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

    // Roles are stored in the protected profiles table, rather than user
    // metadata. User metadata can be changed by the account owner, so it must
    // not be used to grant administrative access.
    const [profileResult, agentResult, legacyUserResult] = await Promise.all([
      supabase.from('profiles').select('id, full_name, role').eq('id', user.id).maybeSingle(),
      // The existing schema links policies to agents.id. Agents are matched by
      // email because the legacy agents.user_id points to public.users, not
      // Supabase auth.users.
      supabase.from('agents').select('id').eq('email', user.email).maybeSingle(),
      // claims.reviewed_by and audit_logs.user_id still reference public.users.
      supabase.from('users').select('id').eq('email', user.email).maybeSingle(),
    ]);

    const { data: profile, error: profileError } = profileResult;

    if (profileError) throw profileError;
    req.user = {
      id: user.id,
      email: user.email,
      role: profile?.role || 'Customer',
      fullName: profile?.full_name || user.user_metadata?.full_name || '',
      agentId: agentResult.data?.id || null,
      legacyUserId: legacyUserResult.data?.id || null,
    };

    next();
  } catch (err) {
    console.error('Auth middleware error:', err);
    res.status(500).json({ success: false, message: 'Authentication failed' });
  }
}

module.exports = authMiddleware;
