const supabase = require('../lib/supabase');

exports.getAll = async (req, res, next) => {
  try {
    const { search, status, type, page = 1, limit = 50 } = req.query;
    let query = supabase.from('policies').select(`*, customer:customers(id, name, email, avatar_url), policy_type:policy_types(id, name), agent:agents(id, name)`, { count: 'exact' });

    if (search) query = query.or(`policy_number.ilike.%${search}%,plan_name.ilike.%${search}%`);
    if (status) query = query.eq('status', status);

    const from = (page - 1) * limit;
    query = query.order('created_at', { ascending: false }).range(from, from + limit - 1);

    const { data, error, count } = await query;
    if (error) throw error;
    res.json({ success: true, data, total: count });
  } catch (err) { next(err); }
};

exports.getById = async (req, res, next) => {
  try {
    const { data, error } = await supabase.from('policies')
      .select(`*, customer:customers(id, name, email, avatar_url), policy_type:policy_types(id, name), agent:agents(id, name)`)
      .eq('id', req.params.id).single();
    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const { customer_id, policy_type_id, agent_id, policy_number, plan_name, premium_amount, coverage_amount, start_date, end_date, premium_frequency } = req.body;
    const policyNum = policy_number || `POL-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;
    const { data, error } = await supabase.from('policies').insert({
      customer_id, policy_type_id, agent_id, policy_number: policyNum, plan_name,
      premium_amount, coverage_amount, start_date, end_date, premium_frequency: premium_frequency || 'monthly', status: 'Active',
    }).select().single();
    if (error) throw error;
    res.status(201).json({ success: true, data });
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const { data, error } = await supabase.from('policies').update(req.body).eq('id', req.params.id).select().single();
    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) { next(err); }
};
