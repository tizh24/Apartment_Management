import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { RoomStatus } from "@prisma/client";
import {
  ArrayMaxSize,
  IsArray,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from "class-validator";

export class CreateRoomDto {
  @ApiProperty()
  @IsUUID()
  apartmentId!: string;

  @ApiProperty({ example: "101" })
  @IsString()
  @MaxLength(50)
  code!: string;

  @ApiPropertyOptional({ example: "1" })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  floor?: string;

  @ApiPropertyOptional({ example: 32.5 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  area?: number;

  @ApiProperty({ example: 10000 })
  @IsNumber()
  @Min(0)
  monthlyRent!: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiPropertyOptional({ type: [String], example: ["wifi", "washing_machine"] })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(50)
  @IsString({ each: true })
  amenities?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @IsString({ each: true })
  imageUrls?: string[];

  @ApiPropertyOptional({ enum: RoomStatus, default: RoomStatus.VACANT })
  @IsOptional()
  @IsEnum(RoomStatus)
  status?: RoomStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  note?: string;
}
