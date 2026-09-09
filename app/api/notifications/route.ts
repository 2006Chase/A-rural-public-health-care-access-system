import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req);
  if ('errorResponse' in auth) return auth.errorResponse;

  const notifications = [
    {
      id: 'NOTIF-1',
      title: 'Appointment Reminder',
      message: 'Your teleconsultation with Dr. Rajesh Deshmukh is confirmed for today at 11:30 AM.',
      type: 'APPOINTMENT',
      timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      read: false,
    },
    {
      id: 'NOTIF-2',
      title: 'Digital Queue Update',
      message: 'Your current queue token is ORTHO-014. Estimated wait time is approx 10 minutes.',
      type: 'QUEUE',
      timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      read: false,
    },
    {
      id: 'NOTIF-3',
      title: 'Diagnostic Test Available',
      message: 'Your Bilateral Knee Digital X-Ray report is available and has been reviewed by your doctor.',
      type: 'DIAGNOSTIC',
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      read: true,
    },
    {
      id: 'NOTIF-4',
      title: 'Referral Scheduled',
      message: 'Referral to District Referral Hospital for Orthopedic Surgery evaluation is scheduled for Sep 22.',
      type: 'REFERRAL',
      timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      read: true,
    },
    {
      id: 'NOTIF-5',
      title: 'Consultation Preparation',
      message: 'For your next consultation, please keep your previous prescription and MCP card handy.',
      type: 'SYSTEM',
      timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      read: true,
    },
  ];

  return NextResponse.json({ success: true, count: notifications.length, data: notifications });
}
