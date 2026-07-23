const { createClient } = require('@supabase/supabase-js');
const config = require('../config');

/**
 * Supabase Admin Client (service_role key)
 * Bypasses RLS — use only on the server side.
 */
const supabase = createClient(config.supabase.url, config.supabase.serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

module.exports = supabase;
