import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';
import { UnauthorizedError } from './errorHandler';

// For development, we'll use a simple mock authentication
// In production, this should validate Azure AD B2C tokens

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    azureAdId?: string;
  };
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    // For development: accept a simple mock user header
    if (process.env.NODE_ENV === 'development') {
      // Check for X-User-Email header for development
      const userEmail = req.headers['x-user-email'] as string;
      if (userEmail) {
        req.user = {
          id: 'dev-user-id',
          email: userEmail,
        };
        return next();
      }
    }

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('No token provided');
    }

    const token = authHeader.substring(7);

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as any;
    
    req.user = {
      id: decoded.sub || decoded.userId,
      email: decoded.email,
      azureAdId: decoded.oid,
    };

    next();
  } catch (error) {
    next(new UnauthorizedError('Invalid token'));
  }
};

// Optional authentication - doesn't throw error if no token
export const optionalAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    await authenticate(req, res, () => {});
  } catch (error) {
    // Continue without user
  }
  next();
};
