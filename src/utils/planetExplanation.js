export function generatePlanetExplanation({
  gravityPercent,
  oxygen,
  pressure,
  distanceFromStar,
  rotationSpeed,
  averageTemperature,
  atmosphere,
}) {
  const sentences = [];

  if (gravityPercent > 150) {
    sentences.push('High gravity would make every step feel significantly heavier, increasing the strain on movement and structure design.');
  } else if (gravityPercent < 70) {
    sentences.push('Lower gravity would make the surface feel lighter, reducing weight but also changing how atmosphere and terrain interact.');
  }

  if (oxygen < 15) {
    sentences.push('Oxygen levels are low enough to create breathing difficulties without special equipment or carefully managed habitats.');
  } else if (oxygen > 30) {
    sentences.push('Higher oxygen concentration could make the atmosphere more reactive and may increase fire risk in warm, dry conditions.');
  }

  if (pressure > 120) {
    sentences.push('This atmospheric pressure is quite substantial, meaning the air would feel dense and could press on living systems and equipment.');
  } else if (pressure < 40) {
    sentences.push('Lower pressure would mean a thinner atmosphere and more difficulty retaining heat or keeping a breathable environment stable.');
  }

  if (distanceFromStar < 35) {
    sentences.push('The planet is relatively close to its star, so it would receive stronger incoming stellar energy and likely experience more intense heating.');
  } else if (distanceFromStar > 90) {
    sentences.push('A larger distance from the star would leave the planet cooler and may reduce the chance of liquid water at the surface.');
  }

  if (rotationSpeed < 40) {
    sentences.push('A slower rotation would lengthen each day, causing hotter and colder regions to persist for longer and changing weather patterns.');
  } else if (rotationSpeed > 80) {
    sentences.push('A faster rotation would reduce daylight extremes and can create more even surface temperature distributions.');
  }

  if (averageTemperature > 30) {
    sentences.push('Higher average temperatures suggest a warmer climate, which can encourage evaporation and more active atmospheric circulation.');
  } else if (averageTemperature < 0) {
    sentences.push('Lower temperatures would likely create icy conditions and reduce surface liquid availability.');
  }

  if (atmosphere === 'thick') {
    sentences.push('A thicker atmosphere could trap more heat and influence the surface climate in a stronger way than a thin atmosphere.');
  }

  if (sentences.length === 0) {
    return 'This world sits in a balanced regime, with moderate atmospheric and thermal conditions that make it a useful candidate for experimental comparison.';
  }

  return sentences.slice(0, 3).join(' ');
}
