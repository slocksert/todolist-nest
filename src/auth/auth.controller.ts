import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  UnauthorizedException,
  BadRequestException,
  Res,
  NotFoundException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { JwtService } from '@nestjs/jwt';
import { Response, Request } from 'express';
import { randomUUID } from 'crypto';
import * as bcrypt from 'bcrypt';

@Controller('api')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private jwtService: JwtService,
  ) {}

  @Post('register')
  async register(@Body() createAuthDto: CreateAuthDto) {
    const user = await this.authService.findOne({
      where: { email: createAuthDto.email },
    });

    if (user) {
      throw new BadRequestException('Email already exists');
    }

    if (createAuthDto.password.length < 5) {
      throw new BadRequestException('Password must have at least 5 characters');
    }

    try {
      const hashedPassword = await bcrypt.hash(createAuthDto.password, 12);
      const user = await this.authService.create({
        uuid: randomUUID(),
        ...createAuthDto,
        password: hashedPassword,
      });
      delete user.password;
      delete user.id;

      return {
        message: 'User created successfully!',
      };
    } catch (error) {
      throw new BadRequestException('Failed to register user');
    }
  }

  @Post('login')
  async login(
    @Body() createAuthDto: CreateAuthDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    try {
      const user = await this.authService.findOne({
        where: { email: createAuthDto.email },
      });

      if (!user) {
        throw new BadRequestException('Invalid credentials');
      }

      const passwordValid = await bcrypt.compare(
        createAuthDto.password,
        user.password,
      );

      if (!passwordValid) {
        throw new BadRequestException('Invalid credentials');
      }

      const jwt = await this.jwtService.signAsync({ id: user.uuid });
      response.cookie('jwt', jwt);

      return {
        message: jwt,
      };
    } catch (error) {
      throw new BadRequestException('Invalid credentials');
    }
  }

  @Get('user')
  async user(@Req() request: Request) {
    try {
      const cookie = request.cookies['jwt'];
      const data = await this.jwtService.verifyAsync(cookie);
      const user = await this.authService.findOne({
        where: { uuid: data['id'] },
      });
      delete user.password;

      return user;
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  @Get('check')
  async check(@Req() request: Request) {
    try {
      const cookie = request.cookies['jwt'];
      const data = await this.jwtService.verifyAsync(cookie);
      await this.authService.findOne({
        where: { uuid: data['id'] },
      });
      return {
        message: 'ok',
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  @Post('logout')
  async logout(@Res({ passthrough: true }) response: Response) {
    response.clearCookie('jwt', {
      path: '/',
      domain: 'localhost',
      httpOnly: true,
    });
    return {
      message: 'Logged out successfully',
    };
  }

  @Patch('update')
  async update(@Body() updateAuthDto: UpdateAuthDto, @Req() request: Request) {
    const user = await this.user(request);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (updateAuthDto.password && updateAuthDto.password.length < 5) {
      throw new BadRequestException('Password must be at least 5 characters');
    }

    if (
      updateAuthDto.password &&
      (await bcrypt.compare(updateAuthDto.password, user.password))
    ) {
      throw new BadRequestException('Password cannot be the same');
    }

    if (updateAuthDto.email && updateAuthDto.email === user.email) {
      throw new BadRequestException('Email cannot be the same');
    }

    if (updateAuthDto.name && updateAuthDto.name === user.name) {
      throw new BadRequestException('Name cannot be the same');
    }

    const updateData = { ...updateAuthDto };

    if (updateAuthDto.password) {
      updateData.password = await bcrypt.hash(updateAuthDto.password, 12);
    }

    await this.authService.update(user.id, updateData);

    return {
      message: 'User updated successfully',
    };
  }

  @Get()
  findAll() {
    return this.authService.findAll();
  }

  @Get('user/:id')
  async findOne(@Param('id') id: string) {
    try {
      const user = await this.authService.findOne({
        where: { id: +id },
      });
      delete user.password;
      delete user.id;

      return user;
    } catch (error) {
      throw new NotFoundException('User not found');
    }
  }

  @Delete('delete/:id')
  remove(@Param('id') id: string) {
    this.authService.remove(+id);
    return {
      message: 'User deleted successfully',
    };
  }
}
