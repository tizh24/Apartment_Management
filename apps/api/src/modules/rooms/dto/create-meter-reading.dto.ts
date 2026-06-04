import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from "class-validator";

export class CreateMeterReadingDto {
  @ApiProperty({ example: "2026-05-01" })
  @IsDateString()
  periodStart!: string;

  @ApiProperty({ example: "2026-05-31" })
  @IsDateString()
  periodEnd!: string;

  @ApiProperty({ example: 100 })
  @IsNumber()
  @Min(0)
  electricityStart!: number;

  @ApiProperty({ example: 180 })
  @IsNumber()
  @Min(0)
  electricityEnd!: number;

  @ApiProperty({ example: 3500 })
  @IsNumber()
  @Min(0)
  electricityUnitPrice!: number;

  @ApiProperty({ example: 20 })
  @IsNumber()
  @Min(0)
  waterStart!: number;

  @ApiProperty({ example: 35 })
  @IsNumber()
  @Min(0)
  waterEnd!: number;

  @ApiProperty({ example: 15000 })
  @IsNumber()
  @Min(0)
  waterUnitPrice!: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  note?: string;
}
