import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { RotateCcw, Save, Sparkles, Trash2 } from 'lucide-react';
import { Button } from '../components/common/Button';
import SectionHeader from '../components/common/SectionHeader';
import { storageService } from '../services/storageService';
import { calculateGravity, calculateGravityEarthPercent, calculateHabitabilityScore, calculateDayLength, interpretAtmosphere, interpretTemperature, formatGravity } from '../utils/planetCalculations';
import { generatePlanetExplanation } from '../utils/planetExplanation';
import { evaluateHabitability } from '../utils/habitability';

const defaultState = {
  name: 'Nova Terra',
  radius: 6371,
  mass: 1,
  pressure: 101,
  oxygen: 21,
  carbonDioxide: 0.04,
  nitrogen: 78,
  temperature: 15,
  distanceFromStar: 150,
  rotationSpeed: 100,
  waterCoverage: 55,
  magneticField: 75,
  atmosphere: 'balanced',
};

const presets = [
  { label: 'Gravity +50%', changes: { mass: 1.5 } },
  { label: 'Lower Oxygen', changes: { oxygen: 10 } },
  { label: 'Move Closer to Star', changes: { distanceFromStar: 60 } },
  { label: 'Slow Rotation', changes: { rotationSpeed: 30 } },
  { label: 'Increase Atmospheric Pressure', changes: { pressure: 150 } },
];

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

