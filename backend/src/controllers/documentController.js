const supabase = require('../lib/supabase');

exports.getAll = async (req, res, next) => {
  try {
    const { category } = req.query;
    let query = supabase.from('documents').select(`*, customer:customers(id, name)`);
    if (category && category !== 'All') query = query.eq('category', category);
    query = query.order('uploaded_at', { ascending: false });

    const { data, error } = await query;
    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const { name, category, size, customer_id, policy_id, file_name, file_path, file_type } = req.body;
    const { data, error } = await supabase.from('documents').insert({
      name: name || file_name, category, size, customer_id, policy_id,
      file_name: file_name || name, file_path: file_path || '/uploads/' + name,
      file_type, uploaded_by: req.user.id, status: 'Verified',
    }).select().single();
    if (error) throw error;
    res.status(201).json({ success: true, data });
  } catch (err) { next(err); }
};

exports.remove = async (req, res, next) => {
  try {
    const { error } = await supabase.from('documents').delete().eq('id', req.params.id);
    if (error) throw error;
    res.json({ success: true, message: 'Document deleted' });
  } catch (err) { next(err); }
};
