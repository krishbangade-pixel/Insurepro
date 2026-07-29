const supabase = require('../lib/supabase');

exports.getAll = async (req, res, next) => {
  try {
    const [agentsRes, profilesRes] = await Promise.all([
      supabase.from('agents').select('*'),
      supabase.from('profiles').select('*').in('role', ['Insurance Agent', 'Agent']),
    ]);

    const agents = agentsRes.data || [];
    const profiles = profilesRes.data || [];

    const map = new Map();
    // Include profiles registered as Agent
    profiles.forEach((p) => {
      const email = p.email || `${p.id}@insurepro.com`;
      map.set(email.toLowerCase(), {
        id: p.id,
        employee_code: `AGT-${String(p.id).substring(0, 4).toUpperCase()}`,
        name: p.full_name || email.split('@')[0] || 'Agent',
        email: email,
        role: p.role || 'Insurance Agent',
        designation: p.role || 'Insurance Agent',
        assigned_customers: 0,
        active_policies: 0,
        claim_resolution_rate: '100%',
        revenue_generated: '$0',
        status: 'Active',
        avatar_url: p.avatar_url,
      });
    });

    // Merge explicitly added agents
    agents.forEach((a) => {
      if (a.email) {
        map.set(a.email.toLowerCase(), { ...a });
      } else {
        map.set(a.id, { ...a });
      }
    });

    if (map.size === 0) {
      const defaultAgents = [
        { id: 'bb2abdc9-75b6-4114-8afa-291472cd7a6b', employee_code: 'AGT-BB2A', name: 'krish', email: 'bangadekrish@gmail.com', role: 'Insurance Agent', designation: 'Insurance Underwriter', assigned_customers: 12, active_policies: 28, claim_resolution_rate: '100%', revenue_generated: '$45,000', status: 'Active' },
        { id: '3a4bd446-b89c-4fad-9c21-f38ee5844f20', employee_code: 'AGT-01', name: 'Alex Johnson', email: 'alex.j@insurepro.com', role: 'Senior Underwriter & Administrator', designation: 'Senior Underwriter', assigned_customers: 142, active_policies: 310, claim_resolution_rate: '98.4%', revenue_generated: '$420,000', status: 'Active' },
        { id: '44e8e972-a61a-4315-89ed-5af0595e2dc0', employee_code: 'AGT-02', name: 'Marcus Vance', email: 'marcus.v@insurepro.com', role: 'Claims Specialist Lead', designation: 'Claims Specialist', assigned_customers: 98, active_policies: 215, claim_resolution_rate: '96.1%', revenue_generated: '$290,000', status: 'Active' },
        { id: 'e62029b7-d3e7-45cb-9be8-92864bec8a26', employee_code: 'AGT-03', name: 'Sophia Lin', email: 'sophia.l@insurepro.com', role: 'Enterprise Account Manager', designation: 'Account Manager', assigned_customers: 185, active_policies: 450, claim_resolution_rate: '99.2%', revenue_generated: '$780,000', status: 'Active' },
      ];
      defaultAgents.forEach((a) => map.set(a.email.toLowerCase(), a));
    }

    res.json({ success: true, data: Array.from(map.values()) });
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const { name, email, role, designation } = req.body;
    const empCode = `AGT-${String(Math.floor(Math.random() * 100)).padStart(2, '0')}`;
    const { data, error } = await supabase.from('agents').insert({
      employee_code: empCode, name, email, role, designation: designation || role,
      assigned_customers: 0, active_policies: 0, claim_resolution_rate: '0%', revenue_generated: '$0', status: 'Active',
    }).select().single();
    if (error) throw error;
    res.status(201).json({ success: true, data });
  } catch (err) { next(err); }
};
