import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const auth = await requireAuth(req);
  if ('errorResponse' in auth) return auth.errorResponse;

  try {
    const body = await req.json();
    const { imageBase64, filename } = body;

    // Realistic OCR extraction simulation for demo paper prescription (Section 28 & 68)
    // Returns confidence scores per field to enforce human verification
    const simulatedOcrResult = {
      doctorName: { value: 'Dr. S. K. Joshi, MD', confidence: 0.94 },
      facilityName: { value: 'Shirur Primary Health Centre', confidence: 0.91 },
      date: { value: '08-Sep-2026', confidence: 0.88 },
      patientName: { value: 'Anand Patil', confidence: 0.85 },
      diagnosis: { value: 'Bilateral Knee Osteoarthritis / Joint Pain', confidence: 0.82 },
      medicines: [
        {
          name: { value: 'Paracetamol', confidence: 0.96 },
          dosage: { value: '500 mg', confidence: 0.92 },
          frequency: { value: 'Twice daily (BD)', confidence: 0.89 },
          duration: { value: '10 days', confidence: 0.86 },
          instructions: { value: 'After meals with water', confidence: 0.91 },
        },
        {
          name: { value: 'Ibuprofen', confidence: 0.89 },
          dosage: { value: '400 mg', confidence: 0.84 },
          frequency: { value: 'SOS (as needed)', confidence: 0.78 }, // Flagged lower confidence for verification
          duration: { value: '5 days', confidence: 0.81 },
          instructions: { value: 'Take only if severe pain occurs', confidence: 0.88 },
        },
        {
          name: { value: 'Calcium + Vit D3', confidence: 0.93 },
          dosage: { value: '500mg', confidence: 0.90 },
          frequency: { value: 'Once daily (OD)', confidence: 0.94 },
          duration: { value: '30 days', confidence: 0.91 },
          instructions: { value: 'After lunch', confidence: 0.95 },
        },
      ],
      overallConfidence: 0.88,
      requiresHumanVerification: true,
      humanVerificationNotice:
        'Please verify all medicine names, dosages, and instructions against the original paper prescription before saving to the medical record.',
    };

    return NextResponse.json({
      success: true,
      ocr: simulatedOcrResult,
    });
  } catch (error: any) {
    console.error('OCR processing error:', error);
    return NextResponse.json({ code: 'OCR_FAILED', message: 'Document OCR processing failed.' }, { status: 500 });
  }
}
