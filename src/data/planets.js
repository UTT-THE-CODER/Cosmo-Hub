export const planets = [
  {
    id: 'mercury',
    name: 'Mercury',
    description: 'A cratered world of extremes, with dramatic temperature swings and a quick orbit around the Sun.',
    gravity: 3.7,
    temperature: 'Day: 430°C | Night: -180°C',
    atmosphere: 'Thin exosphere of oxygen, sodium, hydrogen, helium, and magnesium',
    moons: 0,
    color: '#b8b4a9',
    ring: '#d1d5db',
    facts: [
      'A solar day on Mercury lasts longer than its year.',
      'Its surface is heavily cratered and resembles the Moon.',
      'Mercury has no true atmosphere to trap heat.'
    ],
  },
  {
    id: 'venus',
    name: 'Venus',
    description: 'Wrapped in dense clouds and a runaway greenhouse atmosphere, Venus is a furnace-like world.',
    gravity: 8.87,
    temperature: 'About 465°C average surface temperature',
    atmosphere: 'Mostly carbon dioxide with clouds of sulfuric acid',
    moons: 0,
    color: '#e6b980',
    ring: '#f7d7a5',
    facts: [
      'Venus rotates backward compared with most planets.',
      'Its thick atmosphere creates crushing pressure at the surface.',
      'A day on Venus is longer than a Venusian year.'
    ],
  },
  {
    id: 'earth',
    name: 'Earth',
    description: 'Our blue world, rich with liquid water, climate systems, and a balanced atmosphere.',
    gravity: 9.81,
    temperature: 'Average 15°C',
    atmosphere: 'Nitrogen, oxygen, argon, and trace gases',
    moons: 1,
    color: '#2eb3ff',
    ring: '#7dd3fc',
    facts: [
      'Earth is the only known world with surface liquid water.',
      'The magnetic field helps shield us from solar radiation.',
      'Earth’s atmosphere supports a temperate biosphere.'
    ],
  },
  {
    id: 'mars',
    name: 'Mars',
    description: 'A dusty desert planet with giant volcanoes, deep canyons, and a history of water.',
    gravity: 3.71,
    temperature: 'Average -63°C',
    atmosphere: 'Thin carbon dioxide atmosphere',
    moons: 2,
    color: '#d96c4a',
    ring: '#f4a261',
    facts: [
      'A Martian day is about 24 hours and 39 minutes.',
      'Mars hosts Olympus Mons, the tallest volcano in the Solar System.',
      'Its polar caps contain water ice and carbon dioxide ice.'
    ],
  },
  {
    id: 'jupiter',
    name: 'Jupiter',
    description: 'A giant world of storms, bands, and immense gravity that shapes the Solar System.',
    gravity: 24.79,
    temperature: 'Cloud tops around -110°C',
    atmosphere: 'Hydrogen and helium with ammonia clouds',
    moons: 95,
    color: '#d9b38c',
    ring: '#f5d7a1',
    facts: [
      'Jupiter is the largest planet in the Solar System.',
      'The Great Red Spot is a storm bigger than Earth.',
      'Its strong magnetic field is the largest of any planet.'
    ],
  },
  {
    id: 'saturn',
    name: 'Saturn',
    description: 'Famous for its brilliant rings, Saturn is a mesmerizing ice-and-gas giant.',
    gravity: 10.44,
    temperature: 'Cloud tops around -140°C',
    atmosphere: 'Hydrogen and helium with methane traces',
    moons: 146,
    color: '#e7d3a2',
    ring: '#f4e7b3',
    facts: [
      'Saturn’s rings are made mostly of ice particles and rock.',
      'It is less dense than water.',
      'Its moon Titan has a thick atmosphere and lakes of methane.'
    ],
  },
  {
    id: 'uranus',
    name: 'Uranus',
    description: 'A cold ice giant tipped nearly on its side, with a quiet but strange seasonal rhythm.',
    gravity: 8.69,
    temperature: 'Average -195°C',
    atmosphere: 'Hydrogen, helium, and methane',
    moons: 27,
    color: '#99d6ef',
    ring: '#d8f3ff',
    facts: [
      'Uranus rotates on its side relative to its orbit.',
      'Its blue-green color comes from methane in the atmosphere.',
      'It has one of the most extreme seasonal cycles in the Solar System.'
    ],
  },
  {
    id: 'neptune',
    name: 'Neptune',
    description: 'An immense blue outer planet with supersonic winds and deep atmospheric storms.',
    gravity: 11.15,
    temperature: 'Average -200°C',
    atmosphere: 'Hydrogen, helium, methane',
    moons: 14,
    color: '#3d7ae0',
    ring: '#9ec7ff',
    facts: [
      'Neptune has the fastest winds in the Solar System.',
      'It was discovered through mathematical prediction before direct observation.',
      'Its moon Triton orbits in the opposite direction of Neptune’s rotation.'
    ],
  }
];

export const defaultPlanet = planets[2];
