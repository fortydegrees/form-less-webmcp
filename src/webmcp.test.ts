import { beforeEach, describe, expect, it } from 'vitest'
import { applicationStore } from './applicationStore'
import { registerWebMcpTools, webMcpTools, type ModelContextLike, type WebMcpTool } from './webmcp'

function tool(name: string): WebMcpTool {
  const match = webMcpTools.find((candidate) => candidate.name === name)
  if (!match) throw new Error(`Missing test tool: ${name}`)
  return match
}

beforeEach(() => applicationStore.reset())

describe('generated WebMCP contract', () => {
  it('exposes six composable tools and no submission path', () => {
    expect(webMcpTools.map((candidate) => candidate.name)).toEqual([
      'inspect_application',
      'configure_assistance',
      'propose_answers',
      'explain_requirement',
      'validate_application',
      'get_application_review',
    ])
    expect(webMcpTools.some((candidate) => candidate.name.includes('submit'))).toBe(false)
  })

  it('derives the proposal question enum from agent-writable schema fields', () => {
    const proposalSchema = tool('propose_answers').inputSchema as {
      properties: { proposals: { maxItems: number } }
    }
    const schemaText = JSON.stringify(proposalSchema)
    expect(schemaText).toContain('repair_description')
    expect(schemaText).not.toContain('declaration_accuracy')
    expect(proposalSchema.properties.proposals.maxItems).toBe(15)
  })

  it('lets an agent inspect structure and conditional logic without scraping the DOM', async () => {
    const result = await tool('inspect_application').execute({})
    expect(result).toMatchObject({
      questions: expect.arrayContaining([
        expect.objectContaining({ id: 'heating_status', appliesWhen: { field: 'repair_type', equals: 'heating' } }),
      ]),
      sections: expect.arrayContaining([expect.objectContaining({ id: 'repair' })]),
    })
    expect((result as { questions: unknown[] }).questions).toHaveLength(34)
    expect(applicationStore.getSnapshot().history.at(-1)?.action).toBe('WebMCP · inspect_application')
  })

  it('activates the approved adaptive layout without changing an answer', async () => {
    const result = await tool('configure_assistance').execute({ active: true, keyboardNavigation: true, plainLanguage: true })
    expect(result).toMatchObject({ assistance: { active: true, keyboardNavigation: true, plainLanguage: true }, answersChanged: false })
    expect(applicationStore.getSnapshot().answers).toEqual({})
  })

  it('stages multiple proposals while canonical state remains unchanged', async () => {
    const result = await tool('propose_answers').execute({ proposals: [
      { questionId: 'tenure', value: 'owner_occupier', rationale: 'Applicant said they own and live there.' },
      { questionId: 'repair_type', value: 'heating' },
    ] })
    expect(result).toMatchObject({ proposed: 2, stored: 0 })
    expect(applicationStore.getSnapshot().answers).toEqual({})
    expect(applicationStore.getSnapshot().pendingProposals).toHaveLength(2)
  })

  it('returns directly consumable JSON for deterministic validation and domain errors', async () => {
    const validation = await tool('validate_application').execute({})
    expect(validation).toMatchObject({ valid: false, issueCount: expect.any(Number) })
    const error = await tool('propose_answers').execute({ proposals: [{ questionId: 'declaration_accuracy', value: 'yes' }] })
    expect(error).toMatchObject({ ok: false, error: { code: 'human_only_field' } })
  })

  it('registers all tools with abort signals and degrades without the API', async () => {
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
