// pages/api/login.ts
import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { username, password } = req.body;

  // Get credentials from environment variables (safe on server)
  const ADMIN_USER = process.env.ADMIN_USER;
  const ADMIN_PASS = process.env.ADMIN_PASS;

  // Example check — replace with DB lookup if needed
  if (username === ADMIN_USER && password === ADMIN_PASS) {
    return res.status(200).json({
      success: true,
      user: {
        id: '1',
        username: 'admin',
        email: 'admin@techsolutions.com',
        role: 'admin'
      }
    });
  }

  return res.status(401).json({ success: false, error: 'Invalid credentials' });
}
