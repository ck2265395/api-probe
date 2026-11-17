import { IsNotEmpty, IsString } from 'class-validator';

export class LoginReq {
  @IsString()
  @IsNotEmpty()
  username!: string;

  @IsString()
  @IsNotEmpty()
  password!: string;
}

export interface CreateAdminReq {
  username: string;
  password: string;
}

