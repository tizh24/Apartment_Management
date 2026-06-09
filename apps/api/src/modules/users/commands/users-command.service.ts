import { Injectable } from "@nestjs/common";

import { UsersRepository } from "../repositories/users.repository";

@Injectable()
export class UsersCommandService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async updateLastLoginAt(id: string): Promise<void> {
    await this.usersRepository.updateLastLoginAt(id, new Date());
  }
}
