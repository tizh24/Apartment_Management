import type { UserRole } from "@prisma/client";

export type JwtPayload = {
  sub: string;
  username: string;
  email: string;
  role: UserRole;
  apartmentId: string | null;
};

export type AuthenticatedRequestUser = {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  apartmentId: string | null;
};

export type RequestWithUser = {
  headers: {
    authorization?: string;
  };
  user?: AuthenticatedRequestUser;
};
