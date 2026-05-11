import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

async function loadAnalyzeMission() {
  vi.resetModules()
  const mod = await import('./aiService.js')
  return mod.analyzeMission
}

describe('aiService.analyzeMission', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_API_URL', '')
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.unstubAllEnvs()
  })

  it('POSTs JSON to /analyze and returns parsed body', async () => {
    const payload = { risks: [], goals: [] }
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(payload)
    })
    vi.stubGlobal('fetch', fetchMock)

    const analyzeMission = await loadAnalyzeMission()
    await expect(analyzeMission('mission text')).resolves.toEqual(payload)

    expect(fetchMock).toHaveBeenCalledWith('/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ input: 'mission text' })
    })
  })

  it('throws with JSON message when response is not ok', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 503,
      text: () => Promise.resolve(JSON.stringify({ message: 'upstream down' }))
    })
    vi.stubGlobal('fetch', fetchMock)

    const analyzeMission = await loadAnalyzeMission()
    await expect(analyzeMission('x')).rejects.toThrow('upstream down')
  })

  it('throws with plain text body when response is not ok', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      text: () => Promise.resolve('plain error')
    })
    vi.stubGlobal('fetch', fetchMock)

    const analyzeMission = await loadAnalyzeMission()
    await expect(analyzeMission('x')).rejects.toThrow('plain error')
  })

  it('throws default message when response is not ok and body empty', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 418,
      text: () => Promise.resolve('')
    })
    vi.stubGlobal('fetch', fetchMock)

    const analyzeMission = await loadAnalyzeMission()
    await expect(analyzeMission('x')).rejects.toThrow('Request failed: 418')
  })

  it('uses absolute analyze URL when VITE_API_URL is set', async () => {
    vi.stubEnv('VITE_API_URL', 'https://api.example.com/')
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({})
    })
    vi.stubGlobal('fetch', fetchMock)

    const analyzeMission = await loadAnalyzeMission()
    await analyzeMission('a')

    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.example.com/analyze',
      expect.any(Object)
    )
  })
})
