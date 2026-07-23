export function formatDate(dateStr) {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatCurrency(amount) {
  return `$${Number(amount || 0).toLocaleString()}`;
}

export function getTimeAgo(dateStr) {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs > 1 ? 's' : ''} ago`;
  const days = Math.floor(hrs / 24);
  return `${days} day${days > 1 ? 's' : ''} ago`;
}

export function mapCustomer(c) {
  return {
    id: c.id,
    name: c.name,
    email: c.email,
    phone: c.phone,
    avatar: c.avatar_url,
    city: c.city,
    status: c.status,
    tier: c.tier,
    policiesCount: c.policies_count ?? 0,
    totalPremiums: c.total_premiums ? formatCurrency(c.total_premiums) : '$0',
    joinedDate: formatDate(c.created_at),
    riskScore: c.risk_score || 'N/A',
  };
}

export function mapPolicy(p) {
  const freq = p.premium_frequency === 'monthly' ? 'month' : p.premium_frequency || 'month';
  return {
    id: p.policy_number || p.id,
    _id: p.id,
    customerId: p.customer_id,
    holder: p.customer?.name || 'Unknown',
    holderAvatar: p.customer?.avatar_url,
    type: p.policy_type?.name || 'Insurance',
    planName: p.plan_name,
    premium: `$${Number(p.premium_amount || 0).toLocaleString()} / ${freq}`,
    coverage: `$${Number(p.coverage_amount || 0).toLocaleString()}`,
    startDate: formatDate(p.start_date),
    endDate: formatDate(p.end_date),
    status: p.status,
    agent: p.agent?.name || 'Unassigned',
  };
}

export function mapClaim(c) {
  return {
    id: c.claim_number || c.id,
    _id: c.id,
    customerId: c.customer_id,
    policyNumber: c.policy?.policy_number,
    customer: {
      name: c.customer?.name,
      email: c.customer?.email,
      avatar: c.customer?.avatar_url,
    },
    claimAmount: formatCurrency(c.claim_amount),
    status: c.status,
    submittedOn: formatDate(c.submission_date),
    priority: c.priority,
    type: c.policy?.policy_type?.name || c.claim_type,
  };
}

export function mapPayment(p) {
  return {
    invoiceId: p.invoice_number,
    _id: p.id,
    policyNumber: p.policy?.policy_number,
    customer: p.customer?.name,
    amount: `$${Number(p.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    paymentMethod: p.payment_method,
    dueDate: formatDate(p.due_date),
    paidDate: p.paid_date ? formatDate(p.paid_date) : 'Pending',
    status: p.payment_status,
  };
}

export function mapDocument(d) {
  return {
    id: d.id,
    customerId: d.customer_id,
    name: d.name || d.file_name,
    category: d.category,
    size: d.size,
    uploadedOn: formatDate(d.uploaded_at),
    uploadedBy: d.customer?.name || 'System',
    status: d.status,
  };
}

export function mapAgent(a) {
  return {
    id: a.employee_code || a.id,
    _id: a.id,
    name: a.name,
    role: a.designation || a.role,
    email: a.email,
    avatar: a.avatar_url,
    assignedCustomers: a.assigned_customers ?? 0,
    activePolicies: a.active_policies ?? 0,
    claimResolutionRate: a.claim_resolution_rate || '0%',
    revenueGenerated: a.revenue_generated || '$0',
    status: a.status,
  };
}

export function mapAuditLog(l) {
  return {
    id: l.id,
    user: l.user_name,
    role: l.user_role,
    action: l.action,
    details: l.details,
    ip: l.ip_address,
    timestamp: l.created_at
      ? new Date(l.created_at).toLocaleString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      : '-',
    category: l.category,
  };
}

export function mapNotification(n) {
  return {
    id: n.id,
    title: n.title,
    message: n.message,
    time: getTimeAgo(n.created_at),
    type: n.type,
    read: n.is_read,
  };
}

export function deriveClaimsByCategory(claims) {
  const colors = { Health: '#10B981', Vehicle: '#3B82F6', Life: '#F59E0B', Home: '#8B5CF6', Other: '#8B5CF6' };
  const counts = {};
  (claims || []).forEach((c) => {
    const key = (c.type || 'Other').split(' ')[0];
    counts[key] = (counts[key] || 0) + 1;
  });
  const total = Object.values(counts).reduce((s, v) => s + v, 0) || 1;
  return Object.entries(counts).map(([name, count]) => ({
    name,
    value: Math.round((count / total) * 100),
    color: colors[name] || colors.Other,
  }));
}
