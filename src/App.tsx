import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { applicationStore } from './applicationStore'
import {
  getApplicationReview,
  getApplicationStep,
  questions,
  requirements,
  validateApplication,
  type QuestionDefinition,
} from './domain'
import { registerWebMcpTools } from './webmcp'
import './App.css'

type WebMcpStatus = 'checking' | 'supported' | 'unsupported' | 'error'

function useWebMcpRegistration(): WebMcpStatus {
  const [status, setStatus] = useState<WebMcpStatus>(() =>
    document.modelContext ? 'checking' : 'unsupported',
  )

  useEffect(() => {
    const registration = registerWebMcpTools()
    if (registration.status === 'unsupported') {
      return
    }

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

  return (
    <div
      className="app-shell"
      data-mode={state.mode}
      data-reduced-motion={state.preferences.reducedMotion || undefined}
    >
      <a className="skip-link" href="#main-content">Skip to application</a>
      <div className="service-banner">
        <div className="page-width service-banner__inner">
          <span className="fictional-tag">Demonstration service</span>
          <span>Not a real council or grant application</span>
        </div>
      </div>

      <header className="site-header">
        <div className="page-width site-header__inner">
          <a className="brand" href="#main-content" aria-label="Alderwick Home Support home">
            <span className="brand__mark" aria-hidden="true">A</span>
            <span><strong>Alderwick</strong><small>Home Support</small></span>
          </a>
          <ResetControl />
        </div>
      </header>

      <main id="main-content" className="page-width main-content">
        {state.screen === 'submitted' ? (
          <SuccessPanel />
        ) : state.screen === 'review' ? (
          <ReviewPanel />
        ) : (
          <>
            <section className="intro" aria-labelledby="page-title">
              <div>
                <p className="eyebrow">Urgent home repair grant</p>
                <h1 id="page-title" tabIndex={-1}>
                  Get help with a safety-critical repair
                </h1>
                <p className="lede">
                  Check a short fictional application yourself or work with your chosen browser agent.
                  The same council-authored rules apply either way.
                </p>
              </div>
              <div className="intro__status" aria-label="Application status">
                <span>{questions.length}/{questions.length} answers present</span>
                <strong>{issues.length} checks need attention</strong>
              </div>
            </section>

            <AgentSupport status={webMcpStatus} />
            <InteractionControls />

            {state.preferences.keyboardNavigation && (
              <div className="keyboard-note" role="note">
                <strong>Keyboard guidance is on.</strong> Use Tab to move between controls, Space to
                choose checkboxes, and arrow keys inside answer groups.
              </div>
            )}

            <div className="safety-note" role="note">
              <strong>If anyone is in immediate danger, leave the property and contact the emergency services.</strong>
              <span>This demo cannot arrange emergency help.</span>
            </div>

            <div className="workspace-layout">
              <section className="application-column" aria-label="Grant application">
                {state.mode === 'overview' ? <OverviewForm /> : <GuidedForm />}
              </section>
              <aside className="side-column" aria-label="Application support and activity">
                <ValidationSummary />
                <RequirementSummary plainLanguage={state.preferences.plainLanguage} />
                <ActivityHistory />
              </aside>
            </div>
          </>
        )}
      </main>

      <footer className="site-footer">
        <div className="page-width">
          <strong>Alderwick is fictional.</strong> This prototype gives no real eligibility or safety advice.
        </div>
      </footer>
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {state.announcement}
      </div>
    </div>
  )
}

function ResetControl() {
  const dialogRef = useRef<HTMLDialogElement>(null)

  return (
    <>
      <button
        className="button button--quiet"
        type="button"
        onClick={() => dialogRef.current?.showModal()}
      >
        Reset demo
      </button>
      <dialog className="reset-dialog" ref={dialogRef} aria-labelledby="reset-title">
        <h2 id="reset-title">Reset the demo?</h2>
        <p>This clears every answer, preference and activity entry, then restores the original demo state.</p>
        <div className="form-actions">
          <button
            className="button button--primary"
            type="button"
            onClick={() => {
              applicationStore.reset()
              dialogRef.current?.close()
            }}
          >
            Reset demo
          </button>
          <button className="button button--quiet" type="button" onClick={() => dialogRef.current?.close()}>
            Keep current answers
          </button>
        </div>
      </dialog>
    </>
  )
}

function AgentSupport({ status }: { status: WebMcpStatus }) {
  const messages: Record<WebMcpStatus, { label: string; copy: string }> = {
    checking: {
      label: 'Checking agent connection',
      copy: 'The human application is ready while this browser is checked for WebMCP.',
    },
    supported: {
      label: 'Agent collaboration ready',
      copy: 'This browser can discover six narrow, site-authored WebMCP tools. Agent changes appear below.',
    },
    unsupported: {
      label: 'Agent tools unavailable in this browser',
      copy: 'You can still complete every step normally. For the agent demo, use a WebMCP-enabled Chrome environment.',
    },
    error: {
      label: 'Agent tools could not start',
      copy: 'The normal application still works. Reload in a WebMCP-enabled browser to retry agent collaboration.',
    },
  }
  const message = messages[status]

  return (
    <section className={`agent-support agent-support--${status}`} aria-labelledby="agent-status-title">
      <div className="agent-support__icon" aria-hidden="true">✦</div>
      <div>
        <h2 id="agent-status-title">{message.label}</h2>
        <p>{message.copy}</p>
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
      <div>
        <p className="eyebrow">Adapt the presentation</p>
        <h2 id="interaction-title">Choose how to work through the form</h2>
      </div>
      <div className="mode-switch" aria-label="Application presentation">
        <button
          type="button"
          aria-pressed={state.mode === 'overview'}
          onClick={() => applicationStore.configure({ mode: 'overview' }, 'human')}
        >
          Overview
          <small>See all questions</small>
        </button>
        <button
          type="button"
          aria-pressed={state.mode === 'guided'}
          onClick={() => applicationStore.configure({ mode: 'guided' }, 'human')}
        >
          Guided
          <small>One question at a time</small>
        </button>
      </div>
      <div className="preference-list">
        {preferenceLabels.map(([key, label]) => (
          <label key={key}>
            <input
              type="checkbox"
              checked={state.preferences[key]}
              onChange={(event) =>
                applicationStore.configure({ [key]: event.target.checked }, 'human')
              }
            />
            <span>{label}</span>
          </label>
        ))}
      </div>
    </section>
  )
}

function OverviewForm() {
  const state = applicationStore.getSnapshot()
  return (
    <form
      className="form-card"
      onSubmit={(event) => {
        event.preventDefault()
        runChecks()
      }}
      noValidate
    >
      <div className="section-heading">
        <p className="eyebrow">Application overview</p>
        <h2>Check the seeded answers</h2>
        <p>Two answers deliberately need attention so validation is easy to demonstrate.</p>
      </div>
      <div className="question-stack">
        {questions.map((question) => (
          <QuestionField
            key={question.id}
            question={question}
            value={String(state.answers[question.id] ?? '')}
            onChange={(value) => applicationStore.setHumanAnswer(question.id, value)}
          />
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
      <section className="form-card ready-card" aria-labelledby="guided-ready-title">
        <span className="ready-card__icon" aria-hidden="true">✓</span>
        <p className="eyebrow">Guided application complete</p>
        <h2 id="guided-ready-title">Every deterministic check passes</h2>
        <p>Move to review to check all answers and the visible agent history.</p>
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

  useEffect(() => {
    if (document.activeElement === document.body) {
      document.getElementById('guided-question-heading')?.focus()
    }
  }, [])

  return (
    <form
      className="form-card guided-card"
      onSubmit={(event) => {
        event.preventDefault()
        try {
          applicationStore.setHumanAnswer(step.question.id, draft)
          const next = applicationStore.getStep()
          if (next?.question.id === step.question.id) {
            setMessage(next.issue?.message ?? 'Check this answer before continuing.')
          }
        } catch (error) {
          setMessage(error instanceof Error ? error.message : 'Check this answer.')
        }
      }}
      noValidate
    >
      <div className="guided-progress" aria-label={`Question ${position} of ${questions.length}`}>
        <span style={{ width: `${(position / questions.length) * 100}%` }} />
      </div>
      <p className="eyebrow">Guided step · question {position} of {questions.length}</p>
      <h2 id="guided-question-heading" tabIndex={-1}>One question at a time</h2>
      {step.issue && (
        <div className="inline-issue" role="status">
          <strong>{step.issue.title}</strong>
          <span>{step.issue.message}</span>
        </div>
      )}
      <QuestionField question={step.question} value={draft} onChange={setDraft} focused />
      {message && <p className="field-error" role="alert">{message}</p>}
      <div className="form-actions">
        <button className="button button--primary" type="submit">Save and continue</button>
        <button
          className="button button--quiet"
          type="button"
          onClick={() => applicationStore.configure({ mode: 'overview' }, 'human')}
        >
          Show all questions
        </button>
      </div>
    </form>
  )
}

function QuestionField({
  question,
  value,
  onChange,
  focused = false,
}: {
  question: QuestionDefinition
  value: string
  onChange: (value: string) => void
  focused?: boolean
}) {
  const hintId = `${question.id}-hint`
  const inputProps = {
    id: question.id,
    name: question.id,
    value,
    'aria-describedby': hintId,
    autoFocus: focused,
  }

  if (question.input === 'radio' && question.options) {
    return (
      <fieldset className="question-field" id={question.id} tabIndex={-1}>
        <legend>{question.label}</legend>
        <p id={hintId} className="hint">{question.hint}</p>
        <div className="choice-list">
          {question.options.map((option) => (
            <label key={option.value}>
              <input
                type="radio"
                name={question.id}
                value={option.value}
                checked={value === option.value}
                onChange={(event) => onChange(event.target.value)}
              />
              <span>{option.label}</span>
            </label>
          ))}
        </div>
      </fieldset>
    )
  }

  return (
    <div className="question-field">
      <label htmlFor={question.id}>{question.label}</label>
      <p id={hintId} className="hint">{question.hint}</p>
      {question.input === 'textarea' ? (
        <textarea
          {...inputProps}
          rows={4}
          maxLength={500}
          onChange={(event) => onChange(event.target.value)}
        />
      ) : (
        <div className={question.id === 'estimated_cost' ? 'cost-input' : undefined}>
          {question.id === 'estimated_cost' && <span aria-hidden="true">£</span>}
          <input
            {...inputProps}
            type="text"
            inputMode={question.id === 'estimated_cost' ? 'numeric' : undefined}
            autoComplete={question.id === 'property_postcode' ? 'postal-code' : undefined}
            maxLength={question.id === 'property_postcode' ? 8 : undefined}
            onChange={(event) =>
              onChange(
                question.id === 'property_postcode'
                  ? event.target.value.toUpperCase()
                  : event.target.value,
              )
            }
          />
        </div>
      )}
    </div>
  )
}

function FormAction() {
  const issues = validateApplication(applicationStore.getSnapshot())
  return (
    <div className="form-actions">
      <button className="button button--primary" type="button" onClick={runChecks}>
        {issues.length > 0 ? 'Run checks' : 'Continue to review'}
      </button>
      <span>{issues.length > 0 ? `${issues.length} issues must be fixed` : 'All checks pass'}</span>
    </div>
  )
}

function runChecks() {
  const next = applicationStore.openReview()
  if (next.screen === 'application') {
    window.requestAnimationFrame(() => document.getElementById('validation-title')?.focus())
  }
}

function ValidationSummary() {
  const state = applicationStore.getSnapshot()
  const issues = validateApplication(state)
  return (
    <section className={`side-card validation-card ${issues.length === 0 ? 'is-valid' : ''}`} aria-labelledby="validation-title">
      <p className="eyebrow">Official checks</p>
      <h2 id="validation-title" tabIndex={-1}>
        {issues.length === 0 ? 'Ready for review' : 'There is a problem'}
      </h2>
      {issues.length === 0 ? (
        <p>Every deterministic eligibility and completeness check passes.</p>
      ) : (
        <>
          <p>Fix these answers before you review the application.</p>
          <ol className="issue-list">
            {issues.map((issue) => (
              <li key={issue.code}>
                <a href={`#${issue.questionId}`}>{issue.title}</a>
              </li>
            ))}
          </ol>
        </>
      )}
    </section>
  )
}

function RequirementSummary({ plainLanguage }: { plainLanguage: boolean }) {
  return (
    <details className="side-card requirement-card">
      <summary>What this demo checks</summary>
      <div className="requirement-list">
        {Object.values(requirements).map((requirement) => (
          <div key={requirement.id}>
            <strong>{requirement.title}</strong>
            <p>{plainLanguage ? requirement.plainLanguage : requirement.officialRule}</p>
            <small>{requirement.id}</small>
          </div>
        ))}
      </div>
    </details>
  )
}

function ActivityHistory() {
  const state = applicationStore.getSnapshot()
  return (
    <section className="side-card" aria-labelledby="activity-title">
      <p className="eyebrow">Shared activity</p>
      <h2 id="activity-title">Visible change history</h2>
      <ol className="activity-list">
        {state.history.length === 0 && <li className="activity-empty">No agent changes yet. Changes made by an agent will appear here.</li>}
        {[...state.history].reverse().map((entry) => (
          <li key={entry.id}>
            <span className={`activity-actor activity-actor--${entry.actor}`}>
              {entry.actor === 'agent' ? 'Agent' : entry.actor === 'human' ? 'You' : 'Demo'}
            </span>
            <div><strong>{entry.action}</strong><span>{entry.detail}</span></div>
          </li>
        ))}
      </ol>
    </section>
  )
}

function ReviewPanel() {
  const state = applicationStore.getSnapshot()
  const review = getApplicationReview(state)
  return (
    <section className="review-page" aria-labelledby="review-title">
      <button className="back-button" type="button" onClick={() => applicationStore.configure({ mode: state.mode }, 'human')}>
        ← Back to answers
      </button>
      <p className="eyebrow">Final human review</p>
      <h1 id="review-title">Check your answers before you submit</h1>
      <p className="lede">Review every answer. You can change anything that is not right. Nothing has been sent yet.</p>

      <div className="review-layout">
        <div className="review-card">
          <h2>Your answers</h2>
          <dl className="review-list">
            {review.answers.map((answer) => (
              <div key={answer.questionId}>
                <dt>{answer.label}</dt>
                <dd>{answer.value}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="review-card">
          <h2>Agent-made changes</h2>
          {review.agentChanges.length > 0 ? (
            <ol className="activity-list">
              {review.agentChanges.map((entry) => (
                <li key={entry.id}>
                  <span className="activity-actor activity-actor--agent">Agent</span>
                  <div><strong>{entry.action}</strong><span>{entry.detail}</span></div>
                </li>
              ))}
            </ol>
          ) : (
            <p>No answers or preferences were changed by an agent in this run.</p>
          )}
        </div>
      </div>

      <div className="human-submit">
        <div>
          <span className="human-only">Human action required</span>
          <h2>You must submit this yourself</h2>
          <p>An agent can help check and explain your answers, but it cannot submit this application.</p>
        </div>
        <button className="button button--submit" type="button" onClick={applicationStore.submit}>
          Submit application
        </button>
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
      <p className="eyebrow">Fictional submission complete</p>
      <h1 id="success-title">Your demo application has been submitted</h1>
      <p>
        Your fictional reference is <strong>ALD-DEMO-2047</strong>. Nothing was sent to a council. No one will contact you.
      </p>
      <div className="success-stats">
        <span><strong>{review.answers.length}</strong> answers reviewed</span>
        <span><strong>{review.agentChanges.length}</strong> agent changes recorded</span>
        <span><strong>1</strong> human submission</span>
      </div>
      <button className="button button--primary" type="button" onClick={applicationStore.reset}>
        Reset and run demo again
      </button>
    </section>
  )
}

export default App
