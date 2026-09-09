from schemas import TriageRequest, TriageResponse

EMERGENCY_RED_FLAGS = [
    "chest pain", "heart attack", "difficulty breathing", "cannot breathe",
    "severe burn", "unconscious", "fainted", "seizure", "convulsions",
    "coughing blood", "paralysis", "slurred speech", "uncontrolled bleeding",
    "head injury", "poison", "snake bite", "छातीत दुखणे", "श्वास घेण्यास त्रास",
    "बेहोश", "छाती में दर्द", "सांस लेने में तकलीफ", "सांप का काटना"
]

def evaluate_triage(req: TriageRequest) -> TriageResponse:
    query = req.symptoms.lower().strip()

    # 1. Emergency Red Flags
    for flag in EMERGENCY_RED_FLAGS:
        if flag in query:
            return TriageResponse(
                urgency="emergency",
                urgency_reason=f'Critical red-flag symptom detected: "{flag}". High risk of acute life-threatening condition.',
                recommended_department="Emergency Medicine / Trauma & Intensive Care",
                recommended_service_type="EMERGENCY_CARE",
                confidence=0.98,
                requires_human_review=True,
                escalation_required=True,
                user_facing_advice="These symptoms may indicate a medical emergency. Please contact emergency ambulance 108 immediately or proceed directly to the nearest 24x7 emergency hospital.",
                facility_requirements=["24x7 Emergency", "Oxygen & ICU", "Blood Bank"]
            )

    # 2. Orthopedics / Knee Pain / Travel Difficulty (Hero Journey Case)
    ortho_keywords = ["knee", "joint", "bone", "walking", "travel", "fracture", "गुडघा", "सांधेदुखी", "घुटने", "जोड़ों का दर्द"]
    if any(k in query for k in ortho_keywords):
        return TriageResponse(
            urgency="urgent",
            urgency_reason="Severe musculoskeletal distress identified with reported difficulty in traveling long distance. Teleconsultation recommended to prevent travel burden.",
            recommended_department="Orthopedics",
            recommended_service_type="TELECONSULT",
            confidence=0.92,
            requires_human_review=True,
            escalation_required=False,
            user_facing_advice="I found public facilities that can help because they have an Orthopedics department. Since traveling is difficult, an assisted teleconsultation can connect you with an Orthopedic specialist today.",
            facility_requirements=["Orthopedics Department", "Teleconsultation Facility", "Digital X-Ray"]
        )

    # 3. Maternal / Antenatal Care
    maternal_keywords = ["pregnant", "delivery", "antenatal", "baby kicking", "गर्भवती", "गरोदर", "प्रसूती"]
    if any(k in query for k in maternal_keywords):
        return TriageResponse(
            urgency="urgent",
            urgency_reason="Antenatal care assessment required to safeguard maternal and neonatal health.",
            recommended_department="Gynecology & Obstetrics",
            recommended_service_type="IN_PERSON_PHC",
            confidence=0.89,
            requires_human_review=True,
            escalation_required=False,
            user_facing_advice="Please visit your nearest Primary Health Centre (PHC) or Sub-centre for complete antenatal screening, maternal vital signs, and ultrasound referral.",
            facility_requirements=["Maternal & Child Health", "Delivery Room", "Ultrasound Lab"]
        )

    # 4. Pediatric Care
    pediatric_keywords = ["child", "infant", "newborn", "baby", "बालक", "लहान मूल", "बच्चा"]
    if any(k in query for k in pediatric_keywords):
        return TriageResponse(
            urgency="urgent",
            urgency_reason="Pediatric evaluation recommended for specialized child healthcare.",
            recommended_department="Pediatrics",
            recommended_service_type="IN_PERSON_PHC",
            confidence=0.88,
            requires_human_review=True,
            escalation_required=False,
            user_facing_advice="Please bring your child to a Primary Health Centre or Rural Hospital with pediatric clinical support.",
            facility_requirements=["Pediatric Care", "Immunization", "Cold Chain Storage"]
        )

    # 5. Routine / General Primary Care
    general_keywords = ["fever", "cold", "cough", "headache", "stomach", "vomiting", "ताप", "खोकला", "डोकेदुखी", "बुखार", "सिरदर्द"]
    if any(k in query for k in general_keywords):
        return TriageResponse(
            urgency="routine",
            urgency_reason="Acute primary care symptoms suitable for outpatient evaluation at local PHC or Sub-centre.",
            recommended_department="General Medicine / Outpatient OPD",
            recommended_service_type="IN_PERSON_PHC",
            confidence=0.85,
            requires_human_review=True,
            escalation_required=False,
            user_facing_advice="Your symptoms can be evaluated at your local Primary Health Centre (PHC) or Sub-centre by a medical officer or community health worker.",
            facility_requirements=["Outpatient Clinic", "Basic Diagnostic Lab", "Pharmacy"]
        )

    # 6. Uncertainty Fallback (Explicit safe human-in-the-loop escalation)
    return TriageResponse(
        urgency="routine",
        urgency_reason="Symptoms need in-person clinical clarification. Referred to local ASHA or Community Health Officer.",
        recommended_department="General Outpatient OPD",
        recommended_service_type="IN_PERSON_PHC",
        confidence=0.65,
        requires_human_review=True,
        escalation_required=False,
        user_facing_advice="We cannot definitively evaluate these symptoms online. Please speak with your local ASHA worker or visit the nearest Primary Health Centre.",
        facility_requirements=["General OPD", "Community Health Worker"]
    )
