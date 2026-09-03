import {
  formContract,
  getQuestion,
  isQuestionId,
  isRequirementId,
  questionIds,
  questions,
  requirements,
  sections,
  validationRules,
  type AnswerValue,
  type QuestionDefinition,
  type QuestionId,
  type RequirementId,
} from './formDefinition'

export {
  formContract,
  getQuestion,
  questionIds,
  questions,
  requirements,
  sections,
  type AnswerValue,
  type QuestionDefinition,
  type QuestionId,
  type RequirementId,
}

export type Actor = 'human' | 'agent' | 'service'
export type ApplicationScreen = 'application' | 'review' | 'submitted'

export interface AssistancePreferences {
  keyboardNavigation: boolean
  reducedMotion: boolean
  plainLanguage: boolean
}

export interface AssistanceState extends AssistancePreferences {
  active: boolean
}

export interface ActivityEntry {
  id: number
  actor: Actor
  action: string
  detail: string
}

export interface PendingAnswerProposal {
  questionId: QuestionId
  value: AnswerValue
  rationale?: string
}

export interface ApplicationState {
  assistance: AssistanceState
  answers: Partial<Record<QuestionId, AnswerValue>>
  pendingProposals: readonly PendingAnswerProposal[]
  validationVisible: boolean
  screen: ApplicationScreen
  history: readonly ActivityEntry[]
  nextActivityId: number
  announcement: string
}

export type IssueSeverity = 'ineligible' | 'incomplete'

export interface ValidationIssue {
  code: string
  questionId: QuestionId
  requirementId: RequirementId | 'FORM-COMPLETENESS'
  severity: IssueSeverity
  title: string
  message: string
}

export interface ApplicationStep {
  question: QuestionDefinition
  currentValue: AnswerValue | null
  reason: 'incomplete' | 'needs-correction'
  issue: ValidationIssue | null
  sectionTitle: string
  whyAsked: string
}

export interface PathwaySummary {
  totalQuestions: number
  relevantQuestionIds: readonly QuestionId[]
  notApplicableQuestionIds: readonly QuestionId[]
  undecidedQuestionIds: readonly QuestionId[]
  answeredRelevant: number
  remainingRelevant: number
  documentsNeeded: readonly string[]
  currentSection: string | null
}

export interface ReviewItem {
  questionId: QuestionId
  label: string
  value: string
}

export interface ApplicationReview {
  ready: boolean
  pathway: PathwaySummary
  answers: readonly ReviewItem[]
  issues: readonly ValidationIssue[]
  agentChanges: readonly ActivityEntry[]
  submission: {
    availableToAgent: false
    instruction: string
  }
}

export class DomainError extends Error {
  readonly code: string

  constructor(code: string, message: string) {
    super(message)
    this.name = 'DomainError'
    this.code = code
  }
}

export const completedDemoAnswers: Partial<Record<QuestionId, AnswerValue>> = {
  property_postcode: 'AW2 4LA',
  tenure: 'owner_occupier',
  ownership_type: 'sole',
  ownership_evidence: 'ready',
  financial_route: 'qualifying_benefit',
  benefit_type: 'universal_credit',
  savings_band: 'under_6000',
  repair_type: 'heating',
  repair_description: 'The boiler stopped working two days ago. There is no heating or hot water.',
  problem_started: 'last_3_days',
  heating_status: 'none',
  temporary_heating: 'yes',
  estimated_cost: 2450,
  evidence_route: 'written_estimate',
  contractor_name: 'Alderwick Heating Services',
  declaration_accuracy: 'yes',
}

export const demoAgentProposals: readonly PendingAnswerProposal[] = [
  { questionId: 'property_postcode', value: 'AW2 4LA', rationale: 'You said the repair is at your Alderwick home.' },
  { questionId: 'tenure', value: 'owner_occupier', rationale: 'You said you own and live in the property.' },
  { questionId: 'financial_route', value: 'qualifying_benefit', rationale: 'You said you receive Universal Credit.' },
  { questionId: 'benefit_type', value: 'universal_credit', rationale: 'This is the benefit you named.' },
  { questionId: 'repair_type', value: 'heating', rationale: 'The reported problem is a failed boiler.' },
  { questionId: 'repair_description', value: 'The boiler stopped working two days ago. There is no heating or hot water.', rationale: 'This uses only the repair details you supplied.' },
  { questionId: 'problem_started', value: 'last_3_days', rationale: 'You said the boiler failed two days ago.' },
  { questionId: 'heating_status', value: 'none', rationale: 'You said there is no heating or hot water.' },
  { questionId: 'estimated_cost', value: 2450, rationale: 'You said the written estimate is £2,450.' },
  { questionId: 'evidence_route', value: 'written_estimate', rationale: 'You said a written estimate is ready and no photographs are available.' },
]

