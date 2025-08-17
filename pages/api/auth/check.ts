import type { NextApiRequest, NextApiResponse } from 'next'

const BACKEND = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8888'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  try {
    // send token to backend check route
    const backendRes = await fetch(`${BACKEND}/auth/check`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body),
    })

    if (!backendRes.ok) {
      // try to return error text for debugging
      const text = await backendRes.text().catch(() => '')
      return res.status(backendRes.status).json({ error: text || 'Check failed' })
    }

    return res.status(200).end()
  } catch (err) {
    console.error('Check proxy error', err)
    return res.status(500).json({ error: 'Proxy error' })
  }
}
