const pool = require('../config/database');

class PasswordResetToken {
  /**
   * Create a password reset token
   */
  static async create(userId, token, expiresAt) {
    const query = `
      INSERT INTO password_reset_tokens (user_id, token, expires_at)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    const result = await pool.query(query, [userId, token, expiresAt]);
    return result.rows[0];
  }

  /**
   * Find token by token string
   */
  static async findByToken(token) {
    const query = `
      SELECT * FROM password_reset_tokens
      WHERE token = $1 AND used = false AND expires_at > CURRENT_TIMESTAMP
    `;
    const result = await pool.query(query, [token]);
    return result.rows[0];
  }

  /**
   * Mark token as used
   */
  static async markAsUsed(tokenId) {
    const query = `
      UPDATE password_reset_tokens
      SET used = true
      WHERE id = $1
      RETURNING *
    `;
    const result = await pool.query(query, [tokenId]);
    return result.rows[0];
  }

  /**
   * Delete expired tokens
   */
  static async deleteExpired() {
    const query = `
      DELETE FROM password_reset_tokens
      WHERE expires_at < CURRENT_TIMESTAMP
    `;
    await pool.query(query);
  }

  /**
   * Delete all tokens for a user
   */
  static async deleteByUserId(userId) {
    const query = 'DELETE FROM password_reset_tokens WHERE user_id = $1';
    await pool.query(query, [userId]);
  }
}

module.exports = PasswordResetToken;
