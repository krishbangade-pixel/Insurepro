const supabase = require('../lib/supabase');

exports.getAll = async (req, res, next) => {
  try {
    const { data, error } = await supabase.from('audit_logs')
      .select('*').order('created_at', { ascending: false }).limit(100);
    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) { next(err); }
};
