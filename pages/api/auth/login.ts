import type { NextApiRequest, NextApiResponse } from 'next'

const BACKEND = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8888'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  try {
    const backendRes = await fetch(`${BACKEND}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body),
    })

    let data: Record<string, unknown> | null = null
    try {
      data = await backendRes.json()
    } catch {
      // backend returned non-JSON (HTML or text), capture it for debugging
      const text = await backendRes.text().catch(() => '')
      if (!backendRes.ok) {
        return res.status(backendRes.status).json({ error: text || 'Login failed' })
      }
      // successful but non-JSON
      return res.status(200).json({ body: text })
    }

    if (!backendRes.ok) {
      return res.status(backendRes.status).json(data || { error: 'Login failed' })
    }

    const token = data?.token
    if (token) {
      const maxAge = 30 * 24 * 60 * 60 // 30 days
      // Set cookie so middleware/server can read it. Not HttpOnly so client JS can also read if needed.
      res.setHeader('Set-Cookie', `authToken=${token}; Path=/; Max-Age=${maxAge}; SameSite=Lax`)
    }

    return res.status(200).json(data)
  } catch (err) {
    console.error('Login proxy error', err)
    return res.status(500).json({ error: 'Proxy error' })
  }
}
