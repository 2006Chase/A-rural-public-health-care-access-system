import { AITriageResult } from '@/packages/types';

// Emergency Red-Flag Keywords based on Emergency Medicine Protocols
const EMERGENCY_RED_FLAGS = [
  'chest pain',
  'heart attack',
  'difficulty breathing',
  'cannot breathe',
  'severe burn',
  'unconscious',
  'fainted',
  'seizure',
  'convulsions',
  'coughing blood',
  'paralysis',
  'slurred speech',
  'uncontrolled bleeding',
  'head injury',
  'poison',
  'snake bite',
  'छातीत दुखणे',
  'श्वास घेण्यास त्रास',
  'बेहोश',
  'छाती में दर्द',
  'सांस लेने में तकलीफ',
  'सांप का काटना',
];

export function performSafetyTriage(symptomsText: string): AITriageResult {
  const query = symptomsText.toLowerCase().trim();

  // 1. Check for Emergency Red-Flags (Section 21, 67)
  const matchedEmergency = EMERGENCY_RED_FLAGS.find((flag) => query.includes(flag));
  if (matchedEmergency) {
    return {
      urgency: 'emergency',
      urgencyReason: `Critical red-flag symptom detected: "${matchedEmergency}". High risk of acute life-threatening condition.`,
      recommendedDepartment: 'Emergency Medicine / Trauma & Intensive Care',
      recommendedServiceType: 'EMERGENCY_CARE',
      requiresHumanReview: true,
      confidence: 0.98,
      escalationRequired: true,
      userFacingAdvice:
        'These symptoms may indicate a medical emergency. Please contact emergency ambulance 108 immediately or proceed directly to the nearest 24x7 emergency hospital.',
      facilityRequirements: ['24x7 Emergency', 'Oxygen & ICU', 'Blood Bank'],
    };
  }

  // 2. Orthopedics / Joint Pain / Travel barrier (Hero Journey: Section 66)
  if (
    query.includes('knee') ||
    query.includes('joint') ||
    query.includes('bone') ||
    query.includes('walking') ||
    query.includes('travel') ||
    query.includes('fracture') ||
    query.includes('गुडघा') ||
    query.includes('सांधेदुखी') ||
    query.includes('घुटने') ||
    query.includes('जोड़ों का दर्द')
  ) {
    return {
      urgency: 'urgent',
      urgencyReason:
        'Severe musculoskeletal distress identified with reported difficulty in traveling long distance. Teleconsultation recommended to prevent travel burden.',
      recommendedDepartment: 'Orthopedics',
      recommendedServiceType: 'TELECONSULT',
      requiresHumanReview: true,
      confidence: 0.92,
      escalationRequired: false,
      userFacingAdvice:
        'I found public facilities that can help because they have an Orthopedics department. Since traveling is difficult, an assisted teleconsultation can connect you with an Orthopedic specialist today.',
      facilityRequirements: ['Orthopedics Department', 'Teleconsultation Facility', 'Digital X-Ray'],
    };
  }

  // 3. Maternal / Antenatal Care
  if (
    query.includes('pregnant') ||
    query.includes('delivery') ||
    query.includes('antenatal') ||
    query.includes('baby kicking') ||
    query.includes('गर्भवती') ||
    query.includes('गरोदर')
  ) {
    return {
      urgency: 'urgent',
      urgencyReason: 'Antenatal care assessment required to safeguard maternal and neonatal health.',
      recommendedDepartment: 'Gynecology & Obstetrics',
      recommendedServiceType: 'IN_PERSON_PHC',
      requiresHumanReview: true,
      confidence: 0.89,
      escalationRequired: false,
      userFacingAdvice:
        'Please visit your nearest Primary Health Centre (PHC) or Sub-centre for complete antenatal screening, maternal vital signs, and ultrasound referral.',
      facilityRequirements: ['Maternal & Child Health', 'Delivery Room', 'Ultrasound Lab'],
    };
  }

  // 4. Pediatric Care
  if (
    query.includes('child') ||
    query.includes('baby') ||
    query.includes('infant') ||
    query.includes('toddler') ||
    query.includes('मूल') ||
    query.includes('बाळ') ||
    query.includes('बच्चा')
  ) {
    return {
      urgency: 'urgent',
      urgencyReason: 'Pediatric age group requires prioritized in-person clinical examination.',
      recommendedDepartment: 'Pediatrics',
      recommendedServiceType: 'IN_PERSON_PHC',
      requiresHumanReview: true,
      confidence: 0.86,
      escalationRequired: false,
      userFacingAdvice:
        'Children under 5 should be evaluated by a medical officer at your local PHC or Rural Hospital to monitor hydration, temperature, and respiration.',
      facilityRequirements: ['Pediatrics OPD', 'Oral Rehydration Point'],
    };
  }

  // 5. Chronic Disease (Hypertension, Diabetes)
  if (
    query.includes('bp') ||
    query.includes('blood pressure') ||
    query.includes('sugar') ||
    query.includes('diabetes') ||
    query.includes('रक्तदाब') ||
    query.includes('मधुमेह')
  ) {
    return {
      urgency: 'routine',
      urgencyReason: 'Routine Non-Communicable Disease (NCD) monitoring and prescription renewal.',
      recommendedDepartment: 'General Medicine',
      recommendedServiceType: 'IN_PERSON_PHC',
      requiresHumanReview: false,
      confidence: 0.88,
      escalationRequired: false,
      userFacingAdvice:
        'Your local Health and Wellness Centre or PHC provides free monthly blood pressure/glucose screening and essential medications under the national NCD scheme.',
      facilityRequirements: ['NCD Clinic', 'Essential Medicine Dispensing'],
    };
  }

  // 6. Common Acute / General Outpatient
  if (
    query.includes('fever') ||
    query.includes('cold') ||
    query.includes('cough') ||
    query.includes('headache') ||
    query.includes('stomach') ||
    query.includes('ताप') ||
    query.includes('खोकला') ||
    query.includes('बुखार')
  ) {
    return {
      urgency: 'routine',
      urgencyReason: 'Common acute outpatient symptoms suitable for primary care evaluation.',
      recommendedDepartment: 'General Medicine',
      recommendedServiceType: 'IN_PERSON_PHC',
      requiresHumanReview: false,
      confidence: 0.84,
      escalationRequired: false,
      userFacingAdvice:
        'Your nearest Sub-centre or Primary Health Centre (PHC) can conduct basic examination and provide essential symptomatic care.',
      facilityRequirements: ['General OPD', 'Basic Diagnostics'],
    };
  }

  // 7. Uncertainty Handling (Section 23)
  return {
    urgency: 'routine',
    urgencyReason: 'Low confidence in symptom interpretation or non-specific symptoms.',
    recommendedDepartment: 'General Medicine',
    recommendedServiceType: 'IN_PERSON_PHC',
    requiresHumanReview: true,
    confidence: 0.45,
    escalationRequired: false,
    userFacingAdvice:
      "I'm not confident I fully understood your symptoms. A local healthcare worker (ASHA/ANM) can examine you in person and assist with guidance.",
    facilityRequirements: ['General Outpatient Clinic'],
  };
}
