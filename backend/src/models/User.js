const pool = require('../config/database');

class User {
  /**
   * Create a new user
   */
  static async create(userData) {
    const { fullName, email, password, gender, role } = userData;
    
    const query = `
      INSERT INTO users (full_name, email, password, gender, role)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, full_name, email, gender, role, is_active, created_at
    `;
    
    const values = [fullName, email, password, gender, role];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  /**
   * Find user by email
   */
  static async findByEmail(email) {
    const query = 'SELECT * FROM users WHERE email = $1';
    const result = await pool.query(query, [email]);
    return result.rows[0];
  }

  /**
   * Find user by ID
   */
  static async findById(id) {
    const query = `
      SELECT id, full_name, email, gender, role, is_active, created_at, updated_at
      FROM users WHERE id = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  /**
   * Update user
   */
  static async update(id, updateData) {
    const setClause = Object.keys(updateData)
      .map((key, index) => `${key} = $${index + 2}`)
      .join(', ');
    
    const query = `
      UPDATE users
      SET ${setClause}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING id, full_name, email, gender, role, is_active, created_at, updated_at
    `;
    
    const values = [id, ...Object.values(updateData)];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  /**
   * Update user password
   */
  static async updatePassword(id, newPassword) {
    const query = `
      UPDATE users
      SET password = $2, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING id
    `;
    const result = await pool.query(query, [id, newPassword]);
    return result.rows[0];
  }

  /**
   * Delete user (soft delete by setting is_active to false)
   */
  static async softDelete(id) {
    const query = `
      UPDATE users
      SET is_active = false, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING id
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  /**
   * Get all users with pagination
   */
  static async getAll(limit = 10, offset = 0) {
    const query = `
      SELECT id, full_name, email, gender, role, is_active, created_at, updated_at
      FROM users
      ORDER BY created_at DESC
      LIMIT $1 OFFSET $2
    `;
    const result = await pool.query(query, [limit, offset]);
    return result.rows;
  }

  /**
   * Count total users
   */
  static async count() {
    const query = 'SELECT COUNT(*) FROM users';
    const result = await pool.query(query);
    return parseInt(result.rows[0].count);
  }
}

module.exports = User;
