import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import type { User } from "@prisma/client";
import argon2 from "argon2";

import { UsersService } from "../users/users.service";
import type { JwtPayload } from "./auth.types";
import type { LoginDto } from "./dto/login.dto";

type AuthenticatedUser = Pick<
  User,
  "id" | "username" | "email" | "fullName" | "role"
>;

type LoginResponse = {
  accessToken: string;
  user: AuthenticatedUser;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async login(dto: LoginDto): Promise<LoginResponse> {
    const user = await this.validateUser(dto.username, dto.password);
    const payload: JwtPayload = {
      sub: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    };

    await this.usersService.updateLastLoginAt(user.id);

    return {
      accessToken: await this.jwtService.signAsync(payload),
      user: this.toAuthenticatedUser(user),
    };
  }

  async hashPassword(password: string): Promise<string> {
    return argon2.hash(password);
  }

  async verifyPassword(passwordHash: string, password: string): Promise<boolean> {
    return argon2.verify(passwordHash, password);
  }

  async getCurrentUser(id: string): Promise<AuthenticatedUser> {
    const user = await this.usersService.findById(id);

    if (!user || !user.isActive) {
      throw new UnauthorizedException("Invalid access token");
    }

    return this.toAuthenticatedUser(user);
  }

  private async validateUser(username: string, password: string): Promise<User> {
    const user = await this.usersService.findByUsername(username);

    if (!user || !user.isActive) {
      throw new UnauthorizedException("Invalid username or password");
    }

    const passwordMatches = await this.verifyPassword(user.passwordHash, password);

    if (!passwordMatches) {
      throw new UnauthorizedException("Invalid username or password");
    }

    return user;
  }

  private toAuthenticatedUser(user: User): AuthenticatedUser {
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
    };
  }
}
