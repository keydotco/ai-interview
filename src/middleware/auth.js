const authMiddleware = (req, res, next) => {
  const apiKey = req.headers['x-api-access-token'];

  if (!apiKey) {
    console.warn('Missing API key');
    return res.status(401).json({ error: 'API key is required' });
  }

  // In a real implementation, validate the API key against a database or environment variable
  // For now, we'll accept any non-empty API key
  if (apiKey.trim() === '') {
    console.warn('Invalid API key');
    return res.status(401).json({ error: 'Invalid API key' });
  }

  // If authentication is successful, add user info to request
  req.user = { authenticated: true };
  next();
}

module.exports = { authMiddleware };
