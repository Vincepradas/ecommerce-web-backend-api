import 'express';
import { Document } from 'mongoose';

declare module 'express-serve-static-core' {
  interface Request {
    user?: (Document & { _id: string; role?: string; name?: string; email?: string; addresses?: string[] }) | any;
  }
}
