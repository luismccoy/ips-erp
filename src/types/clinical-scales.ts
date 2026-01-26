/**
 * Clinical Assessment Scales Types
 * 
 * TypeScript interfaces for standardized nursing assessment scales
 * required for RIPS compliance in Colombian healthcare (IPS).
 * 
 * Scales implemented:
 * - Glasgow Coma Scale (GCS) - Consciousness level
 * - Pain Scale (EVA) - Pain intensity
 * - Braden Scale - Pressure ulcer risk
 * - Morse Fall Scale - Fall risk
 * - NEWS/NEWS2 - Early warning deterioration
 * - Barthel Index - ADL independence
 * - Norton Scale - Pressure sore risk
 * - RASS - Sedation/agitation level
 * 
 * @version 1.0.0
 * @since Phase 4 - Clinical Assessment Scales
 */

// ============================================================================
// Alert Types
// ============================================================================

/**
 * Alert severity levels for clinical assessments.
 */
export type AlertLevel = 'INFO' | 'WARNING' | 'CRITICAL';

/**
 * Alert generated when assessment scores hit risk thresholds.
 */
export interface AssessmentAlert {
  /** Name of the scale that triggered the alert */
  scale: string;
  /** Severity level of the alert */
  level: AlertLevel;
  /** Human-readable alert message (Spanish) */
  message: string;
}

// ============================================================================
// Glasgow Coma Scale (GCS)
// ============================================================================

/**
 * Glasgow Coma Scale - Assesses level of consciousness.
 * Total score range: 3-15
 * 
 * Interpretation:
 * - 13-15: Mild injury
 * - 9-12: Moderate injury
 * - 3-8: Severe injury (CRITICAL alert)
 */
export interface GlasgowScore {
  /** Eye opening response (1-4) */
  eye: number;
  /** Verbal response (1-5) */
  verbal: number;
  /** Motor response (1-6) */
  motor: number;
  /** Total score (3-15, computed) */
  total: number;
}

/**
 * Glasgow eye opening response values
 */
export const GLASGOW_EYE = {
  NONE: 1,           // No response
  TO_PAIN: 2,        // Opens to painful stimuli
  TO_VOICE: 3,       // Opens to verbal command
  SPONTANEOUS: 4,    // Opens spontaneously
} as const;

/**
 * Glasgow verbal response values
 */
export const GLASGOW_VERBAL = {
  NONE: 1,           // No response
  INCOMPREHENSIBLE: 2, // Incomprehensible sounds
  INAPPROPRIATE: 3,  // Inappropriate words
  CONFUSED: 4,       // Confused conversation
  ORIENTED: 5,       // Oriented
} as const;

/**
 * Glasgow motor response values
 */
export const GLASGOW_MOTOR = {
  NONE: 1,           // No response
  EXTENSION: 2,      // Extension to pain
  FLEXION: 3,        // Abnormal flexion
  WITHDRAWAL: 4,     // Withdrawal from pain
  LOCALIZES: 5,      // Localizes pain
  OBEYS: 6,          // Obeys commands
} as const;

// ============================================================================
// Pain Scale (EVA)
// ============================================================================

/**
 * Pain intensity thresholds for alerts
 */
export const PAIN_THRESHOLDS = {
  NONE: 0,
  MILD_MAX: 3,
  MODERATE_MAX: 6,
  SEVERE_MIN: 7,
} as const;

// ============================================================================
// Braden Scale
// ============================================================================

/**
 * Braden Scale - Predicts pressure ulcer risk.
 * Total score range: 6-23 (lower = higher risk)
 * 
 * Interpretation:
 * - ≤9: Very high risk (CRITICAL)
 * - 10-12: High risk (WARNING)
 * - 13-14: Moderate risk (INFO)
 * - 15-18: Mild risk
 * - 19-23: No risk
 */
export interface BradenScore {
  /** Sensory perception (1-4) */
  sensoryPerception: number;
  /** Moisture (1-4) */
  moisture: number;
  /** Activity (1-4) */
  activity: number;
  /** Mobility (1-4) */
  mobility: number;
  /** Nutrition (1-4) */
  nutrition: number;
  /** Friction and shear (1-3) */
  frictionShear: number;
  /** Total score (6-23, computed) */
  total: number;
}

export const BRADEN_THRESHOLDS = {
  VERY_HIGH_RISK: 9,
  HIGH_RISK: 12,
  MODERATE_RISK: 14,
  MILD_RISK: 18,
} as const;

// ============================================================================
// Morse Fall Scale
// ============================================================================