export function createInitialState(): ApplicationState {
  return {
    assistance: {
      active: false,
      keyboardNavigation: false,
      reducedMotion: false,
      plainLanguage: false,
    },
    answers: {},
    pendingProposals: [],
    validationVisible: false,
    screen: 'application',
    history: [],
    nextActivityId: 1,
    announcement: 'A blank fictional application is ready.',
  }
}

export function recordActivity(
  state: ApplicationState,
  actor: Actor,
  action: string,
  detail: string,
  announcement = detail,
): ApplicationState {
  return {
    ...state,
    history: [...state.history, { id: state.nextActivityId, actor, action, detail }],
    nextActivityId: state.nextActivityId + 1,
    announcement,
  }
}

export function configureAssistance(
  state: ApplicationState,
  input: Partial<AssistanceState>,
  actor: 'human' | 'agent',
): ApplicationState {
  const next = { ...state.assistance }
  for (const key of ['active', 'keyboardNavigation', 'reducedMotion', 'plainLanguage'] as const) {
    if (key in input) {
      if (typeof input[key] !== 'boolean') throw new DomainError('invalid_preference', `${key} must be a boolean.`)
      next[key] = input[key] as boolean
    }
  }
  if (JSON.stringify(next) === JSON.stringify(state.assistance)) return state

  const enabled = next.active && !state.assistance.active
  return recordActivity(
    { ...state, assistance: next, screen: 'application' },
    actor,
    actor === 'agent' ? 'WebMCP · configure_assistance' : 'You changed assistance settings',
    enabled
      ? 'The agent opened a focused pathway using the service’s approved adaptive layout.'
      : `The ${actor === 'agent' ? 'agent' : 'applicant'} updated presentation preferences.`,
  )
}

export function setHumanAnswer(
  state: ApplicationState,
  questionId: QuestionId,
  value: string,
): ApplicationState {
  const question = getQuestion(questionId)
  const answer = question.type === 'integer' && /^\d+$/.test(value)
    ? Number(value)
    : value
  const answers = { ...state.answers }
  if (value === '') delete answers[questionId]
  else answers[questionId] = answer
  return { ...state, answers, validationVisible: false, screen: 'application' }
}

export function commitHumanAnswer(
  state: ApplicationState,
  questionId: QuestionId,
  value: string,
): ApplicationState {
  const answer = normalizeAnswer(questionId, value)
  const answers = { ...state.answers }
  if (!hasAnswer(answer)) delete answers[questionId]
  else answers[questionId] = answer
  return { ...state, answers, validationVisible: false, screen: 'application' }
}

export function proposeAnswers(
  state: ApplicationState,
  inputs: readonly { questionId: string; value: unknown; rationale?: unknown }[],
): ApplicationState {
  if (inputs.length === 0 || inputs.length > 10) throw new DomainError('invalid_proposals', 'Propose between 1 and 10 answers at a time.')
  if (state.pendingProposals.length > 0) throw new DomainError('proposal_pending', 'The applicant must review the current proposals before more are added.')

  const seen = new Set<QuestionId>()
  const proposals = inputs.map((input): PendingAnswerProposal => {
    if (!isQuestionId(input.questionId)) throw new DomainError('unknown_question', `Unknown question: ${input.questionId}.`)
    const question = getQuestion(input.questionId)
    if (!question.agentWritable) throw new DomainError('human_only_field', `${question.shortLabel} can only be answered by the applicant.`)
    if (seen.has(input.questionId)) throw new DomainError('duplicate_proposal', `Only propose one answer for ${question.shortLabel}.`)
    seen.add(input.questionId)
    if (typeof input.value !== 'string' && typeof input.value !== 'number') throw new DomainError('invalid_value', 'Answers must be text or numbers.')
    const value = normalizeAnswer(input.questionId, input.value)
    assertAnswer(input.questionId, value, true)
    const rationale = typeof input.rationale === 'string' ? input.rationale.trim().slice(0, 180) : undefined
    return { questionId: input.questionId, value, ...(rationale ? { rationale } : {}) }
  })

  return recordActivity(
    { ...state, pendingProposals: proposals, screen: 'application' },
    'agent',
    'WebMCP · propose_answers',
    `The agent mapped your description to ${proposals.length} structured answer${proposals.length === 1 ? '' : 's'}. Nothing is stored until you confirm each one.`,
    `${proposals.length} agent proposals are ready for your review.`,
  )
}

