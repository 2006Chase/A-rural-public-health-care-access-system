// Comprehensive Seed Script for JeevanSetu — Maharashtra Demo District
// Populates 20 facilities, 50 practitioners, 150 patients, demo accounts,
// medicines inventory, government schemes, encounters, prescriptions, queues, and referrals.

import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const DEMO_PASSWORD_HASH = bcrypt.hashSync('Password123!', 8);

function generateSignedQr(recordId, documentId, facilityCode, patientId) {
  const issuedAt = new Date().toISOString();
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
  const patientIdHash = crypto.createHash('sha256').update(patientId).digest('hex').substring(0, 16);
  const rawPayload = `${recordId}|${documentId}|${facilityCode}|${patientIdHash}|${issuedAt}|${expiresAt}`;
  const signature = crypto.createHmac('sha256', 'jeevansetu-secret-key-2026').update(rawPayload).digest('hex');
  const token = Buffer.from(JSON.stringify({
    type: 'health-record-reference',
    recordId,
    documentId,
    facilityCode,
    patientIdHash,
    version: 1,
    issuedAt,
    expiresAt,
    signature
  })).toString('base64url');

  return { token, signature, expiresAt: new Date(expiresAt) };
}

async function main() {
  console.log('🌱 Starting comprehensive seed for Maharashtra Demo District...');

  // 1. Clean existing tables in reverse dependency order
  await prisma.syncOperation.deleteMany({});
  await prisma.auditEvent.deleteMany({});
  await prisma.consent.deleteMany({});
  await prisma.document.deleteMany({});
  await prisma.facilityInventory.deleteMany({});
  await prisma.medicine.deleteMany({});
  await prisma.followUp.deleteMany({});
  await prisma.referral.deleteMany({});
  await prisma.diagnosticOrder.deleteMany({});
  await prisma.prescriptionItem.deleteMany({});
  await prisma.prescription.deleteMany({});
  await prisma.observation.deleteMany({});
  await prisma.condition.deleteMany({});
  await prisma.encounter.deleteMany({});
  await prisma.queueEntry.deleteMany({});
  await prisma.queue.deleteMany({});
  await prisma.appointment.deleteMany({});
  await prisma.department.deleteMany({});
  await prisma.practitioner.deleteMany({});
  await prisma.patient.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.facility.deleteMany({});
  await prisma.governmentService.deleteMany({});

  console.log('🧹 Cleaned existing database records.');

  // 2. Create Government Healthcare Schemes (Section 39 & 62)
  const schemes = [
    {
      title: "Ayushman Bharat PM-JAY (Pradhan Mantri Jan Arogya Yojana)",
      category: "FINANCIAL_PROTECTION",
      targetGroup: "Low-income rural families and vulnerable households",
      description: "Provides cashless healthcare coverage up to ₹5 lakh per family per year for secondary and tertiary hospitalization across empaneled public and private hospitals.",
      eligibility: "Identified under SECC 2011 database or state food security criteria. Check via Aadhaar or Ration Card at any PHC kiosk.",
      benefits: "100% cashless hospitalization, pre and post-hospitalization expenses for up to 15 days, medicines, and diagnostics included.",
      howToAccess: "Visit your nearest Ayushman Mitra at the District Hospital or Rural Hospital with Aadhaar card and Ration card to generate your Golden Card.",
      officialSource: "National Health Authority (NHA), Government of India",
      officialUrl: "https://pmjay.gov.in",
      helplineNumber: "14555",
      language: "en"
    },
    {
      title: "Janani Suraksha Yojana (JSY)",
      category: "MATERNAL_CHILD",
      targetGroup: "Pregnant women in rural and underserved areas",
      description: "A safe motherhood intervention under the National Health Mission promoting institutional delivery among poor pregnant women to reduce maternal and neonatal mortality.",
      eligibility: "All pregnant women delivering in government health centres (Sub-centres, PHCs, CHCs, District Hospitals) or accredited private facilities.",
      benefits: "Direct cash assistance of ₹1,400 for rural mothers upon institutional delivery, plus ₹600 incentive to ASHA worker for complete antenatal care support.",
      howToAccess: "Register with your local ASHA worker or ANM at the village Sub-centre during the first trimester. Carry your Mother & Child Protection (MCP) card.",
      officialSource: "Ministry of Health and Family Welfare (MoHFW)",
      officialUrl: "https://nhm.gov.in",
      helplineNumber: "102",
      language: "en"
    },
    {
      title: "Tele-MANAS (National Tele-Mental Health Programme)",
      category: "MENTAL_HEALTH",
      targetGroup: "Anyone experiencing mental distress, anxiety, stress, or seeking counseling",
      description: "A 24x7 toll-free tele-mental health helpline network providing immediate psychosocial counseling, psychiatric consultation, and referral linkages in regional languages.",
      eligibility: "Universal — open to all citizens across Maharashtra and India without any documents or fees.",
      benefits: "Free, confidential consultation with trained clinical psychologists and psychiatrists in Marathi, Hindi, and English.",
      howToAccess: "Dial 14416 or 1800-891-4416 directly from any mobile or landline at zero cost.",
      officialSource: "Ministry of Health and Family Welfare / NIMHANS",
      officialUrl: "https://telemanas.mohfw.gov.in",
      helplineNumber: "14416",
      language: "en"
    },
    {
      title: "Rashtriya Bal Swasthya Karyakram (RBSK)",
      category: "IMMUNIZATION",
      targetGroup: "Children from birth up to 18 years of age",
      description: "Comprehensive screening for 4Ds: Defects at birth, Diseases, Deficiencies, and Development delays including disabilities, with free treatment and surgical care.",
      eligibility: "All rural children enrolled in Anganwadi centres and government/aided schools.",
      benefits: "Free specialized corrective surgeries (e.g. congenital heart defect, cleft palate, clubfoot) at empaneled tertiary hospitals.",
      howToAccess: "Mobile Health Teams visit schools and Anganwadi centres. Parents can also request screening via local ASHA worker or PHC Medical Officer.",
      officialSource: "National Health Mission, Maharashtra",
      officialUrl: "https://arogya.maharashtra.gov.in",
      helplineNumber: "104",
      language: "en"
    },
    {
      title: "National Programme for Prevention and Control of Cancer, Diabetes, CVD and Stroke (NPCDCS)",
      category: "CHRONIC_DISEASE",
      targetGroup: "Adults aged 30 years and above",
      description: "Universal screening and management for hypertension, diabetes, and common cancers at primary healthcare levels with free monthly essential medications.",
      eligibility: "All adults aged 30+ visiting any Sub-centre Health and Wellness Centre (Ayushman Arogya Mandir) or PHC.",
      benefits: "Free blood pressure, blood glucose tests, oral and cervical cancer screenings, and free continuous supply of antihypertensives and antidiabetics.",
      howToAccess: "Visit your village Health and Wellness Centre (HWC) on regular NCD clinic days (Tuesdays/Fridays).",
      officialSource: "Public Health Department, Government of Maharashtra",
      officialUrl: "https://arogya.maharashtra.gov.in",
      helplineNumber: "104",
      language: "en"
    }
  ];

  for (const s of schemes) {
    await prisma.governmentService.create({ data: s });
  }
  console.log(`✅ Seeded ${schemes.length} verified government healthcare schemes.`);

  // 3. Create 20 Facilities (Sub-centres, PHCs, Rural Hospitals, District Hospital, Private, Diagnostics)
  const facilityData = [
    // Public Health Centers (Govt)
    {
      name: "Shirur Rural Hospital",
      code: "FAC-GOV-RH-001",
      type: "RURAL_HOSPITAL",
      ownership: "GOVERNMENT",
      address: "Station Road, Near Tehsil Office, Shirur",
      district: "Maharashtra Demo District",
      pinCode: "412210",
      latitude: 18.8256,
      longitude: 74.3789,
      phone: "+91 2138 222100",
      emergencyPhone: "108",
      hasEmergency: true,
      hasTeleconsult: true,
      hasDiagnostics: true,
      hasPharmacy: true,
      operatingHours: "24x7 Emergency, 08:30 - 16:30 OPD",
      bedCount: 50
    },
    {
      name: "Shirur Primary Health Centre (PHC)",
      code: "FAC-GOV-PHC-002",
      type: "PHC",
      ownership: "GOVERNMENT",
      address: "Main Bazar Peth, Shirur Taluka",
      district: "Maharashtra Demo District",
      pinCode: "412210",
      latitude: 18.8280,
      longitude: 74.3720,
      phone: "+91 2138 222150",
      emergencyPhone: "108",
      hasEmergency: true,
      hasTeleconsult: true,
      hasDiagnostics: true,
      hasPharmacy: true,
      operatingHours: "24x7 Delivery & Emergency, 09:00 - 16:00 OPD",
      bedCount: 12
    },
    {
      name: "Kendur Sub-Centre & Ayushman Arogya Mandir",
      code: "FAC-GOV-SC-003",
      type: "SUB_CENTRE",
      ownership: "GOVERNMENT",
      address: "Gram Panchayat Complex, Kendur Village",
      district: "Maharashtra Demo District",
      pinCode: "412403",
      latitude: 18.7900,
      longitude: 74.2200,
      phone: "+91 98221 00101",
      emergencyPhone: "108",
      hasEmergency: false,
      hasTeleconsult: true,
      hasDiagnostics: false,
      hasPharmacy: true,
      operatingHours: "09:00 - 15:00 (Mon-Sat)",
      bedCount: 2
    },
    {
      name: "Pabal Primary Health Centre (PHC)",
      code: "FAC-GOV-PHC-004",
      type: "PHC",
      ownership: "GOVERNMENT",
      address: "Vigyan Ashram Road, Pabal",
      district: "Maharashtra Demo District",
      pinCode: "412403",
      latitude: 18.8350,
      longitude: 74.0550,
      phone: "+91 2138 282220",
      emergencyPhone: "108",
      hasEmergency: true,
      hasTeleconsult: true,
      hasDiagnostics: true,
      hasPharmacy: true,
      operatingHours: "24x7 Emergency, 09:00 - 16:00 OPD",
      bedCount: 10
    },
    {
      name: "Nighoj Primary Health Centre",
      code: "FAC-GOV-PHC-005",
      type: "PHC",
      ownership: "GOVERNMENT",
      address: "Kund Road, Nighoj",
      district: "Maharashtra Demo District",
      pinCode: "414306",
      latitude: 18.9100,
      longitude: 74.2500,
      phone: "+91 2488 230120",
      emergencyPhone: "108",
      hasEmergency: true,
      hasTeleconsult: true,
      hasDiagnostics: true,
      hasPharmacy: true,
      operatingHours: "24x7 Emergency, 09:00 - 16:00 OPD",
      bedCount: 10
    },
    {
      name: "Shikrapur Primary Health Centre",
      code: "FAC-GOV-PHC-006",
      type: "PHC",
      ownership: "GOVERNMENT",
      address: "Pune-Nagar Highway, Shikrapur",
      district: "Maharashtra Demo District",
      pinCode: "412208",
      latitude: 18.6950,
      longitude: 74.1250,
      phone: "+91 2137 286200",
      emergencyPhone: "108",
      hasEmergency: true,
      hasTeleconsult: true,
      hasDiagnostics: true,
      hasPharmacy: true,
      operatingHours: "24x7 Emergency, 09:00 - 17:00 OPD",
      bedCount: 15
    },
    {
      name: "Talegaon Dhamdhere Rural Health Unit",
      code: "FAC-GOV-PHC-007",
      type: "PHC",
      ownership: "GOVERNMENT",
      address: "Near S.T. Stand, Talegaon Dhamdhere",
      district: "Maharashtra Demo District",
      pinCode: "412208",
      latitude: 18.6750,
      longitude: 74.1550,
      phone: "+91 2137 272110",
      emergencyPhone: "108",
      hasEmergency: false,
      hasTeleconsult: true,
      hasDiagnostics: false,
      hasPharmacy: true,
      operatingHours: "09:00 - 16:00 OPD",
      bedCount: 8
    },
    {
      name: "Kavathe Yamai Sub-Centre",
      code: "FAC-GOV-SC-008",
      type: "SUB_CENTRE",
      ownership: "GOVERNMENT",
      address: "Near Village Well, Kavathe Yamai",
      district: "Maharashtra Demo District",
      pinCode: "412218",
      latitude: 18.9150,
      longitude: 74.3100,
      phone: "+91 98221 00102",
      emergencyPhone: "108",
      hasEmergency: false,
      hasTeleconsult: true,
      hasDiagnostics: false,
      hasPharmacy: true,
      operatingHours: "09:00 - 15:00",
      bedCount: 2
    },
    {
      name: "Mandavgan Pharata PHC",
      code: "FAC-GOV-PHC-009",
      type: "PHC",
      ownership: "GOVERNMENT",
      address: "Bhima River Road, Mandavgan Pharata",
      district: "Maharashtra Demo District",
      pinCode: "412211",
      latitude: 18.7100,
      longitude: 74.4900,
      phone: "+91 2138 274110",
      emergencyPhone: "108",
      hasEmergency: true,
      hasTeleconsult: true,
      hasDiagnostics: true,
      hasPharmacy: true,
      operatingHours: "24x7 Emergency, 09:00 - 16:00 OPD",
      bedCount: 10
    },
    {
      name: "Koregaon Bhima Sub-Centre",
      code: "FAC-GOV-SC-010",
      type: "SUB_CENTRE",
      ownership: "GOVERNMENT",
      address: "Gram Sevak Office Lane, Koregaon Bhima",
      district: "Maharashtra Demo District",
      pinCode: "412216",
      latitude: 18.6650,
      longitude: 74.0750,
      phone: "+91 98221 00103",
      emergencyPhone: "108",
      hasEmergency: false,
      hasTeleconsult: true,
      hasDiagnostics: false,
      hasPharmacy: true,
      operatingHours: "09:00 - 15:00",
      bedCount: 2
    },
    {
      name: "Maharashtra District Referral Hospital",
      code: "FAC-GOV-DH-011",
      type: "DISTRICT_HOSPITAL",
      ownership: "GOVERNMENT",
      address: "Civil Hospital Road, Central District Headquarters",
      district: "Maharashtra Demo District",
      pinCode: "411027",
      latitude: 18.5800,
      longitude: 73.8200,
      phone: "+91 20 2712 5500",
      emergencyPhone: "108",
      hasEmergency: true,
      hasTeleconsult: true,
      hasDiagnostics: true,
      hasPharmacy: true,
      operatingHours: "24x7 Emergency & Inpatient, 08:00 - 17:00 OPD",
      bedCount: 300
    },
    {
      name: "Baramati Sub-District Hospital (SDH)",
      code: "FAC-GOV-SDH-012",
      type: "SUB_DISTRICT_HOSPITAL",
      ownership: "GOVERNMENT",
      address: "Bhigwan Road, Baramati",
      district: "Maharashtra Demo District",
      pinCode: "413102",
      latitude: 18.1500,
      longitude: 74.5800,
      phone: "+91 2112 222400",
      emergencyPhone: "108",
      hasEmergency: true,
      hasTeleconsult: true,
      hasDiagnostics: true,
      hasPharmacy: true,
      operatingHours: "24x7 Emergency, 08:30 - 17:00 OPD",
      bedCount: 100
    },
    {
      name: "Junnar Rural Hospital",
      code: "FAC-GOV-RH-013",
      type: "RURAL_HOSPITAL",
      ownership: "GOVERNMENT",
      address: "Shivneri Fort Road, Junnar",
      district: "Maharashtra Demo District",
      pinCode: "410502",
      latitude: 19.2050,
      longitude: 73.8750,
      phone: "+91 2132 222120",
      emergencyPhone: "108",
      hasEmergency: true,
      hasTeleconsult: true,
      hasDiagnostics: true,
      hasPharmacy: true,
      operatingHours: "24x7 Emergency, 08:30 - 16:30 OPD",
      bedCount: 40
    },
    {
      name: "Manchar Sub-District Hospital",
      code: "FAC-GOV-SDH-014",
      type: "SUB_DISTRICT_HOSPITAL",
      ownership: "GOVERNMENT",
      address: "Pune-Nashik Highway, Manchar",
      district: "Maharashtra Demo District",
      pinCode: "410503",
      latitude: 19.0050,
      longitude: 73.9450,
      phone: "+91 2133 223150",
      emergencyPhone: "108",
      hasEmergency: true,
      hasTeleconsult: true,
      hasDiagnostics: true,
      hasPharmacy: true,
      operatingHours: "24x7 Emergency, 09:00 - 17:00 OPD",
      bedCount: 60
    },
    {
      name: "Daund Sub-District Hospital",
      code: "FAC-GOV-SDH-015",
      type: "SUB_DISTRICT_HOSPITAL",
      ownership: "GOVERNMENT",
      address: "Railway Station Road, Daund",
      district: "Maharashtra Demo District",
      pinCode: "413801",
      latitude: 18.4650,
      longitude: 74.5800,
      phone: "+91 2117 262300",
      emergencyPhone: "108",
      hasEmergency: true,
      hasTeleconsult: true,
      hasDiagnostics: true,
      hasPharmacy: true,
      operatingHours: "24x7 Emergency, 08:30 - 16:30 OPD",
      bedCount: 75
    },
    // Private Hospitals
    {
      name: "Sanjeevani Multispeciality Hospital",
      code: "FAC-PVT-HOSP-016",
      type: "PRIVATE_HOSPITAL",
      ownership: "PRIVATE",
      address: "Bypass Road, Shirur",
      district: "Maharashtra Demo District",
      pinCode: "412210",
      latitude: 18.8320,
      longitude: 74.3680,
      phone: "+91 2138 224488",
      emergencyPhone: "+91 2138 224499",
      hasEmergency: true,
      hasTeleconsult: true,
      hasDiagnostics: true,
      hasPharmacy: true,
      operatingHours: "24x7 Emergency & Specialist OPD",
      bedCount: 45
    },
    {
      name: "Sai Seva Rural Nursing Home",
      code: "FAC-PVT-HOSP-017",
      type: "PRIVATE_HOSPITAL",
      ownership: "PRIVATE",
      address: "Market Yard Chowk, Shikrapur",
      district: "Maharashtra Demo District",
      pinCode: "412208",
      latitude: 18.7010,
      longitude: 74.1180,
      phone: "+91 2137 287111",
      emergencyPhone: "+91 2137 287112",
      hasEmergency: true,
      hasTeleconsult: false,
      hasDiagnostics: true,
      hasPharmacy: true,
      operatingHours: "08:00 - 20:00 Daily",
      bedCount: 25
    },
    {
      name: "Sahyadri Rural Community Hospital",
      code: "FAC-PVT-HOSP-018",
      type: "PRIVATE_HOSPITAL",
      ownership: "PRIVATE",
      address: "Ghodnadi River Bridge, Shirur",
      district: "Maharashtra Demo District",
      pinCode: "412210",
      latitude: 18.8210,
      longitude: 74.3820,
      phone: "+91 2138 225900",
      emergencyPhone: "+91 2138 225901",
      hasEmergency: true,
      hasTeleconsult: true,
      hasDiagnostics: true,
      hasPharmacy: true,
      operatingHours: "24x7 Emergency, 09:00 - 18:00 OPD",
      bedCount: 35
    },
    // Diagnostic Centres
    {
      name: "LifeLine Rural Diagnostic & Imaging Centre",
      code: "FAC-PVT-DIAG-019",
      type: "DIAGNOSTIC_CENTRE",
      ownership: "PRIVATE",
      address: "Opp. ST Stand, Station Road, Shirur",
      district: "Maharashtra Demo District",
      pinCode: "412210",
      latitude: 18.8270,
      longitude: 74.3750,
      phone: "+91 2138 223344",
      emergencyPhone: "+91 2138 223344",
      hasEmergency: false,
      hasTeleconsult: false,
      hasDiagnostics: true,
      hasPharmacy: false,
      operatingHours: "07:30 - 20:30 (Mon-Sat), 08:00 - 14:00 (Sun)",
      bedCount: 0
    },
    {
      name: "District Public Health & Microbiology Laboratory",
      code: "FAC-GOV-DIAG-020",
      type: "DIAGNOSTIC_CENTRE",
      ownership: "GOVERNMENT",
      address: "Civil Hospital Campus, District Headquarters",
      district: "Maharashtra Demo District",
      pinCode: "411027",
      latitude: 18.5815,
      longitude: 73.8210,
      phone: "+91 20 2712 5599",
      emergencyPhone: "108",
      hasEmergency: false,
      hasTeleconsult: false,
      hasDiagnostics: true,
      hasPharmacy: false,
      operatingHours: "08:00 - 17:00 (Mon-Sat)",
      bedCount: 0
    }
  ];

  const createdFacilities = [];
  for (const f of facilityData) {
    const facility = await prisma.facility.create({ data: f });
    createdFacilities.push(facility);
  }
  console.log(`✅ Seeded ${createdFacilities.length} facilities across Maharashtra Demo District.`);

  // Find key facilities for foreign keys
  const shirurRh = createdFacilities.find(f => f.code === 'FAC-GOV-RH-001');
  const shirurPhc = createdFacilities.find(f => f.code === 'FAC-GOV-PHC-002');
  const kendurSc = createdFacilities.find(f => f.code === 'FAC-GOV-SC-003');
  const districtHosp = createdFacilities.find(f => f.code === 'FAC-GOV-DH-011');
  const lifelineDiag = createdFacilities.find(f => f.code === 'FAC-PVT-DIAG-019');

  // 4. Create Departments for Facilities
  const departmentsData = [
    { facilityId: shirurRh.id, name: "General Medicine", headDoctor: "Dr. Rajesh Deshmukh" },
    { facilityId: shirurRh.id, name: "Orthopedics", headDoctor: "Dr. Rajesh Deshmukh" },
    { facilityId: shirurRh.id, name: "Gynecology & Obstetrics", headDoctor: "Dr. Kavita Kadam" },
    { facilityId: shirurRh.id, name: "Pediatrics", headDoctor: "Dr. Amit Joshi" },
    { facilityId: shirurRh.id, name: "Diagnostics & Radiology", headDoctor: "Dr. Smita Varma" },
    { facilityId: shirurPhc.id, name: "Outpatient General Care", headDoctor: "Dr. Sameer Patil" },
    { facilityId: shirurPhc.id, name: "Maternal & Child Health", headDoctor: "Dr. Smita Varma" },
    { facilityId: kendurSc.id, name: "Primary Health & Wellness", headDoctor: "Sunita Shinde (CHO/ASHA)" },
    { facilityId: districtHosp.id, name: "Orthopedic Surgery & Trauma", headDoctor: "Dr. Vikram Sethi" },
    { facilityId: districtHosp.id, name: "Cardiology", headDoctor: "Dr. Sneha Rao" },
    { facilityId: districtHosp.id, name: "Advanced Radiology", headDoctor: "Dr. SMita Varma" },
  ];

  const createdDepartments = [];
  for (const d of departmentsData) {
    const dept = await prisma.department.create({ data: d });
    createdDepartments.push(dept);
  }

  // 5. Create Essential Medicines Catalog & Inventory
  const medicines = [
    { name: "Paracetamol 500mg", genericName: "Paracetamol", category: "Analgesic", form: "TABLET", strength: "500mg", isEssential: true },
    { name: "Ibuprofen 400mg", genericName: "Ibuprofen", category: "Analgesic / Anti-inflammatory", form: "TABLET", strength: "400mg", isEssential: true },
    { name: "Amoxicillin 500mg", genericName: "Amoxicillin", category: "Antibiotic", form: "CAPSULE", strength: "500mg", isEssential: true },
    { name: "Amlodipine 5mg", genericName: "Amlodipine Besylate", category: "Antihypertensive", form: "TABLET", strength: "5mg", isEssential: true },
    { name: "Metformin 500mg", genericName: "Metformin Hydrochloride", category: "Antidiabetic", form: "TABLET", strength: "500mg", isEssential: true },
    { name: "Oral Rehydration Salts (ORS)", genericName: "Electrolyte Salts (WHO Formula)", category: "Rehydration", form: "POWDER", strength: "21.8g sachet", isEssential: true },
    { name: "Iron & Folic Acid", genericName: "Ferrous Ascorbate + Folic Acid", category: "Nutritional Supplement", form: "TABLET", strength: "100mg elemental Iron + 0.5mg Folic Acid", isEssential: true },
    { name: "Azithromycin 500mg", genericName: "Azithromycin", category: "Antibiotic", form: "TABLET", strength: "500mg", isEssential: true },
    { name: "Diclofenac Sodium 50mg", genericName: "Diclofenac Sodium", category: "NSAID", form: "TABLET", strength: "50mg", isEssential: true },
    { name: "Omeprazole 20mg", genericName: "Omeprazole", category: "Proton Pump Inhibitor", form: "CAPSULE", strength: "20mg", isEssential: true },
    { name: "Cetirizine 10mg", genericName: "Cetirizine Hydrochloride", category: "Antihistamine", form: "TABLET", strength: "10mg", isEssential: true },
    { name: "Calcium + Vitamin D3", genericName: "Calcium Carbonate + Cholecalciferol", category: "Bone Health", form: "TABLET", strength: "500mg + 250 IU", isEssential: true }
  ];

  const createdMedicines = [];
  for (const m of medicines) {
    const med = await prisma.medicine.create({ data: m });
    createdMedicines.push(med);
  }

  // Seed inventory for all 20 facilities with realistic variations
  for (const fac of createdFacilities) {
    for (const med of createdMedicines) {
      let quantity = 250;
      let isAvail = true;

      // Simulate realistic rural supply differences (e.g. Sub-centres have basic, PHCs moderate, RH high)
      if (fac.type === 'SUB_CENTRE') {
        quantity = med.genericName === 'Paracetamol' || med.genericName === 'Oral Rehydration Salts (ORS)' || med.genericName === 'Iron & Folic Acid' ? 80 : 0;
        isAvail = quantity > 0;
      } else if (fac.type === 'PHC' && med.genericName === 'Azithromycin') {
        quantity = 15; // Low stock
      }

      await prisma.facilityInventory.create({
        data: {
          facilityId: fac.id,
          medicineId: med.id,
          quantityInStock: quantity,
          batchNumber: `BATCH-2026-${fac.code.substring(8, 12)}`,
          expiryDate: '2027-12-31',
          lowStockThreshold: 30,
          isAvailable: isAvail,
          lastUpdated: new Date()
        }
      });
    }
  }
  console.log(`✅ Seeded medicine catalog and inventory for ${createdFacilities.length} facilities.`);

  // 6. Create Demo Users & Key Clinical Accounts (Section 65)
  // Patient Demo: Anand Patil
  const userPatient = await prisma.user.create({
    data: {
      phone: "9820011001",
      email: "anand.patil.demo@jeevansetu.in",
      name: "Anand Patil",
      role: "PATIENT",
      passwordHash: DEMO_PASSWORD_HASH,
      facilityId: shirurRh.id
    }
  });

  const heroPatient = await prisma.patient.create({
    data: {
      userId: userPatient.id,
      nationalHealthId: "91-4829-1049-2810", // ABHA demo format
      fullName: "Anand Patil",
      dateOfBirth: "1972-04-14",
      gender: "MALE",
      phone: "9820011001",
      emergencyPhone: "9820011099",
      bloodGroup: "B+",
      address: "Gat No. 142, Patil Mala, Kendur Village",
      village: "Kendur",
      district: "Maharashtra Demo District",
      pinCode: "412403",
      preferredLanguage: "mr",
      assignedWorkerId: "WORKER-SUNITA",
      allergies: "None known",
      chronicConditions: "Osteoarthritis (Bilateral Knee)",
      riskLevel: "MEDIUM",
      riskReason: "Mobility impairment due to severe joint pain, remote travel barrier"
    }
  });

  // Health Worker Demo: Sunita Shinde (ASHA / Frontline Worker)
  const userWorker = await prisma.user.create({
    data: {
      phone: "9820022002",
      email: "sunita.shinde.demo@jeevansetu.in",
      name: "Sunita Shinde",
      role: "HEALTH_WORKER",
      passwordHash: DEMO_PASSWORD_HASH,
      facilityId: kendurSc.id
    }
  });

  // Doctor Demo: Dr. Rajesh Deshmukh (Orthopedics Specialist)
  const userDoctor = await prisma.user.create({
    data: {
      phone: "9820033003",
      email: "dr.rajesh.demo@jeevansetu.in",
      name: "Dr. Rajesh Deshmukh",
      role: "DOCTOR",
      passwordHash: DEMO_PASSWORD_HASH,
      facilityId: shirurRh.id
    }
  });

  const heroDoctor = await prisma.practitioner.create({
    data: {
      userId: userDoctor.id,
      fullName: "Dr. Rajesh Deshmukh",
      licenseNumber: "MCI-MH-2011-049281",
      qualification: "MBBS, MS (Orthopedics)",
      specialty: "Orthopedics",
      department: "Orthopedics",
      facilityId: shirurRh.id,
      isAvailable: true,
      teleconsultActive: true,
      consultationFee: 0, // Public facility: zero fee
      languagesSpoken: "mr,hi,en"
    }
  });

  // Facility Admin Demo: Priya Kulkarni
  await prisma.user.create({
    data: {
      phone: "9820044004",
      email: "priya.kulkarni.demo@jeevansetu.in",
      name: "Priya Kulkarni",
      role: "FACILITY_ADMIN",
      passwordHash: DEMO_PASSWORD_HASH,
      facilityId: shirurRh.id
    }
  });

  // System Admin Demo: District Health Officer
  await prisma.user.create({
    data: {
      phone: "9820055005",
      email: "district.officer.demo@jeevansetu.in",
      name: "District Health Officer (Pune Rural)",
      role: "SYSTEM_ADMIN",
      passwordHash: DEMO_PASSWORD_HASH
    }
  });

  // 7. Seed Additional 49 Practitioners (Total 50 Practitioners)
  const specialties = [
    { spec: "General Medicine", dept: "General Medicine", qual: "MBBS, MD (Medicine)" },
    { spec: "Orthopedics", dept: "Orthopedics", qual: "MBBS, D.Ortho" },
    { spec: "Gynecology & Obstetrics", dept: "Gynecology & Obstetrics", qual: "MBBS, DGO" },
    { spec: "Pediatrics", dept: "Pediatrics", qual: "MBBS, DCH" },
    { spec: "Cardiology", dept: "Cardiology", qual: "MBBS, MD, DM (Cardiology)" },
    { spec: "Radiology", dept: "Diagnostics & Radiology", qual: "MBBS, DMRD" }
  ];

  const firstNames = ["Suresh", "Vikram", "Kavita", "Amit", "Pooja", "Sachin", "Smita", "Ramesh", "Ganesh", "Neha"];
  const lastNames = ["Joshi", "Kadam", "Patil", "Bhosale", "Jadhav", "Pawar", "Shinde", "Desai", "More", "Gaikwad"];

  for (let i = 1; i <= 49; i++) {
    const fn = firstNames[i % firstNames.length];
    const ln = lastNames[Math.floor(i / 5) % lastNames.length];
    const specObj = specialties[i % specialties.length];
    const assignedFac = createdFacilities[i % createdFacilities.length];

    const u = await prisma.user.create({
      data: {
        phone: `98200${(30000 + i).toString().padStart(5, '0')}`,
        email: `dr.${fn.toLowerCase()}.${ln.toLowerCase()}${i}@jeevansetu.in`,
        name: `Dr. ${fn} ${ln}`,
        role: "DOCTOR",
        passwordHash: DEMO_PASSWORD_HASH,
        facilityId: assignedFac.id
      }
    });

    await prisma.practitioner.create({
      data: {
        userId: u.id,
        fullName: `Dr. ${fn} ${ln}`,
        licenseNumber: `MCI-MH-20${10 + (i % 14)}-${100000 + i}`,
        qualification: specObj.qual,
        specialty: specObj.spec,
        department: specObj.dept,
        facilityId: assignedFac.id,
        isAvailable: i % 4 !== 0, // 75% available
        teleconsultActive: i % 2 === 0,
        consultationFee: assignedFac.ownership === 'GOVERNMENT' ? 0 : 300,
        languagesSpoken: "mr,hi,en"
      }
    });
  }
  console.log('✅ Seeded 50 medical practitioners across 20 facilities.');

  // 8. Seed 149 Additional Realistic Patients (Total 150 Patients) (Section 63 & 64)
  // Patient B: Meena Kale (Hypertension, Missed follow-up, High-risk flag)
  const patientB = await prisma.patient.create({
    data: {
      nationalHealthId: "91-3829-5021-9922",
      fullName: "Meena Kale",
      dateOfBirth: "1968-09-12",
      gender: "FEMALE",
      phone: "9820011002",
      emergencyPhone: "9820011098",
      bloodGroup: "O+",
      address: "House No 24, Near ZP School, Pabal",
      village: "Pabal",
      district: "Maharashtra Demo District",
      pinCode: "412403",
      preferredLanguage: "mr",
      assignedWorkerId: "WORKER-SUNITA",
      chronicConditions: "Hypertension (Stage II), Type 2 Diabetes",
      riskLevel: "HIGH",
      riskReason: "Missed scheduled monthly hypertension follow-up on September 1; BP recorded 168/104 mmHg"
    }
  });

  // Patient C: Sunita Gaikwad (Maternal follow-up, 32 weeks, Pending Hb & Ultrasound)
  const patientC = await prisma.patient.create({
    data: {
      nationalHealthId: "91-5829-1122-4411",
      fullName: "Sunita Gaikwad",
      dateOfBirth: "1998-11-20",
      gender: "FEMALE",
      phone: "9820011003",
      emergencyPhone: "9820011097",
      bloodGroup: "A+",
      address: "Wadi No. 3, Shikrapur Road, Kendur",
      village: "Kendur",
      district: "Maharashtra Demo District",
      pinCode: "412403",
      preferredLanguage: "mr",
      assignedWorkerId: "WORKER-SUNITA",
      chronicConditions: "Pregnancy (32 Weeks, Primi), Mild Anemia (Hb 9.2 g/dL)",
      riskLevel: "HIGH",
      riskReason: "High-risk antenatal case: Mild anemia and pending growth ultrasound scan"
    }
  });

  // Patient D: Rohan Shinde (Child, Asthma & fever)
  const patientD = await prisma.patient.create({
    data: {
      nationalHealthId: "91-7729-3344-5566",
      fullName: "Rohan Shinde",
      dateOfBirth: "2019-06-15",
      gender: "MALE",
      phone: "9820011004",
      emergencyPhone: "9820011096",
      bloodGroup: "B+",
      address: "Shinde Vasti, Nighoj",
      village: "Nighoj",
      district: "Maharashtra Demo District",
      pinCode: "414306",
      preferredLanguage: "mr",
      assignedWorkerId: "WORKER-SUNITA",
      chronicConditions: "Childhood Bronchial Asthma",
      riskLevel: "MEDIUM",
      riskReason: "Seasonal exacerbation; scheduled pediatric follow-up"
    }
  });

  // Patient E: Suresh Jadhav (Emergency trauma / chest tightness presentation)
  const patientE = await prisma.patient.create({
    data: {
      nationalHealthId: "91-9929-8877-6655",
      fullName: "Suresh Jadhav",
      dateOfBirth: "1960-01-10",
      gender: "MALE",
      phone: "9820011005",
      emergencyPhone: "9820011095",
      bloodGroup: "AB+",
      address: "Near S.T. Bus Depot, Shirur",
      village: "Shirur",
      district: "Maharashtra Demo District",
      pinCode: "412210",
      preferredLanguage: "hi",
      assignedWorkerId: "WORKER-SUNITA",
      chronicConditions: "Coronary Artery Disease, Heavy Smoker",
      riskLevel: "HIGH",
      riskReason: "Emergency triage: Acute chest tightness and diaphoresis flagged for urgent referral"
    }
  });

  // Patient F: Ramesh Thorat (Referral from PHC to District Hospital)
  const patientF = await prisma.patient.create({
    data: {
      nationalHealthId: "91-4429-7711-2288",
      fullName: "Ramesh Thorat",
      dateOfBirth: "1975-08-25",
      gender: "MALE",
      phone: "9820011006",
      emergencyPhone: "9820011094",
      bloodGroup: "O-",
      address: "Bazar Peth, Mandavgan Pharata",
      village: "Mandavgan Pharata",
      district: "Maharashtra Demo District",
      pinCode: "412211",
      preferredLanguage: "mr",
      assignedWorkerId: "WORKER-SUNITA",
      chronicConditions: "Complicated Inguinal Hernia",
      riskLevel: "MEDIUM",
      riskReason: "Surgical referral to District Hospital for elective repair"
    }
  });

  const villages = ["Kendur", "Pabal", "Nighoj", "Shikrapur", "Talegaon Dhamdhere", "Kavathe Yamai", "Mandavgan Pharata", "Koregaon Bhima", "Junnar", "Baramati"];
  const maleNames = ["Dattatray", "Santosh", "Maruti", "Baban", "Tukaram", "Vitthal", "Eknath", "Namdeo", "Kailas", "Pandurang"];
  const femaleNames = ["Lata", "Usha", "Shobha", "Rekha", "Sangita", "Mangal", "Savita", "Anita", "Vandana", "Chhaya"];

  for (let i = 7; i <= 150; i++) {
    const isMale = i % 2 === 0;
    const nameList = isMale ? maleNames : femaleNames;
    const fn = nameList[i % nameList.length];
    const ln = lastNames[(i * 3) % lastNames.length];
    const village = villages[i % villages.length];
    const birthYear = 1955 + (i % 60);
    const risk = i % 12 === 0 ? "HIGH" : i % 4 === 0 ? "MEDIUM" : "ROUTINE";

    await prisma.patient.create({
      data: {
        nationalHealthId: `91-${(1000 + i)}-${(2000 + i * 2)}-${(3000 + i * 3)}`,
        fullName: `${fn} ${ln}`,
        dateOfBirth: `${birthYear}-0${(i % 9) + 1}-15`,
        gender: isMale ? "MALE" : "FEMALE",
        phone: `98200${(10000 + i).toString().padStart(5, '0')}`,
        bloodGroup: ["A+", "B+", "O+", "AB+", "O-"][i % 5],
        address: `Wadi No. ${(i % 5) + 1}, ${village} Village`,
        village,
        district: "Maharashtra Demo District",
        pinCode: "412403",
        preferredLanguage: i % 5 === 0 ? "hi" : "mr",
        assignedWorkerId: "WORKER-SUNITA",
        riskLevel: risk,
        riskReason: risk === "HIGH" ? "Chronic uncontrolled condition requiring weekly ASHA check-in" : null
      }
    });
  }
  console.log('✅ Seeded 150 realistic rural patients with health identifiers and risk cohorts.');

  // 9. Create Active Queue for Shirur Rural Hospital (Orthopedics & General OPD)
  const todayStr = new Date().toISOString().split('T')[0];
  const orthoDept = createdDepartments.find(d => d.name === 'Orthopedics');

  const orthoQueue = await prisma.queue.create({
    data: {
      facilityId: shirurRh.id,
      departmentId: orthoDept.id,
      date: todayStr,
      status: "ACTIVE",
      totalTokens: 18,
      currentServingToken: 12
    }
  });

  // Hero Patient Appointment & Queue Entry
  const heroAppointment = await prisma.appointment.create({
    data: {
      appointmentNumber: "APT-2026-0908-01",
      patientId: heroPatient.id,
      practitionerId: heroDoctor.id,
      facilityId: shirurRh.id,
      departmentId: orthoDept.id,
      date: todayStr,
      timeSlot: "11:30 - 12:00",
      type: "TELECONSULT",
      status: "CONFIRMED",
      reason: "Severe bilateral knee pain, difficulty walking and long-distance travel",
      queueToken: "ORTHO-014",
      estimatedWaitMinutes: 10,
      notes: "Assisted teleconsultation initiated from Kendur Sub-centre"
    }
  });

  await prisma.queueEntry.create({
    data: {
      queueId: orthoQueue.id,
      appointmentId: heroAppointment.id,
      patientId: heroPatient.id,
      tokenNumber: 14,
      tokenDisplay: "ORTHO-014",
      priority: "URGENT",
      status: "WAITING",
      checkInTime: new Date(Date.now() - 25 * 60 * 1000),
      estimatedWaitMinutes: 10
    }
  });

  // 10. Create Historical Clinical Encounter, Vitals, Prescription, QR, Test & Referral for Hero Patient
  const previousEncounter = await prisma.encounter.create({
    data: {
      encounterNumber: "ENC-2026-0818-01",
      patientId: heroPatient.id,
      practitionerId: heroDoctor.id,
      facilityId: shirurRh.id,
      type: "TELECONSULT",
      status: "FINISHED",
      chiefComplaint: "Bilateral knee joint pain, swelling after walking >200 metres",
      symptoms: "Stiffness in morning lasting 20 minutes, crepitus on flexion",
      vitalsSummary: "BP: 130/84 mmHg, Pulse: 76 bpm, Weight: 74 kg, SpO2: 98%",
      assessment: "Moderate Bilateral Knee Osteoarthritis (Kellgren-Lawrence Grade II)",
      clinicalNotes: "Patient has substantial travel difficulty from Kendur. Conservative medical management started; digital X-ray ordered.",
      plan: "1. Analgesics and protective exercises. 2. Digital AP/Lateral Knee X-ray at Shirur or District Lab. 3. Follow-up in 14 days.",
      startedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
      endedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000 + 20 * 60 * 1000)
    }
  });

  // Vitals Observations
  await prisma.observation.createMany({
    data: [
      {
        patientId: heroPatient.id,
        encounterId: previousEncounter.id,
        category: "VITAL_SIGNS",
        code: "SYSTOLIC_BP",
        name: "Systolic Blood Pressure",
        value: "130",
        unit: "mmHg",
        interpretation: "NORMAL",
        recordedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
        recordedBy: "Sunita Shinde (ASHA)"
      },
      {
        patientId: heroPatient.id,
        encounterId: previousEncounter.id,
        category: "VITAL_SIGNS",
        code: "DIASTOLIC_BP",
        name: "Diastolic Blood Pressure",
        value: "84",
        unit: "mmHg",
        interpretation: "NORMAL",
        recordedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
        recordedBy: "Sunita Shinde (ASHA)"
      },
      {
        patientId: heroPatient.id,
        encounterId: previousEncounter.id,
        category: "VITAL_SIGNS",
        code: "HEART_RATE",
        name: "Pulse Rate",
        value: "76",
        unit: "bpm",
        interpretation: "NORMAL",
        recordedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
        recordedBy: "Sunita Shinde (ASHA)"
      },
      {
        patientId: heroPatient.id,
        encounterId: previousEncounter.id,
        category: "VITAL_SIGNS",
        code: "WEIGHT",
        name: "Weight",
        value: "74",
        unit: "kg",
        interpretation: "NORMAL",
        recordedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
        recordedBy: "Sunita Shinde (ASHA)"
      }
    ]
  });

  // Active Condition
  await prisma.condition.create({
    data: {
      patientId: heroPatient.id,
      encounterId: previousEncounter.id,
      code: "M17.0",
      title: "Bilateral primary osteoarthritis of knee",
      clinicalStatus: "ACTIVE",
      verificationStatus: "CONFIRMED",
      category: "CHRONIC",
      severity: "MODERATE",
      onsetDate: "2025-11-01"
    }
  });

  // Prescription with Signed Privacy-Safe QR Reference
  const qrData = generateSignedQr("RX-2026-0818-099", "DOC-RX-0818", shirurRh.code, heroPatient.id);

  const heroPrescription = await prisma.prescription.create({
    data: {
      prescriptionNumber: "RX-2026-0818-099",
      encounterId: previousEncounter.id,
      patientId: heroPatient.id,
      practitionerId: heroDoctor.id,
      facilityId: shirurRh.id,
      status: "SIGNED",
      diagnosisSummary: "Bilateral Osteoarthritis Knee — Conservative Phase I",
      instructions: "Take medicines strictly after meals with warm water. Avoid squatting on floor. Perform quadriceps static exercises daily.",
      qrReferenceToken: qrData.token,
      qrTokenSignature: qrData.signature,
      qrExpiresAt: qrData.expiresAt,
      signedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
      signedBy: "Dr. Rajesh Deshmukh, MS (Ortho)"
    }
  });

  await prisma.prescriptionItem.createMany({
    data: [
      {
        prescriptionId: heroPrescription.id,
        medicineName: "Paracetamol 500mg",
        genericName: "Paracetamol",
        dosage: "500 mg",
        form: "TABLET",
        route: "ORAL",
        frequency: "BD",
        durationDays: 14,
        instructions: "Twice daily after morning and night meals",
        quantity: 28,
        isAvailableInFacility: true
      },
      {
        prescriptionId: heroPrescription.id,
        medicineName: "Calcium + Vitamin D3",
        genericName: "Calcium Carbonate + Cholecalciferol",
        dosage: "500mg + 250 IU",
        form: "TABLET",
        route: "ORAL",
        frequency: "OD",
        durationDays: 30,
        instructions: "Once daily after lunch",
        quantity: 30,
        isAvailableInFacility: true
      },
      {
        prescriptionId: heroPrescription.id,
        medicineName: "Diclofenac Sodium 50mg",
        genericName: "Diclofenac Sodium",
        dosage: "50 mg",
        form: "TABLET",
        route: "ORAL",
        frequency: "SOS",
        durationDays: 5,
        instructions: "Take only if severe pain occurs, maximum 1 tablet per day with food",
        quantity: 5,
        isAvailableInFacility: true
      }
    ]
  });

  // Diagnostic Order: X-Ray Knee AP/Lateral
  const heroXrayOrder = await prisma.diagnosticOrder.create({
    data: {
      orderNumber: "DIAG-2026-0818-42",
      encounterId: previousEncounter.id,
      patientId: heroPatient.id,
      practitionerId: heroDoctor.id,
      facilityId: shirurRh.id,
      testName: "Digital X-Ray Knee AP & Lateral Views (Bilateral)",
      testCategory: "RADIOLOGY",
      priority: "ROUTINE",
      status: "RESULT_READY",
      instructions: "Non-weight-bearing and weight-bearing views to evaluate medial joint space reduction",
      orderedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
      sampleCollectedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      resultReadyAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      reviewedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      reviewedById: heroDoctor.id,
      resultSummary: "Medial joint compartment space narrowing noted bilaterally. Mild subchondral sclerosis. Grade II Osteoarthritis.",
      abnormalFlag: true
    }
  });

  // Closed-loop Referral: From Shirur RH to District Hospital for Orthopedic Joint Preservation Consultation
  await prisma.referral.create({
    data: {
      referralNumber: "REF-2026-0901-18",
      encounterId: previousEncounter.id,
      patientId: heroPatient.id,
      referringPractitionerId: heroDoctor.id,
      referringFacilityId: shirurRh.id,
      receivingFacilityId: districtHosp.id,
      requestedSpecialty: "Orthopedic Surgery & Trauma",
      priority: "ROUTINE",
      reason: "Specialist evaluation for knee viscosupplementation / joint preservation",
      clinicalSummary: "54M, Farmer with progressive knee pain. Grade II OA confirmed on X-ray. Medical therapy given. Teleconsultation recommended before in-person district travel.",
      status: "SCHEDULED",
      patientAcknowledged: true,
      dueDate: "2026-09-22"
    }
  });

  // Scheduled Follow-Up (Section 19)
  await prisma.followUp.create({
    data: {
      encounterId: previousEncounter.id,
      patientId: heroPatient.id,
      practitionerId: heroDoctor.id,
      facilityId: shirurRh.id,
      scheduledDate: todayStr,
      reason: "14-day teleconsultation follow-up to evaluate response to analgesics and review X-ray results",
      status: "PENDING",
      priority: "MEDIUM",
      isHighRiskEscalated: false,
      assignedWorkerId: "WORKER-SUNITA",
      notes: "ASHA Sunita to assist with mobile video connect from Kendur Sub-centre"
    }
  });

  // High-Risk Patient B Missed Follow-up (Demonstrating Section 33 & 64)
  await prisma.followUp.create({
    data: {
      patientId: patientB.id,
      facilityId: shirurPhc.id,
      scheduledDate: "2026-09-01",
      reason: "Monthly Hypertension evaluation and prescription refill",
      status: "MISSED",
      priority: "HIGH",
      isHighRiskEscalated: true,
      assignedWorkerId: "WORKER-SUNITA",
      notes: "Alert: Patient missed scheduled visit. High BP (168/104 mmHg) on last home visit. ASHA home visit task auto-generated."
    }
  });

  // Patient Consent Record (Section 50)
  await prisma.consent.create({
    data: {
      patientId: heroPatient.id,
      purpose: "Care Continuity and Referral Evaluation",
      dataCategory: "Prescriptions, Diagnostic X-Ray Reports, Vitals History",
      recipientScope: "Shirur Rural Hospital & District Referral Hospital Orthopedics Department",
      status: "GRANTED",
      grantedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
      expiresAt: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000)
    }
  });

  // Audit Logs (Section 49)
  await prisma.auditEvent.createMany({
    data: [
      {
        actorId: heroDoctor.id,
        actorRole: "DOCTOR",
        action: "PRESCRIPTION_SIGNED",
        resource: "Prescription",
        resourceId: heroPrescription.id,
        facilityId: shirurRh.id,
        outcome: "SUCCESS",
        metadataJson: JSON.stringify({ prescriptionNumber: heroPrescription.prescriptionNumber })
      },
      {
        actorId: heroDoctor.id,
        actorRole: "DOCTOR",
        action: "DIAGNOSTIC_ORDERED",
        resource: "DiagnosticOrder",
        resourceId: heroXrayOrder.id,
        facilityId: shirurRh.id,
        outcome: "SUCCESS",
        metadataJson: JSON.stringify({ testName: heroXrayOrder.testName })
      },
      {
        actorId: userWorker.id,
        actorRole: "HEALTH_WORKER",
        action: "QR_SCANNED",
        resource: "Prescription",
        resourceId: heroPrescription.id,
        facilityId: kendurSc.id,
        outcome: "SUCCESS",
        metadataJson: JSON.stringify({ verificationType: "HMAC_TOKEN_VALID" })
      }
    ]
  });

  console.log('✅ Seeded complete clinical journey: encounter, vitals, signed Rx, QR, diagnostics, referrals, follow-up, and audit trail.');
  console.log('🎉 Maharashtra Demo District database successfully seeded!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
