export async function callLLM(prompt: string, systemInstruction?: string): Promise<string | null> {
  const apiKey = process.env.LLM_API_KEY || process.env.GEMINI_API_KEY || process.env.GOOGLE_MAPS_API_KEY
  const model = process.env.LLM_MODEL || 'gemini-1.5-flash'

  if (!apiKey || apiKey.includes('demo_') || apiKey.includes('your_')) {
    return null // Signal fallback mode to agent
  }

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`
    const payload: any = {
      contents: [{ parts: [{ text: prompt }] }],
    }
    if (systemInstruction) {
      payload.systemInstruction = { parts: [{ text: systemInstruction }] }
    }

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      console.warn('[LLM Abstraction] LLM API returned status:', res.status)
      return null
    }

    const data = await res.json()
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text
    return text || null
  } catch (e) {
    console.warn('[LLM Abstraction] LLM call exception, using intent fallback:', e)
    return null
  }
}
