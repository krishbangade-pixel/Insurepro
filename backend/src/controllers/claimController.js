const supabase = require('../lib/supabase');

exports.getAll = async (req, res, next) => {
  try {
    const { search, status, page = 1, limit = 50 } = req.query;
    let query = supabase.from('claims').select(`*, policy:policies(id, policy_number, policy_type:policy_types(name)), customer:customers(id, name, email, avatar_url)`, { count: 'exact' });

    if (search) query = query.or(`claim_number.ilike.%${search}%,description.ilike.%${search}%`);
    if (status) query = query.eq('status', status);

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
    const { policy_id, customer_id, claim_amount, priority, claim_type, description } = req.body;
    const claimNum = `CLM-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`;
    const { data, error } = await supabase.from('claims').insert({
      policy_id, customer_id, claim_number: claimNum, claim_amount, priority: priority || 'Medium',
      claim_type, description, status: 'Pending',
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
    const { data, error } = await supabase.from('claims').update({ status: 'Approved', reviewed_by: req.user.legacyUserId, reviewed_at: new Date().toISOString() }).eq('id', req.params.id).select().single();
    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

exports.reject = async (req, res, next) => {
  try {
    const { data, error } = await supabase.from('claims').update({ status: 'Rejected', reviewed_by: req.user.legacyUserId, reviewed_at: new Date().toISOString() }).eq('id', req.params.id).select().single();
    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) { next(err); }
};
