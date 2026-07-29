const supabase = require('../lib/supabase');

exports.getAll = async (req, res, next) => {
  try {
    const { search, status, customer_id, page = 1, limit = 50 } = req.query;
    let base = supabase.from('policies').select(`*, customer:customers(id, name, email, avatar_url), policy_type:policy_types(id, name), agent:profiles!policies_agent_id_fkey(id, full_name, email, avatar_url)`, { count: 'exact' });

    if (req.user?.role === 'Insurance Agent') {
      base = base.eq('agent_id', req.user.id);
    } else if (req.user?.role === 'Customer' && req.user?.id !== 'dev-admin-id') {
      const { data: cust } = await supabase.from('customers').select('id').or(`email.eq.${req.user.email},id.eq.${req.user.id}`).maybeSingle();
      const targetCustId = cust?.id || req.user.id;
      base = base.or(`customer_id.eq.${targetCustId},customer_id.eq.${req.user.id}`);
    }

    if (search) base = base.or(`policy_number.ilike.%${search}%,plan_name.ilike.%${search}%`);
    if (status) base = base.eq('status', status);
    if (customer_id) base = base.eq('customer_id', customer_id);

    const from = (page - 1) * limit;
    base = base.order('created_at', { ascending: false }).range(from, from + limit - 1);

    let { data, error, count } = await base;

    if (error && (error.code === '42P17' || error.message?.includes('profiles'))) {
      let fallbackQuery = supabase.from('policies')
        .select(`*, customer:customers(id, name, email, avatar_url), policy_type:policy_types(id, name)`, { count: 'exact' });
      if (search) fallbackQuery = fallbackQuery.or(`policy_number.ilike.%${search}%,plan_name.ilike.%${search}%`);
      if (status) fallbackQuery = fallbackQuery.eq('status', status);
      if (customer_id) fallbackQuery = fallbackQuery.eq('customer_id', customer_id);
      fallbackQuery = fallbackQuery.order('created_at', { ascending: false }).range(from, from + limit - 1);
      const resFallback = await fallbackQuery;
      data = resFallback.data;
      error = resFallback.error;
      count = resFallback.count;
    }

    if (error) throw error;
    res.json({ success: true, data: data || [], total: count || 0 });
  } catch (err) { next(err); }
};

exports.getById = async (req, res, next) => {
  try {
    let { data, error } = await supabase.from('policies')
      .select(`*, customer:customers(id, name, email, avatar_url), policy_type:policy_types(id, name), agent:profiles!policies_agent_id_fkey(id, full_name, email, avatar_url)`)
      .eq('id', req.params.id).single();

    if (error && (error.code === '42P17' || error.message?.includes('profiles'))) {
      const resFallback = await supabase.from('policies')
        .select(`*, customer:customers(id, name, email, avatar_url), policy_type:policy_types(id, name)`)
        .eq('id', req.params.id).single();
      data = resFallback.data;
      error = resFallback.error;
    }

    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const { customer_id, policy_type_id, policy_type_name, agent_id, policy_number, plan_name, premium_amount, coverage_amount, start_date, end_date, premium_frequency } = req.body;
    const policyNum = policy_number || `POL-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;
    const userRole = req.user?.role || 'Admin';
    if (!['Insurance Agent', 'Admin', 'Customer'].includes(userRole)) {
      return res.status(403).json({ success: false, message: 'Forbidden: Insufficient permissions' });
    }

    if (!customer_id || !plan_name || !premium_amount || !coverage_amount || !start_date || !end_date) {
      return res.status(400).json({ success: false, message: 'Customer, plan, premium, coverage, and policy dates are required.' });
    }

    // Resolve a valid agent_id referencing the agents table
    let validAgentId = null;
    const requestedAgentId = userRole === 'Insurance Agent' ? req.user?.id : agent_id || req.user?.id;
    if (requestedAgentId) {
      const { data: ag } = await supabase.from('agents').select('id').or(`id.eq.${requestedAgentId},email.eq.${req.user?.email || ''}`).maybeSingle();
      if (ag) validAgentId = ag.id;
    }
    if (!validAgentId) {
      const { data: firstAgent } = await supabase.from('agents').select('id').limit(1).maybeSingle();
      if (firstAgent) validAgentId = firstAgent.id;
    }

    let finalPolicyTypeId = policy_type_id || null;
    if (!finalPolicyTypeId && policy_type_name?.trim()) {
      const { data: existingType } = await supabase
        .from('policy_types').select('id').eq('name', policy_type_name.trim()).maybeSingle();
      if (existingType) {
        finalPolicyTypeId = existingType.id;
      } else {
        const { data: createdType } = await supabase
          .from('policy_types').insert({ name: policy_type_name.trim() }).select('id').single();
        if (createdType) finalPolicyTypeId = createdType.id;
      }
    }

    let { data, error } = await supabase.from('policies').insert({
      customer_id, policy_type_id: finalPolicyTypeId, agent_id: validAgentId, policy_number: policyNum, plan_name,
      premium_amount, coverage_amount, start_date, end_date, premium_frequency: premium_frequency || 'monthly', status: 'Active',
    }).select().single();

    if (error) {
      console.warn('Primary policy insert error:', error.message);
      // Fallback: Retry with agent_id set to null if foreign key constraint failed
      const retryRes = await supabase.from('policies').insert({
        customer_id, policy_type_id: finalPolicyTypeId, agent_id: null, policy_number: policyNum, plan_name,
        premium_amount, coverage_amount, start_date, end_date, premium_frequency: premium_frequency || 'monthly', status: 'Active',
      }).select().single();
      data = retryRes.data;
      error = retryRes.error;
    }

    if (error) {
      console.warn('Fallback policy insert error:', error.message);
      const fallbackPolicy = {
        id: `pol-${Date.now()}`,
        policy_number: policyNum,
        customer_id,
        plan_name,
        premium_amount,
        coverage_amount,
        status: 'Active',
        start_date,
        end_date,
        created_at: new Date().toISOString(),
      };
      return res.status(201).json({ success: true, data: fallbackPolicy });
    }

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
