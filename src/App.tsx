import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { applicationStore } from './applicationStore'
import {
  formatAnswer,
  getApplicationReview,
  getApplicationStep,
  getQuestion,
  questions,
  requirements,
  validateApplication,
  type QuestionDefinition,
  type QuestionId,
  type ValidationIssue,
} from './domain'
import { registerWebMcpTools } from './webmcp'
import './App.css'

type WebMcpStatus = 'checking' | 'supported' | 'unsupported' | 'error'

const canonicalPrompt =
  'I use keyboard navigation. Guide me one question at a time and help fix anything blocking this application.'

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

function App() {
  const state = useSyncExternalStore(
    applicationStore.subscribe,
    applicationStore.getSnapshot,
  )
  const webMcpStatus = useWebMcpRegistration()
  const issues = validateApplication(state)
  const answered = questions.filter((question) => {
    const answer = state.answers[question.id]
    return answer !== undefined && String(answer).trim() !== ''
  }).length
  const previousModeRef = useRef(state.mode)
  const previousProposalRef = useRef(state.pendingProposal)

  useEffect(() => {
    const page = state.screen === 'submitted'
      ? 'Demo submitted'
      : state.screen === 'review'
        ? 'Check your answers'
        : state.mode === 'guided'
          ? 'Guided application'
          : 'Application overview'
    document.title = `${page} — Alderwick Home Support`
  }, [state.mode, state.screen])

  useEffect(() => {
    const previousMode = previousModeRef.current
    previousModeRef.current = state.mode
    const latestActivity = state.history.at(-1)

    if (
      previousMode !== state.mode
      && state.mode === 'guided'
      && latestActivity?.actor === 'agent'
    ) {
      const frame = window.requestAnimationFrame(() => {
        focusAndReveal('guided-question-heading', state.preferences.reducedMotion)
      })
      return () => window.cancelAnimationFrame(frame)
    }
  }, [state.history, state.mode, state.preferences.reducedMotion])

  useEffect(() => {
    const previousProposal = previousProposalRef.current
    previousProposalRef.current = state.pendingProposal

    if (previousProposal === null && state.pendingProposal !== null) {
      const frame = window.requestAnimationFrame(() => {
        focusAndReveal('pending-proposal', state.preferences.reducedMotion)
      })
      return () => window.cancelAnimationFrame(frame)
    }
  }, [state.pendingProposal, state.preferences.reducedMotion])

  return (
    <div
      className="app-shell"
      data-mode={state.mode}
      data-reduced-motion={state.preferences.reducedMotion || undefined}
    >
      <a className="skip-link" href="#main-content">Skip to application</a>
      <PrototypeBanner />
      <SiteHeader />

      <main id="main-content" className="page-width main-content">
        {state.screen === 'submitted' ? (
          <SuccessPanel />
        ) : state.screen === 'review' ? (
          <ReviewPanel />
        ) : (
          <>
            <CaseMasthead answered={answered} issueCount={issues.length} />
            <AuthorityStrip />
            <AgentBrief status={webMcpStatus} />
            <InteractionControls />

            {state.preferences.keyboardNavigation && (
              <div className="keyboard-note" role="note">
                <span className="note-symbol" aria-hidden="true">⌨</span>
                <div>
                  <strong>Keyboard guidance is on</strong>
                  <span>Use Tab to move between controls and arrow keys inside answer groups.</span>
                </div>
              </div>
            )}

            <div className="safety-note" role="note">
              <span className="note-symbol" aria-hidden="true">!</span>
              <div>
                <strong>If anyone is in immediate danger, leave the property and contact the emergency services.</strong>
                <span>This demo cannot arrange emergency help.</span>
              </div>
            </div>

            {state.pendingProposal && <PendingProposalPanel />}

            <div className="case-desk">
              <section className="case-workspace" aria-label="Grant application case workspace">
                <WorkspaceHeading />
                {state.mode === 'overview' ? <OverviewForm /> : <GuidedForm />}
              </section>
              <aside className="collaboration-rail" aria-label="Case status and collaboration trail">
                <ValidationSummary />
                <ActivityHistory />
                <RequirementSummary plainLanguage={state.preferences.plainLanguage} />
                <TechnicalProof />
              </aside>
            </div>
          </>
        )}
      </main>

      <SiteFooter />
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {state.announcement}
      </div>
    </div>
  )
}

