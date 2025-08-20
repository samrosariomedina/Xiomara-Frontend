import type { NextApiRequest, NextApiResponse } from 'next'

const BACKEND = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8888'
console.log('BACKEND', BACKEND); 

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  try {
    const backendRes = await fetch(`${BACKEND}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body),
    })

    let data: Record<string, unknown> | null = null
    try {
      data = await backendRes.json()
    } catch {
      const text = await backendRes.text().catch(() => '')
      if (!backendRes.ok) {
        return res.status(backendRes.status).json({ error: text || 'Signup failed' })
      }
      return res.status(200).json({ body: text })
    }

    if (!backendRes.ok) {
      return res.status(backendRes.status).json(data || { error: 'Signup failed' })
    }

    return res.status(200).json(data || { success: true })
  } catch (err) {
    console.error('Signup proxy error', err)
    return res.status(500).json({ error: 'Proxy error' })
  }
}
