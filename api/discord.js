// api/discord.js
export default async function handler(req, res) {
  const { path } = req.query; // Vercel uses query parameters for dynamic routes
  const pathParts = path ? path.split('/') : [];

  // Handle /discord/callback
  if (req.method === 'GET' && pathParts[0] === 'callback') {
    const { code, state } = req.query;

    console.log('Received callback with:', { code, state });

    if (!code || !state) {
      console.error('Missing code or state');
      return res.status(400).json({ error: 'Code and state are required' });
    }

    try {
      console.log('Environment variables:', {
        client_id: process.env.DISCORD_CLIENT_ID,
        client_secret: process.env.DISCORD_CLIENT_SECRET ? '[REDACTED]' : 'undefined',
        redirect_uri: `${process.env.BACKEND_URL}/discord/callback`,
      });

      // Exchange code for access token
      const tokenResponse = await fetch('https://discord.com/api/oauth2/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: process.env.DISCORD_CLIENT_ID,
          client_secret: process.env.DISCORD_CLIENT_SECRET,
          grant_type: 'authorization_code',
          code,
          redirect_uri: `${process.env.BACKEND_URL}/discord/callback`,
        }),
      });

      const tokenData = await tokenResponse.json();
      console.log('Token response:', tokenData);

      if (!tokenResponse.ok) {
        throw new Error(tokenData.error || 'Failed to exchange code for token');
      }

      // Fetch user data
      const userResponse = await fetch('https://discord.com/api/users/@me', {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
        },
      });

      const userData = await userResponse.json();
      console.log('User data response:', userData);

      if (!userResponse.ok) {
        throw new Error(userData.error || 'Failed to fetch user data');
      }

      const discordId = userData.username; // Store the username
      console.log('Storing Discord ID:', { address: state, discordId });

      // In-memory storage (temporary)
      global.discordLinks = global.discordLinks || {};
      global.discordLinks[state] = discordId;

      // Redirect back to the frontend
      res.redirect('/');
    } catch (error) {
      console.error('Error in Discord callback:', error.message);
      res.status(500).json({ error: 'Failed to link Discord' });
    }
  }
  // Handle /discord/${address}
  else if (req.method === 'GET' && pathParts.length === 1) {
    const address = pathParts[0];

    if (!address) {
      return res.status(400).json({ error: 'Address is required' });
    }

    const discordLinks = global.discordLinks || {};
    const discordId = discordLinks[address];

    if (!discordId) {
      return res.status(404).json({ error: 'Discord ID not found for this address' });
    }

    res.status(200).json({ discordId });
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