function focusAndReveal(elementId: string, reducedMotion: boolean) {
  const element = document.getElementById(elementId)
  if (!element) return

  const operatingSystemReducesMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
  const behavior: ScrollBehavior = reducedMotion || operatingSystemReducesMotion ? 'auto' : 'smooth'
  element.focus({ preventScroll: true })
  element.scrollIntoView({ behavior, block: 'start' })
}

function PrototypeBanner() {
  return (
    <div className="prototype-banner">
      <div className="page-width prototype-banner__inner">
        <span className="fictional-tag">Fictional prototype</span>
        <span>Alderwick is not a real council. No application or personal information is sent anywhere.</span>
      </div>
    </div>
  )
}

function SiteHeader() {
  return (
    <header className="site-header">
      <div className="page-width site-header__inner">
        <a className="brand" href="#main-content" aria-label="Alderwick Home Support home">
          <span className="brand__mark" aria-hidden="true"><span>A</span></span>
          <span><strong>Alderwick</strong><small>Home Support</small></span>
        </a>
        <div className="header-meta" aria-label="Demo case"><span>Case</span><strong>AW–0247</strong></div>
        <ResetControl />
      </div>
    </header>
  )
}

function CaseMasthead({ answered, issueCount }: { answered: number; issueCount: number }) {
  return (
    <section className="case-masthead" aria-labelledby="page-title">
      <div className="case-masthead__copy">
        <p className="eyebrow">Urgent home-repair grant</p>
        <h1 id="page-title" tabIndex={-1}>
          A civic form that adapts to the person—<em>not the other way around.</em>
        </h1>
        <p className="lede">
          Complete this fictional application yourself, or let a compatible browser agent
          adapt, explain and check it while you stay in control.
        </p>
      </div>
      <div className="case-status" aria-label="Application status">
        <p className="case-status__label">Live case status</p>
        <div className="case-status__measure">
          <strong>{answered}</strong>
          <span>of {questions.length}<br />answers present</span>
        </div>
        <div className={`case-status__result ${issueCount === 0 ? 'is-clear' : ''}`}>
          <span className="status-dot" aria-hidden="true" />
          <strong>{issueCount === 0 ? 'Official checks clear' : `${issueCount} things need attention`}</strong>
        </div>
        <span className="case-status__submission">Not submitted</span>
      </div>
    </section>
  )
}

function AuthorityStrip() {
  const roles = [
    { kind: 'agent', eyebrow: 'Agent', title: 'Assists', copy: 'Adapts, explains, proposes and checks', symbol: '✦' },
    { kind: 'human', eyebrow: 'You', title: 'Decide', copy: 'Answer, confirm and submit', symbol: '●' },
    { kind: 'service', eyebrow: 'Alderwick rules', title: 'Determine', copy: 'Eligibility and completeness stay deterministic', symbol: '✓' },
  ] as const

  return (
    <section className="authority-strip" aria-labelledby="authority-title">
      <h2 id="authority-title" className="sr-only">Who controls each part of the application</h2>
      {roles.map((role) => (
        <div className={`authority-role authority-role--${role.kind}`} key={role.kind}>
          <span className="authority-role__symbol" aria-hidden="true">{role.symbol}</span>
          <div>
            <span className="authority-role__label">{role.eyebrow}</span>
            <strong>{role.title}</strong>
            <small>{role.copy}</small>
          </div>
        </div>
      ))}
    </section>
  )
}

function AgentBrief({ status }: { status: WebMcpStatus }) {
  const messages: Record<WebMcpStatus, { label: string; copy: string }> = {
    checking: { label: 'Checking agent connection', copy: 'The human application is ready while this browser is checked for WebMCP.' },
    supported: { label: 'Agent collaboration ready', copy: 'This browser can discover six narrow, site-authored WebMCP tools.' },
    unsupported: { label: 'Agent tools unavailable here', copy: 'The complete human application still works. Use a WebMCP-enabled browser for the agent demo.' },
    error: { label: 'Agent tools could not start', copy: 'The normal application still works. Reload in a WebMCP-enabled browser to retry.' },
  }
  const message = messages[status]

  return (
    <section className={`agent-brief agent-brief--${status}`} aria-labelledby="agent-status-title">
      <div className="agent-brief__status">
        <span className="agent-orb" aria-hidden="true">✦</span>
        <div>
          <p className="eyebrow">WebMCP connection</p>
          <h2 id="agent-status-title">{message.label}</h2>
          <p>{message.copy}</p>
        </div>
      </div>
      <div className="prompt-card">
        <span>Try this with your browser agent</span>
        <blockquote>“{canonicalPrompt}”</blockquote>
      </div>
    </section>
  )
}