export default function PlanetLab() {
  const [planet, setPlanet] = useState(defaultState);
  const [savedPlanets, setSavedPlanets] = useState([]);

  useEffect(() => {
    setSavedPlanets(storageService.getSavedPlanets());
  }, []);

  const gravity = useMemo(() => calculateGravity(planet.mass, planet.radius), [planet.mass, planet.radius]);
  const gravityPercent = useMemo(() => calculateGravityEarthPercent(gravity), [gravity]);
  const dayLength = useMemo(() => calculateDayLength(planet.rotationSpeed), [planet.rotationSpeed]);
  const atmosphericInterpretation = useMemo(
    () => interpretAtmosphere(planet.pressure, planet.oxygen, planet.carbonDioxide, planet.nitrogen),
    [planet.pressure, planet.oxygen, planet.carbonDioxide, planet.nitrogen],
  );
  const temperatureInterpretation = useMemo(
    () => interpretTemperature(planet.temperature, planet.distanceFromStar),
    [planet.temperature, planet.distanceFromStar],
  );
  const habitability = useMemo(
    () => evaluateHabitability({
      temperature: planet.temperature,
      pressure: planet.pressure,
      oxygen: planet.oxygen,
      waterCoverage: planet.waterCoverage,
      magneticField: planet.magneticField,
      gravityPercent,
    }),
    [planet.temperature, planet.pressure, planet.oxygen, planet.waterCoverage, planet.magneticField, gravityPercent],
  );
  const explanation = useMemo(
    () => generatePlanetExplanation({
      gravityPercent,
      oxygen: planet.oxygen,
      pressure: planet.pressure,
      distanceFromStar: planet.distanceFromStar,
      rotationSpeed: planet.rotationSpeed,
      averageTemperature: planet.temperature,
      atmosphere: planet.atmosphere,
    }),
    [gravityPercent, planet.oxygen, planet.pressure, planet.distanceFromStar, planet.rotationSpeed, planet.temperature, planet.atmosphere],
  );

  const updatePlanet = (key, value) => {
    setPlanet((prev) => ({ ...prev, [key]: Number(value) }));
  };

  const applyPreset = (preset) => {
    setPlanet((prev) => ({ ...prev, ...preset.changes }));
  };

  const savePlanet = () => {
    const item = {
      id: `${planet.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
      name: planet.name,
      color: '#5eead4',
      gravityPercent,
      description: explanation,
    };
    const next = [...savedPlanets, item];
    setSavedPlanets(next);
    storageService.setSavedPlanets(next);
  };

  const resetPlanet = () => setPlanet(defaultState);

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.35 }}
      className="space-y-8"
    >
      <SectionHeader
        eyebrow="Planet Lab"
        title="Create a hypothetical planet"
        text="Tune the environment, observe the physics, and ask what would happen with a different world."
      />

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="glass-panel rounded-[1.8rem] border border-slate-700/80 p-5">
          <div className="mb-5 flex items-center justify-between gap-3">
            <input
              value={planet.name}
              onChange={(e) => setPlanet((prev) => ({ ...prev, name: e.target.value }))}
              className="rounded-full border border-slate-700 bg-slate-900/60 px-4 py-2 text-lg font-semibold text-slate-50 placeholder:text-slate-500 focus:outline-none"
              aria-label="Planet name"
            />
            <div className="flex gap-2">
              <Button variant="secondary" onClick={resetPlanet} className="gap-2 px-3 py-2 text-sm">
                <RotateCcw size={15} /> Reset
              </Button>
              <Button onClick={savePlanet} className="gap-2 px-3 py-2 text-sm">
                <Save size={15} /> Save
              </Button>
            </div>
          </div>

          <div className="rounded-[1.8rem] border border-slate-700/70 bg-[radial-gradient(circle_at_center,_rgba(139,92,246,0.15),_transparent_30%),linear-gradient(180deg,_rgba(15,23,42,0.9),_rgba(2,6,23,0.95))] p-5">
            <div className="relative mx-auto flex h-[320px] max-w-[320px] items-center justify-center overflow-hidden rounded-full">
              <div className="absolute inset-6 rounded-full border border-cyan-500/40" />
              <div
                className="relative h-44 w-44 rounded-full border border-white/15 transition-all duration-300"
                style={{
                  background: `radial-gradient(circle at 30% 30%, rgba(255,255,255,0.8), rgba(34,211,238,0.6) 20%, rgba(59,130,246,0.7) 45%, rgba(15,23,42,0.9) 100%)`,
                  boxShadow: `0 0 ${planet.magneticField / 5}px rgba(34,211,238,0.8)`,
                  transform: `scale(${1 + (planet.radius / 10000) * 0.8}) rotate(${planet.rotationSpeed * 3}deg)`,
                  filter: `saturate(${1 + planet.oxygen / 30}) brightness(${0.8 + planet.temperature / 200})`,
                }}
              >
                <div
                  className="absolute inset-3 rounded-full border border-white/10"
                  style={{
                    background: `linear-gradient(180deg, rgba(255,255,255,${0.18 + planet.waterCoverage / 250}), rgba(84,196,255,${0.18 + planet.waterCoverage / 220}))`,
                    opacity: `${0.22 + planet.waterCoverage / 100}`,
                  }}
                />
              </div>
              <div
                className="absolute h-52 w-52 rounded-full border border-cyan-300/30"
                style={{ boxShadow: `0 0 ${planet.magneticField * 1.2}px rgba(34,211,238,0.25)` }}
              />
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-slate-700 bg-slate-900/40 p-4">
              <div className="text-xs uppercase tracking-[0.28em] text-slate-400">Gravity</div>
              <div className="mt-2 text-3xl font-semibold text-cyan-300">{formatGravity(gravity)}</div>
              <div className="mt-1 text-sm text-slate-300">{gravityPercent}% of Earth gravity</div>
            </div>
            <div className="rounded-2xl border border-slate-700 bg-slate-900/40 p-4">
              <div className="text-xs uppercase tracking-[0.28em] text-slate-400">Day Length</div>
              <div className="mt-2 text-3xl font-semibold text-violet-300">{dayLength}h</div>
              <div className="mt-1 text-sm text-slate-300">Based on rotation speed</div>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 text-sm text-amber-100">
            Cosmos Hub's planet simulation uses simplified educational estimates. Real planetary climate, atmosphere, and habitability depend on many interacting variables and cannot be determined from this simulator alone.
          </div>
        </div>

        <div className="space-y-5">
          <div className="glass-panel rounded-[1.6rem] border border-slate-700/80 p-5">
            <h3 className="mb-4 text-lg font-semibold text-cyan-300">What if presets</h3>
            <div className="space-y-2">
              {presets.map((preset) => (
                <button
                  key={preset.label}
                  onClick={() => applyPreset(preset)}
                  className="flex w-full items-center justify-between rounded-xl border border-slate-700 bg-slate-900/60 px-3 py-2.5 text-left text-sm text-slate-200 transition hover:border-cyan-400"
                >
                  <span>{preset.label}</span>
                  <span className="text-cyan-300">Apply</span>
                </button>
              ))}
            </div>
          </div>

          <div className="glass-panel rounded-[1.6rem] border border-slate-700/80 p-5">
            <h3 className="mb-4 text-lg font-semibold text-violet-300">Live calculations</h3>
            <div className="space-y-4">
              {[
                { label: 'Planet radius', key: 'radius', value: planet.radius, min: 1000, max: 15000, unit: 'km' },
                { label: 'Planet mass', key: 'mass', value: planet.mass, min: 0.2, max: 5, step: 0.1, unit: 'Earth masses' },
                { label: 'Atmospheric pressure', key: 'pressure', value: planet.pressure, min: 10, max: 180, unit: 'kPa' },
                { label: 'Oxygen %', key: 'oxygen', value: planet.oxygen, min: 0, max: 40, unit: '%' },
                { label: 'CO₂ %', key: 'carbonDioxide', value: planet.carbonDioxide, min: 0, max: 100, step: 0.1, unit: '%' },
                { label: 'Nitrogen %', key: 'nitrogen', value: planet.nitrogen, min: 0, max: 100, unit: '%' },
                { label: 'Average temperature', key: 'temperature', value: planet.temperature, min: -80, max: 80, unit: '°C' },
                { label: 'Distance from star', key: 'distanceFromStar', value: planet.distanceFromStar, min: 20, max: 200, unit: 'AU' },
                { label: 'Rotation speed', key: 'rotationSpeed', value: planet.rotationSpeed, min: 10, max: 120, unit: '%' },
                { label: 'Water coverage', key: 'waterCoverage', value: planet.waterCoverage, min: 0, max: 100, unit: '%' },
                { label: 'Magnetic field', key: 'magneticField', value: planet.magneticField, min: 0, max: 100, unit: '%' },
              ].map((slider) => (
                <div key={slider.key}>
                  <div className="mb-1 flex items-center justify-between text-sm text-slate-300">
                    <label htmlFor={slider.key}>{slider.label}</label>
                    <span>{slider.value}{slider.unit}</span>
                  </div>
                  <input
                    id={slider.key}
                    type="range"
                    className="slider h-2 w-full cursor-pointer rounded-full"
                    min={slider.min}
                    max={slider.max}
                    step={slider.step ?? 1}
                    value={slider.value}
                    onChange={(e) => updatePlanet(slider.key, e.target.value)}
                    aria-label={slider.label}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="glass-panel rounded-[1.6rem] border border-slate-700/80 p-5">
            <h3 className="text-lg font-semibold text-cyan-300">Simplified educational estimate</h3>
            <div className="mt-3 h-3 w-full overflow-hidden rounded-full bg-slate-800">
              <div
                className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-violet-400 to-blue-500"
                style={{ width: `${habitability.score}%` }}
              />
            </div>
            <p className="mt-3 text-xl font-semibold text-slate-50">{habitability.score}/100</p>
            <p className="mt-2 text-sm text-slate-300">{habitability.label} — {habitability.text}</p>
            <div className="mt-4 space-y-3 text-sm text-slate-300">
              <p><span className="text-slate-400">Atmosphere:</span> {atmosphericInterpretation}</p>
              <p><span className="text-slate-400">Temperature:</span> {temperatureInterpretation}</p>
              <p><span className="text-slate-400">Explanation:</span> {explanation}</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
