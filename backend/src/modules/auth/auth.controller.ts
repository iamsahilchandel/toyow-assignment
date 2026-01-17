import { Request, Response, NextFunction } from 'express';
import { authService } from './auth.service';

/**
 * Auth controller - handles HTTP request/response logic
 */
export class AuthController {
  /**
   * Register a new user
   * POST /auth/register
   */
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password, role } = req.body;
      const result = await authService.register(email, password, role);

      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Login user
   * POST /auth/login
   */
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      const result = await authService.login(email, password);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Refresh access token
   * POST /auth/refresh
   */
  async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body;
      const result = await authService.refreshToken(refreshToken);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get current authenticated user
   * GET /auth/me
   */
  async me(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await authService.getUserById(req.user!.userId);

      if (!user) {
        res.status(404).json({
          success: false,
          error: 'User not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: { user },
      });
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();
