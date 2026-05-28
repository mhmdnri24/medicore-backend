import { IsEmail, IsEnum, IsNotEmpty, IsOptional, MinLength } from 'class-validator';
import { Role } from '../../common/enums/role.enum';

export class RegisterDto {
  @IsNotEmpty()
  employeeId!: string;

  @IsNotEmpty()
  fullName!: string;

  @IsEmail()
  email!: string;

  @MinLength(8)
  password!: string;

  @IsEnum(Role)
  @IsOptional()
  role?: Role;
}
