import { Injectable } from '@nestjs/common';
import bcrypt from 'bcryptjs';
import {
  createInvite,
  createUser,
  findUserByEmail,
  listInvites,
  listUsers,
  updateUserRole,
  updateUserPassword,
} from './db.service';

type StackService = {
  name: string;
  role: string;
  license: string;
  status: 'planned' | 'ready';
};

type DashboardMetric = {
  label: string;
  value: string;
};

type AuthUser = {
  email: string;
  name: string;
  role: string;
};

type DashboardSummary = {
  heading: string;
  subheading: string;
  workspace: {
    name: string;
    plan: string;
    status: string;
  };
  integrations: Array<{
    name: string;
    status: string;
    note: string;
  }>;
  metrics: DashboardMetric[];
  milestones: string[];
};

@Injectable()
export class AppService {
  getOverview() {
    return {
      name: 'SM 365 API',
      project: 'SM 365',
      description:
        'Integration API for orchestrating the SM 365 web app, social engine, CRM, funnel, and inbox.',
      version: '0.1.0',
    };
  }

  getHealth() {
    return {
      status: 'ok',
      service: 'api',
      timestamp: new Date().toISOString(),
      project: 'SM 365',
    };
  }

  getStack(): { services: StackService[] } {
    return {
      services: [
        {
          name: 'Postiz',
          role: 'Social scheduling and publishing',
          license: 'AGPL-3.0',
          status: 'planned',
        },
        {
          name: 'Mautic',
          role: 'Funnels, forms, and lifecycle campaigns',
          license: 'GPL-3.0',
          status: 'planned',
        },
        {
          name: 'Twenty',
          role: 'CRM and pipeline management',
          license: 'MIT',
          status: 'planned',
        },
        {
          name: 'Chatwoot',
          role: 'Shared inbox and customer conversations',
          license: 'MIT',
          status: 'planned',
        },
      ],
    };
  }

  getDashboard(user?: Partial<AuthUser>): DashboardSummary {
    const displayName = user?.name || 'SM 365 Admin';
    const workspaceName = `${displayName.split(' ')[0]}'s Workspace`;
    const metrics: DashboardMetric[] = [
      { label: 'Connected engines', value: '4' },
      { label: 'Workspace plan', value: 'Growth' },
      { label: 'API status', value: 'Ready' },
      { label: 'Session role', value: user?.role || 'owner' },
    ];

    return {
      heading: `Welcome back, ${displayName}.`,
      subheading:
        'Your dashboard is now driven by the signed-in session and the integration API, so it can evolve into real workspace data next.',
      workspace: {
        name: workspaceName,
        plan: 'Growth',
        status: 'Active',
      },
      integrations: [
        {
          name: 'Postiz',
          status: 'Planned',
          note: 'Will power scheduling, queues, and content publishing.',
        },
        {
          name: 'Mautic',
          status: 'Planned',
          note: 'Will run lead capture, landing pages, and lifecycle campaigns.',
        },
        {
          name: 'Twenty',
          status: 'Planned',
          note: 'Will track contacts, companies, and pipeline movement.',
        },
        {
          name: 'Chatwoot',
          status: 'Planned',
          note: 'Will unify support and pre-sales conversations.',
        },
      ],
      metrics,
      milestones: [
        'Replace the demo user with database-backed accounts',
        'Add billing and subscription webhooks',
        'Sync lead and customer records across services',
        'Provision workspaces and service access automatically',
      ],
    };
  }

  getRoutes() {
    return {
      routes: [
        { path: '/', method: 'GET', description: 'API overview' },
        { path: '/health', method: 'GET', description: 'Health check' },
        {
          path: '/stack',
          method: 'GET',
          description: 'Free-stack service map',
        },
        {
          path: '/dashboard',
          method: 'GET',
          description: 'Dashboard summary payload with optional user context',
        },
        { path: '/routes', method: 'GET', description: 'Available routes' },
        {
          path: '/auth/login',
          method: 'POST',
          description: 'Validate login credentials',
        },
        {
          path: '/auth/register',
          method: 'POST',
          description: 'Register a new user account',
        },
        {
          path: '/auth/change-password',
          method: 'POST',
          description: 'Change a user password',
        },
        {
          path: '/auth/demo-user',
          method: 'GET',
          description: 'Demo sign-in credentials',
        },
        {
          path: '/auth/me',
          method: 'GET',
          description: 'Demo user profile by email',
        },
        {
          path: '/users',
          method: 'GET',
          description: 'List registered users',
        },
        {
          path: '/users/role',
          method: 'POST',
          description: 'Update a user role',
        },
        {
          path: '/invites',
          method: 'GET',
          description: 'List pending invites',
        },
        {
          path: '/invites',
          method: 'POST',
          description: 'Create a new invite',
        },
      ],
    };
  }

  async authenticate(
    email: string,
    password: string,
  ): Promise<AuthUser | null> {
    const user = await findUserByEmail(email);

    if (!user) {
      return null;
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);

    if (!isValidPassword) {
      return null;
    }

    return {
      email: user.email,
      name: user.name,
      role: user.role,
    };
  }

  async getDemoUser() {
    const user = await findUserByEmail('admin@sm365.local');

    if (!user) {
      return null;
    }

    return {
      email: user.email,
      password: 'sm365-demo',
      name: user.name,
      role: user.role,
    };
  }

  async getUserByEmail(email: string): Promise<AuthUser | null> {
    const user = await findUserByEmail(email);

    if (!user) {
      return null;
    }

    return {
      email: user.email,
      name: user.name,
      role: user.role,
    };
  }

  async register(input: {
    email: string;
    name: string;
    password: string;
  }): Promise<AuthUser | null> {
    const user = await createUser({
      email: input.email,
      name: input.name,
      password: input.password,
      role: 'member',
    });

    if (!user) {
      return null;
    }

    return {
      email: user.email,
      name: user.name,
      role: user.role,
    };
  }

  async changePassword(input: {
    email: string;
    currentPassword: string;
    newPassword: string;
  }): Promise<AuthUser | null> {
    const user = await findUserByEmail(input.email);

    if (!user) {
      return null;
    }

    const isValidPassword = await bcrypt.compare(
      input.currentPassword,
      user.passwordHash,
    );

    if (!isValidPassword) {
      return null;
    }

    const updatedUser = await updateUserPassword({
      email: input.email,
      password: input.newPassword,
    });

    if (!updatedUser) {
      return null;
    }

    return {
      email: updatedUser.email,
      name: updatedUser.name,
      role: updatedUser.role,
    };
  }

  async getUsers() {
    return listUsers();
  }

  async changeUserRole(input: {
    email: string;
    role: string;
  }): Promise<AuthUser | null> {
    const allowedRoles = new Set(['owner', 'member']);

    if (!allowedRoles.has(input.role)) {
      return null;
    }

    const user = await updateUserRole(input);

    if (!user) {
      return null;
    }

    return {
      email: user.email,
      name: user.name,
      role: user.role,
    };
  }

  async createInvite(input: {
    email: string;
    role: string;
    invitedByEmail: string;
  }) {
    const allowedRoles = new Set(['owner', 'member']);

    if (!allowedRoles.has(input.role)) {
      return null;
    }

    return createInvite(input);
  }

  async getInvites() {
    return listInvites();
  }
}
