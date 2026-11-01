"use client";

import { useRef, useEffect, useState } from "react";
import * as THREE from "three";

export default function Hero3D() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);

  // Étape 1 : monter le canvas, puis initialiser la scène (effet suivant)
  useEffect(() => {
    setReady(true);
  }, []);

  // Étape 2 : le canvas existe, on peut créer le renderer
  useEffect(() => {
    if (!ready || !canvasRef.current) return;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x05050a, 0.035);

    const camera = new THREE.PerspectiveCamera(60, 2, 0.1, 100);
    camera.position.set(0, 0, 4);

    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      alpha: true,
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x05050a, 1);

    // Adapter la résolution réelle du renderer à la taille d'affichage
    const resize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const w = canvas.clientWidth || 1;
      const h = canvas.clientHeight || 1;
      renderer.setSize(w, h, false); // false : on laisse CSS gérer la taille
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    resize();
    window.addEventListener("resize", resize);

    // Lumière ambiante douce
    const ambientLight = new THREE.AmbientLight(0x4a00e0, 0.4);
    scene.add(ambientLight);

    // Lumière principale violette
    const pointLight = new THREE.PointLight(0x8b00ff, 1.5, 10);
    pointLight.position.set(2, 2, 3);
    scene.add(pointLight);

    // Lumière secondaire rose
    const spotLight = new THREE.SpotLight(0xff00ff, 1, 10);
    spotLight.position.set(-2, 1, 2);
    scene.add(spotLight);

    // Groupe central
    const group = new THREE.Group();
    scene.add(group);

    // Forme géométrique : icosaèdre avec fil de fer
    const geometry = new THREE.IcosahedronGeometry(1.1, 0);
    const material = new THREE.MeshStandardMaterial({
      color: 0x0a0a0f,
      wireframe: true,
      transparent: true,
      opacity: 0.6,
    });
    const mesh = new THREE.Mesh(geometry, material);
    group.add(mesh);

    // Sphère interne émissive violette
    const innerGeo = new THREE.SphereGeometry(0.7, 32, 32);
    const innerMat = new THREE.MeshStandardMaterial({
      color: 0x6a0dad,
      emissive: 0x8b00ff,
      emissiveIntensity: 0.8,
      transparent: true,
      opacity: 0.7,
    });
    const innerSphere = new THREE.Mesh(innerGeo, innerMat);
    group.add(innerSphere);

    // Particules en arrière-plan
    const particlesGeo = new THREE.BufferGeometry();
    const particlesCount = 400;
    const posArray = new Float32Array(particlesCount * 3);
    for (let i = 0; i < particlesCount * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 10;
    }
    particlesGeo.setAttribute("position", new THREE.BufferAttribute(posArray, 3));
    const particlesMat = new THREE.PointsMaterial({
      size: 0.02,
      color: 0x8b00ff,
      transparent: true,
      opacity: 0.6,
    });
    const particles = new THREE.Points(particlesGeo, particlesMat);
    scene.add(particles);

    // Ligne connectant les particules proches
    const linesGeo = new THREE.BufferGeometry();
    const linePositions: number[] = [];
    const lineColors: number[] = [];
    const maxDistance = 2.5;

    for (let i = 0; i < particlesCount; i++) {
      for (let j = i + 1; j < particlesCount; j++) {
        const dx = posArray[i * 3] - posArray[j * 3];
        const dy = posArray[i * 3 + 1] - posArray[j * 3 + 1];
        const dz = posArray[i * 3 + 2] - posArray[j * 3 + 2];
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
        if (dist < maxDistance) {
          linePositions.push(posArray[i * 3], posArray[i * 3 + 1], posArray[i * 3 + 2]);
          linePositions.push(posArray[j * 3], posArray[j * 3 + 1], posArray[j * 3 + 2]);
          const alpha = 1 - dist / maxDistance;
          lineColors.push(0.55, 0, 1, alpha, 0.55, 0, 1, alpha);
        }
      }
    }
    linesGeo.setAttribute("position", new THREE.Float32BufferAttribute(linePositions, 3));
    linesGeo.setAttribute("color", new THREE.Float32BufferAttribute(lineColors, 4));
    const linesMat = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.3,
    });
    const lines = new THREE.LineSegments(linesGeo, linesMat);
    scene.add(lines);

    // Animation
    const clock = new THREE.Clock();
    let frameId: number;

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      group.rotation.x = elapsed * 0.2;
      group.rotation.y = elapsed * 0.3;
      innerSphere.rotation.x = -elapsed * 0.2;
      innerSphere.rotation.y = -elapsed * 0.3;

      // Mouvement léger des particules
      const positions = particles.geometry.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < particlesCount; i++) {
        positions.setY(i, posArray[i * 3 + 1] + Math.sin(elapsed + i) * 0.05);
      }
      positions.needsUpdate = true;

      // Mouvement de la lumière
      pointLight.position.x = Math.sin(elapsed * 0.5) * 2;
      pointLight.position.z = Math.cos(elapsed * 0.5) * 3;

      renderer.render(scene, camera);
    };

    animate();
    setReady(true);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", resize);
      renderer.dispose();
    };
  }, [ready]);

  if (!ready) {
    return (
      <div className="w-full h-[500px] flex items-center justify-center bg-gray-900">
        <div className="text-violet-400 animate-pulse">Chargement de la scène 3D…</div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[500px] sm:h-[600px] lg:h-[700px] bg-black overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block" />
      {/* Overlay gradient pour lisibilité */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/40 pointer-events-none" />
    </div>
  );
}