import { Canvas, useFrame } from '@react-three/fiber';
import { Float, OrbitControls, Html, Stars } from '@react-three/drei';
import { useMemo, useRef } from 'react';
import { planets } from '../../data/planets';

const PLANET_VISUALS = {
  mercury: { color: '#b8b4a9', size: 0.34, orbitRadius: 2.2, speed: 0.28, rotationSpeed: 1.1 },
  venus: { color: '#e6b980', size: 0.46, orbitRadius: 2.9, speed: 0.24, rotationSpeed: 1.0 },
  earth: { color: '#2eb3ff', size: 0.48, orbitRadius: 3.6, speed: 0.21, rotationSpeed: 1.4 },
  mars: { color: '#d96c4a', size: 0.43, orbitRadius: 4.3, speed: 0.19, rotationSpeed: 1.3 },
  jupiter: { color: '#d9b38c', size: 0.78, orbitRadius: 5.2, speed: 0.14, rotationSpeed: 0.9 },
  saturn: { color: '#e7d3a2', size: 0.72, orbitRadius: 6.0, speed: 0.12, rotationSpeed: 0.8 },
  uranus: { color: '#99d6ef', size: 0.56, orbitRadius: 6.85, speed: 0.1, rotationSpeed: 0.7 },
  neptune: { color: '#3d7ae0', size: 0.56, orbitRadius: 7.55, speed: 0.09, rotationSpeed: 0.7 },
};

function OrbitRing({ radius, color = '#8bdffb' }) {
  const points = useMemo(() => {
    const pts = [];
    for (let i = 0; i <= 96; i += 1) {
      const angle = (i / 96) * Math.PI * 2;
      pts.push([Math.cos(angle) * radius, Math.sin(angle) * radius * 0.74, 0]);
    }
    return pts;
  }, [radius]);

  return (
    <group>
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <torusGeometry args={[radius, 0.015, 8, 128]} />
        <meshBasicMaterial color={color} transparent opacity={0.62} />
      </mesh>
    </group>
  );
}

function PlanetMesh({ planet, index, selectedPlanetId, onPlanetSelect }) {
  const planetMeta = PLANET_VISUALS[planet.id];
  const orbitRadius = planetMeta.orbitRadius;
  const angle = index * 0.76 + Math.PI * 0.18;
  const position = useRef(new Array(3));
  const meshRef = useRef(null);
  const ringRef = useRef(null);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    const x = Math.cos(angle + time * planetMeta.speed) * orbitRadius;
    const z = Math.sin(angle + time * planetMeta.speed) * orbitRadius * 0.74;
    const y = Math.sin(angle + time * planetMeta.speed + 1.2) * 0.18;
    if (meshRef.current) {
      meshRef.current.position.set(x, y, z);
      meshRef.current.rotation.y += 0.012 * planetMeta.rotationSpeed;
    }
    if (ringRef.current) {
      ringRef.current.rotation.z += 0.0025;
    }
  });

  const isSelected = selectedPlanetId === planet.id;
  const planetRadius = planetMeta.size;

  return (
    <group>
      <OrbitRing radius={orbitRadius} />
      <group>
        <mesh
          ref={meshRef}
          onPointerOver={(event) => {
            event.stopPropagation();
            document.body.style.cursor = 'pointer';
            if (meshRef.current) meshRef.current.scale.setScalar(isSelected ? 1.2 : 1.08);
          }}
          onPointerOut={(event) => {
            event.stopPropagation();
            document.body.style.cursor = 'default';
            if (meshRef.current) meshRef.current.scale.setScalar(isSelected ? 1.14 : 1);
          }}
          onClick={(event) => {
            event.stopPropagation();
            onPlanetSelect(planet.id);
            if (meshRef.current) meshRef.current.scale.setScalar(1.12);
          }}
        >
          <sphereGeometry args={[planetRadius, 32, 32]} />
          <meshStandardMaterial
            color={planet.color}
            emissive={planet.color}
            emissiveIntensity={isSelected ? 0.5 : 0.2}
            roughness={0.9}
            metalness={0.04}
          />
        </mesh>
        {planet.id === 'saturn' && (
          <mesh ref={ringRef} rotation={[Math.PI / 2.4, 0, 0]} position={meshRef.current ? meshRef.current.position : [0, 0, 0]}>
            <torusGeometry args={[planetRadius * 1.55, 0.075, 12, 80]} />
            <meshBasicMaterial color="#f8ecd4" transparent opacity={0.8} />
          </mesh>
        )}
        {isSelected && (
          <mesh position={meshRef.current ? meshRef.current.position : [0, 0, 0]}>
            <ringGeometry args={[planetRadius + 0.12, planetRadius + 0.17, 64]} />
            <meshBasicMaterial color="#8bfaff" transparent opacity={0.9} side={2} />
          </mesh>
        )}
        <Html position={[0, -planetRadius - 0.35, 0]} center>
          <div className="planet-label">{planet.name}</div>
        </Html>
      </group>
    </group>
  );
}

function StarSystem({ selectedPlanetId, onPlanetSelect }) {
  const sunRef = useRef(null);

  useFrame((state) => {
    if (sunRef.current) {
      sunRef.current.rotation.y += 0.002;
    }
  });

  return (
    <group>
      <mesh ref={sunRef} position={[0, 0, 0]}>
        <sphereGeometry args={[1.08, 48, 48]} />
        <meshStandardMaterial color="#ffd37a" emissive="#ffb347" emissiveIntensity={0.9} roughness={0.8} />
      </mesh>
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[1.18, 48, 48]} />
        <meshBasicMaterial color="#fed68a" transparent opacity={0.08} />
      </mesh>

      {planets.map((planet, index) => (
        <PlanetMesh key={planet.id} planet={planet} index={index} selectedPlanetId={selectedPlanetId} onPlanetSelect={onPlanetSelect} />
      ))}
    </group>
  );
}

export default function SolarSystemScene({ selectedPlanetId, onPlanetSelect }) {
  return (
    <div className="solar-system-canvas-wrap">
      <Canvas camera={{ position: [0, 0, 14], fov: 50 }} dpr={[1, 1.5]}>
        <color attach="background" args={['#050816']} />
        <fog attach="fog" args={['#050816', 12, 16]} />
        <ambientLight intensity={0.75} />
        <pointLight position={[0, 0, 0]} intensity={2.3} color="#ffd37a" distance={22} />
        <Stars radius={80} depth={45} count={1800} factor={2.5} saturation={0} fade speed={0.8} />
        <StarSystem selectedPlanetId={selectedPlanetId} onPlanetSelect={onPlanetSelect} />
        <OrbitControls enablePan={false} enableZoom={true} enableRotate={true} minDistance={10} maxDistance={16} minPolarAngle={Math.PI / 2.8} maxPolarAngle={Math.PI / 1.8} />
      </Canvas>
    </div>
  );
}
