import type { NextApiRequest, NextApiResponse } from 'next'

const BACKEND = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8888'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  try {
    // Log request body for debugging
    console.log('Client creation request to backend:', req.body);
    
    // Send request to backend folders/create endpoint
    const backendRes = await fetch(`${BACKEND}/folders/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body),
    })

    if (!backendRes.ok) {
      // Try to return error text for debugging
      const text = await backendRes.text().catch(() => '')
      console.error('Backend client creation error:', backendRes.status, text);
      return res.status(backendRes.status).json({ error: text || 'Failed to create client' })
    }

    // Return the created client folder
    const client = await backendRes.json()
    console.log('Client created successfully:', client);
    return res.status(200).json(client)
  } catch (err) {
    console.error('Client creation proxy error', err)
    return res.status(500).json({ error: 'Proxy error' })
  }
}
