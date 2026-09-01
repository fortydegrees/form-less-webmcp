export type PresentationMode = 'overview' | 'guided'
export type Actor = 'human' | 'agent'
export type ApplicationScreen = 'application' | 'review' | 'submitted'

export const questionIds = [
  'property_postcode',
  'owner_occupier',
  'financial_criterion',
  'repair_type',
  'repair_description',
  'urgent_impact',
  'estimated_cost',
  'evidence_status',
] as const

export type QuestionId = (typeof questionIds)[number]
export type AnswerValue = string | number

export interface AnswerOption {
  value: string
  label: string
}

export interface QuestionDefinition {
  id: QuestionId
  label: string
  shortLabel: string
  hint: string
  requirementId?: RequirementId
  input: 'text' | 'textarea' | 'radio'
  options?: readonly AnswerOption[]
}

export const requirements = {
  'REQ-AREA': {
    id: 'REQ-AREA',
    title: 'Alderwick area',
    officialRule: 'The home must be in an AW1, AW2, AW3 or AW4 postcode.',
    plainLanguage: 'This demo only covers the fictional borough of Alderwick.',
    evidence: 'The postcode answer is enough in the prototype.',
  },
  'REQ-HOME': {
    id: 'REQ-HOME',
    title: 'Your home',
    officialRule: 'You must own the property and live there as your main home.',
    plainLanguage: 'This particular demo grant is for owner-occupiers, not landlords or tenants.',
    evidence:
      'A mortgage statement, title record or similar proof would be accepted in a real version. Nothing is uploaded here.',
  },
  'REQ-INCOME': {
    id: 'REQ-INCOME',
    title: 'Financial condition',
    officialRule:
      'Your household must receive one of the benefits listed in the question or have annual income below £25,000 before tax.',
    plainLanguage: 'You need to meet one of the two financial conditions, not both.',
    evidence:
      'A benefit decision notice or a recent household income summary would be accepted. Nothing is uploaded here.',
  },
  'REQ-URGENT': {
    id: 'REQ-URGENT',
    title: 'Urgent impact',
    officialRule: 'The repair must remove an essential service or create an immediate safety risk.',
    plainLanguage: 'The scheme is for problems that need prompt attention, not routine improvements.',
    evidence: 'Your impact answer and repair description are used for this demo.',
  },
  'REQ-COST': {
    id: 'REQ-COST',
    title: 'Repair cost',
    officialRule: 'The repair must be expected to cost between £250 and £7,500 including tax.',
    plainLanguage: 'Costs outside this range are not covered by the fictional scheme.',
    evidence: 'A contractor estimate would show the expected total.',
  },
  'REQ-EVIDENCE': {
    id: 'REQ-EVIDENCE',
    title: 'Supporting evidence',
    officialRule: 'You must have a contractor estimate, clear photos, or both.',
    plainLanguage: 'Tell us what you already have. The demo does not upload or inspect files.',
    evidence: 'One estimate, clear photos, or both.',
  },
} as const

export type RequirementId = keyof typeof requirements

