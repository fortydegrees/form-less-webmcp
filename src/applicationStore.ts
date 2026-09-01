import {
  configureInteraction,
  confirmPendingProposal,
  createInitialState,
  getApplicationReview,
  getApplicationStep,
  openReview,
  proposeAnswer,
  rejectPendingProposal,
  setHumanAnswer,
  submitApplication,
  type ApplicationState,
  type InteractionPreferences,
  type PresentationMode,
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
  configure(
    input: Partial<InteractionPreferences> & { mode?: PresentationMode },
    actor: 'human' | 'agent',
  ) {
    return publish(configureInteraction(state, input, actor))
  },
  setHumanAnswer(questionId: QuestionId, value: string) {
    return publish(setHumanAnswer(state, questionId, value))
  },
  proposeAgentAnswer(input: { questionId: string; value: unknown }) {
    return publish(proposeAnswer(state, input, 'agent'))
  },
  confirmAgentProposal() {
    return publish(confirmPendingProposal(state))
  },
  rejectAgentProposal() {
    return publish(rejectPendingProposal(state))
  },
  openReview() {
    return publish(openReview(state))
  },
  submit() {
    return publish(submitApplication(state))
  },
  reset() {
    return publish({
      ...createInitialState(),
      announcement: 'Demo reset. Original answers and presentation restored.',
    })
  },
  getStep: () => getApplicationStep(state),
  getReview: () => getApplicationReview(state),
}
