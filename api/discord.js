require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = "https://treasure-hunt-frontend-livid.vercel.app/discord/callback";

const discordLinks = {};
const addressByDiscord = {};

// Handle /discord/callback
app.get('/discord/callback', async (req, res) => {
  const { code, state } = req.query;
  const address = state;

  if (!code || !address) return res.status(400).send("Missing code or state");

  try {
    if (discordLinks[address]) return res.status(403).send("Address already linked");

    const tokenResponse = await axios.post('https://discord.com/api/oauth2/token', new URLSearchParams({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      grant_type: 'authorization_code',
      code,
      redirect_uri: REDIRECT_URI,
    }), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    const { access_token } = tokenResponse.data;
    const userResponse = await axios.get('https://discord.com/api/users/@me', {
      headers: { Authorization: `Bearer ${access_token}` }
    });

    const discordId = `${userResponse.data.username}#${userResponse.data.discriminator}`;
    if (addressByDiscord[discordId]) return res.status(403).send("Discord account already linked");

    discordLinks[address] = discordId;
    addressByDiscord[discordId] = address;

    res.redirect(`https://treasure-hunt-frontend-livid.vercel.app?discord_linked=${encodeURIComponent(discordId)}`);
  } catch (error) {
    console.error("Discord auth error:", error);
    res.status(500).send("Authentication failed");
  }
});

// Handle /discord/:address
app.get('/discord/:address', (req, res) => {
  const { address } = req.params;
  res.json({ discordId: discordLinks[address] || null });
});

// Handle /discord/forgive
app.post('/discord/forgive', (req, res) => {
  const { address } = req.body;
  if (!address) return res.status(400).send("Missing address");
  const discordId = discordLinks[address];
  if (discordId) {
    delete discordLinks[address];
    delete addressByDiscord[discordId];
  }
  res.send("User forgiven");
});

// Fallback for unmatched routes
app.use((req, res) => {
  res.status(404).send("Cannot GET " + req.path);
});

module.exports = app;