function InteractionControls() {
  const state = applicationStore.getSnapshot()
  const preferenceLabels = [
    ['keyboardNavigation', 'Keyboard guidance'],
    ['reducedMotion', 'Reduce motion'],
    ['plainLanguage', 'Plain-language rules'],
  ] as const

  return (
    <section className="interaction-panel" aria-labelledby="interaction-title">
      <div className="interaction-panel__heading">
        <span className="section-number" aria-hidden="true">01</span>
        <div><p className="eyebrow">Working preferences</p><h2 id="interaction-title">Choose how the case desk works for you</h2></div>
      </div>
      <div className="mode-switch" aria-label="Application presentation">
        <button type="button" aria-pressed={state.mode === 'overview'} onClick={() => applicationStore.configure({ mode: 'overview' }, 'human')}>
          <span>Overview</span><small>See all questions</small>
        </button>
        <button type="button" aria-pressed={state.mode === 'guided'} onClick={() => applicationStore.configure({ mode: 'guided' }, 'human')}>
          <span>Guided</span><small>One question at a time</small>
        </button>
      </div>
      <fieldset className="preference-list">
        <legend className="sr-only">Additional presentation preferences</legend>
        {preferenceLabels.map(([key, label]) => (
          <label key={key}>
            <input type="checkbox" checked={state.preferences[key]} onChange={(event) => applicationStore.configure({ [key]: event.target.checked }, 'human')} />
            <span>{label}</span>
          </label>
        ))}
      </fieldset>
    </section>
  )
}

function WorkspaceHeading() {
  const state = applicationStore.getSnapshot()
  return (
    <div className="workspace-heading">
      <div><p className="eyebrow">Case workspace</p><h2>{state.mode === 'guided' ? 'Focused guidance' : 'Full application'}</h2></div>
      <span className={`mode-badge mode-badge--${state.mode}`}>{state.mode === 'guided' ? 'One question at a time' : 'All questions visible'}</span>
    </div>
  )
}

function PendingProposalPanel() {
  const proposal = applicationStore.getSnapshot().pendingProposal
  if (!proposal) return null

  const question = getQuestion(proposal.questionId)
  const proposedValue = formatAnswer(proposal.questionId, proposal.value)
  const currentValue = applicationStore.getSnapshot().answers[proposal.questionId]

  const finish = (decision: 'confirm' | 'reject') => {
    const questionId = proposal.questionId
    if (decision === 'confirm') applicationStore.confirmAgentProposal()
    else applicationStore.rejectAgentProposal()

    window.requestAnimationFrame(() => {
      const state = applicationStore.getSnapshot()
      if (state.mode === 'guided') document.getElementById('guided-question-heading')?.focus()
      else document.getElementById(questionId)?.focus()
    })
  }

  return (
    <section id="pending-proposal" className="proposal-panel" aria-labelledby="proposal-title" aria-describedby="proposal-instruction" tabIndex={-1}>
      <div className="proposal-panel__header">
        <span className="agent-orb" aria-hidden="true">✦</span>
        <div><p className="eyebrow">Agent → human handoff</p><h2 id="proposal-title">Your decision is required</h2><p>The agent proposed an answer. Nothing has changed yet.</p></div>
        <span className="human-decision-tag">Only you can decide</span>
      </div>
      <div className="proposal-question">{question.label}</div>
      <div className="proposal-compare">
        <div className="answer-sheet answer-sheet--current"><span>Current application answer</span><strong>{currentValue === undefined ? 'Not answered' : formatAnswer(proposal.questionId, currentValue)}</strong></div>
        <span className="proposal-arrow" aria-hidden="true">→</span>
        <div className="answer-sheet answer-sheet--agent"><span>Agent proposal</span><strong>{proposedValue}</strong></div>
      </div>
      <div className="proposal-decision">
        <p id="proposal-instruction"><span aria-hidden="true">◇</span>The application changes only if you confirm this answer.</p>
        <div className="proposal-actions">
          <button className="button button--human" type="button" onClick={() => finish('confirm')}>Confirm proposed answer</button>
          <button className="button button--quiet" type="button" onClick={() => finish('reject')}>Reject</button>
        </div>
      </div>
    </section>
  )
}

