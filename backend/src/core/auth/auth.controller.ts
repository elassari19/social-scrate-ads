import { Request, Response, NextFunction } from 'express';
import passport from 'passport';
import { AuthService } from './auth.service';
import { User } from '@prisma/client';

export class AuthController {
  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await AuthService.register(req.body);
      req.login(user, (err) => {
        if (err) return next(err);
        return res.status(201).json(user);
      });
    } catch (error: any) {
      if (error.message === 'User already exists') {
        return res.status(409).json({ message: error.message });
      }
      if (error.message === 'Invalid input data') {
        return res.status(400).json({ message: error.message });
      }
      next(error);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction) {
    passport.authenticate('local', (err: any, user: any, info: any) => {
      if (err) return next(err);
      if (!user) {
        return res.status(401).json({ message: info.message });
      }
      req.login(user, (err) => {
        if (err) return next(err);
        return res.json({
          id: user.id,
          email: user.email,
          name: user.name,
        });
      });
    })(req, res, next);
  }

  static logout(req: Request, res: Response) {
    req.logout(() => {
      res.status(200).json({ message: 'Logged out successfully' });
    });
  }

  static async getCurrentUser(req: Request, res: Response) {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const user = await AuthService.getUserById(req.user.id);
    res.json(user);
  }

  static checkSession(req: Request, res: Response) {
    if (req.isAuthenticated()) {
      res.json({ authenticated: true, user: req.user });
    } else {
      res.json({ authenticated: false });
    }
  }
}
