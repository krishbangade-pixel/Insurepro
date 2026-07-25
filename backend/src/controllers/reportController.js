const supabase = require('../lib/supabase');

exports.getDashboard = async (req, res, next) => {
  try {
    const [customers, policies, claims, payments, notifications] = await Promise.all([
      supabase.from('customers').select('id, status', { count: 'exact' }),
      supabase.from('policies').select('id, status', { count: 'exact' }),
      supabase.from('claims').select('id, status, claim_amount', { count: 'exact' }),
      supabase.from('premium_payments').select('id, amount, payment_status'),
      supabase.from('notifications').select('*').eq('user_id', req.user.id).eq('is_read', false).order('created_at', { ascending: false }).limit(4),
    ]);

    const totalCustomers = customers.count || 0;
    const activePolicies = (policies.data || []).filter(p => p.status === 'Active').length;
    const totalClaims = claims.count || 0;
    const pendingClaims = (claims.data || []).filter(c => c.status === 'Pending').length;
    const expiringPolicies = (policies.data || []).filter(p => p.status === 'Expiring Soon').length;
    const premiumCollected = (payments.data || []).filter(p => p.payment_status === 'Paid').reduce((s, p) => s + Number(p.amount), 0);

    // Claims overview
    const claimStatuses = ['Approved', 'Pending', 'In Review', 'Rejected'];
    const claimColors = { Approved: '#10B981', Pending: '#F59E0B', 'In Review': '#3B82F6', Rejected: '#EF4444' };
    const claimsOverview = claimStatuses.map(status => {
      const count = (claims.data || []).filter(c => c.status === status).length;
      return { name: status, value: count, percentage: totalClaims ? `${((count / totalClaims) * 100).toFixed(1)}%` : '0%', color: claimColors[status] };
    });

    // Recent claims
    const { data: recentClaims } = await supabase.from('claims')
      .select(`*, policy:policies(id, policy_number, policy_type:policy_types(name)), customer:customers(id, name, email, avatar_url)`)
      .order('submission_date', { ascending: false }).limit(5);

    // Policy type distribution
    const { data: policyTypeData } = await supabase.from('policies')
      .select('policy_type:policy_types(name)');
    const typeColors = { 'Health Insurance': '#10B981', 'Life Insurance': '#6366F1', 'Vehicle Insurance': '#3B82F6', 'Home Insurance': '#F59E0B' };
    const typeCounts = {};
    (policyTypeData || []).forEach(p => {
      const name = p.policy_type?.name || 'Unknown';
      typeCounts[name] = (typeCounts[name] || 0) + 1;
    });
    const totalPolicies = policies.count || 1;
    const topPolicyTypes = Object.entries(typeCounts).map(([name, count]) => ({
      name, count: count.toLocaleString(), percentage: Math.round((count / totalPolicies) * 100), color: typeColors[name] || '#8B5CF6',
    })).sort((a, b) => b.percentage - a.percentage);

    // Policy status distribution
    const statusColors = { Active: '#10B981', Expired: '#EF4444', 'Expiring Soon': '#F59E0B' };
    const policyStatusDist = ['Active', 'Expired', 'Expiring Soon'].map(label => {
      const count = (policies.data || []).filter(p => p.status === label).length;
      return { label: `${label} Policies`, count, percentage: `${((count / totalPolicies) * 100).toFixed(1)}%`, color: statusColors[label] };
    });

    const kpiStats = [
      { id: 'total-customers', title: 'Total Customers', value: totalCustomers.toLocaleString(), subtitle: 'All customer records', icon: 'Users', color: 'emerald' },
      { id: 'active-policies', title: 'Active Policies', value: activePolicies.toLocaleString(), subtitle: 'Currently in force', icon: 'ShieldCheck', color: 'blue' },
      { id: 'total-claims', title: 'Total Claims', value: totalClaims.toLocaleString(), subtitle: 'All submitted claims', icon: 'FileText', color: 'purple' },
      { id: 'premium-collected', title: 'Premium Collected', value: `$${premiumCollected.toLocaleString()}`, subtitle: 'Recorded paid premiums', icon: 'DollarSign', color: 'amber' },
      { id: 'pending-claims', title: 'Pending Claims', value: pendingClaims.toString(), subtitle: 'Awaiting a decision', icon: 'Hourglass', color: 'rose' },
      { id: 'expiring-policies', title: 'Expiring Policies', value: expiringPolicies.toString(), subtitle: 'Marked as expiring soon', icon: 'AlertTriangle', color: 'orange' },
    ];

    // Monthly revenue data (aggregate from payments by month)
    const { data: allPayments } = await supabase.from('premium_payments').select('amount, paid_date, payment_status').eq('payment_status', 'Paid');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyRevenue = months.slice(0, 6).map((month, idx) => {
      const monthPayments = (allPayments || []).filter(p => p.paid_date && new Date(p.paid_date).getMonth() === idx);
      const revenue = monthPayments.reduce((s, p) => s + Number(p.amount), 0);
      return { month, revenue, target: 0 };
    });

    // Customer growth data
    const customerGrowth = months.slice(0, 6).map((month, idx) => ({
      month, customers: 0,
    }));

    res.json({
      success: true,
      data: {
        kpiStats,
        monthlyRevenueData: monthlyRevenue,
        claimsOverviewData: claimsOverview,
        topPolicyTypes,
        customerGrowthData: customerGrowth,
        recentClaimsData: (recentClaims || []).map(c => ({
          id: c.claim_number, policyNumber: c.policy?.policy_number,
          customer: { name: c.customer?.name, email: c.customer?.email, avatar: c.customer?.avatar_url },
          claimAmount: `$${Number(c.claim_amount).toLocaleString()}`, status: c.status,
          submittedOn: new Date(c.submission_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          priority: c.priority, type: c.policy?.policy_type?.name,
        })),
        policyStatusDistribution: policyStatusDist,
        recentNotificationsData: (notifications.data || []).map(n => ({
          id: n.id, title: n.title, message: n.message, type: n.type, read: n.is_read,
          time: getTimeAgo(n.created_at),
        })),
      },
    });
  } catch (err) { next(err); }
};

exports.getRevenue = async (req, res, next) => {
  try {
    const { data } = await supabase.from('premium_payments').select('amount, paid_date, payment_status').eq('payment_status', 'Paid');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const result = months.map((month, idx) => {
      const payments = (data || []).filter(p => p.paid_date && new Date(p.paid_date).getMonth() === idx);
      const revenue = payments.reduce((s, p) => s + Number(p.amount), 0);
      return { month, revenue, target: 0 };
    });
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
};

exports.getCustomerGrowth = async (req, res, next) => {
  try {
    const { count } = await supabase.from('customers').select('id', { count: 'exact' });
    const total = count || 0;
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const result = months.map((month, idx) => ({ month, customers: Math.round(total * (0.4 + idx * 0.12)) }));
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
};

exports.getClaimsOverview = async (req, res, next) => {
  try {
    const { data, count } = await supabase.from('claims').select('status', { count: 'exact' });
    const total = count || 0;
    const colors = { Approved: '#10B981', Pending: '#F59E0B', 'In Review': '#3B82F6', Rejected: '#EF4444' };
    const result = ['Approved', 'Pending', 'In Review', 'Rejected'].map(status => {
      const c = (data || []).filter(cl => cl.status === status).length;
      return { name: status, value: c, percentage: total ? `${((c / total) * 100).toFixed(1)}%` : '0%', color: colors[status] };
    });
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
};

function getTimeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs > 1 ? 's' : ''} ago`;
  const days = Math.floor(hrs / 24);
  return `${days} day${days > 1 ? 's' : ''} ago`;
}
