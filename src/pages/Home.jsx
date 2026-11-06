import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Compass, Orbit, Sparkles, Map, Telescope, Beaker, Newspaper, Quote, UserRound, Layers } from 'lucide-react';
import { Link } from 'react-router-dom';
import { planets, defaultPlanet } from '../data/planets';
import { cosmicFacts } from '../data/facts';
import { Button } from '../components/common/Button';
import SectionHeader from '../components/common/SectionHeader';
import SolarSystemScene from '../components/solar-system/SolarSystemScene';

function SolarSystemMap() {
  const [selected, setSelected] = useState(defaultPlanet.id);
  const activePlanet = planets.find((planet) => planet.id === selected) || planets[0];

  return (
    <section className="solar-system-panel">
      <div className="solar-system-frame">
        <SolarSystemScene selectedPlanetId={selected} onPlanetSelect={setSelected} />
      </div>

      <div className="solar-system-controls">
        {planets.map((planet) => (
          <button
            key={planet.id}
            onClick={() => setSelected(planet.id)}
            className={`planet-chip ${selected === planet.id ? 'planet-chip-active' : ''}`}
          >
            {planet.name}
          </button>
        ))}
      </div>

      <div className="selected-world-card">
        <div className="selected-world-title">
          <div>
            <span className="section-kicker small-kicker">Selected world</span>
            <h3>{activePlanet.name}</h3>
          </div>
          <div className="selected-world-orbit">
            <span className="selected-world-swatch" style={{ background: `radial-gradient(circle at 30% 30%, #fff, ${activePlanet.color})` }} />
          </div>
        </div>
        <p>{activePlanet.description}</p>
        <Link to="/discover" className="inline-link">
          Explore details <ArrowRight size={16} />
        </Link>
      </div>
    </section>
  );
}

export default function Home() {
  const fact = useMemo(() => cosmicFacts[0], []);

  const featureCards = [
    { icon: <Compass size={20} />, title: 'Discover', description: 'Learn the stories, atmosphere, and scale of the planets around our star.', tone: 'cyan' },
    { icon: <Sparkles size={20} />, title: 'Experiment', description: 'Tune temperature, gravity, atmosphere, and water to see a world change in real time.', tone: 'violet' },
    { icon: <Orbit size={20} />, title: 'Predict', description: 'Read explanations and quantified estimates for habitability, climate, and gravity.', tone: 'blue' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.35 }}
      className="home-page"
    >
      <section className="hero-section">
        <div className="hero-grid">
          <div className="hero-copy">
            <div className="section-label">
              <span className="section-label-dot" />
              Explore • Discover • Experiment
            </div>
            <h1 className="hero-title">
              Explore the universe with a little more imagination.
            </h1>
            <p className="hero-summary">
              Cosmos Hub turns every celestial body into an interactive story—where planetary science meets speculative design.
            </p>

            <div className="hero-actions">
              <Link to="/discover">
                <Button className="primary-cta">Explore the Universe</Button>
              </Link>
              <Link to="/planet-lab">
                <Button variant="secondary" className="secondary-cta">Create a Planet</Button>
              </Link>
            </div>

            <div className="hero-metadata">
              <div>
                <span className="metadata-label">Solar System</span>
                <span className="metadata-value">8 planets</span>
              </div>
              <div>
                <span className="metadata-label">Mission</span>
                <span className="metadata-value">Observation</span>
              </div>
              <div>
                <span className="metadata-label">Station</span>
                <span className="metadata-value">Orbital</span>
              </div>
            </div>
          </div>

          <aside className="hero-aside">
            <div className="fact-card">
              <div className="fact-card-top">
                <div>
                  <span className="section-kicker">Cosmic fact</span>
                  <h3>{fact.title}</h3>
                </div>
                <span className="fact-icon">
                  <Sparkles size={22} />
                </span>
              </div>
              <p className="fact-body">{fact.fact}</p>
              <div className="fact-progress">
                <span className="progress-label">Observation window</span>
                <div className="progress-bar">
                  <span className="progress-fill" />
                </div>
              </div>
              <div className="quick-path">
                <div className="quick-path-head">
                  <Compass size={16} />
                  <span>Quick path</span>
                </div>
                <div className="quick-path-list">
                  <span>Discover a planet</span>
                  <span>Change its conditions</span>
                  <span>Explore the outcomes</span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </section>

      <section className="section-block">
        <SectionHeader
          eyebrow="Universe"
          title="Interactive Solar System"
          text="Hover, inspect, and choose a world to explore. The system is designed for smooth motion and clear planetary identity."
        />
        <SolarSystemMap />
      </section>

      <section className="feature-grid">
        {featureCards.map((feature, index) => (
          <article key={feature.title} className="feature-card">
            <div className="feature-card-icon">
              {feature.icon}
            </div>
            <div className="feature-card-content">
              <span className="section-kicker">0{index + 1}</span>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
            <span className={`feature-line feature-line-${feature.tone}`} />
          </article>
        ))}
      </section>

      <section className="lab-preview">
        <div className="lab-preview-copy">
          <span className="section-kicker">Planet Lab</span>
          <h2>Model a world.</h2>
          <p>Build a hypothetical planet from orbit, atmosphere, temperature, and the balance of habitability.</p>
          <div className="lab-preview-actions">
            <Link to="/planet-lab" className="inline-link">
              Open the Planet Lab <ArrowRight size={16} />
            </Link>
          </div>
        </div>
        <div className="lab-preview-grid">
          <div className="lab-preview-stat">
            <Telescope size={20} />
            <span>Signal clarity</span>
            <strong>98%</strong>
          </div>
          <div className="lab-preview-stat">
            <Beaker size={20} />
            <span>Habitat index</span>
            <strong>74</strong>
          </div>
          <div className="lab-preview-stat">
            <Map size={20} />
            <span>Orbit estimate</span>
            <strong>01.24</strong>
          </div>
        </div>
      </section>

      <section className="circuit-strip">
        <Link to="/discover" className="circuit-tile">
          <Compass size={18} />
          <span>Discover</span>
        </Link>
        <Link to="/news" className="circuit-tile">
          <Newspaper size={18} />
          <span>News</span>
        </Link>
        <Link to="/quotes" className="circuit-tile">
          <Quote size={18} />
          <span>Quotes</span>
        </Link>
        <Link to="/my-cosmos" className="circuit-tile">
          <UserRound size={18} />
          <span>My Cosmos</span>
        </Link>
      </section>
    </motion.div>
  );
}
