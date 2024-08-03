import { IsEmail, IsNotEmpty, IsOptional } from 'class-validator';

export class SignInDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsOptional()
  password: string | null;
}
