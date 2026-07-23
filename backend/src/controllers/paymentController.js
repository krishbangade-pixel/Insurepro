const supabase = require('../lib/supabase');

exports.getAll = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 50 } = req.query;
    let query = supabase.from('premium_payments').select(`*, policy:policies(id, policy_number), customer:customers(id, name)`, { count: 'exact' });

    if (status) query = query.eq('payment_status', status);
    const from = (page - 1) * limit;
    query = query.order('created_at', { ascending: false }).range(from, from + limit - 1);

    const { data, error, count } = await query;
    if (error) throw error;
    res.json({ success: true, data, total: count });
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const { policy_id, customer_id, amount, payment_method, due_date, paid_date, payment_status } = req.body;
    const invoiceNum = `INV-${Math.floor(9000 + Math.random() * 1000)}`;
    const { data, error } = await supabase.from('premium_payments').insert({
      policy_id, customer_id, invoice_number: invoiceNum, amount, payment_method,
      due_date, paid_date, payment_status: payment_status || 'Paid',
    }).select().single();
    if (error) throw error;
    res.status(201).json({ success: true, data });
  } catch (err) { next(err); }
};

exports.getSummary = async (req, res, next) => {
  try {
    const { data: paid } = await supabase.from('premium_payments').select('amount').eq('payment_status', 'Paid');
    const { data: dueSoon } = await supabase.from('premium_payments').select('amount').eq('payment_status', 'Due Soon');
    const { data: overdue } = await supabase.from('premium_payments').select('amount').eq('payment_status', 'Overdue');

    const sum = (arr) => (arr || []).reduce((acc, r) => acc + Number(r.amount), 0);
    res.json({ success: true, data: { totalCollected: sum(paid), upcomingDue: sum(dueSoon), overdueAmount: sum(overdue) } });
  } catch (err) { next(err); }
};
