import { Controller, Get } from "@nestjs/common";

@Controller()
export class AppController {
  @Get()
  root() {
    return {
      status: "ok",
      service: "Apartment Management API",
      apiBasePath: "/api/v1",
      healthPath: "/api/v1/health",
    };
  }
}