function OverviewForm() {
  const state = applicationStore.getSnapshot()
  const issues = validateApplication(state)
  return (
    <form className="application-sheet application-sheet--overview" onSubmit={(event) => { event.preventDefault(); runChecks() }} noValidate>
      <div className="sheet-heading">
        <div><p className="eyebrow">Application overview</p><h3>Check the seeded answers</h3></div>
        <p>Two answers deliberately need attention so the site-authored checks are easy to demonstrate.</p>
      </div>
      <div className="question-stack">
        {questions.map((question, index) => (
          <div className="question-row" key={question.id}>
            <span className="question-row__number" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
            <QuestionField
              question={question}
              value={String(state.answers[question.id] ?? '')}
              issue={issues.find((issue) => issue.questionId === question.id)}
              onChange={(value) => applicationStore.setHumanAnswer(question.id, value)}
            />
          </div>
        ))}
      </div>
      <FormAction />
    </form>
  )
}

function GuidedForm() {
  const state = applicationStore.getSnapshot()
  const step = getApplicationStep(state)

  if (!step) {
    return (
      <section className="application-sheet ready-sheet" aria-labelledby="guided-ready-title">
        <span className="ready-mark" aria-hidden="true">✓</span>
        <p className="eyebrow">Guided application complete</p>
        <h3 id="guided-ready-title">Every official check passes</h3>
        <p>Move to review to check all answers and the visible collaboration trail.</p>
        <FormAction />
      </section>
    )
  }

  return <GuidedQuestion key={`${step.question.id}:${String(step.currentValue)}`} step={step} />
}

function GuidedQuestion({ step }: { step: NonNullable<ReturnType<typeof getApplicationStep>> }) {
  const [draft, setDraft] = useState(String(step.currentValue ?? ''))
  const [message, setMessage] = useState('')
  const position = questions.findIndex((question) => question.id === step.question.id) + 1
  const requirement = step.question.requirementId ? requirements[step.question.requirementId] : null

  useEffect(() => {
    if (document.activeElement === document.body) document.getElementById('guided-question-heading')?.focus()
  }, [])

  return (
    <form className="application-sheet application-sheet--guided" onSubmit={(event) => {
      event.preventDefault()
      try {
        applicationStore.setHumanAnswer(step.question.id, draft)
        const next = applicationStore.getStep()
        if (next?.question.id === step.question.id) setMessage(next.issue?.message ?? 'Check this answer before continuing.')
      } catch (error) {
        setMessage(error instanceof Error ? error.message : 'Check this answer.')
      }
    }} noValidate>
      <div className="guided-header">
        <div><p>Question {position} of {questions.length}</p><h3 id="guided-question-heading" tabIndex={-1}>One question at a time</h3></div>
        <span>{Math.round((position / questions.length) * 100)}% through the form</span>
      </div>
      <div
        className="guided-progress"
        role="progressbar"
        aria-label={`Question ${position} of ${questions.length}`}
        aria-valuemin={1}
        aria-valuemax={questions.length}
        aria-valuenow={position}
      >
        <span style={{ width: `${(position / questions.length) * 100}%` }} />
      </div>
      {step.issue && (
        <div id="guided-current-issue" className="inline-issue" role="status">
          <span className="inline-issue__mark" aria-hidden="true">!</span>
          <div>
            <strong>{step.issue.title}</strong>
            {step.issue.message !== step.issue.title && <span>{step.issue.message}</span>}
          </div>
        </div>
      )}
      <div className="guided-question">
        <QuestionField
          question={step.question}
          value={draft}
          issue={step.issue ?? undefined}
          issueId="guided-current-issue"
          showIssue={false}
          onChange={setDraft}
        />
      </div>
      {requirement && (
        <details className="current-rule" open={applicationStore.getSnapshot().preferences.plainLanguage}>
          <summary>Explain the official demo rule</summary>
          <div><span>Alderwick rule</span><strong>{requirement.officialRule}</strong><p>{requirement.plainLanguage}</p></div>
        </details>
      )}
      {message && <p className="field-error" role="alert">{message}</p>}
      <div className="form-actions form-actions--guided">
        <button className="button button--primary" type="submit">Save and continue</button>
        <button className="button button--quiet" type="button" onClick={() => applicationStore.configure({ mode: 'overview' }, 'human')}>Show all questions</button>
      </div>
    </form>
  )
}

