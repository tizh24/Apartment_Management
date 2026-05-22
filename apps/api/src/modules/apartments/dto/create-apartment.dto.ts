import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString, MaxLength } from "class-validator";

export class CreateApartmentDto {
  @ApiProperty({ example: "Sunrise Apartment" })
  @IsString()
  @MaxLength(255)
  name!: string;

  @ApiPropertyOptional({ example: "12 Nguyen Trai, District 1" })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  address?: string;

  @ApiPropertyOptional({ example: "Asia/Ho_Chi_Minh", default: "Asia/Bangkok" })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  timezone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  note?: string;
}
