const AuthService = require('../services/authService');

class AuthController {
  /**
   * Register new user
   */
  static async register(req, res) {
    try {
      const { fullName, email, gender, role, password, confirmPassword } = req.body;

      const result = await AuthService.register({
        fullName,
        email,
        gender,
        role,
        password,
      });

      res.status(201).json({
        success: true,
        message: 'Account created successfully',
        data: result,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Login user
   */
  static async login(req, res) {
    try {
      const { email, password } = req.body;

      const result = await AuthService.login(email, password);

      // Set HTTP-only cookie
      res.cookie('token', result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: result.user,
      });
    } catch (error) {
      res.status(401).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Logout user
   */
  static async logout(req, res) {
    try {
      res.clearCookie('token');
      res.status(200).json({
        success: true,
        message: 'Logout successful',
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Logout failed',
      });
    }
  }

  /**
   * Get current user
   */
  static async getCurrentUser(req, res) {
    try {
      const userId = req.user.userId;
      const user = await AuthService.getCurrentUser(userId);

      res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Forgot password
   */
  static async forgotPassword(req, res) {
    try {
      const { email } = req.body;
      const result = await AuthService.forgotPassword(email);

      res.status(200).json({
        success: true,
        message: result.message,
        // In production, don't include resetToken in response
        ...(process.env.NODE_ENV !== 'production' && { resetToken: result.resetToken }),
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Reset password
   */
  static async resetPassword(req, res) {
    try {
      const { token, password, confirmPassword } = req.body;
      const result = await AuthService.resetPassword(token, password);

      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }
}

module.exports = AuthController;
