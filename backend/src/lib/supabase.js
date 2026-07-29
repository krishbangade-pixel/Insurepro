const { createClient } = require('@supabase/supabase-js');
const config = require('../config');

/**
 * Supabase Admin Client (service_role key)
 * Bypasses RLS — use only on the server side.
 */
const keyToUse = (config.supabase.serviceRoleKey && config.supabase.serviceRoleKey !== 'your-service-role-key-here')
  ? config.supabase.serviceRoleKey
  : (process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJzcXJ0eGFhZ2t6a2ZxcGJjdnZoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ3MjU3OTksImV4cCI6MjEwMDMwMTc5OX0.gcrZz0Yf0A4iPhoAK2U95mMuA_XpHUShVia2bdirnpI');

const supabase = createClient(config.supabase.url, keyToUse, {
  auth: { autoRefreshToken: false, persistSession: false },
});

module.exports = supabase;
