import express from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Trust Proxy for correct protocol/host detection behind load balancers/proxies
  app.enable('trust proxy');

  // Middleware to parse JSON
  app.use(express.json());

  // OAuth Configuration
  const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
  const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

  // API Route to get Google Auth URL
  app.get('/api/auth/google/url', (req, res) => {
    if (!GOOGLE_CLIENT_ID) {
      return res.status(500).json({ error: 'Missing GOOGLE_CLIENT_ID environment variable' });
    }

    // Construct the redirect URI based on the current request host
    // This handles the dynamic preview URLs correctly
    const protocol = req.headers['x-forwarded-proto'] || req.protocol;
    const host = req.headers['x-forwarded-host'] || req.get('host');
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
  });

  // Callback Route
  app.get('/auth/callback', async (req, res) => {
    const { code } = req.query;
    
    if (!code) {
      return res.status(400).send('No code provided');
    }

    try {
      const protocol = req.headers['x-forwarded-proto'] || req.protocol;
      const host = req.headers['x-forwarded-host'] || req.get('host');
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
  });

  // Vite Middleware
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
