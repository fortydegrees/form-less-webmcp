import { describe, expect, it } from 'vitest'
import {
  DomainError,
  completedDemoAnswers,
  configureAssistance,
  confirmProposal,
  createInitialState,
  getApplicationReview,
  getPathway,
  openReview,
  proposeAnswers,
  questionIds,
  questions,
  sections,
  setHumanAnswer,
  submitApplication,
  validateApplication,
  type ApplicationState,
  type QuestionId,
} from './domain'

function withAnswers(answers = completedDemoAnswers): ApplicationState {
  let state = createInitialState()
  for (const [questionId, value] of Object.entries(answers)) {
    state = setHumanAnswer(state, questionId as QuestionId, String(value))
  }
  return state
}

describe('schema-driven form contract', () => {
  it('defines one 24-question contract across five UI sections', () => {
    expect(questionIds).toHaveLength(24)
    expect(questions).toHaveLength(24)
    expect(sections).toHaveLength(5)
    expect(new Set(sections.flatMap((section) => section.questions))).toEqual(new Set(questionIds))
  })

  it('derives a personal pathway from conditional answers', () => {
    let state = createInitialState()
    expect(getPathway(state).relevantQuestionIds).not.toContain('benefit_type')
    expect(getPathway(state).notApplicableQuestionIds).toContain('heating_status')

    state = setHumanAnswer(state, 'financial_route', 'qualifying_benefit')
    state = setHumanAnswer(state, 'repair_type', 'heating')
    state = setHumanAnswer(state, 'quote_status', 'estimate_ready')
    const pathway = getPathway(state)
    expect(pathway.relevantQuestionIds).toEqual(expect.arrayContaining(['benefit_type', 'heating_status', 'contractor_name']))
    expect(pathway.notApplicableQuestionIds).toEqual(expect.arrayContaining(['annual_income', 'electrical_risk', 'structural_risk']))
  })

  it('changes presentation without changing answers or policy state', () => {
    const initial = createInitialState()
    const assisted = configureAssistance(initial, { active: true, keyboardNavigation: true, plainLanguage: true }, 'agent')
    expect(assisted.assistance).toMatchObject({ active: true, keyboardNavigation: true, plainLanguage: true })
    expect(assisted.answers).toEqual(initial.answers)
    expect(assisted.history[0]).toMatchObject({ actor: 'agent', action: 'WebMCP · configure_assistance' })
  })
})

describe('agent proposals and human decisions', () => {
  it('stages several structured answers without storing any of them', () => {
    const initial = createInitialState()
    const proposed = proposeAnswers(initial, [
      { questionId: 'tenure', value: 'owner_occupier', rationale: 'The applicant said they own the home.' },
      { questionId: 'repair_type', value: 'heating' },
    ])
    expect(proposed.pendingProposals).toHaveLength(2)
    expect(proposed.answers).toEqual({})
    expect(initial.pendingProposals).toEqual([])
  })

  it('stores only the proposal the human confirms', () => {
    const proposed = proposeAnswers(createInitialState(), [
      { questionId: 'tenure', value: 'owner_occupier' },
      { questionId: 'repair_type', value: 'heating' },
    ])
    const confirmed = confirmProposal(proposed, 'tenure')
    expect(confirmed.answers.tenure).toBe('owner_occupier')
    expect(confirmed.answers.repair_type).toBeUndefined()
    expect(confirmed.pendingProposals.map((proposal) => proposal.questionId)).toEqual(['repair_type'])
    expect(confirmed.history.map((entry) => entry.actor)).toEqual(['agent', 'human'])
  })

  it('prevents the agent from proposing the applicant declaration', () => {
    expect(() => proposeAnswers(createInitialState(), [{ questionId: 'declaration_accuracy', value: 'yes' }]))
      .toThrowError(expect.objectContaining({ code: 'human_only_field' }))
  })

  it('rejects invalid, duplicate, oversized, and concurrent proposal batches', () => {
    expect(() => proposeAnswers(createInitialState(), [{ questionId: 'repair_type', value: 'invented' }])).toThrowError(DomainError)
    expect(() => proposeAnswers(createInitialState(), [
      { questionId: 'repair_type', value: 'heating' },
      { questionId: 'repair_type', value: 'electrics' },
    ])).toThrowError(expect.objectContaining({ code: 'duplicate_proposal' }))
    expect(() => proposeAnswers(createInitialState(), Array.from({ length: 9 }, () => ({ questionId: 'repair_type', value: 'heating' })))).toThrowError(expect.objectContaining({ code: 'invalid_proposals' }))
    const pending = proposeAnswers(createInitialState(), [{ questionId: 'repair_type', value: 'heating' }])
    expect(() => proposeAnswers(pending, [{ questionId: 'tenure', value: 'owner_occupier' }])).toThrowError(expect.objectContaining({ code: 'proposal_pending' }))
  })
})

describe('deterministic rules and submission boundary', () => {
  it('accepts the complete heating-repair scenario', () => {
    expect(validateApplication(withAnswers())).toEqual([])
  })

  it('combines schema constraints with service-authored policy rules', () => {
    let state = withAnswers()
    state = setHumanAnswer(state, 'property_postcode', 'AW8 2ZZ')
    state = setHumanAnswer(state, 'tenure', 'private_tenant')
    state = setHumanAnswer(state, 'savings_band', '16000_or_more')
    state = setHumanAnswer(state, 'immediate_impact', 'no_immediate_impact')
    const codes = validateApplication(state).map((issue) => issue.code)
    expect(codes).toEqual(expect.arrayContaining(['pattern_property_postcode', 'tenure_ineligible', 'savings_ineligible', 'impact_ineligible']))
  })

  it('requires repair evidence through either allowed route', () => {
    let state = withAnswers()
    state = setHumanAnswer(state, 'quote_status', 'none')
    state = setHumanAnswer(state, 'photo_status', 'none')
    expect(validateApplication(state).map((issue) => issue.code)).toContain('repair_evidence_missing')
  })

  it('keeps submission human-only and behind a passing visible review', () => {
    expect(() => submitApplication(createInitialState())).toThrowError(DomainError)
    let state = withAnswers()
    state = openReview(state)
    expect(state.screen).toBe('review')
    expect(getApplicationReview(state).submission.availableToAgent).toBe(false)
    state = submitApplication(state)
    expect(state.screen).toBe('submitted')
    expect(state.history.at(-1)).toMatchObject({ actor: 'human' })
  })
})
