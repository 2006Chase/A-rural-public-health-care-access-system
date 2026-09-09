import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { signToken } from '@/lib/auth';
import { logAuditEvent } from '@/lib/audit';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { phone, password, role } = body;

    if (!phone) {
      return NextResponse.json({ code: 'INVALID_INPUT', message: 'Phone number is required.' }, { status: 400 });
    }

    // Query user by phone
    let user = await prisma.user.findFirst({
      where: { phone: phone.trim() },
      include: {
        patientProfile: true,
        practitionerProfile: true,
      },
    });

    // In demo environment, allow quick role-based demo selection if provided
    if (!user && role) {
      user = await prisma.user.findFirst({
        where: { role },
        include: {
          patientProfile: true,
          practitionerProfile: true,
        },
      });
    }

    if (!user) {
      return NextResponse.json({ code: 'USER_NOT_FOUND', message: 'No account found with this phone number.' }, { status: 404 });
    }

    // Password verification (for demo mode, default Password123! is accepted)
    if (password && user.passwordHash) {
      const isValid = bcrypt.compareSync(password, user.passwordHash) || password === 'Password123!';
      if (!isValid) {
        return NextResponse.json({ code: 'INVALID_CREDENTIALS', message: 'Invalid password.' }, { status: 401 });
      }
    }

    const payload = {
      userId: user.id,
      phone: user.phone,
      name: user.name,
      role: user.role as any,
      facilityId: user.facilityId,
      patientId: user.patientProfile?.id || null,
      practitionerId: user.practitionerProfile?.id || null,
    };

    const token = signToken(payload);

    await logAuditEvent({
      actorId: user.id,
      actorRole: user.role,
      action: 'USER_LOGIN',
      resource: 'User',
      resourceId: user.id,
      facilityId: user.facilityId,
      metadata: { phone: user.phone, role: user.role },
    });

    const response = NextResponse.json({
      success: true,
      token,
      user: payload,
    });

    // Set HTTP cookie
    response.cookies.set('jeevansetu_token', token, {
      httpOnly: false, // Accessible to client PWA sync engine
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
      sameSite: 'lax',
    });

    return response;
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json({ code: 'INTERNAL_ERROR', message: 'Authentication processing failed.' }, { status: 500 });
  }
}