export function confirmProposal(state: ApplicationState, questionId: QuestionId): ApplicationState {
  const proposal = state.pendingProposals.find((candidate) => candidate.questionId === questionId)
  if (!proposal) throw new DomainError('no_pending_proposal', 'That proposal is no longer waiting for review.')
  assertAnswer(questionId, proposal.value, true)
  const question = getQuestion(questionId)
  return recordActivity(
    {
      ...state,
      answers: { ...state.answers, [questionId]: proposal.value },
      pendingProposals: state.pendingProposals.filter((candidate) => candidate.questionId !== questionId),
      validationVisible: false,
    },
    'human',
    'You confirmed an agent proposal',
    `You confirmed “${formatAnswer(questionId, proposal.value)}” for “${question.shortLabel}”.`,
  )
}

export function rejectProposal(state: ApplicationState, questionId: QuestionId): ApplicationState {
  const proposal = state.pendingProposals.find((candidate) => candidate.questionId === questionId)
  if (!proposal) throw new DomainError('no_pending_proposal', 'That proposal is no longer waiting for review.')
  const question = getQuestion(questionId)
  return recordActivity(
    { ...state, pendingProposals: state.pendingProposals.filter((candidate) => candidate.questionId !== questionId) },
    'human',
    'You rejected an agent proposal',
    `You rejected the proposed answer for “${question.shortLabel}”. The application did not change.`,
  )
}

export function isQuestionApplicable(
  question: QuestionDefinition,
  answers: Partial<Record<QuestionId, AnswerValue>>,
): boolean {
  return getQuestionApplicability(question, answers) === 'applicable'
}

export type QuestionApplicability = 'applicable' | 'not-applicable' | 'undecided'

export function getQuestionApplicability(
  question: QuestionDefinition,
  answers: Partial<Record<QuestionId, AnswerValue>>,
  visiting = new Set<QuestionId>(),
): QuestionApplicability {
  if (!question.appliesWhen) return 'applicable'
  if (visiting.has(question.id)) throw new DomainError('circular_condition', `Circular condition detected for ${question.shortLabel}.`)

  const nextVisiting = new Set(visiting)
  nextVisiting.add(question.id)
  const controller = getQuestion(question.appliesWhen.field)
  const controllerStatus = getQuestionApplicability(controller, answers, nextVisiting)
  if (controllerStatus === 'not-applicable') return 'not-applicable'

  const controllerValue = answers[question.appliesWhen.field]
  if (!hasAnswer(controllerValue)) return 'undecided'
  const matches = 'equals' in question.appliesWhen
    ? controllerValue === question.appliesWhen.equals
    : question.appliesWhen.in.includes(String(controllerValue))
  return matches ? 'applicable' : 'not-applicable'
}

export function getPathway(state: ApplicationState): PathwaySummary {
  const statuses = new Map(questions.map((question) => [question.id, getQuestionApplicability(question, state.answers)]))
  const relevant = questions.filter((question) => statuses.get(question.id) === 'applicable')
  const relevantIds = relevant.map((question) => question.id)
  const notApplicableIds = questionIds.filter((id) => statuses.get(id) === 'not-applicable')
  const undecidedIds = questionIds.filter((id) => statuses.get(id) === 'undecided')
  const answeredRelevant = relevant.filter((question) => hasAnswer(state.answers[question.id])).length
  const currentQuestion = relevant.find((question) => !hasAnswer(state.answers[question.id])) ?? getApplicationStep(state)?.question
  const currentSection = currentQuestion
    ? sections.find((section) => section.questions.includes(currentQuestion.id))?.title ?? null
    : null
  const documentsNeeded: string[] = []
  if (!['written_estimate', 'photographs', 'both'].includes(String(state.answers.evidence_route ?? ''))) {
    documentsNeeded.push('written estimate or clear photographs')
  }
  if (state.answers.tenure === 'owner_occupier' && state.answers.ownership_evidence !== 'ready') {
    documentsNeeded.push('proof of ownership')
  }
  if (state.answers.financial_route === 'qualifying_benefit') documentsNeeded.push('current benefit award notice')
  if (state.answers.financial_route === 'income_under_25000' && state.answers.income_evidence !== 'ready') {
    documentsNeeded.push('recent household income evidence')
  }

  return {
    totalQuestions: questions.length,
    relevantQuestionIds: relevantIds,
    notApplicableQuestionIds: notApplicableIds,
    undecidedQuestionIds: undecidedIds,
    answeredRelevant,
    remainingRelevant: relevant.length - answeredRelevant,
    documentsNeeded,
    currentSection,
  }
}

