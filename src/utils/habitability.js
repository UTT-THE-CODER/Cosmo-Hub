import { calculateHabitabilityScore } from './planetCalculations';

export function getHabitabilityStatus(score) {
  if (score >= 75) return { label: 'Strong potential', text: 'This world shows a balanced mix of temperature, pressure, and atmospheric conditions.' };
  if (score >= 50) return { label: 'Moderate potential', text: 'The environment may support some liquid water or stable weather patterns, but it is not fully stable.' };
  if (score >= 25) return { label: 'Challenging conditions', text: 'Several environmental factors would strongly limit long-term surface stability.' };
  return { label: 'Extreme conditions', text: 'The environment is likely too harsh or chemically unstable for comfortable surface conditions.' };
}

export function evaluateHabitability(planetState) {
  const score = calculateHabitabilityScore({
    temperature: planetState.temperature,
    pressure: planetState.pressure,
    oxygen: planetState.oxygen,
    waterCoverage: planetState.waterCoverage,
    magneticField: planetState.magneticField,
    gravityPercent: planetState.gravityPercent,
  });

  return {
    score,
    ...getHabitabilityStatus(score),
  };
}
