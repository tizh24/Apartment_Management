import type { UserRole } from "@prisma/client";

export type JwtPayload = {
  sub: string;
  username: string;
  email: string;
  role: UserRole;
};

export type AuthenticatedRequestUser = {
  id: string;
  username: string;
  email: string;
  role: UserRole;
};

export type RequestWithUser = {
  headers: {
    authorization?: string;
  };
  user?: AuthenticatedRequestUser;
};