function hasAnswer(value: AnswerValue | undefined): boolean {
  return value !== undefined && String(value).trim() !== ''
}

function normalizeAnswer(questionId: QuestionId, value: string | number): AnswerValue {
  const question = getQuestion(questionId)
  if (question.type === 'integer' && /^\d+$/.test(String(value).trim())) return Number(value)
  if (questionId === 'property_postcode') {
    const compact = String(value).toUpperCase().replace(/\s+/g, '')
    return compact.length > 3 ? `${compact.slice(0, 3)} ${compact.slice(3)}` : compact
  }
  return typeof value === 'string' ? value.trim() : value
}

function assertAnswer(questionId: QuestionId, value: AnswerValue, requireComplete: boolean): void {
  const question = getQuestion(questionId)
  if (!hasAnswer(value)) throw new DomainError('invalid_value', `${question.shortLabel} cannot be empty.`)
  if (question.type === 'integer' && (typeof value !== 'number' || !Number.isInteger(value))) throw new DomainError('invalid_value', `${question.shortLabel} must be a whole number.`)
  if (question.options && !question.options.some((option) => option.value === value)) throw new DomainError('invalid_value', `${question.shortLabel} must use one of the allowed values.`)
  if (requireComplete) {
    if (question.minLength !== undefined && String(value).length < question.minLength) throw new DomainError('invalid_value', `${question.shortLabel} needs more detail.`)
    if (question.maxLength !== undefined && String(value).length > question.maxLength) throw new DomainError('invalid_value', `${question.shortLabel} is too long.`)
    if (question.minimum !== undefined && Number(value) < question.minimum) throw new DomainError('invalid_value', `${question.shortLabel} is below the allowed minimum.`)
    if (question.maximum !== undefined && Number(value) > question.maximum) throw new DomainError('invalid_value', `${question.shortLabel} is above the allowed maximum.`)
  }
}

function issue(
  code: string,
  questionId: QuestionId,
  requirementId: RequirementId | 'FORM-COMPLETENESS',
  severity: IssueSeverity,
  message: string,
): ValidationIssue {
  return { code, questionId, requirementId, severity, title: message, message }
}

export function validateApplication(state: ApplicationState): readonly ValidationIssue[] {
  const issues: ValidationIssue[] = []
  const required = new Set(formContract.schema.required as QuestionId[])

  for (const question of questions) {
    if (!isQuestionApplicable(question, state.answers)) continue
    const value = state.answers[question.id]
    const requirementId = question.requirementId ?? 'FORM-COMPLETENESS'
    if ((required.has(question.id) || question.appliesWhen) && !hasAnswer(value)) {
      issues.push(issue(`required_${question.id}`, question.id, requirementId, 'incomplete', `Answer “${question.shortLabel}”.`))
      continue
    }
    if (!hasAnswer(value)) continue
    if (question.type === 'integer' && (typeof value !== 'number' || !Number.isInteger(value))) {
      issues.push(issue(`type_${question.id}`, question.id, requirementId, 'incomplete', `Enter ${question.shortLabel.toLowerCase()} as a whole number.`))
      continue
    }
    if (question.pattern && !new RegExp(question.pattern).test(String(value))) {
      const message = question.id === 'property_postcode'
        ? 'Enter an Alderwick demo postcode from AW1 to AW4, for example AW2 4LA.'
        : `Check the format of ${question.shortLabel.toLowerCase()}.`
      issues.push(issue(`pattern_${question.id}`, question.id, requirementId, 'ineligible', message))
    }
    if (question.minLength !== undefined && String(value).length < question.minLength) issues.push(issue(`min_length_${question.id}`, question.id, requirementId, 'incomplete', `Add more detail to ${question.shortLabel.toLowerCase()}.`))
    if (question.minimum !== undefined && Number(value) < question.minimum) issues.push(issue(`minimum_${question.id}`, question.id, requirementId, 'ineligible', `${question.shortLabel} is below the fictional scheme’s minimum.`))
    if (question.maximum !== undefined && Number(value) > question.maximum) issues.push(issue(`maximum_${question.id}`, question.id, requirementId, 'ineligible', `${question.shortLabel} is above the fictional scheme’s maximum.`))
  }

  for (const rule of validationRules) {
    if (!isQuestionApplicable(getQuestion(rule.field), state.answers)) continue
    if (rule.kind === 'disallow' && rule.values.includes(String(state.answers[rule.field] ?? ''))) {
      issues.push(issue(rule.code, rule.field, rule.requirementId, rule.severity, rule.message))
    }
    if (
      rule.kind === 'requiresAny'
      && isQuestionApplicable(getQuestion(rule.orField), state.answers)
      && hasAnswer(state.answers[rule.field])
      && hasAnswer(state.answers[rule.orField])
      && state.answers[rule.field] !== rule.equals
      && state.answers[rule.orField] !== rule.orEquals
    ) {
      issues.push(issue(rule.code, rule.target, rule.requirementId, rule.severity, rule.message))
    }
  }

  return issues
}

