const supabase = require('../lib/supabase');

exports.getAll = async (req, res, next) => {
  try {
    // Only pull from the dedicated agents table — no profile merging
    const { data: agents, error } = await supabase
      .from('agents')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({ success: true, data: agents || [] });
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const { name, email, role, designation } = req.body;

    // Only admins can create agents
    const userRole = req.user?.role || 'Admin';
    if (userRole !== 'Admin' && req.user?.id !== 'dev-admin-id') {
      return res.status(403).json({ success: false, message: 'Forbidden: Only admins can create agents.' });
    }

    if (!name || !email) {
      return res.status(400).json({ success: false, message: 'Name and email are required.' });
    }

    const empCode = `AGT-${String(Math.floor(Math.random() * 9000) + 1000)}`;

    const { data, error } = await supabase
      .from('agents')
      .insert({
        employee_code: empCode,
        name,
        email,
        role: role || 'Insurance Agent',
        designation: designation || role || 'Claims Specialist',
        assigned_customers: 0,
        active_policies: 0,
        claim_resolution_rate: '0%',
        revenue_generated: '$0',
        status: 'Active',
      })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('agents')
      .select('*')
      .eq('id', req.params.id)
      .maybeSingle();

    if (error) throw error;
    if (!data) return res.status(404).json({ success: false, message: 'Agent not found.' });

    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('agents')
      .update(req.body)
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const { error } = await supabase
      .from('agents')
      .delete()
      .eq('id', req.params.id);

    if (error) throw error;
    res.json({ success: true, message: 'Agent removed successfully.' });
  } catch (err) {
    next(err);
  }
};
