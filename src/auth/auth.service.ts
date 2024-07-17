import { Injectable } from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Auth } from './entities/auth.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Auth) private readonly authRepository: Repository<Auth>,
  ) {}

  create(createAuthDto: CreateAuthDto) {
    return this.authRepository.save(createAuthDto);
  }

  findAll() {
    return this.authRepository.find({
      select: ['uuid', 'email', 'name'],
    });
  }

  findOne(condition: any) {
    return this.authRepository.findOne(condition);
  }

  async update(id: number, updateAuthDto: UpdateAuthDto) {
    return this.authRepository.update(id, updateAuthDto);
  }

  remove(id: number) {
    return this.authRepository.delete(id);
  }
}