export const questions: readonly QuestionDefinition[] = [
  {
    id: 'property_postcode',
    label: 'What is the property postcode?',
    shortLabel: 'Property postcode',
    hint: 'For this demo, use an Alderwick postcode from AW1 to AW4.',
    requirementId: 'REQ-AREA',
    input: 'text',
  },
  {
    id: 'owner_occupier',
    label: 'Do you own the property and live there as your main home?',
    shortLabel: 'Own and live in the property',
    hint: 'This is sometimes called being an owner-occupier.',
    requirementId: 'REQ-HOME',
    input: 'radio',
    options: [
      { value: 'yes', label: 'Yes' },
      { value: 'no', label: 'No' },
    ],
  },
  {
    id: 'financial_criterion',
    label: 'Which financial condition applies to your household?',
    shortLabel: 'Financial condition',
    hint:
      'Qualifying benefits for this demo are Universal Credit, Pension Credit, Income Support, income-based Jobseeker’s Allowance, income-related Employment and Support Allowance and Housing Benefit. Otherwise, use income before tax for everyone who normally lives in the home.',
    requirementId: 'REQ-INCOME',
    input: 'radio',
    options: [
      { value: 'qualifying_benefit', label: 'Someone in the household receives an income-related benefit' },
      { value: 'income_under_25000', label: 'Annual household income is below £25,000 before tax' },
      { value: 'neither', label: 'Neither of these' },
      { value: 'not_sure', label: 'I’m not sure' },
    ],
  },
  {
    id: 'repair_type',
    label: 'What needs repairing?',
    shortLabel: 'Type of repair',
    hint: 'Choose the main problem. You can add detail next.',
    input: 'radio',
    options: [
      { value: 'heating', label: 'Heating or hot water' },
      { value: 'electrics', label: 'Electrical system' },
      { value: 'structure', label: 'Walls, roof or structure' },
      { value: 'water_ingress', label: 'Water entering the home' },
      { value: 'other', label: 'Another urgent repair' },
    ],
  },
  {
    id: 'repair_description',
    label: 'Describe what has happened',
    shortLabel: 'What happened',
    hint: 'Say what has stopped working or become unsafe, and when it began. Do not include medical details.',
    input: 'textarea',
  },
  {
    id: 'urgent_impact',
    label: 'How is the problem affecting the home now?',
    shortLabel: 'Current impact',
    hint: 'Choose the closest answer.',
    requirementId: 'REQ-URGENT',
    input: 'radio',
    options: [
      { value: 'no_heating_or_hot_water', label: 'There is no main heating or hot water' },
      { value: 'dangerous_electrics', label: 'There are sparks, burning smells or exposed live parts' },
      { value: 'unsafe_structure', label: 'Part of the home may collapse or cannot be used safely' },
      { value: 'active_water_risk', label: 'Water is entering and may damage electrics or the structure' },
      { value: 'other_immediate_risk', label: 'There is another immediate safety risk' },
      { value: 'no_immediate_risk', label: 'None of these' },
    ],
  },
  {
    id: 'estimated_cost',
    label: 'What is the expected repair cost?',
    shortLabel: 'Expected cost',
    hint: 'Enter a whole amount from £250 to £7,500, including tax. A rough amount is enough for this demo.',
    requirementId: 'REQ-COST',
    input: 'text',
  },
  {
    id: 'evidence_status',
    label: 'What supporting evidence do you have?',
    shortLabel: 'Evidence ready',
    hint: 'You will not upload anything in this prototype.',
    requirementId: 'REQ-EVIDENCE',
    input: 'radio',
    options: [
      { value: 'estimate_ready', label: 'A contractor estimate' },
      { value: 'photos_ready', label: 'Clear photos of the problem' },
      { value: 'both_ready', label: 'An estimate and photos' },
      { value: 'none_ready', label: 'Neither is ready' },
    ],
  },
]

export interface InteractionPreferences {
  keyboardNavigation: boolean
  reducedMotion: boolean
  plainLanguage: boolean
}

export interface ActivityEntry {
  id: number
  actor: Actor
  action: string
  detail: string
}

export interface ApplicationState {
  mode: PresentationMode
  preferences: InteractionPreferences
  answers: Partial<Record<QuestionId, AnswerValue>>
  screen: ApplicationScreen
  history: readonly ActivityEntry[]
  nextActivityId: number
  announcement: string
}

export type IssueSeverity = 'ineligible' | 'incomplete'

export interface ValidationIssue {
  code: string
  questionId: QuestionId
  requirementId: RequirementId | 'COMP-DESCRIPTION'
  severity: IssueSeverity
  title: string
  message: string
}

export interface ApplicationStep {
  question: QuestionDefinition
  currentValue: AnswerValue | null
  reason: 'incomplete' | 'needs-correction'
  issue: ValidationIssue | null
}

export interface ReviewItem {
  questionId: QuestionId
  label: string
  value: string
}

