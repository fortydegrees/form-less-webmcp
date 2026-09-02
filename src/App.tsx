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
import { registerWebMcpTools } from './webmcp'
import './App.css'

type WebMcpStatus = 'checking' | 'supported' | 'unsupported' | 'error'

const canonicalPrompt =
  'Use this site’s tools—not browser clicks. I use keyboard navigation. I own and live at AW2 4LA, receive Universal Credit, and my boiler failed two days ago. There is no heating or hot water. I have a £2,450 written estimate but no photos. Build me a focused pathway and propose only answers supported by what I said. Do not submit.'

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
      <SiteHeader />
      <main id="main-content" className="page-width main-content">
        {state.screen === 'submitted' ? <SuccessPanel /> : state.screen === 'review' ? <ReviewPanel /> : (
          <>
            <Hero status={webMcpStatus} />
            <AuthorityStrip />
            {state.assistance.keyboardNavigation && <KeyboardNote />}
            {state.assistance.active ? <AssistedExperience /> : <StandardExperience />}
          </>
        )}
      </main>
      <SiteFooter />
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
  return <div className="prototype-banner"><div className="page-width"><strong>Fictional prototype</strong><span>Alderwick is not a real council. No information is sent anywhere.</span></div></div>
}

function SiteHeader() {
  return (
    <header className="site-header">
      <div className="page-width site-header__inner">
        <a className="brand" href="#main-content"><span className="brand__mark" aria-hidden="true">A</span><span><strong>Alderwick</strong><small>Home Support</small></span></a>
        <span className="case-reference">Application <strong>AW–0247</strong></span>
        <button className="text-button" type="button" onClick={() => applicationStore.reset()}>Reset demo</button>
      </div>
    </header>
  )
}

function Hero({ status }: { status: WebMcpStatus }) {
  const messages = {
    checking: 'Checking for site tools…',
    supported: 'WebMCP ready · 6 tools · 0 submission tools',
    unsupported: 'Standard form ready · WebMCP unavailable in this browser',
    error: 'Standard form ready · Site tools could not start',
  }
  return (
    <section className="hero" aria-labelledby="page-title">
      <div>
        <p className="eyebrow">Urgent home-repair grant</p>
        <h1 id="page-title">The website knows the rules.<br /><em>Your agent knows you.</em></h1>
        <p className="lede">Together they can produce the right interface—without letting the agent rewrite policy, confirm your answers, or submit for you.</p>
      </div>
      <div className={`connection-card connection-card--${status}`}>
        <span className="agent-orb" aria-hidden="true">✦</span>
        <div><strong>{messages[status]}</strong><span>{status === 'supported' ? 'Typed site tools are available to your browser agent.' : 'You can still complete every question yourself.'}</span></div>
      </div>
      <div className="demo-prompt">
        <span>Canonical agent request</span>
        <blockquote>“{canonicalPrompt}”</blockquote>
      </div>
    </section>
  )
}

function AuthorityStrip() {
  return (
    <section className="authority-strip" aria-label="Application authority">
      <div className="authority authority--agent"><span>✦</span><div><small>Your agent</small><strong>Reads structure, adapts, explains, proposes</strong></div></div>
      <div className="authority authority--human"><span>●</span><div><small>You</small><strong>Confirm answers and submit</strong></div></div>
      <div className="authority authority--service"><span>✓</span><div><small>Service rules</small><strong>Determine pathways and validation</strong></div></div>
    </section>
  )
}

function KeyboardNote() {
  return <div className="keyboard-note" role="note"><strong>Keyboard guidance is on.</strong> Use Tab to move between controls and arrow keys inside answer groups.</div>
}

function StandardExperience() {
  const state = applicationStore.getSnapshot()
  const issues = state.validationVisible ? validateApplication(state) : []
  const applicable = questions.filter((question) => isQuestionApplicable(question, state.answers))
  const answered = applicable.filter((question) => state.answers[question.id] !== undefined).length
  return (
    <div className="standard-shell">
      <div className="standard-intro">
        <div><p className="eyebrow">Standard service</p><h2>Complete the full application</h2><p>This conventional form is generated from the same machine-readable contract the agent sees: 24 questions, 5 sections, conditional branches, and official evidence rules.</p></div>
        <div className="completion"><strong>{answered}/{applicable.length}</strong><span>relevant answers complete</span></div>
      </div>
      <div className="standard-grid">
        <aside className="section-nav" aria-label="Application sections">
          <p>Application sections</p>
          <ol>{sections.map((section, index) => <li key={section.id}><a href={`#section-${section.id}`}><span>{String(index + 1).padStart(2, '0')}</span>{section.title}</a></li>)}</ol>
          <SchemaProof />
        </aside>
        <form className="standard-form" onSubmit={(event) => { event.preventDefault(); applicationStore.runValidation('human') }} noValidate>
          <div className="safety-note"><strong>Immediate danger?</strong> Leave the property and contact emergency services. This prototype cannot arrange emergency help.</div>
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
          <div className="form-actions"><button className="button button--primary" type="submit">Check application</button><span>Checks come from the schema and service rules.</span></div>
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
        <div><p className="eyebrow">Agent-negotiated interface</p><h2 id="pathway-title" tabIndex={-1}>Your personal pathway</h2><p>The service has safely recomposed its own form around the facts you confirmed. Policy and answer state are unchanged.</p></div>
        <button className="text-button text-button--light" type="button" onClick={() => applicationStore.configure({ active: false }, 'human')}>Return to standard form</button>
      </header>
      <div className="pathway-metrics" aria-label="Personal pathway summary">
        <div><strong>{pathway.relevantQuestionIds.length}</strong><span>relevant questions</span></div>
        <div><strong>{pathway.notApplicableQuestionIds.length}</strong><span>not applicable</span></div>
        <div><strong>{pathway.remainingRelevant}</strong><span>answers remaining</span></div>
        <div><strong>{pathway.documentsNeeded.length}</strong><span>evidence items needed</span></div>
      </div>
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
          <SchemaProof />
        </aside>
      </div>
    </section>
  )
}

