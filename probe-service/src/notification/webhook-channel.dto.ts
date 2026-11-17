import { IsObject, IsOptional, IsString, IsUrl, MaxLength } from 'class-validator';

export class CreateWebhookChannelReq {
  @IsString() @MaxLength(100) name!: string;
  @IsUrl({ require_tld: false }) url!: string;
  @IsOptional() @IsObject() headers?: Record<string, string>;
  @IsOptional() @IsString() secret?: string;
}

