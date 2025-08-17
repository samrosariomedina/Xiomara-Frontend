import type { NextApiRequest, NextApiResponse } from 'next'

const BACKEND = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8888'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Log the request method and URL
  console.log(`Handling ${req.method} request to ${req.url}`);
  
  // Allow only POST method
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Extract token from request body
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ error: 'Token is required' });
    }

    // Try a more generic request without filtering by metadata type
    const backendReq = {
      token
    };

    console.log('Sending request to backend:', `${BACKEND}/folders`, 'with data:', JSON.stringify(backendReq));

    // Send request to backend folders endpoint
    const backendRes = await fetch(`${BACKEND}/folders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(backendReq),
    });

    if (!backendRes.ok) {
      // Try to return error text for debugging
      const text = await backendRes.text().catch(() => '');
      console.error('Backend error:', backendRes.status, text);
      return res.status(backendRes.status).json({ error: text || 'Failed to fetch clients' });
    }

    // Return the list of client folders
    const clients = await backendRes.json();
    console.log('Clients from backend:', clients); // Debug log
    return res.status(200).json(clients);
  } catch (err) {
    console.error('Clients proxy error', err);
    return res.status(500).json({ error: 'Proxy error', details: err instanceof Error ? err.message : String(err) });
  }
}
