import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsDateString, IsOptional, IsString } from "class-validator";

export class QueryDashboardDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  apartmentId?: string;

  @ApiPropertyOptional({ example: "2026-06-01" })
  @IsOptional()
  @IsDateString()
  from?: string;

  @ApiPropertyOptional({ example: "2026-06-30" })
  @IsOptional()
  @IsDateString()
  to?: string;
}
