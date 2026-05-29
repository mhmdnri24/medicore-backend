import {
  IsArray,
  IsBoolean,
  IsEmail,
  IsInt,
  IsOptional,
  MinLength,
} from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  employeeId?: string;

  @IsOptional()
  fullName?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @MinLength(8)
  @IsOptional()
  password?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsArray()
  @IsInt({ each: true })
  @IsOptional()
  roleIds?: number[];
}