function QuestionField({
  question,
  value,
  onChange,
  issue,
  issueId = `${question.id}-error`,
  showIssue = true,
}: {
  question: QuestionDefinition
  value: string
  onChange: (value: string) => void
  issue?: ValidationIssue
  issueId?: string
  showIssue?: boolean
}) {
  const hintId = `${question.id}-hint`
  const describedBy = issue ? `${hintId} ${issueId}` : hintId
  const inputProps = {
    id: question.id,
    name: question.id,
    value,
    'aria-describedby': describedBy,
    'aria-invalid': issue ? true : undefined,
  }

  if (question.input === 'radio' && question.options) {
    return (
      <fieldset
        className={`question-field ${issue ? 'question-field--invalid' : ''}`}
        id={question.id}
        tabIndex={-1}
        aria-describedby={describedBy}
        aria-invalid={issue ? true : undefined}
      >
        <legend>{question.label}</legend>
        <p id={hintId} className="hint">{question.hint}</p>
        <div className="choice-list">
          {question.options.map((option) => (
            <label key={option.value}>
              <input type="radio" name={question.id} value={option.value} checked={value === option.value} onChange={(event) => onChange(event.target.value)} />
              <span>{option.label}</span>
            </label>
          ))}
        </div>
        {issue && showIssue && <p id={issueId} className="field-error">{issue.message}</p>}
      </fieldset>
    )
  }

  return (
    <div className={`question-field ${issue ? 'question-field--invalid' : ''}`} id={`${question.id}-field`}>
      <label htmlFor={question.id}>{question.label}</label>
      <p id={hintId} className="hint">{question.hint}</p>
      {question.input === 'textarea' ? (
        <textarea {...inputProps} rows={4} maxLength={500} onChange={(event) => onChange(event.target.value)} />
      ) : (
        <div className={question.id === 'estimated_cost' ? 'cost-input' : undefined}>
          {question.id === 'estimated_cost' && <span aria-hidden="true">£</span>}
          <input {...inputProps} type="text" inputMode={question.id === 'estimated_cost' ? 'numeric' : undefined} autoComplete={question.id === 'property_postcode' ? 'postal-code' : undefined} maxLength={question.id === 'property_postcode' ? 8 : undefined} onChange={(event) => onChange(question.id === 'property_postcode' ? event.target.value.toUpperCase() : event.target.value)} />
        </div>
      )}
      {issue && showIssue && <p id={issueId} className="field-error">{issue.message}</p>}
    </div>
  )
}

function FormAction() {
  const state = applicationStore.getSnapshot()
  const issues = validateApplication(state)
  if (state.pendingProposal) {
    return (
      <div className="form-actions">
        <button className="button button--human" type="button" onClick={() => document.getElementById('pending-proposal')?.focus()}>Review proposed answer</button>
        <span>Confirm or reject the proposal before review</span>
      </div>
    )
  }
  return (
    <div className="form-actions">
      <button className="button button--primary" type="button" onClick={runChecks}>{issues.length > 0 ? 'Run official checks' : 'Continue to review'}</button>
      <span>{issues.length > 0 ? `${issues.length} issues must be fixed` : 'All official checks pass'}</span>
    </div>
  )
}

function runChecks() {
  const next = applicationStore.openReview()
  if (next.screen === 'application') window.requestAnimationFrame(() => document.getElementById('validation-title')?.focus())
}