/**
 * Morse Fall Scale - Assesses fall risk.
 * Total score range: 0-125
 * 
 * Interpretation:
 * - 0-24: Low risk
 * - 25-44: Moderate risk (WARNING)
 * - ≥45: High risk (CRITICAL)
 */
export interface MorseScore {
  /** History of falling (0 or 25) */
  historyOfFalling: number;
  /** Secondary diagnosis (0 or 15) */
  secondaryDiagnosis: number;
  /** Ambulatory aid (0, 15, or 30) */
  ambulatoryAid: number;
  /** IV/Heparin lock (0 or 20) */
  ivHeparinLock: number;
  /** Gait (0, 10, or 20) */
  gait: number;
  /** Mental status (0 or 15) */
  mentalStatus: number;
  /** Total score (0-125, computed) */
  total: number;
}

export const MORSE_THRESHOLDS = {
  LOW_RISK_MAX: 24,
  MODERATE_RISK_MAX: 44,
  HIGH_RISK_MIN: 45,
} as const;

// ============================================================================
// NEWS/NEWS2 (National Early Warning Score)
// ============================================================================

/**
 * NEWS/NEWS2 - Early detection of clinical deterioration.
 * Total score range: 0-20
 * 
 * Interpretation:
 * - 0-4: Low risk
 * - 5-6: Medium risk (WARNING)
 * - ≥7: High risk (CRITICAL - immediate escalation)
 */
export interface NEWSScore {
  /** Respiration rate score (0-3) */
  respirationRate: number;
  /** Oxygen saturation score (0-3) */
  oxygenSaturation: number;
  /** Supplemental oxygen (0-2) */
  supplementalO2: number;
  /** Temperature score (0-3) */
  temperature: number;
  /** Systolic BP score (0-3) */
  systolicBP: number;
  /** Heart rate score (0-3) */
  heartRate: number;
  /** Consciousness score (0-3) */
  consciousness: number;
  /** Total score (0-20, computed) */
  total: number;
}

export const NEWS_THRESHOLDS = {
  LOW_RISK_MAX: 4,
  MEDIUM_RISK_MAX: 6,
  HIGH_RISK_MIN: 7,
} as const;

// ============================================================================
// Barthel Index
// ============================================================================

/**
 * Barthel Index - Measures independence in Activities of Daily Living (ADL).
 * Total score range: 0-100
 * 
 * Interpretation:
 * - 0-20: Total dependence (CRITICAL)
 * - 21-60: Severe dependence (WARNING)
 * - 61-90: Moderate dependence (INFO)
 * - 91-99: Slight dependence
 * - 100: Independent
 */
export interface BarthelScore {
  /** Feeding (0, 5, 10) */
  feeding: number;
  /** Bathing (0, 5) */
  bathing: number;
  /** Grooming (0, 5) */
  grooming: number;
  /** Dressing (0, 5, 10) */
  dressing: number;
  /** Bowels (0, 5, 10) */
  bowels: number;
  /** Bladder (0, 5, 10) */
  bladder: number;
  /** Toilet use (0, 5, 10) */
  toiletUse: number;
  /** Transfers (0, 5, 10, 15) */
  transfers: number;
  /** Mobility (0, 5, 10, 15) */
  mobility: number;
  /** Stairs (0, 5, 10) */
  stairs: number;
  /** Total score (0-100, computed) */
  total: number;
}

export const BARTHEL_THRESHOLDS = {
  TOTAL_DEPENDENCE: 20,
  SEVERE_DEPENDENCE: 60,
  MODERATE_DEPENDENCE: 90,
  SLIGHT_DEPENDENCE: 99,
} as const;

// ============================================================================
// Norton Scale
// ============================================================================

/**
 * Norton Scale - Pressure sore risk assessment.
 * Total score range: 5-20 (lower = higher risk)
 * 
 * Interpretation:
 * - ≤14: High risk (CRITICAL)
 * - 15-16: Medium risk (WARNING)
 * - ≥17: Low risk
 */
export interface NortonScore {
  /** Physical condition (1-4) */
  physicalCondition: number;
  /** Mental condition (1-4) */
  mentalCondition: number;
  /** Activity (1-4) */
  activity: number;
  /** Mobility (1-4) */
  mobility: number;
  /** Incontinence (1-4) */
  incontinence: number;
  /** Total score (5-20, computed) */
  total: number;
}

export const NORTON_THRESHOLDS = {
  HIGH_RISK: 14,
  MEDIUM_RISK: 16,
} as const;

// ============================================================================
// RASS (Richmond Agitation-Sedation Scale)
// ============================================================================

