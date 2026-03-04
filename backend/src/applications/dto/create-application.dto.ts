import { IsEnum, IsOptional, IsString, MinLength } from "class-validator";
import { ApplicationStatus } from "@prisma/client";

export class CreateApplicationDto {
  @IsString()
  @MinLength(1)
  company: string;

  @IsString()
  @MinLength(1)
  role: string;

  @IsOptional()
  @IsEnum(ApplicationStatus)
  status?: ApplicationStatus;

  @IsOptional()
  @IsString()
  jobDescription?: string;
}
