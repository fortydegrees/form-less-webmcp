import { describe, expect, it } from 'vitest'
import {
  DomainError,
  confirmPendingProposal,
  configureInteraction,
  correctedDemoAnswers,
  createInitialState,
  getApplicationReview,
  getApplicationStep,
  openReview,
  proposeAnswer,
  rejectPendingProposal,
  setHumanAnswer,
  submitApplication,
  validateApplication,
} from './domain'

describe('seeded application journey', () => {
  it('starts with the exact two intended issues', () => {
    const state = createInitialState()
    const issues = validateApplication(state)

    expect(state.answers).toEqual({
      property_postcode: 'AW2 4LA',
      owner_occupier: 'yes',
      financial_criterion: 'qualifying_benefit',
      repair_type: 'heating',
      repair_description: 'boiler problem',
      urgent_impact: 'no_heating_or_hot_water',
      estimated_cost: 3200,
      evidence_status: 'none_ready',
    })
    expect(issues.map((issue) => issue.code)).toEqual([
      'description_vague',
      'evidence_none',
    ])
    expect(issues.every((issue) => issue.severity === 'incomplete')).toBe(true)
  })

  it('clears both seeded issues after the canonical corrections', () => {
    let state = createInitialState()
    state = setHumanAnswer(
      state,
      'repair_description',
      String(correctedDemoAnswers.repair_description),
    )
    state = setHumanAnswer(
      state,
      'evidence_status',
      String(correctedDemoAnswers.evidence_status),
    )

    expect(validateApplication(state)).toEqual([])
    expect(getApplicationStep(state)).toBeNull()
    expect(getApplicationReview(state).ready).toBe(true)
  })

  it('does not change answers or validation when presentation changes', () => {
    const initial = createInitialState()
    const adapted = configureInteraction(
      initial,
      {
        mode: 'guided',
        keyboardNavigation: true,
        plainLanguage: true,
        reducedMotion: true,
      },
      'agent',
    )

    expect(adapted.answers).toEqual(initial.answers)
    expect(validateApplication(adapted)).toEqual(validateApplication(initial))
    expect(adapted.history).toHaveLength(1)
    expect(adapted.history[0]?.actor).toBe('agent')
  })
})

describe('agent answer proposals and human decisions', () => {
  it('creates one visible proposal without changing the canonical answer', () => {
    const initial = createInitialState()
    const next = proposeAnswer(
      initial,
      {
        questionId: 'repair_description',
        value: correctedDemoAnswers.repair_description,
      },
      'agent',
    )

    expect(next.answers.repair_description).toBe('boiler problem')
    expect(next.pendingProposal).toEqual({
      questionId: 'repair_description',
      value: correctedDemoAnswers.repair_description,
    })
    expect(next.history).toHaveLength(1)
    expect(next.history[0]).toMatchObject({ actor: 'agent', action: 'Agent proposed an answer' })
    expect(next.announcement).toContain('Confirm or reject')
    expect(initial.answers.repair_description).toBe('boiler problem')
  })

  it('stores a proposal only after the human confirms it and records both actors truthfully', () => {
    const proposed = proposeAnswer(
      createInitialState(),
      { questionId: 'repair_description', value: correctedDemoAnswers.repair_description },
      'agent',
    )
    const confirmed = confirmPendingProposal(proposed)

    expect(confirmed.answers.repair_description).toBe(correctedDemoAnswers.repair_description)
    expect(confirmed.pendingProposal).toBeNull()
    expect(confirmed.history).toHaveLength(2)
    expect(confirmed.history.map((entry) => entry.actor)).toEqual(['agent', 'human'])
    expect(confirmed.history[1]?.detail).toContain('You confirmed the agent’s proposal')
  })

  it('clears a rejected proposal without changing the answer', () => {
    const proposed = proposeAnswer(
      createInitialState(),
      { questionId: 'evidence_status', value: 'estimate_ready' },
      'agent',
    )
    const rejected = rejectPendingProposal(proposed)

    expect(rejected.answers.evidence_status).toBe('none_ready')
    expect(rejected.pendingProposal).toBeNull()
    expect(rejected.history[1]).toMatchObject({
      actor: 'human',
      action: 'You rejected an agent proposal',
    })
  })

  it('rejects invalid or concurrent proposals without mutating prior state', () => {
    const initial = createInitialState()

    expect(() =>
      proposeAnswer(
        initial,
        { questionId: 'evidence_status', value: 'invented' },
        'agent',
      ),
    ).toThrowError(DomainError)
    const proposed = proposeAnswer(
      initial,
      { questionId: 'evidence_status', value: 'estimate_ready' },
      'agent',
    )
    expect(() =>
      proposeAnswer(
        proposed,
        { questionId: 'repair_description', value: correctedDemoAnswers.repair_description },
        'agent',
      ),
    ).toThrowError(expect.objectContaining({ code: 'proposal_pending' }))
    expect(initial).toEqual(createInitialState())
  })

  it('blocks review until the human resolves a pending proposal', () => {
    let state = createInitialState()
    state = setHumanAnswer(state, 'repair_description', String(correctedDemoAnswers.repair_description))
    state = setHumanAnswer(state, 'evidence_status', String(correctedDemoAnswers.evidence_status))
    state = proposeAnswer(state, { questionId: 'evidence_status', value: 'both_ready' }, 'agent')

    expect(validateApplication(state)).toEqual([])
    expect(getApplicationReview(state).ready).toBe(false)
    expect(openReview(state).screen).toBe('application')
    expect(openReview(state).announcement).toContain('Confirm or reject')
  })
})

describe('eligibility and submission boundaries', () => {
  it('returns deterministic hard eligibility and cost issues', () => {
    let state = createInitialState()
    state = setHumanAnswer(state, 'property_postcode', 'AW8 2ZZ')
    state = setHumanAnswer(state, 'owner_occupier', 'no')
    state = setHumanAnswer(state, 'financial_criterion', 'neither')
    state = setHumanAnswer(state, 'urgent_impact', 'no_immediate_risk')
    state = setHumanAnswer(state, 'estimated_cost', '8000')

    const issues = validateApplication(state)
    expect(issues.filter((issue) => issue.severity === 'ineligible').map((issue) => issue.code)).toEqual([
      'postcode_area',
      'ownership_no',
      'financial_neither',
      'urgent_none',
      'cost_high',
    ])
  })

  it('requires a passing visible review before human submission', () => {
    expect(() => submitApplication(createInitialState())).toThrowError(DomainError)

    let state = createInitialState()
    state = setHumanAnswer(state, 'repair_description', String(correctedDemoAnswers.repair_description))
    state = setHumanAnswer(state, 'evidence_status', String(correctedDemoAnswers.evidence_status))
    state = openReview(state)
    expect(state.screen).toBe('review')

    state = submitApplication(state)
    expect(state.screen).toBe('submitted')
    expect(state.history.filter((entry) => entry.actor === 'agent')).toEqual([])
  })
})
