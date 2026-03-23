import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { code } = req.query;
  const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
  const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

  if (!code) {
    return res.status(400).send('No code provided');
  }

  try {
    // Trust Vercel headers
    const protocol = req.headers['x-forwarded-proto'] || 'https';
    const host = req.headers['x-forwarded-host'] || req.headers.host;
    const redirectUri = `${protocol}://${host}/auth/callback`;
    
    // Exchange code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code: code as string,
        client_id: GOOGLE_CLIENT_ID!,
        client_secret: GOOGLE_CLIENT_SECRET!,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code'
      })
    });

    const tokens = await tokenResponse.json();
    
    if (tokens.error) {
      throw new Error(tokens.error_description || tokens.error);
    }

    // Get User Info
    const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` }
    });
    
    const userData = await userResponse.json();

    // Return HTML to close popup and notify opener
    res.send(`
      <html>
        <body>
          <script>
            if (window.opener) {
              window.opener.postMessage({ 
                type: 'OAUTH_AUTH_SUCCESS', 
                user: ${JSON.stringify(userData)} 
              }, '*');
              window.close();
            } else {
              document.body.innerHTML = 'Authentication successful. You can close this window.';
            }
          </script>
          <p>Authentication successful. Redirecting...</p>
        </body>
      </html>
    `);

  } catch (error: any) {
    console.error('OAuth Error:', error);
    res.status(500).send(`Authentication failed: ${error.message}`);
  }
}
