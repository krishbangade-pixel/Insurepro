const supabase = require('../lib/supabase');

/**
 * Auth middleware — verifies the Supabase access token
 * sent via the Authorization header from the frontend.
 */
async function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ success: false, message: 'Invalid or expired token' });
    }

    // Attach user info to request
    req.user = {
      id: user.id,
      email: user.email,
      role: user.user_metadata?.role || 'Customer',
      fullName: user.user_metadata?.full_name || '',
    };

    next();
  } catch (err) {
    console.error('Auth middleware error:', err);
    res.status(500).json({ success: false, message: 'Authentication failed' });
  }
}

module.exports = authMiddleware;
