import { applicationStore } from './applicationStore'
import {
  DomainError,
  explainRequirement,
  getApplicationReview,
  getApplicationStep,
  validateApplication,
  type InteractionPreferences,
  type PresentationMode,
} from './domain'

interface ToolAnnotations {
  readOnlyHint?: boolean
  untrustedContentHint?: boolean
}

export interface WebMcpTool {
  name: string
  title: string
  description: string
  inputSchema: Record<string, unknown>
  annotations?: ToolAnnotations
  execute(input: Record<string, unknown>): Promise<unknown>
}

export interface ModelContextLike extends EventTarget {
  registerTool(
    tool: WebMcpTool,
    options?: { signal?: AbortSignal },
  ): Promise<undefined>
}

declare global {
  interface Document {
    modelContext?: ModelContextLike
  }
}

function success(data: unknown): string {
  return JSON.stringify(data)
}

async function safely(run: () => unknown): Promise<string> {
  try {
    return success(run())
  } catch (error) {
    if (error instanceof DomainError) {
      return JSON.stringify({
        ok: false,
        error: { code: error.code, message: error.message },
      })
    }
    throw error
  }
}

export const webMcpTools: readonly WebMcpTool[] = [
  {
    name: 'configure_interaction',
    title: 'Configure application interaction',
    description:
      'Changes only the visible presentation and interaction preferences for this grant application. It never changes policy, eligibility, answers, or submission state.',
    inputSchema: {
      type: 'object',
      properties: {
        mode: {
          type: 'string',
          enum: ['overview', 'guided'],
          description: 'Overview shows every question; guided shows one official question at a time.',
        },
        keyboardNavigation: {
          type: 'boolean',
          description: 'Show keyboard-specific interaction guidance.',
        },
        reducedMotion: {
          type: 'boolean',
          description: 'Disable non-essential interface motion.',
        },
        plainLanguage: {
          type: 'boolean',
          description: 'Prefer concise plain-language requirement explanations.',
        },
      },
      additionalProperties: false,
    },
    annotations: { readOnlyHint: false, untrustedContentHint: false },
    async execute(input) {
      return safely(() => {
        const state = applicationStore.configure(
          input as Partial<InteractionPreferences> & { mode?: PresentationMode },
          'agent',
        )
        return { mode: state.mode, preferences: state.preferences }
      })
    },
  },
  {
    name: 'get_application_step',
    title: 'Get the next application step',
    description:
      'Returns the next incomplete or invalid official question, its allowed answer shape, and its requirement identifier. It does not change the application.',
    inputSchema: { type: 'object', properties: {}, additionalProperties: false },
    annotations: { readOnlyHint: true, untrustedContentHint: true },
    async execute() {
      return safely(() => {
        const step = getApplicationStep(applicationStore.getSnapshot())
        if (!step) return { complete: true, nextStep: null }
        return {
          complete: false,
          nextStep: {
            questionId: step.question.id,
            question: step.question.label,
            hint: step.question.hint,
            input: step.question.input,
            allowedValues: step.question.options ?? null,
            requirementId: step.question.requirementId,
            currentValue: step.currentValue,
            reason: step.reason,
            issue: step.issue,
          },
        }
      })
    },
  },
  {
    name: 'record_confirmed_answer',
    title: 'Record one confirmed answer',
    description:
      'Records exactly one answer that the applicant has explicitly confirmed. Rejects unknown questions, invalid values, and answers without confirmation.',
    inputSchema: {
      type: 'object',
      properties: {
        questionId: {
          type: 'string',
          enum: [
            'property_postcode',
            'owner_occupier',
            'financial_criterion',
            'repair_type',
            'repair_description',
            'urgent_impact',
            'estimated_cost',
            'evidence_status',
          ],
        },
        value: {
          description: 'The exact answer confirmed by the applicant; estimated_cost is a whole number.',
          oneOf: [{ type: 'string' }, { type: 'number' }],
        },
        confirmed: {
          type: 'boolean',
          const: true,
          description: 'Must be true only after the applicant explicitly confirms this answer.',
        },
      },
      required: ['questionId', 'value', 'confirmed'],
      additionalProperties: false,
    },
    annotations: { readOnlyHint: false, untrustedContentHint: true },
    async execute(input) {
      return safely(() => {
        const state = applicationStore.recordAgentAnswer({
          questionId: String(input.questionId ?? ''),
          value: input.value,
          confirmed: input.confirmed,
        })
        return {
          recorded: true,
          questionId: input.questionId,
          nextStep: getApplicationStep(state),
        }
      })
    },
  },
  {
    name: 'explain_requirement',
    title: 'Explain an official requirement',
    description:
      'Returns the site-authored rule, plain-language explanation, and accepted evidence for one named requirement. It does not make an eligibility decision.',
    inputSchema: {
      type: 'object',
      properties: {
        requirementId: {
          type: 'string',
          enum: ['REQ-AREA', 'REQ-HOME', 'REQ-INCOME', 'REQ-URGENT', 'REQ-COST', 'REQ-EVIDENCE'],
        },
      },
      required: ['requirementId'],
      additionalProperties: false,
    },
    annotations: { readOnlyHint: true, untrustedContentHint: false },
    async execute(input) {
      return safely(() => explainRequirement(String(input.requirementId ?? '')))
    },
  },
  {
    name: 'validate_application',
    title: 'Validate the application',
    description:
      'Runs the service’s deterministic eligibility and completeness checks and returns every actionable issue. It does not submit or change answers.',
    inputSchema: { type: 'object', properties: {}, additionalProperties: false },
    annotations: { readOnlyHint: true, untrustedContentHint: false },
    async execute() {
      return safely(() => {
        const issues = validateApplication(applicationStore.getSnapshot())
        return { valid: issues.length === 0, issueCount: issues.length, issues }
      })
    },
  },
  {
    name: 'get_application_review',
    title: 'Get the application review',
    description:
      'Returns all current answers, validation issues, and visible agent changes. It cannot submit; final submission requires the applicant to use the human interface.',
    inputSchema: { type: 'object', properties: {}, additionalProperties: false },
    annotations: { readOnlyHint: true, untrustedContentHint: true },
    async execute() {
      return safely(() => {
        const review = getApplicationReview(applicationStore.getSnapshot())
        return {
          ...review,
          agentChanges: review.agentChanges.map(({ action, detail }) => ({ action, detail })),
        }
      })
    },
  },
]

export function registerWebMcpTools(
  documentObject: Document = document,
): { status: 'unsupported' } | { status: 'registering'; abort: () => void; ready: Promise<void> } {
  const context = documentObject.modelContext
  if (!context || typeof context.registerTool !== 'function') {
    return { status: 'unsupported' }
  }

  const controller = new AbortController()
  const ready = Promise.all(
    webMcpTools.map((tool) => context.registerTool(tool, { signal: controller.signal })),
  ).then(() => undefined)

  return {
    status: 'registering',
    abort: () => controller.abort(),
    ready,
  }
}
