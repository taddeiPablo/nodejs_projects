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
      .select('id, user_id, revoked')
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

    // 🔥 Ahora la actualización FUNCIONA y nunca da undefined
    const { error: updateError } = await supabase
      .from('api_keys')
      .update({ last_used_at: new Date().toISOString() })
      .eq('id', data.id);

    if (updateError) {
      console.warn("No se pudo actualizar last_used_at:", updateError);
    }

    req.user = { id: data.user_id };
    next();
  } catch (err) {
    console.error('apiKeyAuth error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = apiKeyAuth;