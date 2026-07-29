const supabase = require('../lib/supabase');

exports.getAll = async (req, res, next) => {
  try {
    const { search, status, customer_id, page = 1, limit = 50 } = req.query;
    let query = supabase.from('claims').select(`*, policy:policies(id, policy_number, policy_type:policy_types(name)), customer:customers(id, name, email, avatar_url)`, { count: 'exact' });

    if (search) query = query.or(`claim_number.ilike.%${search}%,description.ilike.%${search}%`);
    if (status) query = query.eq('status', status);
    if (customer_id) query = query.eq('customer_id', customer_id);

    const from = (page - 1) * limit;
    query = query.order('submission_date', { ascending: false }).range(from, from + limit - 1);

    const { data, error, count } = await query;
    if (error) throw error;
    res.json({ success: true, data, total: count });
  } catch (err) { next(err); }
};

exports.getById = async (req, res, next) => {
  try {
    const { data, error } = await supabase.from('claims')
      .select(`*, policy:policies(id, policy_number, policy_type:policy_types(name)), customer:customers(id, name, email, avatar_url)`)
      .eq('id', req.params.id).single();
    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    let { policy_id, customer_id, claim_amount, amount, priority, claim_type, description } = req.body;
    const finalAmount = claim_amount !== undefined ? claim_amount : (amount !== undefined ? amount : 0);

    if (!customer_id) {
      if (policy_id) {
        const { data: pol } = await supabase.from('policies').select('customer_id').eq('id', policy_id).maybeSingle();
        if (pol?.customer_id) customer_id = pol.customer_id;
      }
      if (!customer_id && req.user?.email) {
        const { data: cust } = await supabase.from('customers').select('id').eq('email', req.user.email).maybeSingle();
        if (cust?.id) customer_id = cust.id;
      }
    }

    const claimNum = `CLM-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`;
    const { data, error } = await supabase.from('claims').insert({
      policy_id: policy_id || null,
      customer_id: customer_id || null,
      claim_number: claimNum,
      claim_amount: Number(finalAmount),
      priority: priority || 'Medium',
      claim_type: claim_type || 'General',
      description: description || '',
      status: 'Pending',
    }).select().single();
    if (error) throw error;
    res.status(201).json({ success: true, data });
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const { data, error } = await supabase.from('claims').update(req.body).eq('id', req.params.id).select().single();
    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

exports.approve = async (req, res, next) => {
  try {
    const { data, error } = await supabase.from('claims').update({ status: 'Approved', reviewed_by: req.user.id, reviewed_at: new Date().toISOString() }).eq('id', req.params.id).select().single();
    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

exports.reject = async (req, res, next) => {
  try {
    const { data, error } = await supabase.from('claims').update({ status: 'Rejected', reviewed_by: req.user.id, reviewed_at: new Date().toISOString() }).eq('id', req.params.id).select().single();
    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) { next(err); }
};
