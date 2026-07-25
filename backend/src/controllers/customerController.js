const supabase = require('../lib/supabase');

exports.getAll = async (req, res, next) => {
  try {
    const { search, status, tier, page = 1, limit = 50 } = req.query;
    // Role-based filtering
    let base = supabase.from('customers').select('*', { count: 'exact' });

    if (req.user.role === 'Insurance Agent') {
      base = base.eq('created_by', req.user.id);
    } else if (req.user.role === 'Customer') {
      // Customers only see their own customer record (matched by email)
      base = base.eq('email', req.user.email);
    }

    if (search) base = base.or(`name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`);
    if (status) base = base.eq('status', status);
    if (tier) base = base.eq('tier', tier);

    const from = (page - 1) * limit;
    base = base.order('created_at', { ascending: false }).range(from, from + limit - 1);

    const { data, error, count } = await base;
    if (error) throw error;
    res.json({ success: true, data, total: count });
  } catch (err) { next(err); }
};

exports.getById = async (req, res, next) => {
  try {
    const { data, error } = await supabase.from('customers').select('*').eq('id', req.params.id).single();
    if (error) throw error;
    if (!data) return res.status(404).json({ success: false, message: 'Customer not found' });
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const { name, email, phone, city, gender, status, tier, risk_score, address, state, pincode } = req.body;

    // Only Agents and Admins can create customers
    if (!['Insurance Agent', 'Admin'].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    const { data, error } = await supabase.from('customers').insert({
      name, email, phone, city, gender, status: status || 'Active', tier: tier || 'Silver',
      risk_score, address, state, pincode,
      created_by: req.user.id,
    }).select().single();
    if (error) throw error;
    res.status(201).json({ success: true, data });
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const { data, error } = await supabase.from('customers').update(req.body).eq('id', req.params.id).select().single();
    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

exports.remove = async (req, res, next) => {
  try {
    const { error } = await supabase.from('customers').delete().eq('id', req.params.id);
    if (error) throw error;
    res.json({ success: true, message: 'Customer deleted' });
  } catch (err) { next(err); }
};
