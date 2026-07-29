const supabase = require('../lib/supabase');

exports.getAll = async (req, res, next) => {
  try {
    const { search, status, tier } = req.query;

    // Only pull from the dedicated customers table — no profile merging
    const { data: customers, error } = await supabase
      .from('customers')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    let list = customers || [];

    // Customers can only see their own record
    if (
      req.user?.role === 'Customer' &&
      req.user?.id !== 'dev-admin-id'
    ) {
      list = list.filter(
        (c) => (c.email || '').toLowerCase() === (req.user.email || '').toLowerCase()
      );
    }

    // Optional search filter
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (c) =>
          (c.name || '').toLowerCase().includes(q) ||
          (c.email || '').toLowerCase().includes(q) ||
          (c.phone || '').toLowerCase().includes(q)
      );
    }

    if (status) list = list.filter((c) => c.status === status);
    if (tier) list = list.filter((c) => c.tier === tier);

    res.json({ success: true, data: list, total: list.length });
  } catch (err) {
    next(err);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('id', req.params.id)
      .maybeSingle();

    if (error) throw error;
    if (!data) return res.status(404).json({ success: false, message: 'Customer not found' });

    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const {
      name, email, phone, city, gender,
      status, tier, risk_score, address, state, pincode,
    } = req.body;

    const userRole = req.user?.role || 'Admin';
    if (!['Insurance Agent', 'Agent', 'Admin'].includes(userRole) && req.user?.id !== 'dev-admin-id') {
      return res.status(403).json({ success: false, message: 'Forbidden: Insufficient permissions to create customers.' });
    }

    const { data, error } = await supabase
      .from('customers')
      .insert({
        name,
        email,
        phone,
        city,
        gender: gender || 'Not specified',
        status: status || 'Active',
        tier: tier || 'Silver',
        risk_score: risk_score || 'A+',
        address,
        state,
        pincode,
      })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('customers')
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
      .from('customers')
      .delete()
      .eq('id', req.params.id);

    if (error) throw error;
    res.json({ success: true, message: 'Customer deleted successfully.' });
  } catch (err) {
    next(err);
  }
};
