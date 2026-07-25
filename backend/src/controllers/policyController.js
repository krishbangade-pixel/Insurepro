const supabase = require('../lib/supabase');

exports.getAll = async (req, res, next) => {
  try {
    const { search, status, type, page = 1, limit = 50 } = req.query;
    // Role-based filtering
    let base = supabase.from('policies').select(`*, customer:customers(id, name, email, avatar_url), policy_type:policy_types(id, name), agent:agents(id, name, email, avatar_url)`, { count: 'exact' });

    if (req.user.role === 'Insurance Agent') {
      if (!req.user.agentId) return res.json({ success: true, data: [], total: 0 });
      base = base.eq('agent_id', req.user.agentId);
    } else if (req.user.role === 'Customer') {
      // Customers see only policies linked to their customer record
      const { data: cust } = await supabase.from('customers').select('id').eq('email', req.user.email).limit(1).single();
      if (!cust) return res.json({ success: true, data: [], total: 0 });
      base = base.eq('customer_id', cust.id);
    }

    if (search) base = base.or(`policy_number.ilike.%${search}%,plan_name.ilike.%${search}%`);
    if (status) base = base.eq('status', status);

    const from = (page - 1) * limit;
    base = base.order('created_at', { ascending: false }).range(from, from + limit - 1);

    const { data, error, count } = await base;
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
    // Only Agents and Admins can create policies
    if (!['Insurance Agent', 'Admin'].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    // policies.agent_id references agents.id, not auth.users.id.
    const finalAgentId = agent_id || (req.user.role === 'Insurance Agent' ? req.user.agentId : null);
    if (req.user.role === 'Insurance Agent' && !finalAgentId) {
      return res.status(400).json({ success: false, message: 'No agent record matches this authenticated account.' });
    }

    const { data, error } = await supabase.from('policies').insert({
      customer_id, policy_type_id, agent_id: finalAgentId, policy_number: policyNum, plan_name,
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
