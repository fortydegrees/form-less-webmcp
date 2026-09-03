import { describe, expect, it } from 'vitest'
import {
  DomainError,
  completedDemoAnswers,
  commitHumanAnswer,
  configureAssistance,
  confirmProposal,
  createInitialState,
  demoAgentProposals,
  getApplicationReview,
  getApplicationStepForQuestion,
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
  it('preserves spaces and incomplete values while the applicant is typing', () => {
    let state = setHumanAnswer(createInitialState(), 'contractor_name', 'Alderwick Heating ')
    expect(state.answers.contractor_name).toBe('Alderwick Heating ')

    state = setHumanAnswer(state, 'estimated_cost', '24x')
    expect(state.answers.estimated_cost).toBe('24x')
  })

  it('normalizes text, postcodes, and numbers only when the applicant leaves a field', () => {
    let state = commitHumanAnswer(createInitialState(), 'contractor_name', '  Alderwick Heating Co  ')
    expect(state.answers.contractor_name).toBe('Alderwick Heating Co')

    state = commitHumanAnswer(state, 'property_postcode', 'aw2  4la')
    expect(state.answers.property_postcode).toBe('AW2 4LA')

    state = commitHumanAnswer(state, 'estimated_cost', '2450')
    expect(state.answers.estimated_cost).toBe(2450)
  })

  it('defines one 34-question contract across five UI sections', () => {
    expect(questionIds).toHaveLength(34)
    expect(questions).toHaveLength(34)
    expect(sections).toHaveLength(5)
    expect(new Set(sections.flatMap((section) => section.questions))).toEqual(new Set(questionIds))
  })

  it('derives a personal pathway from conditional answers', () => {
    let state = createInitialState()
    expect(getPathway(state).relevantQuestionIds).not.toContain('benefit_type')
    expect(getPathway(state).undecidedQuestionIds).toContain('heating_status')

    state = setHumanAnswer(state, 'tenure', 'owner_occupier')
    state = setHumanAnswer(state, 'ownership_type', 'sole')
    state = setHumanAnswer(state, 'financial_route', 'qualifying_benefit')
    state = setHumanAnswer(state, 'repair_type', 'heating')
    state = setHumanAnswer(state, 'evidence_route', 'written_estimate')
    const pathway = getPathway(state)
    expect(pathway.relevantQuestionIds).toHaveLength(16)
    expect(pathway.relevantQuestionIds).toEqual(expect.arrayContaining([
      'ownership_evidence',
      'benefit_type',
      'savings_band',
      'heating_status',
      'temporary_heating',
      'contractor_name',
    ]))
    expect(pathway.notApplicableQuestionIds).toHaveLength(18)
    expect(pathway.notApplicableQuestionIds).toEqual(expect.arrayContaining([
      'annual_income',
      'electrical_risk',
      'structural_risk',
      'water_source',
      'photo_status',
    ]))
    expect(pathway.undecidedQuestionIds).toHaveLength(0)
  })

  it('keeps unanswered branches distinct from questions ruled out by confirmed answers', () => {
    let state = createInitialState()
    expect(getPathway(state)).toMatchObject({
      relevantQuestionIds: expect.arrayContaining(['tenure', 'financial_route', 'repair_type']),
      notApplicableQuestionIds: [],
      undecidedQuestionIds: expect.arrayContaining(['ownership_type', 'benefit_type', 'heating_status']),
    })

    state = setHumanAnswer(state, 'tenure', 'private_tenant')
    const pathway = getPathway(state)
    expect(pathway.notApplicableQuestionIds).toEqual(expect.arrayContaining([
      'ownership_type',
      'joint_owner_consent',
      'freeholder_permission',
      'ownership_evidence',
    ]))
    expect(pathway.undecidedQuestionIds).not.toContain('joint_owner_consent')
  })

  it('changes presentation without changing answers or policy state', () => {
    const initial = createInitialState()
    const assisted = configureAssistance(initial, { active: true, keyboardNavigation: true, plainLanguage: true }, 'agent')
    expect(assisted.assistance).toMatchObject({ active: true, keyboardNavigation: true, plainLanguage: true })
    expect(assisted.answers).toEqual(initial.answers)
    expect(assisted.history[0]).toMatchObject({ actor: 'agent', action: 'WebMCP · configure_assistance' })
  })

  it('keeps a completed answer available until the interface deliberately advances', () => {
    const state = setHumanAnswer(createInitialState(), 'property_postcode', 'AW2 4LA')
    expect(getApplicationStepForQuestion(state, 'property_postcode')).toMatchObject({
      currentValue: 'AW2 4LA',
      reason: 'complete',
      issue: null,
    })
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
    expect(() => proposeAnswers(createInitialState(), Array.from({ length: 11 }, () => ({ questionId: 'repair_type', value: 'heating' })))).toThrowError(expect.objectContaining({ code: 'invalid_proposals' }))
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
    state = setHumanAnswer(state, 'heating_status', 'working')
    const codes = validateApplication(state).map((issue) => issue.code)
    expect(codes).toEqual(expect.arrayContaining(['pattern_property_postcode', 'tenure_ineligible', 'savings_ineligible', 'heating_not_urgent']))
  })

  it('requires repair evidence through either allowed route', () => {
    let state = withAnswers()
    state = setHumanAnswer(state, 'evidence_route', 'none')
    expect(validateApplication(state).map((issue) => issue.code)).toContain('repair_evidence_missing')
  })

  it('does not apply rules from a branch that is no longer active', () => {
    let state = withAnswers()
    state = setHumanAnswer(state, 'photo_status', 'not_safe')
    expect(validateApplication(state).map((issue) => issue.code)).not.toContain('photographs_not_usable')

    state = setHumanAnswer(state, 'evidence_route', 'photographs')
    expect(validateApplication(state).map((issue) => issue.code)).toContain('photographs_not_usable')
  })

  it('maps ten supplied facts while leaving six decisions to the applicant', () => {
    let state = proposeAnswers(createInitialState(), demoAgentProposals)
    expect(state.pendingProposals).toHaveLength(10)
    expect(state.answers).toEqual({})
    for (const proposal of [...state.pendingProposals]) state = confirmProposal(state, proposal.questionId)
    const pathway = getPathway(state)
    expect(pathway).toMatchObject({
      totalQuestions: 34,
      relevantQuestionIds: expect.any(Array),
      notApplicableQuestionIds: expect.any(Array),
      remainingRelevant: 6,
    })
    expect(pathway.relevantQuestionIds).toHaveLength(16)
    expect(pathway.notApplicableQuestionIds).toHaveLength(16)
    expect(pathway.undecidedQuestionIds).toHaveLength(2)
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
