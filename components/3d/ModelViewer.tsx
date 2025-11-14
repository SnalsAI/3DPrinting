import { useRef, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stage, useGLTF, Environment } from '@react-three/drei';
import * as THREE from 'three';

interface ModelViewerProps {
  modelUrl: string;
  color?: string;
  scale?: number;
}

function Model({ url, color }: { url: string; color?: string }) {
  try {
    // For .glb/.gltf files
    const { scene } = useGLTF(url);
    const clonedScene = scene.clone();

    // Apply color to all meshes
    if (color) {
      clonedScene.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          if (mesh.material) {
            const material = mesh.material as THREE.MeshStandardMaterial;
            material.color = new THREE.Color(color);
          }
        }
      });
    }

    return <primitive object={clonedScene} />;
  } catch (error) {
    console.error('Error loading model:', error);
    return null;
  }
}

function Fallback() {
  return (
    <mesh>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#cccccc" />
    </mesh>
  );
}

export default function ModelViewer({ modelUrl, color = '#3b82f6', scale = 1 }: ModelViewerProps) {
  return (
    <div className="w-full h-full bg-gray-100 rounded-lg overflow-hidden">
      <Canvas
        shadows
        camera={{ position: [0, 0, 5], fov: 50 }}
        style={{ width: '100%', height: '100%' }}
      >
        <Suspense fallback={<Fallback />}>
          {/* Lighting */}
          <ambientLight intensity={0.5} />
          <directionalLight
            position={[10, 10, 5]}
            intensity={1}
            castShadow
            shadow-mapSize-width={1024}
            shadow-mapSize-height={1024}
          />
          <spotLight position={[-10, 10, 10]} angle={0.15} penumbra={1} intensity={0.5} castShadow />

          {/* Environment */}
          <Environment preset="studio" />

          {/* Model */}
          <group scale={scale}>
            <Model url={modelUrl} color={color} />
          </group>

          {/* Controls */}
          <OrbitControls
            enableZoom={true}
            enablePan={true}
            enableRotate={true}
            minDistance={2}
            maxDistance={10}
          />

          {/* Ground */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]} receiveShadow>
            <planeGeometry args={[10, 10]} />
            <shadowMaterial opacity={0.2} />
          </mesh>
        </Suspense>
      </Canvas>
    </div>
  );
}
