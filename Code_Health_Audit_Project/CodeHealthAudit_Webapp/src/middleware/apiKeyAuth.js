// src/middleware/apiKeyAuth.js
const crypto = require('crypto');
const { supabase } = require('../services/supabase');

async function apiKeyAuth(req, res, next) {
  try {
    const authHeader = req.headers['authorization'];
    const headerKey = req.headers['x-api-key'];
    let apiKey = null;

    if (authHeader && typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
      apiKey = authHeader.slice(7).trim();
    } else if (headerKey) {
      apiKey = headerKey.trim();
    }

    if (!apiKey) {
      return res.status(401).json({ error: 'Missing API key' });
    }

    const hashed = crypto.createHash('sha256').update(apiKey).digest('hex');

    const { data, error } = await supabase
      .from('api_keys')
      .select('user_id, revoked')
      .eq('hashed_key', hashed)
      .maybeSingle();

    if (error) {
      console.error('Supabase error validating API key:', error);
      return res.status(500).json({ error: 'Server error validating API key' });
    }

    if (!data) {
      return res.status(401).json({ error: 'Invalid API key' });
    }

    if (data.revoked) {
      return res.status(403).json({ error: 'API key revoked' });
    }

    // update last_used_at asynchronously
    supabase
      .from('api_keys')
      .update({ last_used_at: new Date().toISOString() })
      .eq('hashed_key', hashed)
      .then(() => {})
      .catch(err => console.warn('Could not update last_used_at', err));

    // 🔥 ESTA ES LA CLAVE 🔥
    req.user = { id: data.user_id };

    next();
  } catch (err) {
    console.error('apiKeyAuth error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = apiKeyAuth;
