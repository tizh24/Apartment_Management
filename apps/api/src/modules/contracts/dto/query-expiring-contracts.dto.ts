import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsIn, IsInt, IsOptional, IsString, MaxLength } from "class-validator";

export class QueryExpiringContractsDto {
  @ApiPropertyOptional({
    example: 7,
    default: 7,
    enum: [3, 5, 7],
    description: "Only supports expiring alerts under 7 days: 3, 5, or 7.",
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsIn([3, 5, 7])
  days = 7;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  apartmentId?: string;
}
