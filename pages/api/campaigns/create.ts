import type { NextApiRequest, NextApiResponse } from 'next'

const BACKEND = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8888'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  try {
    // Send request to backend folders/create endpoint to create a campaign subfolder
    const backendRes = await fetch(`${BACKEND}/folders/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body),
    })

    if (!backendRes.ok) {
      // Try to return error text for debugging
      const text = await backendRes.text().catch(() => '')
      return res.status(backendRes.status).json({ error: text || 'Failed to create campaign' })
    }

    // Return the created campaign folder
    const campaign = await backendRes.json()
    return res.status(200).json(campaign)
  } catch (err) {
    console.error('Campaign creation proxy error', err)
    return res.status(500).json({ error: 'Proxy error' })
  }
}
