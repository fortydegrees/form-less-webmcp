import { beforeEach, describe, expect, it } from 'vitest'
import { applicationStore } from './applicationStore'
import { registerWebMcpTools, webMcpTools, type ModelContextLike, type WebMcpTool } from './webmcp'

function tool(name: string): WebMcpTool {
  const match = webMcpTools.find((candidate) => candidate.name === name)
  if (!match) throw new Error(`Missing test tool: ${name}`)
  return match
}

beforeEach(() => {
  applicationStore.reset()
})

describe('WebMCP tool contract', () => {
  it('exposes six narrow tools and no submission path', () => {
    expect(webMcpTools.map((candidate) => candidate.name)).toEqual([
      'configure_interaction',
      'get_application_step',
      'record_confirmed_answer',
      'explain_requirement',
      'validate_application',
      'get_application_review',
    ])
    expect(webMcpTools.some((candidate) => candidate.name.includes('submit'))).toBe(false)
  })

  it('marks read tools and applicant-text outputs accurately', () => {
    expect(tool('validate_application').annotations).toEqual({
      readOnlyHint: true,
      untrustedContentHint: false,
    })
    expect(tool('get_application_review').annotations).toEqual({
      readOnlyHint: true,
      untrustedContentHint: true,
    })
    expect(tool('record_confirmed_answer').annotations?.readOnlyHint).toBe(false)
  })

  it('uses the same domain store for tool writes and UI reads', async () => {
    await tool('record_confirmed_answer').execute({
      questionId: 'repair_description',
      value: 'The boiler stopped working two days ago. There is no heating or hot water.',
      confirmed: true,
    })

    expect(applicationStore.getSnapshot().answers.repair_description).toContain('two days ago')
    expect(applicationStore.getSnapshot().history).toHaveLength(1)
  })

  it('returns a bounded review payload that explicitly withholds submission', async () => {
    const result = await tool('get_application_review').execute({})
    const text = String(result)

    expect(text.length).toBeLessThan(1500)
    expect(text).toContain('availableToAgent')
    expect(text).toContain('false')
  })

  it('returns one directly consumable JSON value for success and domain errors', async () => {
    const success = await tool('validate_application').execute({})
    expect(JSON.parse(String(success))).toMatchObject({ valid: false, issueCount: 2 })

    const failure = await tool('record_confirmed_answer').execute({
      questionId: 'repair_description',
      value: 'Still vague',
      confirmed: false,
    })
    expect(JSON.parse(String(failure))).toMatchObject({
      ok: false,
      error: { code: 'confirmation_required' },
    })
  })

  it('registers with abort signals and degrades when the API is missing', async () => {
    const registrations: Array<{ tool: WebMcpTool; signal?: AbortSignal }> = []
    const context = new EventTarget() as ModelContextLike
    context.registerTool = async (definition, options) => {
      registrations.push({ tool: definition, signal: options?.signal })
      return undefined
    }
    const supported = registerWebMcpTools({ modelContext: context } as Document)
    expect(supported.status).toBe('registering')
    if (supported.status !== 'registering') throw new Error('Expected registration')
    await supported.ready
    expect(registrations).toHaveLength(6)
    expect(registrations.every((entry) => entry.signal?.aborted === false)).toBe(true)
    supported.abort()
    expect(registrations.every((entry) => entry.signal?.aborted === true)).toBe(true)

    expect(registerWebMcpTools({} as Document)).toEqual({ status: 'unsupported' })
  })
})
