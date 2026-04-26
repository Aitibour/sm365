import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  ForbiddenException,
  Get,
  Headers,
  Post,
  Query,
  UnauthorizedException,
} from '@nestjs/common';
import { createHmac } from 'node:crypto';
import { AppService } from './app.service';

type LoginBody = {
  email?: string;
  password?: string;
};

type RegisterBody = {
  email?: string;
  name?: string;
  password?: string;
};

type ChangePasswordBody = {
  email?: string;
  currentPassword?: string;
  newPassword?: string;
};

type ChangeRoleBody = {
  email?: string;
  role?: string;
};

type InviteBody = {
  email?: string;
  role?: string;
};

type DashboardQuery = {
  email?: string;
  name?: string;
  role?: string;
};

type LoginResponse = {
  user: {
    email: string;
    name: string;
    role: string;
  };
};

type AdminHeaders = {
  'x-sm365-actor-email'?: string;
  'x-sm365-actor-role'?: string;
  'x-sm365-actor-signature'?: string;
};

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  private getAuthSecret() {
    return process.env.AUTH_SECRET || 'sm365-dev-secret';
  }

  private getExpectedSignature(email: string, role: string) {
    return createHmac('sha256', this.getAuthSecret())
      .update(`${email}:${role}`)
      .digest('base64url');
  }

  private assertOwner(headers: AdminHeaders) {
    const actorEmail = headers['x-sm365-actor-email'];
    const actorRole = headers['x-sm365-actor-role'];
    const actorSignature = headers['x-sm365-actor-signature'];

    if (!actorEmail || !actorRole || !actorSignature) {
      throw new ForbiddenException('Owner authorization headers are required');
    }

    if (actorRole !== 'owner') {
      throw new ForbiddenException('Only owners can perform this action');
    }

    if (actorSignature !== this.getExpectedSignature(actorEmail, actorRole)) {
      throw new ForbiddenException('Invalid owner authorization signature');
    }
  }

  @Get()
  getOverview() {
    return this.appService.getOverview();
  }

  @Get('health')
  getHealth() {
    return this.appService.getHealth();
  }

  @Get('stack')
  getStack() {
    return this.appService.getStack();
  }

  @Get('dashboard')
  getDashboard(@Query() query: DashboardQuery) {
    return this.appService.getDashboard({
      email: query.email,
      name: query.name,
      role: query.role,
    });
  }

  @Get('routes')
  getRoutes() {
    return this.appService.getRoutes();
  }

  @Get('users')
  async getUsers(@Headers() headers: AdminHeaders) {
    this.assertOwner(headers);

    return {
      users: await this.appService.getUsers(),
    };
  }

  @Get('invites')
  async getInvites(@Headers() headers: AdminHeaders) {
    this.assertOwner(headers);

    return {
      invites: await this.appService.getInvites(),
    };
  }

  @Post('invites')
  async createInvite(
    @Body() body: InviteBody,
    @Headers() headers: AdminHeaders,
  ) {
    this.assertOwner(headers);

    const actorEmail = headers['x-sm365-actor-email'];

    if (!body.email || !body.role || !actorEmail) {
      throw new BadRequestException(
        'Email, role, and actor email are required',
      );
    }

    const invite = await this.appService.createInvite({
      email: body.email,
      role: body.role,
      invitedByEmail: actorEmail,
    });

    if (!invite) {
      throw new ConflictException('Unable to create invite');
    }

    return {
      invite,
    };
  }

  @Post('users/role')
  async changeUserRole(
    @Body() body: ChangeRoleBody,
    @Headers() headers: AdminHeaders,
  ): Promise<LoginResponse> {
    this.assertOwner(headers);

    if (!body.email || !body.role) {
      throw new BadRequestException('Email and role are required');
    }

    const user = await this.appService.changeUserRole({
      email: body.email,
      role: body.role,
    });

    if (!user) {
      throw new BadRequestException('Unable to update user role');
    }

    return {
      user,
    };
  }

  @Get('auth/demo-user')
  async getDemoUser() {
    const user = await this.appService.getDemoUser();

    if (!user) {
      throw new UnauthorizedException('Demo user not found');
    }

    return user;
  }

  @Get('auth/me')
  async getUser(@Query('email') email?: string) {
    const user = await this.appService.getUserByEmail(email ?? '');

    if (!user) {
      throw new UnauthorizedException('Unknown user');
    }

    return {
      user,
    };
  }

  @Post('auth/login')
  async login(@Body() body: LoginBody): Promise<LoginResponse> {
    const user = await this.appService.authenticate(
      body.email ?? '',
      body.password ?? '',
    );

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return {
      user,
    };
  }

  @Post('auth/register')
  async register(@Body() body: RegisterBody): Promise<LoginResponse> {
    if (!body.email || !body.name || !body.password) {
      throw new BadRequestException('Name, email, and password are required');
    }

    const user = await this.appService.register({
      email: body.email,
      name: body.name,
      password: body.password,
    });

    if (!user) {
      throw new ConflictException('A user with this email already exists');
    }

    return {
      user,
    };
  }

  @Post('auth/change-password')
  async changePassword(
    @Body() body: ChangePasswordBody,
  ): Promise<LoginResponse> {
    if (!body.email || !body.currentPassword || !body.newPassword) {
      throw new BadRequestException(
        'Email, current password, and new password are required',
      );
    }

    const user = await this.appService.changePassword({
      email: body.email,
      currentPassword: body.currentPassword,
      newPassword: body.newPassword,
    });

    if (!user) {
      throw new UnauthorizedException('Unable to change password');
    }

    return {
      user,
    };
  }
}
