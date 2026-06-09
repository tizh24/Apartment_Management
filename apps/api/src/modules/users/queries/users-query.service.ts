import { Injectable } from "@nestjs/common";
import type { User } from "@prisma/client";

import { UsersRepository } from "../repositories/users.repository";

@Injectable()
export class UsersQueryService {
  constructor(private readonly usersRepository: UsersRepository) {}

  findByUsername(username: string): Promise<User | null> {
    return this.usersRepository.findByUsername(username);
  }

  findById(id: string): Promise<User | null> {
    return this.usersRepository.findById(id);
  }
}
