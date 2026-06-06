import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

const client = new Anthropic()

export async function POST(req: NextRequest) {
  const { text } = await req.json()
  if (!text) return NextResponse.json({ error: 'No text' }, { status: 400 })

  const message = await client.messages.create({
    model: 'claude-opus-4-7',
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: `Parse the following Ukrainian text into a list of tasks. Return ONLY a JSON array, no markdown, no explanation.

Each task object must have:
- "title": string (short task title, in Ukrainian)
- "priority": "must" or "nice" (must = urgent/important, nice = everything else)
- "dueDate": "YYYY-MM-DD" or null (extract if mentioned, e.g. "завтра" = tomorrow, "в п'ятницю" = this Friday)
- "duration": string or null (e.g. "30 хв", "1 год")

Today is ${new Date().toISOString().slice(0, 10)}.

Text: "${text}"`,
      },
    ],
  })

  const raw = message.content[0].type === 'text' ? message.content[0].text : '[]'

  try {
    const tasks = JSON.parse(raw)
    return NextResponse.json({ tasks })
  } catch {
    return NextResponse.json({ tasks: [{ title: text, priority: 'nice', dueDate: null, duration: null }] })
  }
}
