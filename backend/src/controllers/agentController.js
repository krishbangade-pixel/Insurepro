const supabase = require('../lib/supabase');

exports.getAll = async (req, res, next) => {
  try {
    const { data, error } = await supabase.from('agents').select('*').order('name');
    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const { name, email, role, designation } = req.body;
    const empCode = `AGT-${String(Math.floor(Math.random() * 100)).padStart(2, '0')}`;
    const { data, error } = await supabase.from('agents').insert({
      employee_code: empCode, name, email, role, designation: designation || role,
      avatar_url: `https://i.pravatar.cc/150?u=${Date.now()}`, assigned_customers: 0,
      active_policies: 0, claim_resolution_rate: '0%', revenue_generated: '$0', status: 'Active',
    }).select().single();
    if (error) throw error;
    res.status(201).json({ success: true, data });
  } catch (err) { next(err); }
};
