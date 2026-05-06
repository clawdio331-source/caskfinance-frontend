"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import s from "./page.module.css";

type CaskSceneProps = {
  telegramUrl: string;
  twitterUrl: string;
};

const HIT_TARGET = 4;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function easeOutCubic(value: number) {
  return 1 - Math.pow(1 - clamp(value, 0, 1), 3);
}

function makeWoodTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 768;
  canvas.height = 384;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return null;
  }

  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, "#895126");
  gradient.addColorStop(0.35, "#b06b35");
  gradient.addColorStop(0.72, "#643319");
  gradient.addColorStop(1, "#c07a3d");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < 84; i += 1) {
    const x = (i / 84) * canvas.width;
    const alpha = i % 4 === 0 ? 0.24 : 0.12;
    ctx.strokeStyle = `rgba(33, 16, 7, ${alpha})`;
    ctx.lineWidth = 1 + ((i * 11) % 5);
    ctx.beginPath();
    ctx.moveTo(x + Math.sin(i) * 8, 0);

    for (let y = 0; y <= canvas.height; y += 36) {
      ctx.lineTo(x + Math.sin(y * 0.02 + i) * 10, y);
    }

    ctx.stroke();
  }

  for (let i = 0; i < 24; i += 1) {
    const x = ((i * 89) % canvas.width) + 8;
    const y = ((i * 47) % canvas.height) + 8;
    ctx.fillStyle = "rgba(32, 13, 5, 0.25)";
    ctx.beginPath();
    ctx.ellipse(x, y, 5 + (i % 4) * 3, 18 + (i % 5) * 5, Math.sin(i) * 0.7, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(1.7, 1.2);
  texture.anisotropy = 8;

  return texture;
}

function disposeMaterial(material: THREE.Material | THREE.Material[]) {
  if (Array.isArray(material)) {
    material.forEach((item) => item.dispose());
    return;
  }

  material.dispose();
}

export default function CaskScene({ telegramUrl, twitterUrl }: CaskSceneProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const hitCountRef = useRef(0);
  const unlockedRef = useRef(false);
  const lastStrikeAtRef = useRef<number | null>(null);
  const redirectTimerRef = useRef<number | null>(null);
  const [hitCount, setHitCount] = useState(0);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [sceneFailed, setSceneFailed] = useState(false);

  const remainingHits = Math.max(0, HIT_TARGET - hitCount);
  const actionLabel = useMemo(() => {
    if (isUnlocked) {
      return "Opening Telegram";
    }

    if (hitCount === 0) {
      return "Tap the hammer";
    }

    if (remainingHits === 1) {
      return "Final tap";
    }

    return `${remainingHits} taps left`;
  }, [hitCount, isUnlocked, remainingHits]);

  const handleTap = useCallback(() => {
    if (unlockedRef.current) {
      window.location.assign(telegramUrl);
      return;
    }

    const nextHitCount = Math.min(HIT_TARGET, hitCountRef.current + 1);
    hitCountRef.current = nextHitCount;
    lastStrikeAtRef.current = performance.now();
    setHitCount(nextHitCount);

    if (nextHitCount >= HIT_TARGET) {
      unlockedRef.current = true;
      setIsUnlocked(true);
      redirectTimerRef.current = window.setTimeout(() => {
        window.location.assign(telegramUrl);
      }, 320);
    }
  }, [telegramUrl]);

  useEffect(() => {
    return () => {
      if (redirectTimerRef.current !== null) {
        window.clearTimeout(redirectTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) {
      return;
    }
    const mountEl = mount;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x080908, 0.028);

    const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 100);
    camera.position.set(0, 0.08, 7.4);

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: "high-performance"
      });
    } catch (error) {
      console.warn("Cask scene unavailable", error);
      setSceneFailed(true);
      return;
    }
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setClearColor(0x000000, 0);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.domElement.setAttribute("aria-label", "Interactive standing cask");
    renderer.domElement.setAttribute("data-cask-canvas", "true");
    mountEl.appendChild(renderer.domElement);

    const woodTexture = makeWoodTexture();
    const cask = new THREE.Group();
    cask.position.set(0, -0.42, 0);
    scene.add(cask);
    let caskRestY = -0.42;

    const ambient = new THREE.HemisphereLight(0xf8efdd, 0x12110e, 1.25);
    scene.add(ambient);

    const key = new THREE.DirectionalLight(0xffe5b5, 3.4);
    key.position.set(-3.5, 4.8, 5.5);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    scene.add(key);

    const rim = new THREE.PointLight(0x8fe4d3, 2, 9);
    rim.position.set(3.6, 1.4, 2.8);
    scene.add(rim);

    const wine = new THREE.PointLight(0xb13d62, 1.05, 8);
    wine.position.set(-4.2, -0.8, 3.2);
    scene.add(wine);

    const floorMaterial = new THREE.MeshStandardMaterial({
      color: 0x0b0d0d,
      roughness: 0.92,
      metalness: 0.05
    });
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(16, 10), floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -1.72;
    floor.receiveShadow = true;
    scene.add(floor);

    const bodyMaterial = new THREE.MeshStandardMaterial({
      color: 0xb36b34,
      map: woodTexture ?? undefined,
      roughness: 0.74,
      metalness: 0.02,
      bumpMap: woodTexture ?? undefined,
      bumpScale: 0.032
    });

    const endMaterial = new THREE.MeshStandardMaterial({
      color: 0x6c371c,
      map: woodTexture ?? undefined,
      roughness: 0.86,
      metalness: 0.01
    });

    const bandMaterial = new THREE.MeshStandardMaterial({
      color: 0x2b2926,
      roughness: 0.33,
      metalness: 0.78
    });

    const brassMaterial = new THREE.MeshStandardMaterial({
      color: 0xd2a45c,
      roughness: 0.26,
      metalness: 0.86
    });

    const darkWoodMaterial = new THREE.MeshStandardMaterial({
      color: 0x2c170c,
      roughness: 0.8,
      metalness: 0.02
    });

    const steelMaterial = new THREE.MeshStandardMaterial({
      color: 0x34383a,
      roughness: 0.3,
      metalness: 0.78
    });

    const points: THREE.Vector2[] = [];
    for (let i = 0; i <= 46; i += 1) {
      const t = i / 46;
      const centered = (t - 0.5) * 2;
      const radius = 0.76 + 0.24 * (1 - centered * centered) + 0.035 * Math.sin(t * Math.PI);
      points.push(new THREE.Vector2(radius, (t - 0.5) * 2.98));
    }

    const body = new THREE.Mesh(new THREE.LatheGeometry(points, 128), bodyMaterial);
    body.castShadow = true;
    body.receiveShadow = true;
    cask.add(body);

    const capGeometry = new THREE.CylinderGeometry(0.84, 0.88, 0.12, 96);
    const topCap = new THREE.Mesh(capGeometry, endMaterial);
    topCap.position.y = 1.54;
    topCap.castShadow = true;
    topCap.receiveShadow = true;
    cask.add(topCap);

    const bottomCap = topCap.clone();
    bottomCap.position.y = -1.54;
    cask.add(bottomCap);

    function addHoop(y: number, radius: number, tube: number) {
      const hoopGeometry = new THREE.TorusGeometry(radius, tube, 18, 128);
      hoopGeometry.rotateX(Math.PI / 2);
      const hoop = new THREE.Mesh(hoopGeometry, bandMaterial);
      hoop.position.y = y;
      hoop.castShadow = true;
      hoop.receiveShadow = true;
      cask.add(hoop);
      return hoop;
    }

    [-1.32, -0.76, 0.76, 1.32].forEach((y) => {
      const radius = 0.88 + 0.14 * (1 - Math.min(1, Math.abs(y) / 1.42));
      addHoop(y, radius, 0.045);
    });

    [-1.52, 1.52].forEach((y) => {
      addHoop(y, 0.86, 0.035);
    });

    const staveGeometry = new THREE.CylinderGeometry(0.007, 0.007, 2.72, 6);
    for (let i = 0; i < 18; i += 1) {
      const angle = (i / 18) * Math.PI * 2;
      const line = new THREE.Mesh(staveGeometry, darkWoodMaterial);
      line.position.set(Math.cos(angle) * 0.99, 0, Math.sin(angle) * 0.99);
      line.castShadow = true;
      cask.add(line);
    }

    const tap = new THREE.Group();
    tap.position.set(0, -0.2, 1.01);
    cask.add(tap);

    const backPlate = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.05, 42), brassMaterial);
    backPlate.rotation.x = Math.PI / 2;
    backPlate.position.z = 0.02;
    backPlate.castShadow = true;
    tap.add(backPlate);

    const spoutGeometry = new THREE.CylinderGeometry(0.055, 0.075, 0.52, 28);
    spoutGeometry.rotateX(Math.PI / 2);
    const spout = new THREE.Mesh(spoutGeometry, brassMaterial);
    spout.position.z = 0.28;
    spout.castShadow = true;
    tap.add(spout);

    const lipGeometry = new THREE.TorusGeometry(0.082, 0.012, 10, 32);
    const lip = new THREE.Mesh(lipGeometry, brassMaterial);
    lip.position.z = 0.56;
    lip.castShadow = true;
    tap.add(lip);

    const handle = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.052, 0.08), brassMaterial);
    handle.position.set(0, 0.28, 0.12);
    handle.rotation.z = 0.12;
    handle.castShadow = true;
    tap.add(handle);

    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.34, 18), brassMaterial);
    stem.position.set(0, 0.13, 0.13);
    stem.castShadow = true;
    tap.add(stem);

    const holeMaterial = new THREE.MeshBasicMaterial({
      color: 0x070402,
      transparent: true,
      opacity: 0
    });
    const hole = new THREE.Mesh(new THREE.CircleGeometry(0.2, 42), holeMaterial);
    hole.position.set(0, -0.2, 1.045);
    hole.visible = false;
    cask.add(hole);

    const dentMaterials = Array.from({ length: HIT_TARGET }, () => new THREE.MeshBasicMaterial({
      color: 0x120604,
      transparent: true,
      opacity: 0
    }));
    const dents = dentMaterials.map((material, index) => {
      const dent = new THREE.Mesh(new THREE.TorusGeometry(0.08 + index * 0.035, 0.006, 8, 36), material);
      dent.position.set(0, -0.2, 1.052 + index * 0.003);
      dent.rotation.z = index * 0.72;
      dent.visible = false;
      cask.add(dent);
      return dent;
    });

    const hammer = new THREE.Group();
    scene.add(hammer);

    const hammerHandleGeometry = new THREE.CylinderGeometry(0.025, 0.032, 0.92, 18);
    const hammerHandle = new THREE.Mesh(hammerHandleGeometry, darkWoodMaterial);
    hammerHandle.rotation.z = 0.28;
    hammerHandle.castShadow = true;
    hammer.add(hammerHandle);

    const hammerHead = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.16, 0.18), steelMaterial);
    hammerHead.position.set(0.05, 0.46, 0);
    hammerHead.rotation.z = 0.04;
    hammerHead.castShadow = true;
    hammer.add(hammerHead);

    const hammerFace = new THREE.Mesh(new THREE.CylinderGeometry(0.095, 0.095, 0.11, 24), steelMaterial);
    hammerFace.rotation.z = Math.PI / 2;
    hammerFace.position.set(-0.28, 0.46, 0);
    hammerFace.castShadow = true;
    hammer.add(hammerFace);

    const sparkMaterial = new THREE.MeshBasicMaterial({
      color: 0xf6d775,
      transparent: true,
      opacity: 0,
      depthWrite: false
    });
    const sparks = Array.from({ length: 10 }, (_, index) => {
      const spark = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.01, 0.01), sparkMaterial);
      spark.position.set(0, -0.2, 1.16);
      spark.rotation.z = (index / 10) * Math.PI * 2;
      spark.visible = false;
      scene.add(spark);
      return spark;
    });

    const streamMaterial = new THREE.MeshBasicMaterial({
      color: 0xf0bd4f,
      transparent: true,
      opacity: 0,
      depthTest: true,
      depthWrite: false
    });
    const stream = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.018, 1, 22, 1, true), streamMaterial);
    stream.renderOrder = -1;
    stream.visible = false;
    scene.add(stream);

    const streamHighlightMaterial = new THREE.MeshBasicMaterial({
      color: 0xffe29a,
      transparent: true,
      opacity: 0,
      depthTest: true,
      depthWrite: false
    });
    const streamHighlight = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.004, 1, 8, 1, true), streamHighlightMaterial);
    streamHighlight.visible = false;
    scene.add(streamHighlight);

    const dropletMaterial = new THREE.MeshBasicMaterial({
      color: 0xf6cc68,
      transparent: true,
      opacity: 0,
      depthTest: true,
      depthWrite: false
    });
    const droplets = Array.from({ length: 3 }, () => {
      const droplet = new THREE.Mesh(new THREE.SphereGeometry(0.025, 14, 10), dropletMaterial);
      droplet.visible = false;
      scene.add(droplet);
      return droplet;
    });

    const puddleMaterial = new THREE.MeshBasicMaterial({
      color: 0xc3842d,
      transparent: true,
      opacity: 0,
      depthWrite: false
    });
    const puddle = new THREE.Mesh(new THREE.CircleGeometry(0.64, 48), puddleMaterial);
    puddle.rotation.x = -Math.PI / 2;
    puddle.position.set(0.03, -1.705, 1.62);
    puddle.scale.set(0.18, 0.08, 1);
    scene.add(puddle);

    let puddleSize = 0;
    let animationFrame = 0;
    let lastTime = performance.now();
    const streamStart = new THREE.Vector3();
    const streamEnd = new THREE.Vector3();
    const streamMid = new THREE.Vector3();
    const streamDirection = new THREE.Vector3();
    const streamAxis = new THREE.Vector3(0, 1, 0);
    const streamHighlightOffset = new THREE.Vector3();

    function resize() {
      const width = mountEl.clientWidth || window.innerWidth;
      const height = mountEl.clientHeight || window.innerHeight;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.position.z = camera.aspect < 0.75 ? 9.4 : width < 900 ? 7.8 : 6.7;
      camera.position.y = camera.aspect < 0.75 ? 0.12 : 0.06;
      cask.scale.setScalar(camera.aspect < 0.75 ? 0.78 : width < 900 ? 0.96 : 1);
      caskRestY = camera.aspect < 0.75 ? -0.58 : width < 900 ? -0.48 : -0.42;
      camera.updateProjectionMatrix();
    }

    function updatePour(delta: number, unlocked: boolean) {
      if (!unlocked) {
        streamMaterial.opacity = Math.max(0, streamMaterial.opacity - delta * 1.8);
        stream.visible = streamMaterial.opacity > 0.01;
        streamHighlightMaterial.opacity = Math.max(0, streamHighlightMaterial.opacity - delta * 2.4);
        streamHighlight.visible = streamHighlightMaterial.opacity > 0.01;
        dropletMaterial.opacity = Math.max(0, dropletMaterial.opacity - delta * 2.4);
        droplets.forEach((droplet) => {
          droplet.visible = dropletMaterial.opacity > 0.01;
        });
        puddleMaterial.opacity = Math.max(0, puddleMaterial.opacity - delta * 0.28);
        return;
      }

      streamStart.set(0, -0.078, 0.56).applyMatrix4(tap.matrixWorld);
      streamEnd.set(streamStart.x + Math.sin(performance.now() * 0.004) * 0.026, -1.64, streamStart.z + 0.045);
      streamDirection.subVectors(streamEnd, streamStart);
      const streamLength = Math.max(0.2, streamDirection.length());
      streamMid.addVectors(streamStart, streamEnd).multiplyScalar(0.5);
      stream.position.copy(streamMid);
      stream.quaternion.setFromUnitVectors(streamAxis, streamDirection.normalize());
      stream.scale.set(1, streamLength, 1);
      stream.visible = true;
      streamMaterial.opacity = Math.min(0.72, streamMaterial.opacity + delta * 2.2);

      streamHighlightOffset.set(-0.012, 0, 0.004);
      streamHighlight.position.copy(streamMid).add(streamHighlightOffset);
      streamHighlight.quaternion.copy(stream.quaternion);
      streamHighlight.scale.set(1, streamLength * 0.96, 1);
      streamHighlight.visible = true;
      streamHighlightMaterial.opacity = Math.min(0.46, streamHighlightMaterial.opacity + delta * 2.8);

      dropletMaterial.opacity = Math.min(0.62, dropletMaterial.opacity + delta * 2.4);
      droplets.forEach((droplet, index) => {
        const phase = (performance.now() * 0.0015 + index / droplets.length) % 1;
        const drift = Math.sin(phase * Math.PI * 2 + index) * 0.022;
        droplet.visible = streamMaterial.opacity > 0.24;
        droplet.position.set(
          streamStart.x + drift,
          streamStart.y + (streamEnd.y - streamStart.y) * phase,
          streamStart.z + 0.026 + Math.cos(phase * Math.PI * 2) * 0.008
        );
        droplet.scale.setScalar(0.72 + phase * 0.5);
      });

      puddleSize = clamp(puddleSize + delta * 0.22, 0, 1);
      puddleMaterial.opacity = 0.12 + puddleSize * 0.38;
      puddle.position.x += (streamEnd.x - puddle.position.x) * 0.08;
      puddle.position.z += (streamEnd.z - puddle.position.z) * 0.08;
      puddle.scale.set(0.18 + puddleSize * 1.08, 0.08 + puddleSize * 0.52, 1);
    }

    function animate(now: number) {
      const delta = Math.min(0.033, (now - lastTime) / 1000);
      lastTime = now;

      const strikeStartedAt = lastStrikeAtRef.current;
      const strikeAge = strikeStartedAt === null ? 999 : (now - strikeStartedAt) / 1000;
      const strikeProgress = clamp(strikeAge / 0.46, 0, 1);
      const swing = strikeAge < 0.46 ? Math.sin(strikeProgress * Math.PI) : 0;
      const hitJolt = strikeAge < 0.22 ? Math.sin(strikeAge * 52) * (1 - strikeAge / 0.22) : 0;
      const hitCountLive = hitCountRef.current;
      const unlockedLive = unlockedRef.current;

      cask.rotation.y = Math.sin(now * 0.00042) * 0.08 + hitJolt * 0.01;
      cask.rotation.x = hitJolt * -0.008;
      cask.position.y = caskRestY + Math.sin(now * 0.001) * 0.012 + Math.abs(hitJolt) * 0.018;

      hammer.position.set(1.08 - swing * 0.48, caskRestY - 0.08 + swing * 0.04, 2.06 - swing * 0.48);
      hammer.rotation.set(-0.18, -0.42 - swing * 0.16, -0.86 + swing * 1.28);
      hammer.scale.setScalar(0.92 + swing * 0.02);

      dents.forEach((dent, index) => {
        const isVisible = hitCountLive > index;
        dent.visible = isVisible;
        dentMaterials[index].opacity = isVisible ? 0.34 + index * 0.08 : 0;
        dent.scale.setScalar(1 + (isVisible && strikeAge < 0.38 && index === hitCountLive - 1 ? swing * 0.35 : 0));
      });

      hole.visible = unlockedLive;
      holeMaterial.opacity = unlockedLive ? Math.min(0.92, holeMaterial.opacity + delta * 2.8) : 0;
      tap.rotation.x += ((unlockedLive ? -0.1 : 0) - tap.rotation.x) * 0.08;
      tap.position.z += ((unlockedLive ? 1.05 : 1.01) - tap.position.z) * 0.08;

      sparks.forEach((spark, index) => {
        const sparkAge = strikeAge - index * 0.008;
        const visible = sparkAge >= 0 && sparkAge < 0.22;
        spark.visible = visible;
        if (!visible) {
          return;
        }

        const burst = easeOutCubic(sparkAge / 0.22);
        spark.position.set(
          Math.cos(spark.rotation.z) * 0.08 * burst,
          caskRestY - 0.2 + Math.sin(spark.rotation.z) * 0.08 * burst,
          1.54 + 0.28 * burst
        );
        spark.scale.setScalar(0.7 + burst * 1.5);
        sparkMaterial.opacity = Math.max(0, 0.8 - burst * 0.8);
      });

      cask.updateMatrixWorld();
      updatePour(delta, unlockedLive);
      renderer.render(scene, camera);
      animationFrame = window.requestAnimationFrame(animate);
    }

    resize();
    window.addEventListener("resize", resize);
    animationFrame = window.requestAnimationFrame(animate);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener("resize", resize);

      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose();
          disposeMaterial(object.material);
        }
      });

      woodTexture?.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return (
    <section className={s.stage} aria-label="Cask whitelist landing">
      <div ref={mountRef} className={s.sceneMount} aria-hidden="true" />
      {sceneFailed ? (
        <div className={s.sceneFallback} aria-hidden="true">
          <div className={s.fallbackCask} />
        </div>
      ) : null}

      <nav className={s.nav} aria-label="Primary navigation">
        <a className={s.brand} href="/" aria-label="Cask home">
          <span className={s.brandSigil}>C</span>
          <span>Cask</span>
        </a>
        <div className={s.navLinks}>
          <a href="/play">
            Play
          </a>
          <a href={twitterUrl} target="_blank" rel="noreferrer">
            Twitter
          </a>
          {isUnlocked ? (
            <a href={telegramUrl} target="_blank" rel="noreferrer">
              Telegram
            </a>
          ) : (
            <button type="button" onClick={handleTap}>
              Telegram
            </button>
          )}
        </div>
      </nav>

      <div className={s.hero}>
        <p className={s.kicker}>Whitelist cellar</p>
        <h1 className={s.headline}>It&apos;s just a cask bro.</h1>
      </div>

      <div className={s.access}>
        <button className={s.breakButton} type="button" onClick={handleTap} disabled={isUnlocked}>
          <span className={s.tapIcon} aria-hidden="true">
            <span />
          </span>
          {actionLabel}
        </button>
        <div className={s.hitMeter} aria-label={`${hitCount} of ${HIT_TARGET} taps`}>
          {Array.from({ length: HIT_TARGET }, (_, index) => (
            <span key={index} className={index < hitCount ? s.hitDotDone : s.hitDot} />
          ))}
        </div>
        <a className={s.twitterButton} href={twitterUrl} target="_blank" rel="noreferrer">
          Follow Twitter
        </a>
      </div>

      <div className={s.footerRail}>
        <span>{isUnlocked ? "Opening Telegram" : "Tap to pour"}</span>
        <a href={twitterUrl} target="_blank" rel="noreferrer">
          @caskfinance
        </a>
      </div>
    </section>
  );
}
