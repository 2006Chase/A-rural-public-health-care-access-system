import { describe, it, expect } from 'vitest';
import { performSafetyTriage } from '@/lib/ai-triage';

describe('Deterministic AI Clinical Triage Safety Engine', () => {
  it('should immediately escalate acute chest pain to EMERGENCY with red-flag reason', () => {
    const result = performSafetyTriage('Severe crushing chest pain radiating to left arm and cold sweats');
    expect(result.urgency).toBe('emergency');
    expect(result.escalationRequired).toBe(true);
    expect(result.requiresHumanReview).toBe(true);
    expect(result.recommendedDepartment).toContain('Emergency');
    expect(result.userFacingAdvice).toContain('108');
  });

  it('should escalate Hindi emergency red-flags to EMERGENCY', () => {
    const result = performSafetyTriage('मरीज को बहुत तेज छाती में दर्द हो रहा है');
    expect(result.urgency).toBe('emergency');
    expect(result.escalationRequired).toBe(true);
  });

  it('should escalate Marathi emergency red-flags to EMERGENCY', () => {
    const result = performSafetyTriage('छातीत दुखणे आणि श्वास घेण्यास त्रास होत आहे');
    expect(result.urgency).toBe('emergency');
    expect(result.escalationRequired).toBe(true);
  });

  it('should route severe knee pain with travel barrier to Orthopedics Teleconsult (Hero Case)', () => {
    const result = performSafetyTriage('Severe bilateral knee pain, difficulty walking and traveling long distance');
    expect(result.urgency).toBe('urgent');
    expect(result.recommendedDepartment).toBe('Orthopedics');
    expect(result.recommendedServiceType).toBe('TELECONSULT');
    expect(result.escalationRequired).toBe(false);
    expect(result.facilityRequirements).toContain('Teleconsultation Facility');
  });

  it('should route maternal/pregnancy queries to Gynecology & Obstetrics', () => {
    const result = performSafetyTriage('Pregnant woman in 3rd trimester needing routine antenatal checkup');
    expect(result.urgency).toBe('urgent');
    expect(result.recommendedDepartment).toBe('Gynecology & Obstetrics');
    expect(result.recommendedServiceType).toBe('IN_PERSON_PHC');
  });

  it('should route pediatric symptoms to Pediatrics', () => {
    const result = performSafetyTriage('My 2 year old infant child has persistent high fever');
    expect(result.recommendedDepartment).toBe('Pediatrics');
    expect(result.requiresHumanReview).toBe(true);
  });

  it('should classify mild common cold as ROUTINE outpatient care', () => {
    const result = performSafetyTriage('Mild cold, running nose and slight headache for 2 days');
    expect(result.urgency).toBe('routine');
    expect(result.escalationRequired).toBe(false);
    expect(result.requiresHumanReview).toBe(false);
  });

  it('should enforce human-in-the-loop and never claim definitive diagnosis', () => {
    const result = performSafetyTriage('I have a strange burning sensation on my skin');
    expect(result.requiresHumanReview).toBe(true);
    expect(result.userFacingAdvice).toContain('healthcare worker');
  });
});
