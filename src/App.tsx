import { useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from 'react'
import { applicationStore } from './applicationStore'
import {
  formatAnswer,
  getApplicationStep,
  getApplicationStepForQuestion,
  getPathway,
  getQuestion,
  isQuestionApplicable,
  requirements,
  sections,
  validateApplication,
  type PendingAnswerProposal,
  type QuestionDefinition,
  type QuestionId,
  type ValidationIssue,
} from './domain'
import { registerWebMcpTools, webMcpTools } from './webmcp'
import './App.css'

type WebMcpStatus = 'checking' | 'supported' | 'unsupported' | 'error'

const canonicalPrompt =
  'Use this site’s tools, not browser clicks. I use keyboard navigation. I own and live at AW2 4LA, receive Universal Credit, and my boiler failed two days ago. There is no heating or hot water. I have a £2,450 written estimate but no photos.'

function useWebMcpRegistration(): WebMcpStatus {
  const [status, setStatus] = useState<WebMcpStatus>(() =>
    document.modelContext ? 'checking' : 'unsupported',
  )

  useEffect(() => {
    const registration = registerWebMcpTools()
    if (registration.status === 'unsupported') return
    let active = true
    registration.ready.then(
      () => active && setStatus('supported'),
      () => active && setStatus('error'),
    )
    return () => {
      active = false
      registration.abort()
    }
  }, [])
  return status
}

export default function App() {
  const state = useSyncExternalStore(applicationStore.subscribe, applicationStore.getSnapshot)
  const webMcpStatus = useWebMcpRegistration()
  const [toolsOpen, setToolsOpen] = useState(false)
  const previousAssistance = useRef(state.assistance.active)
  const previousProposalCount = useRef(state.pendingProposals.length)
  const previousScreen = useRef(state.screen)

  useEffect(() => {
    document.title = state.screen === 'submitted'
      ? 'Form Less demo — Application received'
      : state.screen === 'review'
        ? 'Form Less demo — Check your answers'
        : state.assistance.active
          ? 'Form Less demo — Your personal pathway'
          : 'Form Less demo — Alderwick repair grant'
  }, [state.assistance.active, state.screen])

  useEffect(() => {
    if (!previousAssistance.current && state.assistance.active) {
      requestAnimationFrame(() => focusAndReveal('pathway-title', state.assistance.reducedMotion))
    }
    previousAssistance.current = state.assistance.active
  }, [state.assistance.active, state.assistance.reducedMotion])

  useEffect(() => {
    if (previousProposalCount.current === 0 && state.pendingProposals.length > 0) {
      requestAnimationFrame(() => focusAndReveal('proposal-title', state.assistance.reducedMotion))
    }
    previousProposalCount.current = state.pendingProposals.length
  }, [state.assistance.reducedMotion, state.pendingProposals.length])

  useLayoutEffect(() => {
    if (previousScreen.current !== state.screen) {
      const target = state.screen === 'review'
        ? 'review-title'
        : state.screen === 'submitted'
          ? 'success-title'
          : state.assistance.active
            ? 'pathway-title'
            : 'page-title'
      if (state.screen === 'review' || state.screen === 'submitted') {
        focusAtPageStart(target)
      } else {
        requestAnimationFrame(() => focusAndReveal(target, state.assistance.reducedMotion))
      }
    }
    previousScreen.current = state.screen
  }, [state.assistance.active, state.assistance.reducedMotion, state.screen])

  return (
    <div className="app-shell" data-assisted={state.assistance.active || undefined} data-reduced-motion={state.assistance.reducedMotion || undefined}>
      <a className="skip-link" href="#main-content">Skip to application</a>
      <PrototypeBanner />
      <SiteHeader status={webMcpStatus} onOpenTools={() => setToolsOpen(true)} />
      <main id="main-content" className="page-width main-content">
        {state.screen === 'submitted' ? <SuccessPanel /> : state.screen === 'review' ? <ReviewPanel /> : (
          <>
            {state.assistance.active ? <AssistedExperience /> : <><Hero /><StandardExperience /></>}
          </>
        )}
      </main>
      <SiteFooter />
      <AgentToolsDialog open={toolsOpen} status={webMcpStatus} onClose={() => setToolsOpen(false)} />
      <div className="sr-only" aria-live="polite" aria-atomic="true">{state.announcement}</div>
    </div>
  )
}

function focusAtPageStart(id: string) {
  const element = document.getElementById(id)
  if (!element) return
  element.focus({ preventScroll: true })
  window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  requestAnimationFrame(() => window.scrollTo({ top: 0, left: 0, behavior: 'auto' }))
}

function focusAndReveal(id: string, reducedMotion: boolean) {
  const element = document.getElementById(id)
  if (!element) return
  const region = element.closest<HTMLElement>('[data-focus-region]') ?? element
  const systemReduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
  element.focus({ preventScroll: true })
  region.scrollIntoView({ behavior: reducedMotion || systemReduced ? 'auto' : 'smooth', block: 'start' })
}

function PrototypeBanner() {
  return <div className="prototype-banner"><div className="page-width"><strong>Form Less · WebMCP demonstrator</strong><span>Alderwick Council is a fictional example. Nothing you enter leaves this page.</span></div></div>
}

function SiteHeader({ status, onOpenTools }: { status: WebMcpStatus; onOpenTools: () => void }) {
  const statusLabel = status === 'supported' ? 'connected' : status === 'checking' ? 'connecting' : 'unavailable'
  return (
    <header className="site-header">
      <div className="page-width site-header__inner">
        <a className="brand" href="#main-content"><span className="brand__mark" aria-hidden="true">A</span><span><strong>Alderwick Council</strong><small>Housing support</small></span></a>
        <div className="site-header__actions">
          <span className="case-reference">Application <strong>AW–0247</strong></span>
          <button className={`webmcp-button webmcp-button--${status}`} type="button" onClick={onOpenTools} aria-haspopup="dialog" aria-label={`WebMCP information: ${statusLabel}, ${webMcpTools.length} tools`}>
            <span className="webmcp-dot" aria-hidden="true" />
            <span>WebMCP</span>
            <small>{webMcpTools.length} tools</small>
          </button>
          <button className="text-button" type="button" onClick={() => applicationStore.reset()}>Reset demo</button>
        </div>
      </div>
    </header>
  )
}

function Hero() {
  return (
    <section className="hero" aria-labelledby="page-title">
      <div>
        <p className="eyebrow">Urgent home repair grant</p>
        <h1 id="page-title">Get help with an urgent repair to your home</h1>
        <p className="lede">Apply for help with essential heating, electrical, structural or water-damage work. Your answers determine which questions and evidence apply to your home.</p>
        <a className="start-link" href="#application-form">Start the full application</a>
      </div>
    </section>
  )
}

function AgentToolsDialog({ open, status, onClose }: { open: boolean; status: WebMcpStatus; onClose: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [copied, setCopied] = useState(false)
  const statusCopy = {
    checking: 'Connecting to native browser WebMCP…',
    supported: 'Native browser WebMCP is connected',
    unsupported: 'WebMCP is not available in this browser',
    error: 'WebMCP could not connect',
  }

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  function closeDialog() {
    setCopied(false)
    onClose()
  }

  async function copyPrompt() {
    try {
      await navigator.clipboard.writeText(canonicalPrompt)
      setCopied(true)
    } catch {
      setCopied(false)
    }
  }

  return (
    <dialog
      ref={dialogRef}
      className="tools-dialog"
      aria-labelledby="tools-dialog-title"
      aria-describedby="tools-dialog-description"
      onClose={closeDialog}
      onCancel={(event) => { event.preventDefault(); closeDialog() }}
      onClick={(event) => { if (event.target === event.currentTarget) closeDialog() }}
    >
      <div className="tools-dialog__surface">
        <header className="tools-dialog__header">
          <div>
            <p className="eyebrow">How Form Less works</p>
            <h2 id="tools-dialog-title">A fictional service with real WebMCP tools</h2>
            <p id="tools-dialog-description">Alderwick Council is the worked example. Form Less exposes the site's own form contract and safe actions so a compatible browser agent can inspect the service, request its approved focused layout, stage supported answers and run the site's checks.</p>
          </div>
          <button className="dialog-close" type="button" onClick={closeDialog} aria-label="Close WebMCP information">×</button>
        </header>

        <div className={`tools-status tools-status--${status}`} role="status">
          <span className="webmcp-dot" aria-hidden="true" />
          <strong>{statusCopy[status]}</strong>
          <span>{webMcpTools.length} tools · 0 submission tools</span>
        </div>

        <ol className="tools-list" aria-label="Available WebMCP tools">
          {webMcpTools.map((tool) => (
            <li key={tool.name}>
              <span className="tool-code" aria-hidden="true">&lt;/&gt;</span>
              <div><code>{tool.name}</code><span>{tool.title}</span></div>
              <small>{tool.name === 'propose_answers' ? 'Stages proposals' : tool.annotations?.readOnlyHint ? 'Read only' : 'Changes presentation'}</small>
            </li>
          ))}
        </ol>

        <section className="demo-instruction" aria-labelledby="demo-prompt-title">
          <div className="demo-instruction__heading"><div><p className="eyebrow">Try the complete journey</p><h3 id="demo-prompt-title">Ask your agent</h3></div><button className="copy-button" type="button" onClick={() => void copyPrompt()}>{copied ? 'Copied' : 'Copy prompt'}</button></div>
          <blockquote>{canonicalPrompt}</blockquote>
        </section>

        <div className="tools-boundary">
          <div><strong>Your agent can</strong><span>Inspect, adapt, explain, propose and check.</span></div>
          <div><strong>Only you can</strong><span>Accept answers, make the declaration and submit.</span></div>
        </div>
      </div>
    </dialog>
  )
}

function StandardExperience() {
  const state = applicationStore.getSnapshot()
  const pathway = getPathway(state)
  const issues = state.validationVisible ? validateApplication(state) : []
  return (
    <div className="standard-shell" id="application-form">
      <div className="standard-intro">
        <div><p className="eyebrow">Full application</p><h2>Apply for repair support</h2><p>Complete all five sections. Some questions will appear only after you tell us about your ownership, household finances and the repair.</p></div>
        <aside className="before-start" aria-labelledby="before-start-title">
          <strong id="before-start-title">Allow 30 to 45 minutes</strong>
          <span>Before you start, have these ready if they apply:</span>
          <ul>
            <li>proof of ownership or permission</li>
            <li>benefit or household income evidence</li>
            <li>a written estimate and photographs</li>
          </ul>
        </aside>
      </div>
      <div className="standard-grid">
        <aside className="section-nav" aria-label="Application sections">
          <p>In this application</p>
          <ol>{sections.map((section, index) => <li key={section.id}><a href={`#section-${section.id}`}><span>{String(index + 1).padStart(2, '0')}</span>{section.title}</a></li>)}</ol>
        </aside>
        <form className="standard-form" onSubmit={(event) => { event.preventDefault(); applicationStore.runValidation('human') }} noValidate>
          {state.validationVisible && <IssueSummary issues={issues} />}
          {sections.map((section, sectionIndex) => {
            const sectionQuestions = section.questions.map(getQuestion).filter((question) => isQuestionApplicable(question, state.answers))
            const possibleFollowUps = section.questions.map(getQuestion).filter((question) => pathway.undecidedQuestionIds.includes(question.id))
            return (
              <section className="form-section" id={`section-${section.id}`} key={section.id} aria-labelledby={`${section.id}-title`}>
                <header><span>{String(sectionIndex + 1).padStart(2, '0')}</span><div><h3 id={`${section.id}-title`}>{section.title}</h3><p>{section.description}</p></div></header>
                <div className="form-section__fields">
                  {sectionQuestions.map((question) => <QuestionField key={question.id} question={question} issue={issues.find((issue) => issue.questionId === question.id)} />)}
                  {possibleFollowUps.length > 0 && <PossibleFollowUps questions={possibleFollowUps} />}
                </div>
              </section>
            )
          })}
          <div className="form-actions"><button className="button button--primary" type="submit">Check my answers</button><span>We will show anything you need to fix before review.</span></div>
        </form>
      </div>
    </div>
  )
}

function PossibleFollowUps({ questions: possibleQuestions }: { questions: readonly QuestionDefinition[] }) {
  const groups = new Map<string, QuestionDefinition[]>()
  for (const question of possibleQuestions) {
    const condition = question.appliesWhen
    const values = condition
      ? 'equals' in condition ? [condition.equals] : condition.in
      : []
    const trigger = condition
      ? `If you answer ${values.map((value) => `“${formatAnswer(condition.field, value)}”`).join(' or ')}`
      : 'Depending on your earlier answers'
    groups.set(trigger, [...(groups.get(trigger) ?? []), question])
  }

  return (
    <aside className="possible-follow-ups" aria-label="Conditional questions that may also apply">
      <header>
        <strong>Other questions in this section</strong>
        <p>You may need to complete one of these parts after answering the questions above.</p>
      </header>
      <div className="conditional-groups">
        {[...groups.entries()].map(([trigger, groupQuestions]) => (
          <section className="conditional-group" key={trigger}>
            <header><strong>{trigger}</strong><span>{groupQuestions.length} {groupQuestions.length === 1 ? 'question' : 'questions'}</span></header>
            <div className="conditional-group__questions">
              {groupQuestions.map((question) => <ConditionalQuestionPreview question={question} key={question.id} />)}
            </div>
          </section>
        ))}
      </div>
    </aside>
  )
}

function ConditionalQuestionPreview({ question }: { question: QuestionDefinition }) {
  return (
    <article className="conditional-question">
      <strong>{question.label}</strong>
      <p>{question.hint}</p>
      <div className={`conditional-control conditional-control--${question.input}`} aria-hidden="true">
        {question.input === 'radio' && question.options
          ? <>{question.options.slice(0, 2).map((option) => <span className="conditional-choice" key={option.value}><i />{option.label}</span>)}{question.options.length > 2 && <small>+ {question.options.length - 2} more options</small>}</>
          : question.input === 'select'
            ? <span className="conditional-input">Select an answer <i>⌄</i></span>
            : question.input === 'checkbox'
              ? <span className="conditional-choice"><i />{question.options?.[0]?.label ?? 'Confirm'}</span>
              : question.input === 'textarea'
                ? <span className="conditional-textarea" />
                : <span className="conditional-input">{question.input === 'currency' ? '£' : ''}</span>}
      </div>
    </article>
  )
}

function AssistedExperience() {
  const state = applicationStore.getSnapshot()
  const pathway = getPathway(state)
  const suggestedStep = getApplicationStep(state)
  const [activeQuestionId, setActiveQuestionId] = useState<QuestionId | null>(() => suggestedStep?.question.id ?? null)
  const [proposalBatch, setProposalBatch] = useState<readonly PendingAnswerProposal[]>(() => [...state.pendingProposals])
  const [proposalDecisions, setProposalDecisions] = useState<Partial<Record<QuestionId, 'accepted' | 'rejected'>>>({})
  const [reviewingProposals, setReviewingProposals] = useState(state.pendingProposals.length > 0)
  const [showHumanHandoff, setShowHumanHandoff] = useState(false)
  const previousActiveQuestionId = useRef(activeQuestionId)
  const previousPendingCount = useRef(state.pendingProposals.length)
  const step = activeQuestionId
    ? getApplicationStepForQuestion(state, activeQuestionId) ?? suggestedStep
    : suggestedStep
  const issues = state.validationVisible ? validateApplication(state) : []

  useEffect(() => {
    if (previousPendingCount.current === 0 && state.pendingProposals.length > 0) {
      setProposalBatch([...state.pendingProposals])
      setProposalDecisions({})
      setReviewingProposals(true)
    }
    previousPendingCount.current = state.pendingProposals.length
  }, [state.pendingProposals])

  useEffect(() => {
    if (previousActiveQuestionId.current !== activeQuestionId) {
      requestAnimationFrame(() => focusAndReveal(activeQuestionId ? 'focused-question-title' : 'pathway-complete-title', state.assistance.reducedMotion))
    }
    previousActiveQuestionId.current = activeQuestionId
  }, [activeQuestionId, state.assistance.reducedMotion])

  function continueRoute() {
    setShowHumanHandoff(false)
    const nextQuestionId = applicationStore.getStep()?.question.id ?? null
    if (nextQuestionId === activeQuestionId) {
      focusAndReveal('focused-question-title', state.assistance.reducedMotion)
      return
    }
    setActiveQuestionId(nextQuestionId)
  }

  function decideProposal(questionId: QuestionId, decision: 'accepted' | 'rejected') {
    setProposalDecisions((current) => ({ ...current, [questionId]: decision }))
    if (decision === 'accepted') applicationStore.confirmAgentProposal(questionId)
    else applicationStore.rejectAgentProposal(questionId)
  }

  function acceptRemainingProposals() {
    const accepted = Object.fromEntries(
      state.pendingProposals.map((proposal) => [proposal.questionId, 'accepted']),
    ) as Partial<Record<QuestionId, 'accepted'>>
    setProposalDecisions((current) => ({ ...current, ...accepted }))
    applicationStore.confirmAllAgentProposals()
  }

  function finishProposalReview() {
    setReviewingProposals(false)
    setShowHumanHandoff(true)
    setActiveQuestionId(applicationStore.getStep()?.question.id ?? null)
  }

  return (
    <section className="assisted-shell" aria-labelledby="pathway-title">
      <header className="pathway-header" data-focus-region>
        <div><p className="eyebrow">Personalised view</p><h2 id="pathway-title" className="focus-target" tabIndex={-1}>Your application</h2><p>Based on the answers you confirm, this view keeps the questions and guidance that apply to you. The council’s rules have not changed.</p>{state.assistance.keyboardNavigation && <p className="pathway-keyboard-note"><strong>Keyboard route active.</strong> Use Tab between controls and arrow keys within answer choices.</p>}</div>
        <button className="text-button" type="button" onClick={() => applicationStore.configure({ active: false }, 'human')}>Return to standard form</button>
      </header>
      {reviewingProposals && proposalBatch.length > 0 ? (
        <ProposalQueue
          proposals={proposalBatch}
          decisions={proposalDecisions}
          pendingCount={state.pendingProposals.length}
          remainingCount={pathway.remainingRelevant}
          onDecide={decideProposal}
          onAcceptRemaining={acceptRemainingProposals}
          onContinue={finishProposalReview}
        />
      ) : (
        <>
          <div className="pathway-metrics" aria-label="Personal pathway summary">
            <div><strong>{pathway.totalQuestions}</strong><span>possible questions</span></div>
            <div><strong>{pathway.relevantQuestionIds.length}</strong><span>questions on your route</span></div>
            <div><strong>{pathway.notApplicableQuestionIds.length}</strong><span>questions not needed</span></div>
            <div><strong>{pathway.remainingRelevant}</strong><span>answers left</span></div>
            <div><strong>{pathway.documentsNeeded.length}</strong><span>documents to prepare</span></div>
          </div>
          {pathway.undecidedQuestionIds.length > 0 && (
            <p className="route-note" role="status">{pathway.undecidedQuestionIds.length} possible follow-up {pathway.undecidedQuestionIds.length === 1 ? 'is' : 'questions are'} waiting on your answers and {pathway.undecidedQuestionIds.length === 1 ? 'is' : 'are'} not counted as removed.</p>
          )}
          <div className="assisted-grid">
            <div className="focus-workspace">
              {state.validationVisible && issues.length > 0 && <IssueSummary issues={issues} />}
              {step ? <FocusedQuestion step={step} onContinue={continueRoute} handoff={showHumanHandoff ? { remainingCount: pathway.remainingRelevant, nextQuestion: step.question.label } : undefined} /> : <PathwayComplete />}
            </div>
            <aside className="case-trail">
              <PathwayMap />
              <EvidencePlan />
              <ActivityTrail />
            </aside>
          </div>
        </>
      )}
    </section>
  )
}

function ProposalQueue({ proposals, decisions, pendingCount, remainingCount, onDecide, onAcceptRemaining, onContinue }: {
  proposals: readonly PendingAnswerProposal[]
  decisions: Partial<Record<QuestionId, 'accepted' | 'rejected'>>
  pendingCount: number
  remainingCount: number
  onDecide: (questionId: QuestionId, decision: 'accepted' | 'rejected') => void
  onAcceptRemaining: () => void
  onContinue: () => void
}) {
  const state = applicationStore.getSnapshot()
  const acceptedCount = Object.values(decisions).filter((decision) => decision === 'accepted').length
  const rejectedCount = Object.values(decisions).filter((decision) => decision === 'rejected').length
  return (
    <section className="proposal-queue" aria-labelledby="proposal-title" data-focus-region>
      <header><span className="agent-orb" aria-hidden="true">A</span><div><p className="eyebrow">Your agent found these details</p><h3 id="proposal-title" className="focus-target" tabIndex={-1}>Preview the suggested answers</h3><p>This is how the information will appear in your application. Review it before anything is added.</p></div><span className="human-only">Your decision</span></header>
      <div className="proposal-review-grid">
        <aside className="proposal-review-panel" aria-label="Suggestion review progress">
          <p className="eyebrow">Review progress</p>
          <strong className="proposal-review-count">{acceptedCount} of {proposals.length}</strong>
          <span>answers added</span>
          <div className="proposal-review-progress" role="progressbar" aria-label={`${acceptedCount + rejectedCount} of ${proposals.length} suggestions reviewed`} aria-valuemin={0} aria-valuemax={proposals.length} aria-valuenow={acceptedCount + rejectedCount}><span style={{ width: `${((acceptedCount + rejectedCount) / proposals.length) * 100}%` }} /></div>
          {pendingCount > 0 ? (
            <><p>{acceptedCount === 0 ? 'Nothing has been added yet.' : `${pendingCount} ${pendingCount === 1 ? 'suggestion remains' : 'suggestions remain'} to review.`}</p><button className="button button--human" type="button" onClick={onAcceptRemaining}>Accept {pendingCount === proposals.length ? 'all' : `remaining ${pendingCount}`} {pendingCount === 1 ? 'suggestion' : 'suggestions'}</button><small>You can also review each field individually.</small></>
          ) : (
            <><p><strong>{acceptedCount} added</strong>{rejectedCount > 0 ? ` · ${rejectedCount} not used` : ''}. Your agent has used the facts it knew.</p><button className="button button--primary" type="button" onClick={onContinue}>Continue to {remainingCount} questions</button><small>The remaining answers need information only you can provide.</small></>
          )}
        </aside>
        <div className="proposal-list" aria-label="Suggested form answers">
          {proposals.map((proposal) => {
          const question = getQuestion(proposal.questionId)
          const current = state.answers[proposal.questionId]
          const decision = decisions[proposal.questionId]
          const sectionTitle = sections.find((section) => section.questions.includes(proposal.questionId))?.title ?? 'Application'
          return (
            <article className="proposal-item" key={proposal.questionId} data-decision={decision ?? 'pending'}>
              <p className="proposal-section">{sectionTitle}</p>
              <h4>{question.label}</h4>
              <p className="proposal-hint">{question.hint}</p>
              <div className="proposal-value"><small>Suggested answer</small><strong>{formatAnswer(proposal.questionId, proposal.value)}</strong></div>
              {proposal.rationale && <p className="proposal-rationale">{proposal.rationale}</p>}
              <div className="proposal-actions">
                {decision ? (
                  <span className={`proposal-decision proposal-decision--${decision}`} role="status">{decision === 'accepted' ? `Added to application: ${formatAnswer(proposal.questionId, current ?? proposal.value)}` : 'Not used'}</span>
                ) : (
                  <><button className="button button--human" type="button" onClick={() => onDecide(proposal.questionId, 'accepted')}>Use this answer</button><button className="text-button" type="button" onClick={() => onDecide(proposal.questionId, 'rejected')}>Not right</button></>
                )}
              </div>
            </article>
          )
          })}
        </div>
      </div>
    </section>
  )
}

function HumanHandoff({ remainingCount, nextQuestion }: { remainingCount: number; nextQuestion: string }) {
  return <section className="human-handoff" aria-label="Questions that still need you"><p className="eyebrow">Now it’s your turn</p><strong>{remainingCount} questions still need you</strong><span>Your agent left these blank because your message did not contain the answer. Start with: “{nextQuestion}”</span></section>
}

function FocusedQuestion({ step, onContinue, handoff }: { step: NonNullable<ReturnType<typeof getApplicationStep>>; onContinue: () => void; handoff?: { remainingCount: number; nextQuestion: string } }) {
  const state = applicationStore.getSnapshot()
  const pathway = getPathway(state)
  const position = pathway.relevantQuestionIds.indexOf(step.question.id) + 1
  const issue = state.validationVisible || step.reason === 'needs-correction' ? step.issue ?? undefined : undefined
  const hasAnswer = step.currentValue !== null && String(step.currentValue).trim().length > 0
  return (
    <section className="focus-card" aria-labelledby="focused-question-title" data-focus-region>
      {handoff && <HumanHandoff remainingCount={handoff.remainingCount} nextQuestion={handoff.nextQuestion} />}
      <div className="focus-card__meta"><span>{step.sectionTitle}</span><span>Question {position} of {pathway.relevantQuestionIds.length}</span></div>
      <div className="focus-progress" role="progressbar" aria-label={`${pathway.answeredRelevant} of ${pathway.relevantQuestionIds.length} relevant answers complete`} aria-valuemin={0} aria-valuemax={pathway.relevantQuestionIds.length} aria-valuenow={pathway.answeredRelevant}><span style={{ width: `${(pathway.answeredRelevant / pathway.relevantQuestionIds.length) * 100}%` }} /></div>
      {state.assistance.plainLanguage && <p className="why-asked"><strong>Why you are seeing this</strong>{step.whyAsked}</p>}
      <div id="focused-question-title" className="focus-target" tabIndex={-1}><QuestionField question={step.question} issue={issue} emphasized /></div>
      {step.question.requirementId && <RequirementCard requirementId={step.question.requirementId} />}
      <div className="form-actions"><button className="button button--primary" type="button" disabled={!hasAnswer} onClick={onContinue}>Continue</button><span>Your route updates from the answers you confirm.</span></div>
    </section>
  )
}

function PathwayComplete() {
  return <section className="focus-card focus-card--complete" data-focus-region><span className="complete-mark" aria-hidden="true">✓</span><p className="eyebrow">Route complete</p><h3 id="pathway-complete-title" className="focus-target" tabIndex={-1}>Your application passes every check</h3><p>You have answered every question and made the declaration. Read through everything once more before submitting.</p><button className="button button--primary" type="button" onClick={() => applicationStore.openReview()}>Review my answers</button></section>
}

function QuestionField({ question, issue, emphasized = false }: { question: QuestionDefinition; issue?: ValidationIssue; emphasized?: boolean }) {
  const state = applicationStore.getSnapshot()
  const value = String(state.answers[question.id] ?? '')
  const hintId = `${question.id}-hint`
  const errorId = `${question.id}-error`
  const describedBy = issue ? `${hintId} ${errorId}` : hintId
  const setValue = (next: string) => applicationStore.setHumanAnswer(question.id, next)
  const commitValue = (next: string) => applicationStore.commitHumanAnswer(question.id, next)

  if (question.input === 'checkbox') {
    return (
      <fieldset id={question.id} className={`question-field question-field--checkbox ${issue ? 'question-field--invalid' : ''} ${emphasized ? 'question-field--emphasized' : ''}`} aria-describedby={describedBy} aria-invalid={issue ? true : undefined}>
        <legend>{question.label}</legend><p className="hint" id={hintId}>{question.hint}</p>
        <label className="check-choice"><input type="checkbox" checked={value === 'yes'} onChange={(event) => setValue(event.target.checked ? 'yes' : '')} /><span>I confirm</span></label>
        {issue && <p className="field-error" id={errorId}>{issue.message}</p>}
      </fieldset>
    )
  }

  if (question.input === 'radio' && question.options) {
    return (
      <fieldset id={question.id} className={`question-field ${issue ? 'question-field--invalid' : ''} ${emphasized ? 'question-field--emphasized' : ''}`} aria-describedby={describedBy} aria-invalid={issue ? true : undefined}>
        <legend>{question.label}</legend><p className="hint" id={hintId}>{question.hint}</p>
        <div className="choice-list">{question.options.map((option) => <label key={option.value}><input type="radio" name={question.id} value={option.value} checked={value === option.value} onChange={(event) => setValue(event.target.value)} /><span>{option.label}</span></label>)}</div>
        {issue && <p className="field-error" id={errorId}>{issue.message}</p>}
      </fieldset>
    )
  }

  const common = { id: question.id, name: question.id, value, 'aria-describedby': describedBy, 'aria-invalid': issue ? true as const : undefined }
  return (
    <div className={`question-field ${issue ? 'question-field--invalid' : ''} ${emphasized ? 'question-field--emphasized' : ''}`}>
      <label htmlFor={question.id}>{question.label}</label><p className="hint" id={hintId}>{question.hint}</p>
      {question.input === 'textarea' ? <textarea {...common} rows={5} maxLength={question.maxLength} onChange={(event) => setValue(event.target.value)} onBlur={(event) => commitValue(event.target.value)} />
        : question.input === 'select' && question.options ? <select {...common} onChange={(event) => setValue(event.target.value)}><option value="">Select an answer</option>{question.options.map((option) => <option value={option.value} key={option.value}>{option.label}</option>)}</select>
          : <div className={question.input === 'currency' ? 'prefixed-input' : undefined}>{question.input === 'currency' && <span aria-hidden="true">£</span>}<input {...common} type="text" inputMode={question.type === 'integer' ? 'numeric' : undefined} onChange={(event) => setValue(event.target.value)} onBlur={(event) => commitValue(event.target.value)} /></div>}
      {issue && <p className="field-error" id={errorId}>{issue.message}</p>}
    </div>
  )
}

function IssueSummary({ issues }: { issues: readonly ValidationIssue[] }) {
  if (issues.length === 0) return <div className="issue-summary issue-summary--clear" role="status"><strong>Your answers pass the council’s checks.</strong><span>Nothing else needs attention before review.</span></div>
  return <section className="issue-summary" aria-labelledby="issues-title"><h3 id="issues-title">Check {issues.length} {issues.length === 1 ? 'answer' : 'answers'}</h3><ul>{issues.slice(0, 6).map((issue) => <li key={issue.code}><a href={`#${issue.questionId}`}>{issue.message}</a></li>)}</ul>{issues.length > 6 && <p>There are {issues.length - 6} more. Your route will take you through each one.</p>}</section>
}

function RequirementCard({ requirementId }: { requirementId: keyof typeof requirements }) {
  const requirement = requirements[requirementId]
  return <details className="requirement-card"><summary>Council rule and evidence: {requirement.title}</summary><div><strong>{requirement.officialRule}</strong><small>What counts as evidence: {requirement.evidence}</small></div></details>
}

function PathwayMap() {
  const state = applicationStore.getSnapshot()
  const pathway = getPathway(state)
  return <section className="rail-card"><p className="eyebrow">Your route</p><h3>{pathway.currentSection ?? 'Ready to review'}</h3><ol className="pathway-list">{sections.map((section) => { const ids = section.questions.filter((id) => pathway.relevantQuestionIds.includes(id)); const waiting = section.questions.filter((id) => pathway.undecidedQuestionIds.includes(id)).length; const done = ids.filter((id) => state.answers[id] !== undefined).length; return <li key={section.id} data-complete={ids.length > 0 && done === ids.length || undefined}><span>{done}/{ids.length}</span><div><strong>{section.title}</strong><small>{waiting > 0 ? `${waiting} possible follow-up${waiting === 1 ? '' : 's'} waiting` : ids.length === 0 ? 'Not needed for this route' : 'Applies to you'}</small></div></li> })}</ol></section>
}

function EvidencePlan() {
  const pathway = getPathway(applicationStore.getSnapshot())
  return <section className="rail-card"><p className="eyebrow">Documents</p><h3>{pathway.documentsNeeded.length === 0 ? 'You have what you need' : `Prepare ${pathway.documentsNeeded.length} ${pathway.documentsNeeded.length === 1 ? 'item' : 'items'}`}</h3>{pathway.documentsNeeded.length > 0 ? <ul>{pathway.documentsNeeded.map((item) => <li key={item}>{item}</li>)}</ul> : <p>Your confirmed answers meet the evidence rules for this demonstration.</p>}</section>
}

function ActivityTrail() {
  const history = applicationStore.getSnapshot().history
  const confirmations = history.filter((entry) => entry.action === 'You confirmed an agent proposal')
  const otherEntries = history.filter((entry) => entry.action !== 'You confirmed an agent proposal')
  const displayEntries = confirmations.length > 1
    ? [...otherEntries, {
        id: confirmations.at(-1)?.id ?? 0,
        actor: 'human' as const,
        action: `${confirmations.length} suggestions accepted`,
        detail: 'The proposed answers were added after human review.',
      }]
    : history
  return <section className="rail-card"><p className="eyebrow">What changed</p><h3>Activity</h3>{displayEntries.length === 0 ? <p>No changes have been made.</p> : <ol className="activity-list">{[...displayEntries].sort((a, b) => b.id - a.id).slice(0, 7).map((entry) => <li key={entry.id} data-actor={entry.actor}><span aria-hidden="true">{entry.actor === 'agent' ? 'A' : entry.actor === 'human' ? 'Y' : 'R'}</span><div><strong>{entry.action}</strong><small>{entry.detail}</small></div></li>)}</ol>}</section>
}

function ReviewPanel() {
  const review = applicationStore.getReview()
  return (
    <section className="review-panel" aria-labelledby="review-title" data-focus-region>
      <p className="eyebrow">Final review</p><h1 id="review-title" className="focus-target" tabIndex={-1}>Review your answers</h1>
      <div className="review-boundary"><strong>Only you can submit this application.</strong><span>Your agent can check this page, but the website gives it no submission tool.</span></div>
      <dl>{review.answers.map((item) => <div key={item.questionId}><dt>{item.label}</dt><dd>{item.value}</dd></div>)}</dl>
      <div className="review-actions"><button className="button button--primary" type="button" onClick={() => applicationStore.submit()}>Submit fictional application</button><button className="text-button" type="button" onClick={() => applicationStore.returnToApplication()}>Return to application</button></div>
    </section>
  )
}

function SuccessPanel() {
  return <section className="success-panel" data-focus-region><span className="complete-mark" aria-hidden="true">✓</span><p className="eyebrow">Demonstration complete</p><h1 id="success-title" className="focus-target" tabIndex={-1}>Application received</h1><p>Your reference is <strong>ALD-DEMO-2047</strong>. Nothing was sent to a real council.</p><button className="button button--primary" type="button" onClick={() => applicationStore.reset()}>Start again</button></section>
}

function SiteFooter() {
  return <footer className="site-footer"><div className="page-width"><strong>Form Less</strong><span>WebMCP technology demonstrator · Alderwick Council is fictional</span></div></footer>
}
