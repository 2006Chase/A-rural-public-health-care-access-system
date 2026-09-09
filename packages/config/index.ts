// Central Configuration, Feature Flags & Branding for JeevanSetu

export const BRANDING = {
  appName: "JeevanSetu",
  appTagline: "Connecting people to the right care",
  version: "1.0.0-sih-prototype",
  organization: "Public Health Care Access Network",
  contactEmergency: "108",
  contactHealthHelpline: "104",
  contactMaternalHelpline: "102",
  colors: {
    primaryTeal: "#0d9488",
    publicHealthBlue: "#0284c7",
    emergencyRed: "#dc2626",
    urgentAmber: "#ea580c",
    routineGreen: "#16a34a",
  }
};

export const FEATURE_FLAGS = {
  enableAIIntake: true,
  enableAssistedTeleconsult: true,
  enablePaperDocumentOCR: true,
  enableOfflineDexieSync: true,
  enableSignedQRVerification: true,
  enableFhirR4Adapter: true,
  enableAbdmMockAdapter: true,
  enableTravelAvoidedEstimate: true,
  enableMultilingualSelector: true,
};

export const DEMO_CREDENTIALS = [
  {
    role: "PATIENT",
    label: "Patient Demo (Anand Patil)",
    phone: "9820011001",
    password: "Password123!",
    description: "Rural farmer, Marathi speaker, severe knee pain, teleconsult follow-up",
    defaultPath: "/patient",
  },
  {
    role: "HEALTH_WORKER",
    label: "Health Worker Demo (Sunita Shinde - ASHA)",
    phone: "9820022002",
    password: "Password123!",
    description: "ASHA worker for Shirur Sub-centre, handles offline vitals & QR scans",
    defaultPath: "/worker",
  },
  {
    role: "DOCTOR",
    label: "Doctor Demo (Dr. Rajesh Deshmukh)",
    phone: "9820033003",
    password: "Password123!",
    description: "Orthopedic Specialist at Shirur Rural Hospital, handles queues & prescriptions",
    defaultPath: "/doctor",
  },
  {
    role: "FACILITY_ADMIN",
    label: "Facility Admin (Priya Kulkarni)",
    phone: "9820044004",
    password: "Password123!",
    description: "Medical Superintendent at Shirur Rural Hospital, manages inventory & queues",
    defaultPath: "/admin/facility",
  },
  {
    role: "SYSTEM_ADMIN",
    label: "System Admin (District Officer)",
    phone: "9820055005",
    password: "Password123!",
    description: "District Health Officer, district quality metrics & audit logs",
    defaultPath: "/admin/quality",
  },
];
