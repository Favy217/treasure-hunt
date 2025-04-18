let messages = [];

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    res.status(200).json(messages);
  } else if (req.method === 'POST') {
    const { user, text } = req.body;
    if (!user || !text) {
      return res.status(400).json({ error: 'User and text are required' });
    }
    const newMessage = { user, text, timestamp: new Date().toISOString() };
    messages.push(newMessage);
    res.status(200).json(newMessage);
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
