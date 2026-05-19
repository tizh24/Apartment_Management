import { Controller, Get } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";

import { PrismaService } from "../../shared/database/prisma.service";

@ApiTags("health")
@Controller({
  path: "health",
  version: "1",
})
export class HealthController {
  constructor(private readonly prismaService: PrismaService) {}

  @Get()
  async check(): Promise<{
    status: "ok";
    database: "up";
    timestamp: string;
  }> {
    await this.prismaService.$queryRaw`SELECT 1`;

    return {
      status: "ok",
      database: "up",
      timestamp: new Date().toISOString(),
    };
  }
}
