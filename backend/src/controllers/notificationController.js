const supabase = require('../lib/supabase');

exports.getAll = async (req, res, next) => {
  try {
    const { data, error } = await supabase.from('notifications')
      .select('*').eq('user_id', req.user.id)
      .order('created_at', { ascending: false });
    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

exports.markRead = async (req, res, next) => {
  try {
    const { data, error } = await supabase.from('notifications')
      .update({ is_read: true }).eq('id', req.params.id).eq('user_id', req.user.id).select().single();
    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

exports.markAllRead = async (req, res, next) => {
  try {
    const { error } = await supabase.from('notifications')
      .update({ is_read: true }).eq('user_id', req.user.id).eq('is_read', false);
    if (error) throw error;
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (err) { next(err); }
};
