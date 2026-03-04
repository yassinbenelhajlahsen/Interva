import { IsDateString, IsOptional, IsString, MinLength } from "class-validator";

export class UpdateRoundDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  roundType?: string;

  @IsOptional()
  @IsDateString()
  date?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  outcome?: string;
}
