import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CryptoService } from '../common/crypto.service';
import { CreateEnvironmentReq, CreatePlatformReq } from './platform.dto';
import { EnvironmentModel } from './environment.model';
import { PlatformModel } from './platform.model';

@Injectable()
export class PlatformService {
  constructor(
    @InjectRepository(PlatformModel) private readonly platforms: Repository<PlatformModel>,
    @InjectRepository(EnvironmentModel) private readonly environments: Repository<EnvironmentModel>,
    private readonly crypto: CryptoService,
  ) {}

  createPlatform(input: CreatePlatformReq): Promise<PlatformModel> {
    return this.platforms.save(this.platforms.create(input));
  }

  listPlatforms(): Promise<PlatformModel[]> {
    return this.platforms.find({ order: { name: 'ASC' } });
  }

  async createEnvironment(platformId: string, input: CreateEnvironmentReq) {
    const encryptedSecrets = Object.fromEntries(
      Object.entries(input.secrets).map(([key, value]) => [key, this.crypto.encrypt(value)]),
    );
    const saved = await this.environments.save(this.environments.create({
      platformId,
      name: input.name,
      type: input.type,
      baseUrl: input.baseUrl.replace(/\/$/, ''),
      variables: input.variables,
      encryptedSecrets,
      tlsVerify: input.tlsVerify ?? true,
      timeoutMs: input.timeoutMs ?? 10000,
    }));
    return {
      id: saved.id,
      platformId: saved.platformId,
      name: saved.name,
      type: saved.type,
      baseUrl: saved.baseUrl,
      variables: saved.variables,
      configuredSecrets: Object.keys(saved.encryptedSecrets).sort(),
    };
  }
}

