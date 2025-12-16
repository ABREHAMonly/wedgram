// First, update the Express type declaration
// backend/src/types/express/index.d.ts
import { IUser } from '../../models/User.model';

// Create a type without password for request user
export type IUserWithoutPassword = Omit<IUser, 'password'> & {
  _id: any;
};

declare global {
  namespace Express {
    interface Request {
      user?: IUserWithoutPassword;
    }
  }
}

export {};