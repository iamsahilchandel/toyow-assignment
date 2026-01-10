import bcrypt from 'bcrypt';
import jwt, { SignOptions } from 'jsonwebtoken';
import { prismaClient } from '../config/database';
import { env } from '../config/env';
import { AuthenticationError, ConflictError, ValidationError } from '../utils/errors';
import { UserRole } from '../../generated/prisma';

const SALT_ROUNDS = 10;

interface TokenPayload {
  userId: string;
  email: string;
  role: UserRole;
}

export class AuthService {
  async register(email: string, password: string, role: UserRole = UserRole.USER) {
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new ValidationError('Invalid email format');
    }

    // Validate password strength
    if (password.length < 8) {
      throw new ValidationError('Password must be at least 8 characters long');
    }

    // Check if user already exists
    const existingUser = await prismaClient.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictError('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await this.hashPassword(password);

    // Create user
    const user = await prismaClient.user.create({
      data: {
        email,
        password: hashedPassword,
        role,
      },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    // Generate tokens
    const tokens = this.generateTokens({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      user,
      tokens,
    };
  }

  async login(email: string, password: string) {
    // Find user
    const user = await prismaClient.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new AuthenticationError('Invalid email or password');
    }

    // Verify password
    const isValidPassword = await this.comparePassword(password, user.password);

    if (!isValidPassword) {
      throw new AuthenticationError('Invalid email or password');
    }

    // Generate tokens
    const tokens = this.generateTokens({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
      tokens,
    };
  }

  async getUserById(userId: string) {
    const user = await prismaClient.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    return user;
  }

  verifyToken(token: string): TokenPayload {
    try {
      const decoded = jwt.verify(token, env.JWT_SECRET) as TokenPayload;
      return decoded;
    } catch (error) {
      throw new AuthenticationError('Invalid or expired token');
    }
  }

  generateTokens(payload: TokenPayload): { accessToken: string; refreshToken: string } {
    const accessTokenOptions: SignOptions = {
      expiresIn: env.JWT_EXPIRES_IN as any,
    };
    const refreshTokenOptions: SignOptions = {
      expiresIn: env.JWT_REFRESH_EXPIRES_IN as any,
    };

    const accessToken = jwt.sign(payload, env.JWT_SECRET, accessTokenOptions);
    const refreshToken = jwt.sign(payload, env.JWT_SECRET, refreshTokenOptions);

    return { accessToken, refreshToken };
  }

  async refreshToken(refreshToken: string) {
    try {
      const decoded = this.verifyToken(refreshToken);

      // Get fresh user data
      const user = await this.getUserById(decoded.userId);

      if (!user) {
        throw new AuthenticationError('User not found');
      }

      // Generate new tokens
      const tokens = this.generateTokens({
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      return {
        user,
        tokens,
      };
    } catch (error) {
      throw new AuthenticationError('Invalid or expired refresh token');
    }
  }

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, SALT_ROUNDS);
  }

  async comparePassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }
}

export const authService = new AuthService();
