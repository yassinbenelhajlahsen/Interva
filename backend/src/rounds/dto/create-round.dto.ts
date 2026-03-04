import { IsDateString, IsOptional, IsString, MinLength } from "class-validator";

export class CreateRoundDto {
  @IsString()
  @MinLength(1)
  roundType: string;

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
