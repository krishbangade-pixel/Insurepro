const User = require('../models/User');
const PasswordResetToken = require('../models/PasswordResetToken');
const { hashPassword, comparePassword } = require('../utils/hashPassword');
const { generateToken } = require('../utils/generateToken');
const crypto = require('crypto');

class AuthService {
  /**
   * Register a new user
   */
  static async register(userData) {
    const { fullName, email, password, gender, role } = userData;

    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = await User.create({
      fullName,
      email,
      password: hashedPassword,
      gender,
      role,
    });

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      user: {
        id: user.id,
        fullName: user.full_name,
        email: user.email,
        gender: user.gender,
        role: user.role,
      },
      token,
    };
  }

  /**
   * Login user
   */
  static async login(email, password) {
    // Find user by email
    const user = await User.findByEmail(email);
    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Check if user is active
    if (!user.is_active) {
      throw new Error('Account has been deactivated');
    }

    // Compare password
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      user: {
        id: user.id,
        fullName: user.full_name,
        email: user.email,
        gender: user.gender,
        role: user.role,
      },
      token,
    };
  }

  /**
   * Get current user
   */
  static async getCurrentUser(userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    return {
      id: user.id,
      fullName: user.full_name,
      email: user.email,
      gender: user.gender,
      role: user.role,
      isActive: user.is_active,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
    };
  }

  /**
   * Initiate forgot password
   */
  static async forgotPassword(email) {
    const user = await User.findByEmail(email);
    if (!user) {
      // Don't reveal if user exists or not for security
      return { message: 'If the email exists, a reset link has been sent' };
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 3600000); // 1 hour from now

    // Delete any existing tokens for this user
    await PasswordResetToken.deleteByUserId(user.id);

    // Create new reset token
    await PasswordResetToken.create(user.id, resetToken, expiresAt);

    // In production, send email here with reset link
    // For now, return the token (in production, don't return this)
    return {
      message: 'If the email exists, a reset link has been sent',
      resetToken, // Remove this in production
    };
  }

  /**
   * Reset password
   */
  static async resetPassword(token, newPassword) {
    // Find valid token
    const resetToken = await PasswordResetToken.findByToken(token);
    if (!resetToken) {
      throw new Error('Invalid or expired reset token');
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword);

    // Update user password
    await User.updatePassword(resetToken.user_id, hashedPassword);

    // Mark token as used
    await PasswordResetToken.markAsUsed(resetToken.id);

    return { message: 'Password has been reset successfully' };
  }
}

module.exports = AuthService;