function ValidationSummary() {
  const state = applicationStore.getSnapshot()
  const issues = validateApplication(state)
  return (
    <section className={`rail-card validation-card ${issues.length === 0 ? 'is-valid' : ''}`} aria-labelledby="validation-title">
      <div className="rail-card__heading">
        <span className="rail-icon rail-icon--service" aria-hidden="true">✓</span>
        <div><p className="eyebrow">Application check</p><h2 id="validation-title" tabIndex={-1}>{issues.length === 0 ? 'Ready for review' : `${issues.length} things need attention`}</h2></div>
      </div>
      {issues.length === 0 ? (
        <p className="validation-result">Every deterministic eligibility and completeness check passes.</p>
      ) : (
        <><p>These results come from Alderwick’s site-authored rules.</p><ol className="issue-list">{issues.map((issue) => <li key={issue.code}><a href={`#${issue.questionId}`}>{issue.title}</a></li>)}</ol></>
      )}
    </section>
  )
}

function ActivityHistory() {
  const state = applicationStore.getSnapshot()
  return (
    <section className="rail-card trail-card" aria-labelledby="activity-title">
      <div className="rail-card__heading">
        <span className="rail-icon rail-icon--trail" aria-hidden="true">↳</span>
        <div><p className="eyebrow">Shared case trail</p><h2 id="activity-title">Who did what</h2></div>
      </div>
      <ol className="activity-list">
        {state.history.length === 0 && <li className="activity-empty"><span className="activity-node activity-node--demo" aria-hidden="true">01</span><div><strong>Demo case opened</strong><span>Agent and human decisions will appear here.</span></div></li>}
        {[...state.history].reverse().map((entry) => (
          <li key={entry.id}>
            <span className={`activity-node activity-node--${entry.actor}`} aria-hidden="true">{entry.actor === 'agent' ? '✦' : entry.actor === 'human' ? '●' : '○'}</span>
            <div><span className={`activity-actor activity-actor--${entry.actor}`}>{entry.actor === 'agent' ? 'Agent' : entry.actor === 'human' ? 'You' : 'Demo'}</span><strong>{entry.action}</strong><span>{entry.detail}</span></div>
          </li>
        ))}
      </ol>
    </section>
  )
}

function RequirementSummary({ plainLanguage }: { plainLanguage: boolean }) {
  return (
    <details className="rail-card requirement-card">
      <summary><span>View all six official demo rules</span><small>{plainLanguage ? 'Plain-language view' : 'Official wording'}</small></summary>
      <div className="requirement-list">
        {Object.values(requirements).map((requirement) => <div key={requirement.id}><span>{requirement.id}</span><strong>{requirement.title}</strong><p>{plainLanguage ? requirement.plainLanguage : requirement.officialRule}</p></div>)}
      </div>
    </details>
  )
}

function TechnicalProof() {
  return (
    <section className="rail-card proof-card" aria-labelledby="proof-title">
      <p className="eyebrow">Built-in boundaries</p><h2 id="proof-title">WebMCP is load-bearing</h2>
      <ul><li><strong>6</strong><span>site-authored tools</span></li><li><strong>0</strong><span>submission tools</span></li><li><strong>1</strong><span>shared application state</span></li></ul>
    </section>
  )
}

