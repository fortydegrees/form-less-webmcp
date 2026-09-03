import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { applicationStore } from './applicationStore'
import {
  formatAnswer,
  getApplicationStep,
  getPathway,
  getQuestion,
  isQuestionApplicable,
  questions,
  requirements,
  sections,
  validateApplication,
  type QuestionDefinition,
  type ValidationIssue,
} from './domain'
import { registerWebMcpTools, webMcpTools } from './webmcp'
import './App.css'

type WebMcpStatus = 'checking' | 'supported' | 'unsupported' | 'error'

const canonicalPrompt =
  'Use this site’s tools, not browser clicks. I use keyboard navigation. I own and live at AW2 4LA, receive Universal Credit, and my boiler failed two days ago. There is no heating or hot water. I have a £2,450 written estimate but no photos. Show me only the questions that apply, explain why they matter, and suggest answers only where I have given you the facts. Do not submit.'

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

  useEffect(() => {
    document.title = state.screen === 'submitted'
      ? 'Demo submitted — Alderwick Home Support'
      : state.screen === 'review'
        ? 'Check your answers — Alderwick Home Support'
        : state.assistance.active
          ? 'Your personal pathway — Alderwick Home Support'
          : 'Urgent home-repair grant — Alderwick Home Support'
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

  return (
    <div className="app-shell" data-assisted={state.assistance.active || undefined} data-reduced-motion={state.assistance.reducedMotion || undefined}>
      <a className="skip-link" href="#main-content">Skip to application</a>
      <PrototypeBanner />
      <SiteHeader status={webMcpStatus} onOpenTools={() => setToolsOpen(true)} />
      <main id="main-content" className="page-width main-content">
        {state.screen === 'submitted' ? <SuccessPanel /> : state.screen === 'review' ? <ReviewPanel /> : (
          <>
            <Hero assisted={state.assistance.active} />
            {state.assistance.keyboardNavigation && <KeyboardNote />}
            {state.assistance.active ? <AssistedExperience /> : <StandardExperience />}
          </>
        )}
      </main>
      <SiteFooter />
      <AgentToolsDialog open={toolsOpen} status={webMcpStatus} onClose={() => setToolsOpen(false)} />
      <div className="sr-only" aria-live="polite" aria-atomic="true">{state.announcement}</div>
    </div>
  )
}

function focusAndReveal(id: string, reducedMotion: boolean) {
  const element = document.getElementById(id)
  if (!element) return
  const systemReduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
  element.focus({ preventScroll: true })
  element.scrollIntoView({ behavior: reducedMotion || systemReduced ? 'auto' : 'smooth', block: 'start' })
}

function PrototypeBanner() {
  return <div className="prototype-banner"><div className="page-width"><strong>Demonstration service</strong><span>Alderwick is fictional. Nothing you enter leaves this page.</span></div></div>
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

function Hero({ assisted }: { assisted: boolean }) {
  return (
    <section className="hero" aria-labelledby="page-title">
      <div>
        <p className="eyebrow">Urgent home repair grant</p>
        <h1 id="page-title">Get help with an urgent repair to your home</h1>
        <p className="lede">Apply for help with essential heating, electrical, structural or water-damage work. Your answers determine which questions and evidence apply to your home.</p>
        {!assisted && <a className="start-link" href="#application-form">Start the full application</a>}
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
            <p className="eyebrow">Agent tools for this service</p>
            <h2 id="tools-dialog-title">This application supports WebMCP</h2>
            <p id="tools-dialog-description">A compatible browser agent can read the form contract, request the council-approved focused layout, suggest answers and run official checks.</p>
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

function KeyboardNote() {
  return <div className="keyboard-note" role="note"><strong>Keyboard route active.</strong> Use Tab to move between controls and arrow keys within answer choices.</div>
}

function StandardExperience() {
  const state = applicationStore.getSnapshot()
  const issues = state.validationVisible ? validateApplication(state) : []
  const applicable = questions.filter((question) => isQuestionApplicable(question, state.answers))
  const answered = getPathway(state).answeredRelevant
  return (
    <div className="standard-shell" id="application-form">
      <div className="standard-intro">
        <div><p className="eyebrow">Full application</p><h2>Apply for repair support</h2><p>This service can ask up to {questions.length} questions across five sections. Your answers determine which ownership, financial, repair and evidence branches appear.</p></div>
        <div className="completion"><strong>{questions.length}</strong><span>possible questions</span><small>{answered}/{applicable.length} on the current route answered</small></div>
      </div>
      <div className="standard-grid">
        <aside className="section-nav" aria-label="Application sections">
          <p>In this application</p>
          <ol>{sections.map((section, index) => <li key={section.id}><a href={`#section-${section.id}`}><span>{String(index + 1).padStart(2, '0')}</span>{section.title}</a></li>)}</ol>
        </aside>
        <form className="standard-form" onSubmit={(event) => { event.preventDefault(); applicationStore.runValidation('human') }} noValidate>
          <div className="safety-note"><strong>If anyone is in immediate danger</strong>Leave the property and contact the emergency services. This demonstration service cannot arrange emergency help.</div>
          {state.validationVisible && <IssueSummary issues={issues} />}
          {sections.map((section, sectionIndex) => {
            const sectionQuestions = section.questions.map(getQuestion).filter((question) => isQuestionApplicable(question, state.answers))
            return (
              <section className="form-section" id={`section-${section.id}`} key={section.id} aria-labelledby={`${section.id}-title`}>
                <header><span>{String(sectionIndex + 1).padStart(2, '0')}</span><div><h3 id={`${section.id}-title`}>{section.title}</h3><p>{section.description}</p></div></header>
                <div className="form-section__fields">
                  {sectionQuestions.map((question) => <QuestionField key={question.id} question={question} issue={issues.find((issue) => issue.questionId === question.id)} />)}
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

function AssistedExperience() {
  const state = applicationStore.getSnapshot()
  const pathway = getPathway(state)
  const step = getApplicationStep(state)
  const issues = state.validationVisible ? validateApplication(state) : []
  return (
    <section className="assisted-shell" aria-labelledby="pathway-title">
      <header className="pathway-header">
        <div><p className="eyebrow">Built from this application</p><h2 id="pathway-title" tabIndex={-1}>Your route through the form</h2><p>Your agent has brought the relevant questions and guidance into one focused route. Confirmed answers decide what is not needed; the council’s rules have not changed.</p></div>
        <button className="text-button text-button--light" type="button" onClick={() => applicationStore.configure({ active: false }, 'human')}>Return to standard form</button>
      </header>
      <div className="pathway-metrics" aria-label="Personal pathway summary">
        <div><strong>{pathway.totalQuestions}</strong><span>possible questions</span></div>
        <div><strong>{pathway.relevantQuestionIds.length}</strong><span>questions on your route</span></div>
        <div><strong>{pathway.notApplicableQuestionIds.length}</strong><span>questions not needed</span></div>
        <div><strong>{pathway.remainingRelevant}</strong><span>answers left</span></div>
        <div><strong>{pathway.documentsNeeded.length}</strong><span>documents to prepare</span></div>
      </div>
      {(state.pendingProposals.length > 0 || pathway.undecidedQuestionIds.length > 0) && (
        <p className="route-note" role="status">
          {state.pendingProposals.length > 0
            ? `${state.pendingProposals.length} drafted answers are waiting for your review. They do not change the route until you accept them.`
            : `${pathway.undecidedQuestionIds.length} possible follow-up ${pathway.undecidedQuestionIds.length === 1 ? 'is' : 'questions are'} waiting on your answers and ${pathway.undecidedQuestionIds.length === 1 ? 'is' : 'are'} not counted as removed.`}
        </p>
      )}
      {state.pendingProposals.length > 0 && <ProposalQueue />}
      <div className="assisted-grid">
        <div className="focus-workspace">
          {state.validationVisible && issues.length > 0 && <IssueSummary issues={issues} />}
          {step ? <FocusedQuestion step={step} /> : <PathwayComplete />}
        </div>
        <aside className="case-trail">
          <PathwayMap />
          <EvidencePlan />
          <ActivityTrail />
        </aside>
      </div>
    </section>
  )
}

function ProposalQueue() {
  const state = applicationStore.getSnapshot()
  return (
    <section className="proposal-queue" aria-labelledby="proposal-title">
      <header><span className="agent-orb" aria-hidden="true">A</span><div><p className="eyebrow">Answers waiting for you</p><h3 id="proposal-title" tabIndex={-1}>Check {state.pendingProposals.length} suggested answers</h3><p>Your agent matched details you gave against the form. Nothing changes until you accept it.</p></div><span className="human-only">Your decision</span></header>
      <div className="proposal-list">
        {state.pendingProposals.map((proposal) => {
          const question = getQuestion(proposal.questionId)
          const current = state.answers[proposal.questionId]
          return (
            <article className="proposal-item" key={proposal.questionId}>
              <div className="proposal-copy"><small>{question.shortLabel}</small><strong>{formatAnswer(proposal.questionId, proposal.value)}</strong>{proposal.rationale && <p>{proposal.rationale}</p>}<span>Current: {current === undefined ? 'Not answered' : formatAnswer(proposal.questionId, current)}</span></div>
              <div className="proposal-actions"><button className="button button--human" type="button" onClick={() => applicationStore.confirmAgentProposal(proposal.questionId)}>Use this answer</button><button className="text-button" type="button" onClick={() => applicationStore.rejectAgentProposal(proposal.questionId)}>Not right</button></div>
            </article>
          )
        })}
      </div>
      {state.pendingProposals.length > 1 && <div className="proposal-bulk"><p>Use this only after checking every suggestion.</p><button className="button button--human" type="button" onClick={() => applicationStore.confirmAllAgentProposals()}>Use all checked answers</button></div>}
    </section>
  )
}

function FocusedQuestion({ step }: { step: NonNullable<ReturnType<typeof getApplicationStep>> }) {
  const state = applicationStore.getSnapshot()
  const pathway = getPathway(state)
  const position = pathway.relevantQuestionIds.indexOf(step.question.id) + 1
  const issue = state.validationVisible ? step.issue ?? undefined : undefined
  return (
    <section className="focus-card" aria-labelledby="focused-question-title">
      <div className="focus-card__meta"><span>{step.sectionTitle}</span><span>Question {position} of {pathway.relevantQuestionIds.length}</span></div>
      <div className="focus-progress" role="progressbar" aria-label={`${pathway.answeredRelevant} of ${pathway.relevantQuestionIds.length} relevant answers complete`} aria-valuemin={0} aria-valuemax={pathway.relevantQuestionIds.length} aria-valuenow={pathway.answeredRelevant}><span style={{ width: `${(pathway.answeredRelevant / pathway.relevantQuestionIds.length) * 100}%` }} /></div>
      <p className="why-asked"><strong>Why you are seeing this</strong>{step.whyAsked}</p>
      <div id="focused-question-title"><QuestionField question={step.question} issue={issue} emphasized /></div>
      {step.question.requirementId && <RequirementCard requirementId={step.question.requirementId} />}
      <div className="form-actions"><button className="button button--primary" type="button" onClick={() => applicationStore.runValidation('human')}>Check my route</button><span>We will take you to the next answer that needs attention.</span></div>
    </section>
  )
}

function PathwayComplete() {
  return <section className="focus-card focus-card--complete"><span className="complete-mark" aria-hidden="true">✓</span><p className="eyebrow">Route complete</p><h3>Your application passes every check</h3><p>Read through your answers before making the declaration and submitting the demonstration application.</p><button className="button button--primary" type="button" onClick={() => applicationStore.openReview()}>Review my answers</button></section>
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
  return <details className="requirement-card" open={applicationStore.getSnapshot().assistance.plainLanguage}><summary>Council rule: {requirement.title}</summary><div><strong>{requirement.officialRule}</strong><p>{requirement.plainLanguage}</p><small>What counts as evidence: {requirement.evidence}</small></div></details>
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
  return <section className="rail-card"><p className="eyebrow">What changed</p><h3>Activity</h3>{history.length === 0 ? <p>No changes have been made.</p> : <ol className="activity-list">{history.slice(-7).reverse().map((entry) => <li key={entry.id} data-actor={entry.actor}><span aria-hidden="true">{entry.actor === 'agent' ? 'A' : entry.actor === 'human' ? 'Y' : 'R'}</span><div><strong>{entry.action}</strong><small>{entry.detail}</small></div></li>)}</ol>}</section>
}

function ReviewPanel() {
  const review = applicationStore.getReview()
  return (
    <section className="review-panel" aria-labelledby="review-title">
      <p className="eyebrow">Final review</p><h1 id="review-title">Review your answers</h1>
      <div className="review-boundary"><strong>Only you can submit this application.</strong><span>Your agent can check this page, but the website gives it no submission tool.</span></div>
      <dl>{review.answers.map((item) => <div key={item.questionId}><dt>{item.label}</dt><dd>{item.value}</dd></div>)}</dl>
      <div className="review-actions"><button className="button button--primary" type="button" onClick={() => applicationStore.submit()}>Submit fictional application</button><button className="text-button" type="button" onClick={() => applicationStore.configure({ active: true }, 'human')}>Return to application</button></div>
    </section>
  )
}

function SuccessPanel() {
  return <section className="success-panel"><span className="complete-mark" aria-hidden="true">✓</span><p className="eyebrow">Demonstration complete</p><h1>Application received</h1><p>Your reference is <strong>ALD-DEMO-2047</strong>. Nothing was sent to a real council.</p><button className="button button--primary" type="button" onClick={() => applicationStore.reset()}>Start again</button></section>
}

function SiteFooter() {
  return <footer className="site-footer"><div className="page-width"><strong>Alderwick Council</strong><span>Fictional housing support demonstration</span></div></footer>
}
