const G = 6.67430e-11;

export function calculateGravity(mass, radius) {
  const radiusMeters = radius * 1000;
  const gravity = (G * mass * 5.972e24) / (radiusMeters ** 2);
  return Number(gravity.toFixed(2));
}

export function calculateGravityEarthPercent(gravity) {
  return Number(((gravity / 9.81) * 100).toFixed(1));
}

export function calculateDayLength(rotationSpeed) {
  const hours = 24 / (rotationSpeed / 100);
  return Number(Math.max(6, Math.min(168, hours)).toFixed(1));
}

export function interpretAtmosphere(pressure, oxygen, carbonDioxide, nitrogen) {
  if (pressure > 120 && oxygen > 25) {
    return 'Dense oxygen-rich atmosphere could feel heavy and could support more complex chemistry.';
  }
  if (oxygen < 15) {
    return 'Lower oxygen means breathing would be difficult without protective equipment or pressure support.';
  }
  if (carbonDioxide > 35) {
    return 'High carbon dioxide increases greenhouse potential and can amplify warming in a closed atmosphere.';
  }
  if (nitrogen > 60) {
    return 'High nitrogen levels suggest a broad atmospheric composition with lower oxygen concentration.';
  }
  return 'A balanced atmospheric mix may support complex weather patterns and moderate surface chemistry.';
}

export function interpretTemperature(avgTemperature, distanceFromStar) {
  if (distanceFromStar < 35 && avgTemperature > 25) {
    return 'A close orbit and elevated temperature suggest a warm environment with strong solar heating.';
  }
  if (avgTemperature < -30) {
    return 'Very low temperatures imply frozen surface conditions and limited liquid water potential.';
  }
  if (avgTemperature > 40) {
    return 'High average temperatures imply strong thermal stress and more active atmospheric dynamics.';
  }
  return 'Moderate temperatures could allow a wider range of surface processes and seasonal variation.';
}

export function calculateHabitabilityScore({ temperature, pressure, oxygen, waterCoverage, magneticField, gravityPercent }) {
  let score = 50;
  score += (temperature >= 0 && temperature <= 30) ? 18 : temperature > 0 ? 6 : -10;
  score += (pressure >= 40 && pressure <= 140) ? 12 : -8;
  score += (oxygen >= 15 && oxygen <= 30) ? 15 : oxygen < 15 ? -15 : -10;
  score += (waterCoverage >= 20 && waterCoverage <= 80) ? 12 : -8;
  score += (magneticField >= 50 && magneticField <= 90) ? 10 : -6;
  score += (gravityPercent >= 60 && gravityPercent <= 160) ? 14 : -12;
  return Math.max(0, Math.min(100, score));
}

export function formatGravity(gravity) {
  return `${gravity.toFixed(2)} m/s²`;
}
