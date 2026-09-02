import {
  configureAssistance,
  confirmProposal,
  createInitialState,
  getApplicationReview,
  getApplicationStep,
  inspectApplication,
  openReview,
  proposeAnswers,
  recordActivity,
  rejectProposal,
  setHumanAnswer,
  submitApplication,
  validateApplication,
  type ApplicationState,
  type AssistanceState,
  type QuestionId,
} from './domain'

type Listener = () => void

let state = createInitialState()
const listeners = new Set<Listener>()

function publish(nextState: ApplicationState): ApplicationState {
  if (nextState === state) return state
  state = nextState
  listeners.forEach((listener) => listener())
  return state
}

export const applicationStore = {
  getSnapshot: () => state,
  subscribe(listener: Listener) {
    listeners.add(listener)
    return () => listeners.delete(listener)
  },
  configure(input: Partial<AssistanceState>, actor: 'human' | 'agent') {
    return publish(configureAssistance(state, input, actor))
  },
  setHumanAnswer(questionId: QuestionId, value: string) {
    return publish(setHumanAnswer(state, questionId, value))
  },
  proposeAgentAnswers(inputs: readonly { questionId: string; value: unknown; rationale?: unknown }[]) {
    return publish(proposeAnswers(state, inputs))
  },
  confirmAgentProposal(questionId: QuestionId) {
    return publish(confirmProposal(state, questionId))
  },
  confirmAllAgentProposals() {
    let next = state
    for (const proposal of state.pendingProposals) next = confirmProposal(next, proposal.questionId)
    return publish(next)
  },
  rejectAgentProposal(questionId: QuestionId) {
    return publish(rejectProposal(state, questionId))
  },
  recordAgentTool(action: string, detail: string) {
    return publish(recordActivity(state, 'agent', `WebMCP · ${action}`, detail))
  },
  runValidation(actor: 'human' | 'agent') {
    const issues = validateApplication(state)
    const next = recordActivity(
      { ...state, validationVisible: true },
      actor === 'agent' ? 'agent' : 'service',
      actor === 'agent' ? 'WebMCP · validate_application' : 'Official checks ran',
      issues.length === 0 ? 'The site’s deterministic checks passed.' : `The site’s deterministic checks found ${issues.length} item${issues.length === 1 ? '' : 's'} to address.`,
    )
    publish(next)
    return issues
  },
  openReview() {
    return publish(openReview(state))
  },
  submit() {
    return publish(submitApplication(state))
  },
  reset() {
    return publish({ ...createInitialState(), announcement: 'Demo reset. The blank standard application is restored.' })
  },
  inspect: () => inspectApplication(state),
  getStep: () => getApplicationStep(state),
  getReview: () => getApplicationReview(state),
}