/**
 * RASS score descriptions
 */
export const RASS_LEVELS = {
  '+4': 'Combativo - Violento, peligro para el personal',
  '+3': 'Muy agitado - Se arranca tubos, agresivo',
  '+2': 'Agitado - Movimientos frecuentes sin propósito',
  '+1': 'Inquieto - Ansioso pero no agresivo',
  '0': 'Alerta y tranquilo',
  '-1': 'Somnoliento - Despierta sostenidamente a la voz',
  '-2': 'Sedación ligera - Despierta brevemente a la voz',
  '-3': 'Sedación moderada - Movimiento a la voz, sin contacto visual',
  '-4': 'Sedación profunda - Movimiento a estimulación física',
  '-5': 'Sin respuesta - No responde a estímulos',
} as const;

// ============================================================================
// Patient Assessment Model
// ============================================================================

/**
 * Complete patient assessment record.
 * Contains all clinical assessment scales collected during a nursing visit.
 */
export interface PatientAssessment {
  /** Unique assessment identifier */
  id: string;
  /** Tenant (home care agency) identifier */
  tenantId: string;
  /** Patient identifier */
  patientId: string;
  /** Nurse who performed the assessment */
  nurseId: string;
  /** Assessment timestamp (ISO 8601) */
  assessedAt: string;
  
  // Clinical Assessment Scales (null if not assessed)
  /** Glasgow Coma Scale (consciousness) */
  glasgowScore?: GlasgowScore | null;
  /** Pain intensity (0-10) */
  painScore?: number | null;
  /** Braden Scale (pressure ulcer risk) */
  bradenScore?: BradenScore | null;
  /** Morse Fall Scale (fall risk) */
  morseScore?: MorseScore | null;
  /** NEWS/NEWS2 (early warning) */
  newsScore?: NEWSScore | null;
  /** Barthel Index (ADL independence) */
  barthelScore?: BarthelScore | null;
  /** Norton Scale (pressure sore risk) */
  nortonScore?: NortonScore | null;
  /** RASS (-5 to +4, sedation/agitation) */
  rassScore?: number | null;
  
  /** Generated alerts based on score thresholds */
  alerts?: AssessmentAlert[] | null;
  /** Clinical notes */
  notes?: string | null;
  /** Linked visit ID (optional) */
  visitId?: string | null;
  
  /** Record timestamps */
  createdAt?: string;
  updatedAt?: string;
}

// ============================================================================
// Score Calculation Utilities
// ============================================================================

/**
 * Calculate Glasgow total score from components.
 */
export function calculateGlasgowTotal(eye: number, verbal: number, motor: number): number {
  return eye + verbal + motor;
}

/**
 * Calculate Braden total score from components.
 */
export function calculateBradenTotal(score: Omit<BradenScore, 'total'>): number {
  return (
    score.sensoryPerception +
    score.moisture +
    score.activity +
    score.mobility +
    score.nutrition +
    score.frictionShear
  );
}

/**
 * Calculate Morse total score from components.
 */
export function calculateMorseTotal(score: Omit<MorseScore, 'total'>): number {
  return (
    score.historyOfFalling +
    score.secondaryDiagnosis +
    score.ambulatoryAid +
    score.ivHeparinLock +
    score.gait +
    score.mentalStatus
  );
}

/**
 * Calculate NEWS total score from components.
 */
export function calculateNEWSTotal(score: Omit<NEWSScore, 'total'>): number {
  return (
    score.respirationRate +
    score.oxygenSaturation +
    score.supplementalO2 +
    score.temperature +
    score.systolicBP +
    score.heartRate +
    score.consciousness
  );
}

/**
 * Calculate Barthel total score from components.
 */
export function calculateBarthelTotal(score: Omit<BarthelScore, 'total'>): number {
  return (
    score.feeding +
    score.bathing +
    score.grooming +
    score.dressing +
    score.bowels +
    score.bladder +
    score.toiletUse +
    score.transfers +
    score.mobility +
    score.stairs
  );
}

/**
 * Calculate Norton total score from components.
 */
export function calculateNortonTotal(score: Omit<NortonScore, 'total'>): number {
  return (
    score.physicalCondition +
    score.mentalCondition +
    score.activity +
    score.mobility +
    score.incontinence
  );
}

// ============================================================================
// Alert Generation
// ============================================================================

/**
 * Generate alerts based on assessment scores.
 * Returns an array of alerts for scores that hit risk thresholds.
 */