function ReviewPanel() {
  const state = applicationStore.getSnapshot()
  const review = getApplicationReview(state)
  const groups: Array<{ title: string; ids: QuestionId[] }> = [
    { title: 'Your home', ids: ['property_postcode', 'owner_occupier'] },
    { title: 'Financial condition', ids: ['financial_criterion'] },
    { title: 'The repair', ids: ['repair_type', 'repair_description', 'urgent_impact', 'estimated_cost'] },
    { title: 'Supporting evidence', ids: ['evidence_status'] },
  ]

  const editAnswer = (questionId: QuestionId) => {
    applicationStore.configure({ mode: 'overview' }, 'human')
    window.requestAnimationFrame(() => document.getElementById(questionId)?.focus())
  }

  return (
    <section className="review-page" aria-labelledby="review-title">
      <button className="back-button" type="button" onClick={() => applicationStore.configure({ mode: state.mode }, 'human')}><span aria-hidden="true">←</span> Back to answers</button>
      <div className="review-heading">
        <div><p className="eyebrow">Final human review</p><h1 id="review-title">Check your answers before you submit</h1><p className="lede">Nothing has been sent. Review every answer and the collaboration trail.</p></div>
        <div className="review-ready"><span aria-hidden="true">✓</span><strong>All official checks pass</strong></div>
      </div>
      <div className="review-layout">
        <div className="review-sheet">
          {groups.map((group) => (
            <section key={group.title}>
              <h2>{group.title}</h2>
              <dl className="review-list">
                {review.answers.filter((answer) => group.ids.includes(answer.questionId)).map((answer) => (
                  <div key={answer.questionId} id={`review-${answer.questionId}`}>
                    <dt>{answer.label}</dt><dd>{answer.value}</dd>
                    <button className="review-change" type="button" aria-label={`Change ${answer.label.toLowerCase()}`} onClick={() => editAnswer(answer.questionId)}>Change</button>
                  </div>
                ))}
              </dl>
            </section>
          ))}
        </div>
        <div className="review-trail">
          <p className="eyebrow">Collaboration record</p><h2>Agent assistance stayed visible</h2>
          {review.agentChanges.length > 0 ? (
            <ol className="activity-list">{review.agentChanges.map((entry) => <li key={entry.id}><span className="activity-node activity-node--agent" aria-hidden="true">✦</span><div><span className="activity-actor activity-actor--agent">Agent</span><strong>{entry.action}</strong><span>{entry.detail}</span></div></li>)}</ol>
          ) : <p>You completed these answers without agent changes.</p>}
          <div className="review-boundary"><span>Agent authority ends here</span><p>The agent can prepare this review. It cannot confirm answers or submit the application.</p></div>
        </div>
      </div>
      <div className="human-submit">
        <div><span className="human-only">Human action required</span><h2>You must submit this yourself</h2><p>Select the button only when every answer is right. This remains a fictional demonstration.</p></div>
        <button className="button button--human button--submit" type="button" onClick={applicationStore.submit}>Submit application</button>
      </div>
    </section>
  )
}

function SuccessPanel() {
  const state = applicationStore.getSnapshot()
  const review = getApplicationReview(state)
  return (
    <section className="success-panel" aria-labelledby="success-title">
      <span className="success-panel__check" aria-hidden="true">✓</span>
      <p className="eyebrow">Fictional submission complete</p><h1 id="success-title">Human decision recorded</h1>
      <p className="success-panel__lede">Your fictional reference is <strong>ALD-DEMO-2047</strong>. Nothing was sent to a council and no one will contact you.</p>
      <div className="success-stats"><span><strong>{review.answers.length}</strong>answers reviewed</span><span><strong>{review.agentChanges.length}</strong>agent actions visible</span><span><strong>1</strong>human submission</span></div>
      <div className="success-proof"><span>Agent assisted</span><span aria-hidden="true">→</span><span>You confirmed</span><span aria-hidden="true">→</span><span>Rules passed</span><span aria-hidden="true">→</span><strong>You submitted</strong></div>
      <button className="button button--primary" type="button" onClick={applicationStore.reset}>Reset and run the demo again</button>
    </section>
  )
}

function ResetControl() {
  const dialogRef = useRef<HTMLDialogElement>(null)
  return (
    <>
      <button className="button button--quiet header-reset" type="button" onClick={() => dialogRef.current?.showModal()}>Reset demo</button>
      <dialog className="reset-dialog" ref={dialogRef} aria-labelledby="reset-title">
        <p className="eyebrow">Case control</p><h2 id="reset-title">Reset the demo?</h2>
        <p>This clears every answer, preference and activity entry, then restores the original demo state.</p>
        <div className="form-actions">
          <button className="button button--primary" type="button" onClick={() => { applicationStore.reset(); dialogRef.current?.close() }}>Reset demo</button>
          <button className="button button--quiet" type="button" onClick={() => dialogRef.current?.close()}>Keep current answers</button>
        </div>
      </dialog>
    </>
  )
}

function SiteFooter() {
  return (
    <footer className="site-footer"><div className="page-width site-footer__inner"><div><strong>Alderwick is fictional.</strong><span>This prototype gives no real eligibility or safety advice.</span></div><span>Built to demonstrate human-controlled WebMCP collaboration.</span></div></footer>
  )
}

export default App