function ProposalQueue() {
  const state = applicationStore.getSnapshot()
  return (
    <section className="proposal-queue" aria-labelledby="proposal-title">
      <header><span className="agent-orb" aria-hidden="true">✦</span><div><p className="eyebrow">WebMCP proposal handoff</p><h3 id="proposal-title" tabIndex={-1}>Review {state.pendingProposals.length} mapped answers</h3><p>The agent used the schema to map what you said. None of these are stored yet.</p></div><span className="human-only">Human decision</span></header>
      <div className="proposal-list">
        {state.pendingProposals.map((proposal) => {
          const question = getQuestion(proposal.questionId)
          const current = state.answers[proposal.questionId]
          return (
            <article className="proposal-item" key={proposal.questionId}>
              <div className="proposal-copy"><small>{question.shortLabel}</small><strong>{formatAnswer(proposal.questionId, proposal.value)}</strong>{proposal.rationale && <p>{proposal.rationale}</p>}<span>Current: {current === undefined ? 'Not answered' : formatAnswer(proposal.questionId, current)}</span></div>
              <div className="proposal-actions"><button className="button button--human" type="button" onClick={() => applicationStore.confirmAgentProposal(proposal.questionId)}>Confirm</button><button className="text-button" type="button" onClick={() => applicationStore.rejectAgentProposal(proposal.questionId)}>Reject</button></div>
            </article>
          )
        })}
      </div>
      {state.pendingProposals.length > 1 && <div className="proposal-bulk"><p>Review the list above before applying every proposal.</p><button className="button button--human" type="button" onClick={() => applicationStore.confirmAllAgentProposals()}>Confirm all reviewed answers</button></div>}
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
      <div className="focus-card__meta"><span>{step.sectionTitle}</span><span>Relevant question {position} of {pathway.relevantQuestionIds.length}</span></div>
      <div className="focus-progress" role="progressbar" aria-label={`${pathway.answeredRelevant} of ${pathway.relevantQuestionIds.length} relevant answers complete`} aria-valuemin={0} aria-valuemax={pathway.relevantQuestionIds.length} aria-valuenow={pathway.answeredRelevant}><span style={{ width: `${(pathway.answeredRelevant / pathway.relevantQuestionIds.length) * 100}%` }} /></div>
      <p className="why-asked"><strong>Why this is on your pathway</strong>{step.whyAsked}</p>
      <div id="focused-question-title"><QuestionField question={step.question} issue={issue} emphasized /></div>
      {step.question.requirementId && <RequirementCard requirementId={step.question.requirementId} />}
      <div className="form-actions"><button className="button button--primary" type="button" onClick={() => applicationStore.runValidation('human')}>Save and check pathway</button><span>The next relevant question appears automatically.</span></div>
    </section>
  )
}

function PathwayComplete() {
  return <section className="focus-card focus-card--complete"><span className="complete-mark">✓</span><p className="eyebrow">Pathway complete</p><h3>Every official check passes</h3><p>Review the relevant answers, the agent’s activity, and the human-only submission boundary.</p><button className="button button--primary" type="button" onClick={() => applicationStore.openReview()}>Review application</button></section>
}

function QuestionField({ question, issue, emphasized = false }: { question: QuestionDefinition; issue?: ValidationIssue; emphasized?: boolean }) {
  const state = applicationStore.getSnapshot()
  const value = String(state.answers[question.id] ?? '')
  const hintId = `${question.id}-hint`
  const errorId = `${question.id}-error`
  const describedBy = issue ? `${hintId} ${errorId}` : hintId
  const setValue = (next: string) => applicationStore.setHumanAnswer(question.id, next)

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
      {question.input === 'textarea' ? <textarea {...common} rows={5} maxLength={question.maxLength} onChange={(event) => setValue(event.target.value)} />
        : question.input === 'select' && question.options ? <select {...common} onChange={(event) => setValue(event.target.value)}><option value="">Select an answer</option>{question.options.map((option) => <option value={option.value} key={option.value}>{option.label}</option>)}</select>
          : <div className={question.input === 'currency' ? 'prefixed-input' : undefined}>{question.input === 'currency' && <span aria-hidden="true">£</span>}<input {...common} type="text" inputMode={question.type === 'integer' ? 'numeric' : undefined} onChange={(event) => setValue(event.target.value)} /></div>}
      {issue && <p className="field-error" id={errorId}>{issue.message}</p>}
    </div>
  )
}

