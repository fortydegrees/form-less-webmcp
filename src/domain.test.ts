import { describe, expect, it } from 'vitest'
import {
  DomainError,
  configureInteraction,
  correctedDemoAnswers,
  createInitialState,
  getApplicationReview,
  getApplicationStep,
  openReview,
  recordConfirmedAnswer,
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

describe('confirmed agent answers', () => {
  it('writes one valid confirmed answer and records one visible activity entry', () => {
    const initial = createInitialState()
    const next = recordConfirmedAnswer(
      initial,
      {
        questionId: 'repair_description',
        value: correctedDemoAnswers.repair_description,
        confirmed: true,
      },
      'agent',
    )

    expect(next.answers.repair_description).toBe(correctedDemoAnswers.repair_description)
    expect(next.history).toHaveLength(1)
    expect(next.history[0]?.detail).toContain('after your confirmation')
    expect(initial.answers.repair_description).toBe('boiler problem')
  })

  it('rejects an unconfirmed or invalid write without mutating prior state', () => {
    const initial = createInitialState()

    expect(() =>
      recordConfirmedAnswer(
        initial,
        { questionId: 'evidence_status', value: 'estimate_ready', confirmed: false },
        'agent',
      ),
    ).toThrowError(DomainError)
    expect(() =>
      recordConfirmedAnswer(
        initial,
        { questionId: 'evidence_status', value: 'invented', confirmed: true },
        'agent',
      ),
    ).toThrowError(DomainError)
    expect(initial).toEqual(createInitialState())
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