export function getApplicationStep(state: ApplicationState): ApplicationStep | null {
  const firstIssue = validateApplication(state)[0]
  if (!firstIssue) return null
  const question = getQuestion(firstIssue.questionId)
  const section = sections.find((candidate) => candidate.questions.includes(question.id))
  const requirement = question.requirementId ? requirements[question.requirementId] : undefined
  return {
    question,
    currentValue: state.answers[question.id] ?? null,
    reason: hasAnswer(state.answers[question.id]) ? 'needs-correction' : 'incomplete',
    issue: firstIssue,
    sectionTitle: section?.title ?? 'Application',
    whyAsked: requirement?.plainLanguage ?? section?.description ?? 'This answer is part of the application.',
  }
}

export function explainRequirement(requirementId: string) {
  if (!isRequirementId(requirementId)) throw new DomainError('unknown_requirement', 'The requirement is not recognised.')
  return requirements[requirementId]
}

export function inspectApplication(state: ApplicationState) {
  const pathway = getPathway(state)
  return {
    title: formContract.schema.title,
    schemaVersion: formContract.schema.$schema,
    sections: sections.map((section) => ({ id: section.id, title: section.title, questionIds: section.questions })),
    questions: questions.map((question) => ({
      id: question.id,
      label: question.label,
      answerType: question.type,
      input: question.input,
      allowedValues: question.options ?? null,
      requirementId: question.requirementId ?? null,
      agentWritable: question.agentWritable,
      appliesWhen: question.appliesWhen ?? null,
      currentValue: state.answers[question.id] ?? null,
    })),
    pathway,
    pendingProposalCount: state.pendingProposals.length,
  }
}

export function getApplicationReview(state: ApplicationState): ApplicationReview {
  const issues = validateApplication(state)
  const pathway = getPathway(state)
  return {
    ready: issues.length === 0 && state.pendingProposals.length === 0,
    pathway,
    answers: pathway.relevantQuestionIds.map((questionId) => ({
      questionId,
      label: getQuestion(questionId).shortLabel,
      value: formatAnswer(questionId, state.answers[questionId] ?? 'Not answered'),
    })),
    issues,
    agentChanges: state.history.filter((entry) => entry.actor === 'agent'),
    submission: {
      availableToAgent: false,
      instruction: 'Only the applicant can use Submit application in the visible interface.',
    },
  }
}

export function openReview(state: ApplicationState): ApplicationState {
  if (state.pendingProposals.length > 0) return { ...state, validationVisible: true, announcement: 'Review every agent proposal before continuing.' }
  const issues = validateApplication(state)
  if (issues.length > 0) return { ...state, validationVisible: true, assistance: { ...state.assistance, active: true }, announcement: `${issues.length} things need attention before review.` }
  return recordActivity({ ...state, screen: 'review', validationVisible: true }, 'human', 'You opened final review', 'You opened the final review. Submission remains a human-only action.')
}

export function submitApplication(state: ApplicationState): ApplicationState {
  if (state.screen !== 'review' || !getApplicationReview(state).ready) throw new DomainError('not_ready', 'Complete the official checks and open review before submitting.')
  return recordActivity({ ...state, screen: 'submitted' }, 'human', 'You submitted the fictional application', 'The fictional application was submitted. No information was sent anywhere.')
}

export function formatAnswer(questionId: QuestionId, value: AnswerValue): string {
  if (value === 'Not answered') return String(value)
  const question = getQuestion(questionId)
  const option = question.options?.find((candidate) => candidate.value === value)
  if (option) return option.label
  if (question.input === 'currency' && typeof value === 'number') return `£${value.toLocaleString('en-GB')}`
  return String(value)
}
