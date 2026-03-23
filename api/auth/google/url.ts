import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
  if (!GOOGLE_CLIENT_ID) {
    return res.status(500).json({ error: 'Missing GOOGLE_CLIENT_ID environment variable' });
  }

  // Trust Vercel headers for protocol and host
  const protocol = req.headers['x-forwarded-proto'] || 'https';
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  
  // Construct redirect URI dynamically to support both preview and production URLs
  const redirectUri = `${protocol}://${host}/auth/callback`;

  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email',
    access_type: 'offline',
    prompt: 'consent'
  });

  const url = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  res.json({ url });
}
