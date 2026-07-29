const supabase = require('../lib/supabase');

// Helper to get matching customer ID for logged-in user (by email)
async function getCustomerIdForUser(user) {
  if (!user?.email) return null;
  const { data } = await supabase.from('customers').select('id').eq('email', user.email).maybeSingle();
  return data?.id || null;
}

// Helper to get matching agent record ID for logged-in user
// The agents table uses user_id (Supabase auth UUID) to link to the profile
async function getAgentIdForUser(user) {
  if (!user?.email) return null;
  // Try by user_id (Supabase auth UUID) first — most reliable
  if (user.id && user.id !== 'dev-admin-id') {
    const { data: byUid } = await supabase
      .from('agents')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();
    if (byUid?.id) return byUid.id;
  }
  // Fallback: look up by email
  const { data: byEmail } = await supabase
    .from('agents')
    .select('id')
    .eq('email', user.email)
    .maybeSingle();
  return byEmail?.id || null;
}

exports.getAll = async (req, res, next) => {
  try {
    const { search, status, customer_id, page = 1, limit = 50 } = req.query;

    let query = supabase
      .from('claims')
      .select(
        `*, 
         policy:policies(id, policy_number, plan_name, policy_type:policy_types(name)), 
         customer:customers(id, name, email, avatar_url), 
         agent:agents(id, name, email)`,
        { count: 'exact' }
      );

    const userRole = req.user?.role || 'Admin';

    // --- Role-based scoping ---
    if (userRole === 'Customer' && req.user?.id !== 'dev-admin-id') {
      // Customers only see their own claims
      const custId = await getCustomerIdForUser(req.user);
      if (custId) {
        query = query.eq('customer_id', custId);
      } else {
        // No customer record → return empty
        return res.json({ success: true, data: [], total: 0 });
      }
    } else if (
      (userRole === 'Insurance Agent' || userRole === 'Agent') &&
      req.user?.id !== 'dev-admin-id'
    ) {
      // Agents ONLY see claims explicitly assigned to them (Requirement #8)
      const agentId = await getAgentIdForUser(req.user);
      if (agentId) {
        query = query.eq('agent_id', agentId);
      } else {
        // Agent has no agent record yet → return empty (not all unassigned claims)
        return res.json({ success: true, data: [], total: 0 });
      }
    }
    // Admin sees all claims — no filter

    if (search) query = query.or(`claim_number.ilike.%${search}%,description.ilike.%${search}%`);
    if (status) query = query.eq('status', status);
    if (customer_id) query = query.eq('customer_id', customer_id);

    const from = (page - 1) * limit;
    query = query.order('submission_date', { ascending: false }).range(from, from + Number(limit) - 1);

    const { data, error, count } = await query;
    if (error) throw error;

    res.json({ success: true, data: data || [], total: count || 0 });
  } catch (err) {
    next(err);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('claims')
      .select(
        `*, 
         policy:policies(id, policy_number, plan_name, policy_type:policy_types(name)), 
         customer:customers(id, name, email, avatar_url), 
         agent:agents(id, name, email, designation)`
      )
      .eq('id', req.params.id)
      .maybeSingle();

    if (error) throw error;
    if (!data) return res.status(404).json({ success: false, message: 'Claim record not found' });

    // Agents may only view their assigned claim (Requirement #8)
    const userRole = req.user?.role || 'Admin';
    if (
      (userRole === 'Insurance Agent' || userRole === 'Agent') &&
      req.user?.id !== 'dev-admin-id'
    ) {
      const agentId = await getAgentIdForUser(req.user);
      if (agentId && data.agent_id && data.agent_id !== agentId) {
        return res
          .status(403)
          .json({ success: false, message: 'Forbidden: You may only view claims assigned to you.' });
      }
    }

    // Customers may only view their own claim (Requirement #7)
    if (userRole === 'Customer' && req.user?.id !== 'dev-admin-id') {
      const custId = await getCustomerIdForUser(req.user);
      if (custId && data.customer_id !== custId) {
        return res.status(403).json({ success: false, message: 'Forbidden.' });
      }
    }

    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    let { policy_id, customer_id, claim_amount, amount, priority, claim_type, description, reason, incident_date } = req.body;
    const finalAmount = claim_amount !== undefined ? claim_amount : (amount !== undefined ? amount : 0);

    // Resolve Customer ID if not supplied
    if (!customer_id) {
      if (policy_id) {
        const { data: pol } = await supabase
          .from('policies')
          .select('customer_id, agent_id')
          .eq('id', policy_id)
          .maybeSingle();
        if (pol?.customer_id) customer_id = pol.customer_id;
      }
      if (!customer_id && req.user) {
        customer_id = await getCustomerIdForUser(req.user);
      }
    }

    // Resolve assigned Agent ID from the policy's agent
    let assignedAgentId = null;
    if (policy_id) {
      const { data: pol } = await supabase
        .from('policies')
        .select('agent_id')
        .eq('id', policy_id)
        .maybeSingle();
      if (pol?.agent_id) assignedAgentId = pol.agent_id;
    }
    // Fallback: assign to the first available agent
    if (!assignedAgentId) {
      const { data: defaultAgent } = await supabase
        .from('agents')
        .select('id')
        .limit(1)
        .maybeSingle();
      if (defaultAgent?.id) assignedAgentId = defaultAgent.id;
    }

    const claimNum = `CLM-${new Date().getFullYear()}-${String(Math.floor(1000 + Math.random() * 9000))}`;

    const insertPayload = {
      policy_id: policy_id || null,
      customer_id: customer_id || null,
      agent_id: assignedAgentId || null,
      claim_number: claimNum,
      claim_amount: Number(finalAmount),
      priority: priority || 'Medium',
      claim_type: claim_type || 'General',
      description: description || reason || 'Insurance Claim Submission',
      reason: reason || description || 'General Claim',
      status: 'Pending',
      submission_date: incident_date || new Date().toISOString(),
    };

    const { data, error } = await supabase.from('claims').insert(insertPayload).select().single();
    if (error) throw error;

    res.status(201).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const { agent_id, ...updates } = req.body;
    const userRole = req.user?.role || 'Admin';

    // Requirement #7: Customers cannot edit claims after submission
    if (userRole === 'Customer' && req.user?.id !== 'dev-admin-id') {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: Customers cannot modify claims after submission.',
      });
    }

    // Requirement #9: Only Admin can reassign claims to another agent
    if (agent_id !== undefined) {
      if (userRole !== 'Admin' && req.user?.id !== 'dev-admin-id') {
        return res.status(403).json({
          success: false,
          message: 'Forbidden: Only Administrators can reassign claims to another agent.',
        });
      }
      updates.agent_id = agent_id;
    }

    const { data, error } = await supabase
      .from('claims')
      .update(updates)
      .eq('id', req.params.id)
      .select()
      .single();
    if (error) throw error;

    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

