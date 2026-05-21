import { registerAs } from "@nestjs/config";

export const authConfig = registerAs("auth", () => ({
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET,
  jwtAccessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN ?? "1d",
}));
