import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { CustomerStatus } from "@prisma/client";
import {
  IsDateString,
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from "class-validator";

export class CreateCustomerDto {
  @ApiProperty()
  @IsUUID()
  apartmentId!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  currentRoomId?: string;

  @ApiProperty({ example: "Nguyen Van A" })
  @IsString()
  @MaxLength(255)
  fullName!: string;

  @ApiPropertyOptional({ example: "1995-06-15" })
  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @ApiProperty({ example: "0901234567" })
  @IsString()
  @MaxLength(50)
  phoneNumber!: string;

  @ApiPropertyOptional({ example: "customer@example.com" })
  @IsOptional()
  @IsEmail()
  @MaxLength(255)
  email?: string;

  @ApiPropertyOptional({ example: "Vietnam" })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  nationality?: string;

  @ApiPropertyOptional({ example: "079095000001" })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  identityNumber?: string;

  @ApiPropertyOptional({ example: "B1234567" })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  passportNumber?: string;

  @ApiPropertyOptional({ example: "VN-2026-001" })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  visaNumber?: string;

  @ApiPropertyOptional({ enum: CustomerStatus, default: CustomerStatus.ENDED })
  @IsOptional()
  @IsEnum(CustomerStatus)
  status?: CustomerStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  note?: string;
}