export function generateAssessmentAlerts(assessment: Partial<PatientAssessment>): AssessmentAlert[] {
  const alerts: AssessmentAlert[] = [];
  
  // Glasgow (lower = worse)
  if (assessment.glasgowScore) {
    const total = assessment.glasgowScore.total;
    if (total <= 8) {
      alerts.push({
        scale: 'Glasgow',
        level: 'CRITICAL',
        message: `Glasgow ${total}/15 - Lesión cerebral severa, requiere atención inmediata`,
      });
    } else if (total <= 12) {
      alerts.push({
        scale: 'Glasgow',
        level: 'WARNING',
        message: `Glasgow ${total}/15 - Lesión cerebral moderada`,
      });
    }
  }
  
  // Pain (higher = worse)
  if (assessment.painScore !== null && assessment.painScore !== undefined) {
    if (assessment.painScore >= PAIN_THRESHOLDS.SEVERE_MIN) {
      alerts.push({
        scale: 'Dolor (EVA)',
        level: 'CRITICAL',
        message: `Dolor severo ${assessment.painScore}/10 - Requiere intervención inmediata`,
      });
    } else if (assessment.painScore >= PAIN_THRESHOLDS.MILD_MAX + 1) {
      alerts.push({
        scale: 'Dolor (EVA)',
        level: 'WARNING',
        message: `Dolor moderado ${assessment.painScore}/10`,
      });
    }
  }
  
  // Braden (lower = higher risk)
  if (assessment.bradenScore) {
    const total = assessment.bradenScore.total;
    if (total <= BRADEN_THRESHOLDS.VERY_HIGH_RISK) {
      alerts.push({
        scale: 'Braden',
        level: 'CRITICAL',
        message: `Braden ${total}/23 - Riesgo muy alto de úlceras por presión`,
      });
    } else if (total <= BRADEN_THRESHOLDS.HIGH_RISK) {
      alerts.push({
        scale: 'Braden',
        level: 'WARNING',
        message: `Braden ${total}/23 - Alto riesgo de úlceras por presión`,
      });
    } else if (total <= BRADEN_THRESHOLDS.MODERATE_RISK) {
      alerts.push({
        scale: 'Braden',
        level: 'INFO',
        message: `Braden ${total}/23 - Riesgo moderado de úlceras por presión`,
      });
    }
  }
  
  // Morse (higher = higher risk)
  if (assessment.morseScore) {
    const total = assessment.morseScore.total;
    if (total >= MORSE_THRESHOLDS.HIGH_RISK_MIN) {
      alerts.push({
        scale: 'Morse',
        level: 'CRITICAL',
        message: `Morse ${total}/125 - Alto riesgo de caídas, implementar protocolo`,
      });
    } else if (total > MORSE_THRESHOLDS.LOW_RISK_MAX) {
      alerts.push({
        scale: 'Morse',
        level: 'WARNING',
        message: `Morse ${total}/125 - Riesgo moderado de caídas`,
      });
    }
  }
  
  // NEWS (higher = worse)
  if (assessment.newsScore) {
    const total = assessment.newsScore.total;
    if (total >= NEWS_THRESHOLDS.HIGH_RISK_MIN) {
      alerts.push({
        scale: 'NEWS',
        level: 'CRITICAL',
        message: `NEWS ${total}/20 - Deterioro clínico, escalamiento inmediato requerido`,
      });
    } else if (total >= NEWS_THRESHOLDS.LOW_RISK_MAX + 1) {
      alerts.push({
        scale: 'NEWS',
        level: 'WARNING',
        message: `NEWS ${total}/20 - Riesgo medio de deterioro clínico`,
      });
    }
  }
  
  // Barthel (lower = more dependent)
  if (assessment.barthelScore) {
    const total = assessment.barthelScore.total;
    if (total <= BARTHEL_THRESHOLDS.TOTAL_DEPENDENCE) {
      alerts.push({
        scale: 'Barthel',
        level: 'CRITICAL',
        message: `Barthel ${total}/100 - Dependencia total, requiere cuidado continuo`,
      });
    } else if (total <= BARTHEL_THRESHOLDS.SEVERE_DEPENDENCE) {
      alerts.push({
        scale: 'Barthel',
        level: 'WARNING',
        message: `Barthel ${total}/100 - Dependencia severa`,
      });
    } else if (total <= BARTHEL_THRESHOLDS.MODERATE_DEPENDENCE) {
      alerts.push({
        scale: 'Barthel',
        level: 'INFO',
        message: `Barthel ${total}/100 - Dependencia moderada`,
      });
    }
  }
  
  // Norton (lower = higher risk)
  if (assessment.nortonScore) {
    const total = assessment.nortonScore.total;
    if (total <= NORTON_THRESHOLDS.HIGH_RISK) {
      alerts.push({
        scale: 'Norton',
        level: 'CRITICAL',
        message: `Norton ${total}/20 - Alto riesgo de escaras`,
      });
    } else if (total <= NORTON_THRESHOLDS.MEDIUM_RISK) {
      alerts.push({
        scale: 'Norton',
        level: 'WARNING',
        message: `Norton ${total}/20 - Riesgo medio de escaras`,
      });
    }
  }
  
  // RASS (extremes are concerning)
  if (assessment.rassScore !== null && assessment.rassScore !== undefined) {
    if (assessment.rassScore >= 3) {
      alerts.push({
        scale: 'RASS',
        level: 'CRITICAL',
        message: `RASS +${assessment.rassScore} - Agitación severa, riesgo para paciente y personal`,
      });
    } else if (assessment.rassScore <= -4) {
      alerts.push({
        scale: 'RASS',
        level: 'CRITICAL',
        message: `RASS ${assessment.rassScore} - Sedación profunda, monitoreo requerido`,
      });
    } else if (assessment.rassScore >= 2 || assessment.rassScore <= -3) {
      alerts.push({
        scale: 'RASS',
        level: 'WARNING',
        message: `RASS ${assessment.rassScore > 0 ? '+' : ''}${assessment.rassScore} - Nivel de sedación/agitación a monitorear`,
      });
    }
  }
  
  return alerts;
}