exports.approve = async (req, res, next) => {
  try {
    const { review_comment } = req.body;
    const userRole = req.user?.role || 'Admin';

    // Requirement #5: A review comment is mandatory before approving
    if (!review_comment || !review_comment.trim()) {
      return res.status(400).json({
        success: false,
        message: 'A review comment is required before approving a claim.',
      });
    }

    // Requirement #7: Customers cannot review claims
    if (userRole === 'Customer' && req.user?.id !== 'dev-admin-id') {
      return res.status(403).json({ success: false, message: 'Forbidden: Customers cannot review claims.' });
    }

    // Requirement #8: Agents may only approve claims assigned to them
    if (
      (userRole === 'Insurance Agent' || userRole === 'Agent') &&
      req.user?.id !== 'dev-admin-id'
    ) {
      const agentId = await getAgentIdForUser(req.user);
      const { data: claim } = await supabase
        .from('claims')
        .select('agent_id, status')
        .eq('id', req.params.id)
        .maybeSingle();

      if (!claim) {
        return res.status(404).json({ success: false, message: 'Claim not found.' });
      }
      if (agentId && claim.agent_id && claim.agent_id !== agentId) {
        return res.status(403).json({
          success: false,
          message: 'Forbidden: Agents can only review claims assigned to them.',
        });
      }
      if (claim.status !== 'Pending') {
        return res.status(400).json({
          success: false,
          message: `Claim is already ${claim.status}. Only Pending claims can be reviewed.`,
        });
      }
    }

    // Requirement #6: Update status, reviewer, reviewed_at, review_comment
    const updatePayload = {
      status: 'Approved',
      review_comment: review_comment.trim(),
      reviewed_by: req.user.id,
      reviewed_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('claims')
      .update(updatePayload)
      .eq('id', req.params.id)
      .select(
        `*, policy:policies(id, policy_number, plan_name), customer:customers(id, name, email), agent:agents(id, name, email)`
      )
      .single();
    if (error) throw error;

    res.json({ success: true, data, message: 'Claim approved successfully.' });
  } catch (err) {
    next(err);
  }
};

exports.reject = async (req, res, next) => {
  try {
    const { review_comment } = req.body;
    const userRole = req.user?.role || 'Admin';

    // Requirement #5: A review comment is mandatory before rejecting
    if (!review_comment || !review_comment.trim()) {
      return res.status(400).json({
        success: false,
        message: 'A review comment is required before rejecting a claim.',
      });
    }

    // Requirement #7: Customers cannot review claims
    if (userRole === 'Customer' && req.user?.id !== 'dev-admin-id') {
      return res.status(403).json({ success: false, message: 'Forbidden: Customers cannot review claims.' });
    }

    // Requirement #8: Agents may only reject claims assigned to them
    if (
      (userRole === 'Insurance Agent' || userRole === 'Agent') &&
      req.user?.id !== 'dev-admin-id'
    ) {
      const agentId = await getAgentIdForUser(req.user);
      const { data: claim } = await supabase
        .from('claims')
        .select('agent_id, status')
        .eq('id', req.params.id)
        .maybeSingle();

      if (!claim) {
        return res.status(404).json({ success: false, message: 'Claim not found.' });
      }
      if (agentId && claim.agent_id && claim.agent_id !== agentId) {
        return res.status(403).json({
          success: false,
          message: 'Forbidden: Agents can only review claims assigned to them.',
        });
      }
      if (claim.status !== 'Pending') {
        return res.status(400).json({
          success: false,
          message: `Claim is already ${claim.status}. Only Pending claims can be reviewed.`,
        });
      }
    }

    // Requirement #6: Update status, reviewer, reviewed_at, review_comment
    const updatePayload = {
      status: 'Rejected',
      review_comment: review_comment.trim(),
      reviewed_by: req.user.id,
      reviewed_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('claims')
      .update(updatePayload)
      .eq('id', req.params.id)
      .select(
        `*, policy:policies(id, policy_number, plan_name), customer:customers(id, name, email), agent:agents(id, name, email)`
      )
      .single();
    if (error) throw error;

    res.json({ success: true, data, message: 'Claim rejected successfully.' });
  } catch (err) {
    next(err);
  }
};

// Requirement #9: Only Admin can reassign a claim to another agent
exports.assignAgent = async (req, res, next) => {
  try {
    const userRole = req.user?.role || 'Admin';

    if (userRole !== 'Admin' && req.user?.id !== 'dev-admin-id') {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: Only Administrators can reassign claims to another agent.',
      });
    }

    const { agent_id } = req.body;
    if (!agent_id) {
      return res.status(400).json({ success: false, message: 'agent_id is required.' });
    }

    const { data, error } = await supabase
      .from('claims')
      .update({ agent_id })
      .eq('id', req.params.id)
      .select(`*, agent:agents(id, name, email)`)
      .single();
    if (error) throw error;

    res.json({ success: true, data, message: 'Agent assigned to claim successfully.' });
  } catch (err) {
    next(err);
  }
};
