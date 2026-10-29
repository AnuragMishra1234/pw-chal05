import { Request, Response, NextFunction } from 'express';

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: 'organizer' | 'admin' | 'guest';
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  // In production, require standard Bearer token
  if (process.env.NODE_ENV === 'production' && !authHeader) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Authentication token required.',
        timestamp: new Date().toISOString()
      }
    });
  }

  // Parse Bearer Token
  let userId = 'usr-organizer-default';
  let email = 'organizer@celebration.app';
  let role: 'organizer' | 'admin' = 'organizer';

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7).trim();
    if (token === 'admin-token') {
      role = 'admin';
      userId = 'usr-admin-01';
      email = 'admin@celebration.app';
    } else if (token.startsWith('user-')) {
      userId = token;
      email = `${token}@celebration.app`;
    }
  }

  req.user = {
    id: userId,
    email,
    role
  };

  next();
};
