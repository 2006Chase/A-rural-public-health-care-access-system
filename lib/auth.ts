import jwt from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from './prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'jeevansetu-secure-dev-jwt-secret-key-change-in-prod-2026';

export interface TokenPayload {
  userId: string;
  phone: string;
  name: string;
  role: 'PATIENT' | 'HEALTH_WORKER' | 'DOCTOR' | 'FACILITY_ADMIN' | 'SYSTEM_ADMIN';
  facilityId?: string | null;
  patientId?: string | null;
  practitionerId?: string | null;
}

export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch (error) {
    return null;
  }
}

export function extractAuthToken(req: NextRequest): string | null {
  const authHeader = req.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  const cookie = req.cookies.get('jeevansetu_token');
  if (cookie) {
    return cookie.value;
  }
  return null;
}

export async function getSessionUser(req: NextRequest): Promise<TokenPayload | null> {
  const token = extractAuthToken(req);
  if (!token) return null;
  const decoded = verifyToken(token);
  return decoded;
}

export async function requireAuth(req: NextRequest): Promise<{ user: TokenPayload } | { errorResponse: NextResponse }> {
  const user = await getSessionUser(req);
  if (!user) {
    return {
      errorResponse: NextResponse.json(
        { code: 'UNAUTHORIZED', message: 'Authentication is required to access this resource.' },
        { status: 401 }
      ),
    };
  }
  return { user };
}

export async function requireRoles(
  req: NextRequest,
  allowedRoles: Array<TokenPayload['role']>
): Promise<{ user: TokenPayload } | { errorResponse: NextResponse }> {
  const auth = await requireAuth(req);
  if ('errorResponse' in auth) {
    return auth;
  }
  if (!allowedRoles.includes(auth.user.role)) {
    return {
      errorResponse: NextResponse.json(
        {
          code: 'FORBIDDEN',
          message: `Access denied. Role '${auth.user.role}' is not authorized for this action.`,
        },
        { status: 403 }
      ),
    };
  }
  return { user: auth.user };
}