function IssueSummary({ issues }: { issues: readonly ValidationIssue[] }) {
  if (issues.length === 0) return <div className="issue-summary issue-summary--clear" role="status"><strong>Official checks passed.</strong><span>No eligibility or completeness issues remain.</span></div>
  return <section className="issue-summary" aria-labelledby="issues-title"><h3 id="issues-title">{issues.length} things need attention</h3><ul>{issues.slice(0, 6).map((issue) => <li key={issue.code}><a href={`#${issue.questionId}`}>{issue.message}</a></li>)}</ul>{issues.length > 6 && <p>And {issues.length - 6} more. The focused pathway will take you through them.</p>}</section>
}

function RequirementCard({ requirementId }: { requirementId: keyof typeof requirements }) {
  const requirement = requirements[requirementId]
  return <details className="requirement-card" open={applicationStore.getSnapshot().assistance.plainLanguage}><summary>Official rule: {requirement.title}</summary><div><strong>{requirement.officialRule}</strong><p>{requirement.plainLanguage}</p><small>Evidence: {requirement.evidence}</small></div></details>
}

function PathwayMap() {
  const state = applicationStore.getSnapshot()
  const pathway = getPathway(state)
  return <section className="rail-card"><p className="eyebrow">Live pathway</p><h3>{pathway.currentSection ?? 'Ready for review'}</h3><ol className="pathway-list">{sections.map((section) => { const ids = section.questions.filter((id) => pathway.relevantQuestionIds.includes(id)); const done = ids.filter((id) => state.answers[id] !== undefined).length; return <li key={section.id} data-complete={ids.length > 0 && done === ids.length || undefined}><span>{done}/{ids.length}</span><div><strong>{section.title}</strong><small>{ids.length === 0 ? 'Not applicable' : 'Relevant to this case'}</small></div></li> })}</ol></section>
}

function EvidencePlan() {
  const pathway = getPathway(applicationStore.getSnapshot())
  return <section className="rail-card"><p className="eyebrow">Evidence plan</p><h3>{pathway.documentsNeeded.length === 0 ? 'Evidence ready' : `${pathway.documentsNeeded.length} item${pathway.documentsNeeded.length === 1 ? '' : 's'} needed`}</h3>{pathway.documentsNeeded.length > 0 ? <ul>{pathway.documentsNeeded.map((item) => <li key={item}>{item}</li>)}</ul> : <p>The confirmed answers satisfy the prototype’s evidence rules.</p>}</section>
}

function ActivityTrail() {
  const history = applicationStore.getSnapshot().history
  return <section className="rail-card"><p className="eyebrow">Visible collaboration</p><h3>Case trail</h3>{history.length === 0 ? <p>No agent or human changes yet.</p> : <ol className="activity-list">{history.slice(-7).reverse().map((entry) => <li key={entry.id} data-actor={entry.actor}><span>{entry.actor === 'agent' ? '✦' : entry.actor === 'human' ? '●' : '✓'}</span><div><strong>{entry.action}</strong><small>{entry.detail}</small></div></li>)}</ol>}</section>
}

function SchemaProof() {
  return <section className="schema-proof"><p className="eyebrow">One shared contract</p><ul><li><strong>JSON Schema</strong><span>24 fields + constraints</span></li><li><strong>UI schema</strong><span>5 sections + adaptive layout</span></li><li><strong>Rules</strong><span>7 official requirements</span></li><li><strong>WebMCP</strong><span>6 tools · no submit</span></li></ul></section>
}

function ReviewPanel() {
  const review = applicationStore.getReview()
  return (
    <section className="review-panel" aria-labelledby="review-title">
      <p className="eyebrow">Human review</p><h1 id="review-title">Check the pathway before you submit</h1>
      <div className="review-boundary"><strong>Your agent’s work stops here.</strong><span>It can inspect and check this review, but it has no submission tool.</span></div>
      <dl>{review.answers.map((item) => <div key={item.questionId}><dt>{item.label}</dt><dd>{item.value}</dd></div>)}</dl>
      <div className="review-actions"><button className="button button--primary" type="button" onClick={() => applicationStore.submit()}>Submit fictional application</button><button className="text-button" type="button" onClick={() => applicationStore.configure({ active: true }, 'human')}>Return to application</button></div>
    </section>
  )
}

function SuccessPanel() {
  return <section className="success-panel"><span className="complete-mark">✓</span><p className="eyebrow">Fictional demo complete</p><h1>Application received</h1><p>Reference <strong>ALD-DEMO-2047</strong>. Nothing was sent to a real council.</p><button className="button button--primary" type="button" onClick={() => applicationStore.reset()}>Restart demo</button></section>
}

function SiteFooter() {
  return <footer className="site-footer"><div className="page-width"><strong>Alderwick Home Support</strong><span>Schema-driven adaptive public service · fictional WebMCP prototype</span></div></footer>
}
