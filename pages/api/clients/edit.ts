import type { NextApiRequest, NextApiResponse } from 'next'

const BACKEND = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8888'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  try {
    // Send request to backend folders/edit endpoint
    const backendRes = await fetch(`${BACKEND}/folders/edit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body),
    })

    if (!backendRes.ok) {
      // Try to return error text for debugging
      const text = await backendRes.text().catch(() => '')
      return res.status(backendRes.status).json({ error: text || 'Failed to edit client' })
    }

    // Return the updated client folder
    const client = await backendRes.json()
    return res.status(200).json(client)
  } catch (err) {
    console.error('Client edit proxy error', err)
    return res.status(500).json({ error: 'Proxy error' })
  }
}
