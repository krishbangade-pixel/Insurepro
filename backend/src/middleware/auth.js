const supabase = require('../lib/supabase');

/**
 * Auth middleware — verifies the Supabase access token
 * sent via the Authorization header from the frontend.
 */
async function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      if (process.env.NODE_ENV !== 'production') {
        req.user = {
          id: 'dev-admin-id',
          email: 'admin@insurepro.com',
          role: 'Admin',
          fullName: 'System Admin',
        };
        return next();
      }
      return res.status(401).json({ success: false, message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    let user = null;

    try {
      const { data, error } = await supabase.auth.getUser(token);
      if (!error && data?.user) {
        user = data.user;
      }
    } catch (e) {
      console.warn('Supabase token verification error:', e.message);
    }

    if (!user) {
      if (process.env.NODE_ENV !== 'production') {
        req.user = {
          id: 'dev-admin-id',
          email: 'admin@insurepro.com',
          role: 'Admin',
          fullName: 'System Admin',
        };
        return next();
      }
      return res.status(401).json({ success: false, message: 'Invalid or expired token' });
    }

    let profileRole = null;
    let profileFullName = null;

    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, full_name, role')
        .eq('id', user.id)
        .maybeSingle();

      if (profile) {
        profileRole = profile.role;
        profileFullName = profile.full_name;
      }
    } catch (pe) {
      console.warn('Profile lookup warning:', pe.message);
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: profileRole || user.user_metadata?.role || 'Admin',
      fullName: profileFullName || user.user_metadata?.full_name || user.email || 'User',
    };

    next();
  } catch (err) {
    console.error('Auth middleware error:', err);
    if (process.env.NODE_ENV !== 'production') {
      req.user = {
        id: 'dev-admin-id',
        email: 'admin@insurepro.com',
        role: 'Admin',
        fullName: 'System Admin',
      };
      return next();
    }
    res.status(500).json({ success: false, message: 'Authentication failed' });
  }
}

module.exports = authMiddleware;
