import { IsBoolean, IsEnum, IsObject, IsOptional, IsString, IsUrl, MaxLength, Min } from 'class-validator';
import { EnvironmentType } from './environment.model';

export class CreatePlatformReq {
  @IsString() @MaxLength(100) name!: string;
  @IsString() @MaxLength(100) code!: string;
  @IsOptional() @IsString() description?: string;
}

export class CreateEnvironmentReq {
  @IsString() @MaxLength(100) name!: string;
  @IsEnum(EnvironmentType) type!: EnvironmentType;
  @IsUrl({ require_tld: false }) baseUrl!: string;
  @IsObject() variables: Record<string, string> = {};
  @IsObject() secrets: Record<string, string> = {};
  @IsOptional() @IsBoolean() tlsVerify?: boolean;
  @IsOptional() @Min(100) timeoutMs?: number;
}