export interface ApplicationReview {
  ready: boolean
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

const seededAnswers: Partial<Record<QuestionId, AnswerValue>> = {
  property_postcode: 'AW2 4LA',
  owner_occupier: 'yes',
  financial_criterion: 'qualifying_benefit',
  repair_type: 'heating',
  repair_description: 'boiler problem',
  urgent_impact: 'no_heating_or_hot_water',
  estimated_cost: 3200,
  evidence_status: 'none_ready',
}

export const correctedDemoAnswers: Partial<Record<QuestionId, AnswerValue>> = {
  ...seededAnswers,
  repair_description: 'The boiler stopped working two days ago. There is no heating or hot water.',
  evidence_status: 'estimate_ready',
}

export function createInitialState(): ApplicationState {
  return {
    mode: 'overview',
    preferences: {
      keyboardNavigation: false,
      reducedMotion: false,
      plainLanguage: false,
    },
    answers: { ...seededAnswers },
    screen: 'application',
    history: [],
    nextActivityId: 1,
    announcement: 'Original demo answers are ready.',
  }
}

function appendActivity(
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

export function configureInteraction(
  state: ApplicationState,
  input: Partial<InteractionPreferences> & { mode?: PresentationMode },
  actor: Actor,
): ApplicationState {
  const mode = input.mode ?? state.mode
  if (mode !== 'overview' && mode !== 'guided') {
    throw new DomainError('invalid_mode', 'Mode must be overview or guided.')
  }

  const preferences = { ...state.preferences, ...pickBooleanPreferences(input) }
  const changes: string[] = []
  if (mode !== state.mode) {
    changes.push(
      actor === 'agent'
        ? mode === 'guided'
          ? 'Agent changed the form to one question at a time.'
          : 'Agent changed the form to show all questions.'
        : mode === 'guided'
          ? 'You changed the form to one question at a time.'
          : 'You changed the form back to show all questions.',
    )
  }
  if (preferences.keyboardNavigation !== state.preferences.keyboardNavigation) {
    changes.push(
      `${actor === 'agent' ? 'Agent' : 'You'} ${preferences.keyboardNavigation ? 'showed' : 'hid'} keyboard hints.`,
    )
  }
  if (preferences.plainLanguage !== state.preferences.plainLanguage) {
    changes.push(
      `${actor === 'agent' ? 'Agent' : 'You'} turned ${preferences.plainLanguage ? 'on' : 'off'} plain-language explanations.`,
    )
  }
  if (preferences.reducedMotion !== state.preferences.reducedMotion) {
    changes.push(
      `${actor === 'agent' ? 'Agent' : 'You'} ${preferences.reducedMotion ? 'reduced' : 'restored'} non-essential motion.`,
    )
  }

  if (changes.length === 0) {
    return state.screen === 'application' ? state : { ...state, screen: 'application' }
  }

  return appendActivity(
    { ...state, mode, preferences, screen: 'application' },
    actor,
    actor === 'agent' ? 'Agent changed presentation' : 'You changed presentation',
    changes.join(' '),
    changes.join(' '),
  )
}

function pickBooleanPreferences(
  input: Partial<InteractionPreferences>,
): Partial<InteractionPreferences> {
  const result: Partial<InteractionPreferences> = {}
  const keys: readonly (keyof InteractionPreferences)[] = [
    'keyboardNavigation',
    'reducedMotion',
    'plainLanguage',
  ]
  for (const key of keys) {
    if (key in input) {
      if (typeof input[key] !== 'boolean') {
        throw new DomainError('invalid_preference', `${key} must be a boolean.`)
      }
      result[key] = input[key]
    }
  }
  return result
}

export function setHumanAnswer(
  state: ApplicationState,
  questionId: QuestionId,
  value: string,
): ApplicationState {
  const answer = normalizeAnswer(questionId, value)
  assertAnswer(questionId, answer)
  return {
    ...state,
    answers: { ...state.answers, [questionId]: answer },
    screen: 'application',
  }
}

export function recordConfirmedAnswer(
  state: ApplicationState,
  input: { questionId: string; value: unknown; confirmed: unknown },
  actor: 'agent',
): ApplicationState {
  if (input.confirmed !== true) {
    throw new DomainError(
      'confirmation_required',
      'The agent may only record an answer you have explicitly confirmed.',
    )
  }
  if (!isQuestionId(input.questionId)) {
    throw new DomainError('unknown_question', 'The agent could not save that answer. The question is not recognised.')
  }
  if (typeof input.value !== 'string' && typeof input.value !== 'number') {
    throw new DomainError('invalid_value', 'The answer must be text or a number.')
  }
  const answer = normalizeAnswer(input.questionId, input.value)
  assertAnswer(input.questionId, answer)

  const question = getQuestion(input.questionId)
  const answerLabel = formatAnswer(input.questionId, answer)
  const previous = state.answers[input.questionId]
  const detail = previous === undefined
    ? `Agent recorded “${answerLabel}” for “${question.shortLabel}” after your confirmation.`
    : `Agent changed “${question.shortLabel}” from “${formatAnswer(input.questionId, previous)}” to “${answerLabel}” after your confirmation.`
  return appendActivity(
    {
      ...state,
      answers: { ...state.answers, [input.questionId]: answer },
      screen: 'application',
    },
    actor,
    'Agent recorded a confirmed answer',
    detail,
    `Agent saved ${question.shortLabel}: ${answerLabel}.`,
  )
}

function normalizeAnswer(questionId: QuestionId, value: string | number): AnswerValue {
  if (questionId === 'estimated_cost' && String(value).trim().match(/^\d+$/)) {
    return Number(value)
  }
  if (questionId === 'property_postcode') return normalizePostcode(String(value))
  return typeof value === 'string' ? value.trim() : value
}

export function normalizePostcode(value: string): string {
  const compact = value.toUpperCase().replace(/\s+/g, '')
  return compact.length > 3 ? `${compact.slice(0, 3)} ${compact.slice(3)}` : compact
}

function assertAnswer(questionId: QuestionId, value: AnswerValue): void {
  const question = getQuestion(questionId)
  if (String(value).trim() === '') {
    throw new DomainError('invalid_value', `${question.shortLabel} cannot be empty.`)
  }
  if (question.options && !question.options.some((option) => option.value === value)) {
    throw new DomainError('invalid_value', `${question.shortLabel} must use one of the allowed values.`)
  }
  if (questionId === 'repair_description' && String(value).length > 500) {
    throw new DomainError('invalid_value', 'Shorten the description to 500 characters or fewer.')
  }
}

function issue(
  code: string,
  questionId: QuestionId,
  requirementId: RequirementId | 'COMP-DESCRIPTION',
  severity: IssueSeverity,
  message: string,
): ValidationIssue {
  return { code, questionId, requirementId, severity, title: message, message }
}

export function validateApplication(state: ApplicationState): readonly ValidationIssue[] {
  const issues: ValidationIssue[] = []
  const answers = state.answers

  if (!answers.property_postcode) {
    issues.push(issue('postcode_empty', 'property_postcode', 'REQ-AREA', 'incomplete', 'Enter the property postcode.'))
  } else if (!/^AW\d \d[A-Z]{2}$/.test(String(answers.property_postcode))) {
    issues.push(issue('postcode_format', 'property_postcode', 'REQ-AREA', 'ineligible', 'Enter an Alderwick demo postcode, for example AW2 4LA.'))
  } else if (!/^AW[1-4] \d[A-Z]{2}$/.test(String(answers.property_postcode))) {
    issues.push(issue('postcode_area', 'property_postcode', 'REQ-AREA', 'ineligible', 'Enter a postcode in the fictional Alderwick area, from AW1 to AW4.'))
  }

  if (!answers.owner_occupier) {
    issues.push(issue('ownership_empty', 'owner_occupier', 'REQ-HOME', 'incomplete', 'Select whether you own the property and live there as your main home.'))
  } else if (answers.owner_occupier === 'no') {
    issues.push(issue('ownership_no', 'owner_occupier', 'REQ-HOME', 'ineligible', 'This fictional grant is only for people who own and live in the property.'))
  }

  if (!answers.financial_criterion) {
    issues.push(issue('financial_empty', 'financial_criterion', 'REQ-INCOME', 'incomplete', 'Select the financial condition that applies to your household.'))
  } else if (answers.financial_criterion === 'not_sure') {
    issues.push(issue('financial_unsure', 'financial_criterion', 'REQ-INCOME', 'incomplete', 'Find out whether your household receives an income-related benefit or has annual income below £25,000, then select an answer.'))
  } else if (answers.financial_criterion === 'neither') {
    issues.push(issue('financial_neither', 'financial_criterion', 'REQ-INCOME', 'ineligible', 'This fictional grant is only for households that meet one of the financial conditions.'))
  }

  if (!answers.repair_type) {
    issues.push(issue('repair_type_empty', 'repair_type', 'REQ-URGENT', 'incomplete', 'Select the main type of repair.'))
  }

  const description = String(answers.repair_description ?? '').trim()
  if (!description) {
    issues.push(issue('description_empty', 'repair_description', 'COMP-DESCRIPTION', 'incomplete', 'Describe what has happened.'))
  } else if (!isSpecificRepairDescription(description)) {
    issues.push(issue('description_vague', 'repair_description', 'COMP-DESCRIPTION', 'incomplete', 'Add more detail: say what has stopped working or become unsafe, and when it began.'))
  }

  if (!answers.urgent_impact) {
    issues.push(issue('urgent_empty', 'urgent_impact', 'REQ-URGENT', 'incomplete', 'Select how the problem is affecting the home now.'))
  } else if (answers.urgent_impact === 'no_immediate_risk') {
    issues.push(issue('urgent_none', 'urgent_impact', 'REQ-URGENT', 'ineligible', 'This fictional grant only covers loss of an essential service or an immediate safety risk.'))
  }

  const cost = answers.estimated_cost
  if (cost === undefined || cost === '') {
    issues.push(issue('cost_empty', 'estimated_cost', 'REQ-COST', 'incomplete', 'Enter the expected repair cost.'))
  } else if (typeof cost !== 'number' || !Number.isInteger(cost)) {
    issues.push(issue('cost_whole_number', 'estimated_cost', 'REQ-COST', 'incomplete', 'Enter the cost in whole pounds, without pence.'))
  } else if (cost < 250) {
    issues.push(issue('cost_low', 'estimated_cost', 'REQ-COST', 'ineligible', 'Enter a cost of at least £250 for this fictional grant.'))
  } else if (cost > 7500) {
    issues.push(issue('cost_high', 'estimated_cost', 'REQ-COST', 'ineligible', 'Enter a cost of no more than £7,500 for this fictional grant.'))
  }

  if (!answers.evidence_status) {
    issues.push(issue('evidence_empty', 'evidence_status', 'REQ-EVIDENCE', 'incomplete', 'Select what supporting evidence you have.'))
  } else if (answers.evidence_status === 'none_ready') {
    issues.push(issue('evidence_none', 'evidence_status', 'REQ-EVIDENCE', 'incomplete', 'You need a contractor estimate or clear photos before review.'))
  }

  return issues
}

export function isSpecificRepairDescription(value: string): boolean {
  const genericAnswers = [
    'boiler problem',
    'heating problem',
    'electrical problem',
    'roof problem',
    'water problem',
  ]
  const normalized = value.trim().toLowerCase()
  return normalized.length >= 30 && !genericAnswers.includes(normalized)
}

export function getApplicationStep(state: ApplicationState): ApplicationStep | null {
  const firstIssue = validateApplication(state)[0]
  if (!firstIssue) return null
  const question = getQuestion(firstIssue.questionId)
  return {
    question,
    currentValue: state.answers[question.id] ?? null,
    reason: state.answers[question.id] === undefined ? 'incomplete' : 'needs-correction',
    issue: firstIssue,
  }
}

export function explainRequirement(requirementId: string) {
  if (!(requirementId in requirements)) {
    throw new DomainError('unknown_requirement', 'The requirement is not recognised.')
  }
  return requirements[requirementId as RequirementId]
}

export function getApplicationReview(state: ApplicationState): ApplicationReview {
  const issues = validateApplication(state)
  return {
    ready: issues.length === 0,
    answers: questions.map((question) => ({
      questionId: question.id,
      label: question.shortLabel,
      value: formatAnswer(question.id, state.answers[question.id] ?? 'Not answered'),
    })),
    issues,
    agentChanges: state.history.filter((entry) => entry.actor === 'agent'),
    submission: {
      availableToAgent: false,
      instruction: 'Only you can select Submit application in the visible interface.',
    },
  }
}

export function openReview(state: ApplicationState): ApplicationState {
  const issues = validateApplication(state)
  if (issues.length > 0) {
    return {
      ...state,
      screen: 'application',
      announcement: `${issues.length} ${issues.length === 1 ? 'thing needs' : 'things need'} attention before review.`,
    }
  }
  return { ...state, screen: 'review', announcement: 'Check your answers before you submit.' }
}

export function submitApplication(state: ApplicationState): ApplicationState {
  if (state.screen !== 'review' || validateApplication(state).length > 0) {
    throw new DomainError('review_required', 'Check every answer before you submit.')
  }
  return {
    ...state,
    screen: 'submitted',
    announcement: 'Demo application submitted. Nothing was sent.',
  }
}

export function formatAnswer(questionId: QuestionId, value: AnswerValue): string {
  if (questionId === 'estimated_cost' && typeof value === 'number') {
    return `£${value.toLocaleString('en-GB')}`
  }
  const stringValue = String(value)
  const question = getQuestion(questionId)
  return question.options?.find((option) => option.value === stringValue)?.label ?? stringValue
}

export function getQuestion(questionId: QuestionId): QuestionDefinition {
  const question = questions.find((candidate) => candidate.id === questionId)
  if (!question) throw new DomainError('unknown_question', 'The question is not recognised.')
  return question
}

export function isQuestionId(value: string): value is QuestionId {
  return questionIds.includes(value as QuestionId)
}

