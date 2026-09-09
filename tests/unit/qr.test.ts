import { describe, it, expect } from 'vitest';
import { createSignedQrToken, verifySignedQrToken } from '@/lib/qr';

describe('Privacy-Safe Cryptographic QR Token Engine', () => {
  const sampleRecordId = 'RX-2026-0818-099';
  const sampleDocId = 'DOC-RX-0818';
  const sampleFacilityCode = 'FAC-GOV-RH-011';
  const samplePatientId = 'pat-hero-anand-patil-12345';

  it('should generate a valid HMAC-SHA256 signed QR reference token', () => {
    const { token, signature, expiresAt } = createSignedQrToken(
      sampleRecordId,
      sampleDocId,
      sampleFacilityCode,
      samplePatientId,
      30
    );

    expect(token).toBeDefined();
    expect(signature).toHaveLength(64); // SHA256 hex length
    expect(expiresAt.getTime()).toBeGreaterThan(Date.now());

    const verification = verifySignedQrToken(token);
    expect(verification.valid).toBe(true);
    expect(verification.data?.recordId).toBe(sampleRecordId);
    expect(verification.data?.facilityCode).toBe(sampleFacilityCode);
  });

  it('should never leak raw patient ID, names, or clinical details in the token', () => {
    const { token } = createSignedQrToken(
      sampleRecordId,
      sampleDocId,
      sampleFacilityCode,
      samplePatientId
    );

    const decodedString = Buffer.from(token, 'base64url').toString('utf8');
    // Ensure raw patient ID is NOT in the token
    expect(decodedString).not.toContain(samplePatientId);
    // Ensure no plaintext medical keywords exist in the token
    expect(decodedString).not.toContain('Osteoarthritis');
    expect(decodedString).not.toContain('Paracetamol');
    expect(decodedString).not.toContain('Anand Patil');
  });

  it('should reject tampered tokens with altered record ID', () => {
    const { token } = createSignedQrToken(
      sampleRecordId,
      sampleDocId,
      sampleFacilityCode,
      samplePatientId
    );

    // Tamper with the token data
    const decoded = JSON.parse(Buffer.from(token, 'base64url').toString('utf8'));
    decoded.recordId = 'RX-TAMPERED-999';
    const tamperedToken = Buffer.from(JSON.stringify(decoded)).toString('base64url');

    const result = verifySignedQrToken(tamperedToken);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('mismatch');
  });

  it('should reject expired tokens', () => {
    // Generate token with negative validity days (expired)
    const { token } = createSignedQrToken(
      sampleRecordId,
      sampleDocId,
      sampleFacilityCode,
      samplePatientId,
      -1 // expired yesterday
    );

    const result = verifySignedQrToken(token);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('expired');
  });
});
