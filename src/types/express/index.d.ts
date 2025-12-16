// backend/src/types/express/index.d.ts
// For the alternative approach

declare global {
  namespace Express {
    interface Request {
      user?: {
        _id: string;
        name: string;
        email: string;
        role: 'admin' | 'inviter';
        isActive: boolean;
        phone?: string;
        weddingDate?: Date;
        partnerName?: string;
        weddingLocation?: string;
        createdAt: Date;
        updatedAt: Date;
      };
    }
  }
}

export {};