// ============================================================================
// Risk Level Utilities
// ============================================================================

export type RiskLevel = 'none' | 'low' | 'moderate' | 'high' | 'critical';

/**
 * Get risk level from Glasgow score.
 */
export function getGlasgowRiskLevel(total: number): RiskLevel {
  if (total <= 8) return 'critical';
  if (total <= 12) return 'high';
  return 'low';
}

/**
 * Get risk level from Braden score.
 */
export function getBradenRiskLevel(total: number): RiskLevel {
  if (total <= 9) return 'critical';
  if (total <= 12) return 'high';
  if (total <= 14) return 'moderate';
  if (total <= 18) return 'low';
  return 'none';
}

/**
 * Get risk level from Morse score.
 */
export function getMorseRiskLevel(total: number): RiskLevel {
  if (total >= 45) return 'critical';
  if (total >= 25) return 'moderate';
  return 'low';
}

/**
 * Get risk level from NEWS score.
 */
export function getNEWSRiskLevel(total: number): RiskLevel {
  if (total >= 7) return 'critical';
  if (total >= 5) return 'moderate';
  return 'low';
}

/**
 * Get risk level from Barthel score.
 */
export function getBarthelRiskLevel(total: number): RiskLevel {
  if (total <= 20) return 'critical';
  if (total <= 60) return 'high';
  if (total <= 90) return 'moderate';
  if (total <= 99) return 'low';
  return 'none';
}

/**
 * Get risk level from Norton score.
 */
export function getNortonRiskLevel(total: number): RiskLevel {
  if (total <= 14) return 'critical';
  if (total <= 16) return 'moderate';
  return 'low';
}

// ============================================================================
// Default Values
// ============================================================================

export const DEFAULT_GLASGOW: GlasgowScore = {
  eye: 4,
  verbal: 5,
  motor: 6,
  total: 15,
};

export const DEFAULT_BRADEN: BradenScore = {
  sensoryPerception: 4,
  moisture: 4,
  activity: 4,
  mobility: 4,
  nutrition: 4,
  frictionShear: 3,
  total: 23,
};

export const DEFAULT_MORSE: MorseScore = {
  historyOfFalling: 0,
  secondaryDiagnosis: 0,
  ambulatoryAid: 0,
  ivHeparinLock: 0,
  gait: 0,
  mentalStatus: 0,
  total: 0,
};

export const DEFAULT_NEWS: NEWSScore = {
  respirationRate: 0,
  oxygenSaturation: 0,
  supplementalO2: 0,
  temperature: 0,
  systolicBP: 0,
  heartRate: 0,
  consciousness: 0,
  total: 0,
};

export const DEFAULT_BARTHEL: BarthelScore = {
  feeding: 10,
  bathing: 5,
  grooming: 5,
  dressing: 10,
  bowels: 10,
  bladder: 10,
  toiletUse: 10,
  transfers: 15,
  mobility: 15,
  stairs: 10,
  total: 100,
};

export const DEFAULT_NORTON: NortonScore = {
  physicalCondition: 4,
  mentalCondition: 4,
  activity: 4,
  mobility: 4,
  incontinence: 4,
  total: 20,
};
