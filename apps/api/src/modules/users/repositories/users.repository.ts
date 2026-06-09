import { Injectable } from "@nestjs/common";
import type { User } from "@prisma/client";

import { PrismaService } from "../../../shared/database/prisma.service";

@Injectable()
export class UsersRepository {
  constructor(private readonly prismaService: PrismaService) {}

  findByUsername(username: string): Promise<User | null> {
    return this.prismaService.user.findUnique({
      where: { username },
    });
  }

  findById(id: string): Promise<User | null> {
    return this.prismaService.user.findUnique({
      where: { id },
    });
  }

  async updateLastLoginAt(id: string, lastLoginAt: Date): Promise<void> {
    await this.prismaService.user.update({
      where: { id },
      data: { lastLoginAt },
    });
  }
}
