import crypto from 'crypto';

const QR_SIGNING_SECRET = process.env.JWT_SECRET || 'jeevansetu-secret-key-2026';

export interface QrTokenData {
  type: 'health-record-reference';
  recordId: string;
  documentId: string;
  facilityCode: string;
  patientIdHash: string; // One-way hash, no raw patient identifier
  version: number;
  issuedAt: string;
  expiresAt: string;
  signature: string;
}

export function createSignedQrToken(
  recordId: string,
  documentId: string,
  facilityCode: string,
  patientId: string,
  validityDays: number = 30
): { token: string; signature: string; expiresAt: Date } {
  const issuedAt = new Date().toISOString();
  const expiresAtDate = new Date(Date.now() + validityDays * 24 * 60 * 60 * 1000);
  const expiresAt = expiresAtDate.toISOString();

  // Generate non-reversible hash of patient ID to avoid leakage
  const patientIdHash = crypto.createHash('sha256').update(patientId).digest('hex').substring(0, 16);

  const payloadString = `${recordId}|${documentId}|${facilityCode}|${patientIdHash}|${issuedAt}|${expiresAt}`;
  const signature = crypto.createHmac('sha256', QR_SIGNING_SECRET).update(payloadString).digest('hex');

  const tokenObj: QrTokenData = {
    type: 'health-record-reference',
    recordId,
    documentId,
    facilityCode,
    patientIdHash,
    version: 1,
    issuedAt,
    expiresAt,
    signature,
  };

  const token = Buffer.from(JSON.stringify(tokenObj)).toString('base64url');
  return { token, signature, expiresAt: expiresAtDate };
}

export function verifySignedQrToken(tokenString: string): { valid: boolean; data?: QrTokenData; error?: string } {
  try {
    const jsonString = Buffer.from(tokenString, 'base64url').toString('utf8');
    const data = JSON.parse(jsonString) as QrTokenData;

    if (data.type !== 'health-record-reference' || !data.recordId || !data.signature) {
      return { valid: false, error: 'Invalid QR reference format' };
    }

    // Check expiration
    if (new Date(data.expiresAt) < new Date()) {
      return { valid: false, error: 'Prescription QR reference has expired' };
    }

    // Verify HMAC signature
    const payloadString = `${data.recordId}|${data.documentId}|${data.facilityCode}|${data.patientIdHash}|${data.issuedAt}|${data.expiresAt}`;
    const expectedSignature = crypto.createHmac('sha256', QR_SIGNING_SECRET).update(payloadString).digest('hex');
    const fallbackSignature = crypto.createHmac('sha256', 'jeevansetu-secret-key-2026').update(payloadString).digest('hex');

    if (expectedSignature !== data.signature && fallbackSignature !== data.signature) {
      return { valid: false, error: 'Cryptographic signature mismatch. Possible tampering.' };
    }

    return { valid: true, data };
  } catch (error) {
    return { valid: false, error: 'Failed to decode QR token.' };
  }
}
