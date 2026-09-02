import rawRules from './form.rules.json'
import rawSchema from './form.schema.json'
import rawUi from './form.ui.json'

export type QuestionId = keyof typeof rawSchema.properties
export type AnswerValue = string | number
export type RequirementId = (typeof rawRules.requirements)[number]['id']
export type InputKind = 'text' | 'textarea' | 'radio' | 'select' | 'number' | 'currency' | 'checkbox'

export interface AnswerOption {
  value: string
  label: string
}

export interface AppliesWhen {
  field: QuestionId
  equals: string
}

export interface QuestionDefinition {
  id: QuestionId
  label: string
  shortLabel: string
  hint: string
  input: InputKind
  type: 'string' | 'integer'
  options?: readonly AnswerOption[]
  requirementId?: RequirementId
  agentWritable: boolean
  appliesWhen?: AppliesWhen
  minimum?: number
  maximum?: number
  minLength?: number
  maxLength?: number
  pattern?: string
}

export interface SectionDefinition {
  id: string
  title: string
  description: string
  questions: readonly QuestionId[]
}

export interface RequirementDefinition {
  id: RequirementId
  title: string
  officialRule: string
  plainLanguage: string
  evidence: string
}

export type RuleDefinition =
  | {
      kind: 'disallow'
      field: QuestionId
      values: readonly string[]
      code: string
      severity: 'ineligible' | 'incomplete'
      requirementId: RequirementId
      message: string
    }
  | {
      kind: 'requiresAny'
      field: QuestionId
      equals: string
      orField: QuestionId
      orEquals: string
      target: QuestionId
      code: string
      severity: 'ineligible' | 'incomplete'
      requirementId: RequirementId
      message: string
    }

interface RawProperty {
  type: 'string' | 'integer'
  title: string
  description: string
  oneOf?: readonly { const: string; title: string }[]
  minimum?: number
  maximum?: number
  minLength?: number
  maxLength?: number
  pattern?: string
  'x-shortLabel': string
  'x-input': InputKind
  'x-requirementId'?: RequirementId
  'x-agentWritable': boolean
}

interface RawConditional {
  if: { properties: Record<string, { const: string }>; required: readonly string[] }
  then: { required: readonly QuestionId[] }
}

const schemaProperties = rawSchema.properties as Record<QuestionId, RawProperty>
const conditionByQuestion = new Map<QuestionId, AppliesWhen>()
for (const conditional of rawSchema.allOf as unknown as readonly RawConditional[]) {
  const [field, condition] = Object.entries(conditional.if.properties)[0] as [QuestionId, { const: string }]
  for (const questionId of conditional.then.required) {
    conditionByQuestion.set(questionId, { field, equals: condition.const })
  }
}

export const questionIds = Object.keys(schemaProperties) as QuestionId[]

export const questions: readonly QuestionDefinition[] = questionIds.map((id) => {
  const property = schemaProperties[id]
  return {
    id,
    label: property.title,
    shortLabel: property['x-shortLabel'],
    hint: property.description,
    input: property['x-input'],
    type: property.type,
    options: property.oneOf?.map((option) => ({ value: option.const, label: option.title })),
    requirementId: property['x-requirementId'],
    agentWritable: property['x-agentWritable'],
    appliesWhen: conditionByQuestion.get(id),
    minimum: property.minimum,
    maximum: property.maximum,
    minLength: property.minLength,
    maxLength: property.maxLength,
    pattern: property.pattern,
  }
})

export const sections = rawUi.sections as readonly SectionDefinition[]
export const requirements = Object.fromEntries(
  rawRules.requirements.map((requirement) => [requirement.id, requirement]),
) as Record<RequirementId, RequirementDefinition>
export const validationRules = rawRules.validations as readonly RuleDefinition[]

export const formContract = {
  schema: rawSchema,
  ui: rawUi,
  rules: rawRules,
}

export function getQuestion(questionId: QuestionId): QuestionDefinition {
  const question = questions.find((candidate) => candidate.id === questionId)
  if (!question) throw new Error(`Unknown form question: ${questionId}`)
  return question
}

export function isQuestionId(value: string): value is QuestionId {
  return questionIds.includes(value as QuestionId)
}

export function isRequirementId(value: string): value is RequirementId {
  return value in requirements
}
