import { IsString, IsArray, IsNumber, IsOptional, Min, Max } from 'class-validator';

export class Question {
  @IsString()
  id: string;

  @IsString()
  text: string;

  @IsArray()
  @IsString({ each: true })
  options: string[];

  @IsNumber()
  @Min(0)
  correctOption: number;

  @IsOptional()
  @IsString()
  explanation?: string;
}
