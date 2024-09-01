import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schemas/user.schema';

import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { Model } from 'mongoose';
import { SignUpDto } from './schemas/dto/signUp.dto';
import { LoginDto } from './schemas/dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<User>,
    private jwtService: JwtService
  ) {}

  async signUp(signUpDto: SignUpDto): Promise<{ token: string }> {
    const { name, email, password } = signUpDto;

    const hasHedPassword = await bcrypt.hash(password, 10);

    const user = await this.userModel.create({
      name,
      email,
      password: hasHedPassword,
    });

    const token = this.jwtService.sign({ id: user._id });

    return { token };
  }

  async login(loginDto: LoginDto): Promise<{ token: string }> {
    const { email, password } = loginDto;

    const user = await this.userModel.findOne({ email });

    if (!user) {
      throw new UnauthorizedException('Invalid Email or Password');
    }

    const isMatchPassword = await bcrypt.compare(password, user.password);

    if (!isMatchPassword) {
      throw new UnauthorizedException('Invalid Email or Password');
    }

    const token = this.jwtService.sign({ id: user._id });

    return { token };
  }
}
