import { motion } from 'framer-motion';
import SectionHeader from '../components/common/SectionHeader';

export default function About() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.35 }}
      className="about-document"
    >
      <SectionHeader
        eyebrow="Project Overview"
        title="About Cosmos Hub"
        text="A front-end-first exploratory space app designed to feel cinematic, educational, and interactive."
      />

      <section className="documentation-grid">
        <article className="doc-panel">
          <div className="doc-panel-head">
            <span className="doc-number">01</span>
            <span className="doc-title">Mission</span>
          </div>
          <p className="doc-body">
            Cosmos Hub helps people explore the Solar System, experiment with hypothetical planet-building, and understand how simple scientific variables shape worlds.
          </p>
        </article>

        <article className="doc-panel">
          <div className="doc-panel-head">
            <span className="doc-number">02</span>
            <span className="doc-title">Current Phase</span>
          </div>
          <p className="doc-body">
            This implementation is frontend-only, with local data, local calculations, and local persistence. The architecture is intentionally clean for a future backend integration.
          </p>
        </article>
      </section>

      <section className="tech-report">
        <div className="doc-panel-head report-head">
          <span className="doc-number">03</span>
          <span className="doc-title">Technology Stack</span>
        </div>

        <div className="tech-table-wrap">
          <table className="tech-table">
            <thead>
              <tr>
                <th>Domain</th>
                <th>Implementation</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Interface</td>
                <td>React + Vite</td>
                <td>Operational</td>
              </tr>
              <tr>
                <td>Motion</td>
                <td>Framer Motion</td>
                <td>Enabled</td>
              </tr>
              <tr>
                <td>Spatial Visualization</td>
                <td>Three.js / R3F</td>
                <td>Active</td>
              </tr>
              <tr>
                <td>Styling System</td>
                <td>Tailwind CSS</td>
                <td>Glass UI</td>
              </tr>
              <tr>
                <td>Experience</td>
                <td>Planet Lab + Discovery</td>
                <td>In Scope</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </motion.div>
  );
}
