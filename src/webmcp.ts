import { applicationStore } from './applicationStore'
import {
  DomainError,
  explainRequirement,
  getApplicationReview,
  questions,
  requirements,
  type AssistanceState,
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
  registerTool(tool: WebMcpTool, options?: { signal?: AbortSignal }): Promise<undefined>
}

declare global {
  interface Document {
    modelContext?: ModelContextLike
  }
}

async function safely(run: () => unknown): Promise<unknown> {
  try {
    return run()
  } catch (error) {
    if (error instanceof DomainError) {
      return { ok: false, error: { code: error.code, message: error.message } }
    }
    throw error
  }
}

const agentWritableQuestionIds = questions
  .filter((question) => question.agentWritable)
  .map((question) => question.id)
const requirementIds = Object.keys(requirements)

export const webMcpTools: readonly WebMcpTool[] = [
  {
    name: 'inspect_application',
    title: 'Inspect the application contract',
    description:
      'Returns the site-authored form structure, answer types, conditional branches, allowed values, current answers, and personal pathway. Use this instead of scraping the page or guessing field relationships.',
    inputSchema: { type: 'object', properties: {}, additionalProperties: false },
    annotations: { readOnlyHint: true, untrustedContentHint: true },
    async execute() {
      return safely(() => {
        const result = applicationStore.inspect()
        applicationStore.recordAgentTool('inspect_application', `The agent inspected ${result.questions.length} structured questions across ${result.sections.length} sections.`)
        return result
      })
    },
  },
  {
    name: 'configure_assistance',
    title: 'Configure a personal application pathway',
    description:
      'Activates the service’s approved focused layout and presentation preferences. This changes only the interface; it never changes answers, policy, eligibility, or submission state.',
    inputSchema: {
      type: 'object',
      properties: {
        active: { type: 'boolean', description: 'Use the approved focused pathway instead of the standard multi-section form.' },
        keyboardNavigation: { type: 'boolean', description: 'Show keyboard-specific navigation guidance.' },
        reducedMotion: { type: 'boolean', description: 'Disable non-essential interface motion.' },
        plainLanguage: { type: 'boolean', description: 'Show concise site-authored explanations beside relevant questions.' },
      },
      additionalProperties: false,
    },
    annotations: { readOnlyHint: false, untrustedContentHint: false },
    async execute(input) {
      return safely(() => {
        const state = applicationStore.configure(input as Partial<AssistanceState>, 'agent')
        return {
          assistance: state.assistance,
          pathway: applicationStore.inspect().pathway,
          answersChanged: false,
        }
      })
    },
  },
  {
    name: 'propose_answers',
    title: 'Propose structured application answers',
    description:
      'Maps information the applicant supplied into up to eight schema-valid proposals. Proposals are displayed for individual human confirmation and never alter stored answers by themselves. The applicant declaration is unavailable to agents.',
    inputSchema: {
      type: 'object',
      properties: {
        proposals: {
          type: 'array',
          minItems: 1,
          maxItems: 8,
          items: {
            type: 'object',
            properties: {
              questionId: { type: 'string', enum: agentWritableQuestionIds },
              value: { oneOf: [{ type: 'string' }, { type: 'number' }] },
              rationale: { type: 'string', maxLength: 180, description: 'Briefly state which applicant-provided fact supports this proposal.' },
            },
            required: ['questionId', 'value'],
            additionalProperties: false,
          },
        },
      },
      required: ['proposals'],
      additionalProperties: false,
    },
    annotations: { readOnlyHint: false, untrustedContentHint: true },
    async execute(input) {
      return safely(() => {
        const proposals = Array.isArray(input.proposals) ? input.proposals : []
        const state = applicationStore.proposeAgentAnswers(proposals as Array<{ questionId: string; value: unknown; rationale?: unknown }>)
        return {
          proposed: state.pendingProposals.length,
          stored: 0,
          proposalQuestionIds: state.pendingProposals.map((proposal) => proposal.questionId),
          instruction: 'The applicant must confirm or reject every proposal in the visible page.',
        }
      })
    },
  },
  {
    name: 'explain_requirement',
    title: 'Explain an official requirement',
    description:
      'Returns the service-authored rule, plain-language explanation, and accepted evidence for one requirement. It does not invent policy or decide eligibility.',
    inputSchema: {
      type: 'object',
      properties: { requirementId: { type: 'string', enum: requirementIds } },
      required: ['requirementId'],
      additionalProperties: false,
    },
    annotations: { readOnlyHint: true, untrustedContentHint: false },
    async execute(input) {
      return safely(() => {
        const result = explainRequirement(String(input.requirementId ?? ''))
        applicationStore.recordAgentTool('explain_requirement', `The agent retrieved the site-authored “${result.title}” rule.`)
        return result
      })
    },
  },
  {
    name: 'validate_application',
    title: 'Run official application checks',
    description:
      'Runs deterministic validation generated from the form schema and service rules. It returns every actionable issue without changing answers or submitting.',
    inputSchema: { type: 'object', properties: {}, additionalProperties: false },
    annotations: { readOnlyHint: true, untrustedContentHint: false },
    async execute() {
      return safely(() => {
        const issues = applicationStore.runValidation('agent')
        return { valid: issues.length === 0, issueCount: issues.length, issues }
      })
    },
  },
  {
    name: 'get_application_review',
    title: 'Get the application review',
    description:
      'Returns the current relevant answers, pathway, validation issues, and authority boundary. It cannot submit; final submission exists only in the human interface.',
    inputSchema: { type: 'object', properties: {}, additionalProperties: false },
    annotations: { readOnlyHint: true, untrustedContentHint: true },
    async execute() {
      return safely(() => {
        const review = getApplicationReview(applicationStore.getSnapshot())
        applicationStore.recordAgentTool('get_application_review', `The agent reviewed ${review.answers.length} relevant answers. Submission remains human-only.`)
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
  if (!context || typeof context.registerTool !== 'function') return { status: 'unsupported' }

  const controller = new AbortController()
  const ready = Promise.all(webMcpTools.map((tool) => context.registerTool(tool, { signal: controller.signal }))).then(() => undefined)
  return { status: 'registering', abort: () => controller.abort(), ready }
}
