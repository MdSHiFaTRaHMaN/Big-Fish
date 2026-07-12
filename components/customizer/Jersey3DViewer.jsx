import React, { useState, useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { Canvas, useThree } from "@react-three/fiber";
import {
  OrbitControls,
  Environment,
  ContactShadows,
  Center,
  useGLTF,
  Decal,
} from "@react-three/drei";
import { useCustomizerStore } from "./useCustomizerStore";
import { useJerseyDecals, useStyleDecals } from "./useJerseyDecals";
import { JERSEY_DESIGNS } from "./JerseyPresets";

// ─── Normal Map Generators for Fabrics ──────────────────────────────────────
function createMeshNormalMap() {
  if (typeof window === "undefined") return null;
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  ctx.fillStyle = "rgb(128, 128, 255)";
  ctx.fillRect(0, 0, size, size);

  const imgData = ctx.getImageData(0, 0, size, size);
  const data = imgData.data;

  const tileSize = 32;
  const halfTile = tileSize / 2;
  const radius = 6;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let minDist = Infinity;
      let dxMin = 0;
      let dyMin = 0;

      const cx1 = Math.floor(x / tileSize) * tileSize;
      const cy1 = Math.floor(y / tileSize) * tileSize;

      const centers = [
        [cx1, cy1],
        [cx1 + tileSize, cy1],
        [cx1, cy1 + tileSize],
        [cx1 + tileSize, cy1 + tileSize],
        [cx1 + halfTile, cy1 + halfTile],
        [cx1 - halfTile, cy1 + halfTile],
        [cx1 + halfTile, cy1 - halfTile],
        [cx1 + tileSize + halfTile, cy1 + halfTile],
        [cx1 + halfTile, cy1 + tileSize + halfTile],
      ];

      for (const [cx, cy] of centers) {
        const dx = x - cx;
        const dy = y - cy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < minDist) {
          minDist = dist;
          dxMin = dx;
          dyMin = dy;
        }
      }

      if (minDist < radius) {
        const nx = dxMin / radius;
        const ny = dyMin / radius;
        const nzSquare = 1 - nx * nx - ny * ny;
        const nz = nzSquare > 0 ? Math.sqrt(nzSquare) : 0;

        const rVal = Math.round((nx * 0.5 + 0.5) * 255);
        const gVal = Math.round((-ny * 0.5 + 0.5) * 255);
        const bVal = Math.round((nz * 0.8 + 0.2) * 255);

        const idx = (y * size + x) * 4;
        data[idx] = rVal;
        data[idx + 1] = gVal;
        data[idx + 2] = bVal;
      }
    }
  }

  ctx.putImageData(imgData, 0, 0);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(30, 30);
  texture.needsUpdate = true;
  return texture;
}

function createFlexNormalMap() {
  if (typeof window === "undefined") return null;
  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  ctx.fillStyle = "rgb(128, 128, 255)";
  ctx.fillRect(0, 0, size, size);

  const imgData = ctx.getImageData(0, 0, size, size);
  const data = imgData.data;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const nx = Math.sin(x * 1.5) * 0.04;
      const ny = Math.sin(y * 1.5) * 0.04;
      const rVal = Math.round((nx * 0.5 + 0.5) * 255);
      const gVal = Math.round((ny * 0.5 + 0.5) * 255);
      const bVal = 255;

      const idx = (y * size + x) * 4;
      data[idx] = rVal;
      data[idx + 1] = gVal;
      data[idx + 2] = bVal;
    }
  }

  ctx.putImageData(imgData, 0, 0);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(80, 80);
  texture.needsUpdate = true;
  return texture;
}

// ─── ThreeGrabber Helper ────────────────────────────────────────────────────
function ThreeGrabber({ threeRef }) {
  const { gl, scene, camera } = useThree();
  useEffect(() => {
    threeRef.current = { gl, scene, camera };
    return () => {
      threeRef.current = null;
    };
  }, [gl, scene, camera, threeRef]);
  return null;
}

// ─── ViewHandler Helper ──────────────────────────────────────────────────────
function ViewHandler({ currentView }) {
  const controlsRef = useRef(null);
  const { camera } = useThree();

  useEffect(() => {
    if (!controlsRef.current) return;

    let shouldUpdate = false;
    if (currentView === "front") {
      camera.position.set(0, 0.1, 4);
      shouldUpdate = true;
    } else if (currentView === "back") {
      camera.position.set(0, 0.1, -4);
      shouldUpdate = true;
    } else if (currentView === "sleeves") {
      camera.position.set(4, 0.1, 0);
      shouldUpdate = true;
    }

    if (shouldUpdate) {
      controlsRef.current.target.set(0, 0.1, 0);
      controlsRef.current.update();
    }
  }, [currentView, camera]);

  return (
    <OrbitControls
      ref={controlsRef}
      enablePan={false}
      minPolarAngle={Math.PI / 6}
      maxPolarAngle={Math.PI * 0.75}
      minDistance={1}
      maxDistance={7}
      autoRotate={currentView === "360"}
      autoRotateSpeed={5}
    />
  );
}

function LogoDecal({ layer, loadedLogoImages, roughness, fabricConfig }) {
  const img = loadedLogoImages[layer.src];
  const texture = useMemo(() => {
    if (!img) return null;
    const canvas = document.createElement("canvas");
    const imgWidth = img.naturalWidth || img.width || 200;
    const imgHeight = img.naturalHeight || img.height || 200;
    canvas.width = imgWidth;
    canvas.height = imgHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    ctx.clearRect(0, 0, imgWidth, imgHeight);
    ctx.drawImage(img, 0, 0, imgWidth, imgHeight);

    if (layer.eraserPaths && layer.eraserPaths.length > 0) {
      ctx.globalCompositeOperation = "destination-out";
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.strokeStyle = "rgba(0,0,0,1)";
      layer.eraserPaths.forEach((path) => {
        ctx.lineWidth = path.size;
        ctx.beginPath();
        path.points.forEach((pt, idx) => {
          if (idx === 0) ctx.moveTo(pt.x, pt.y);
          else ctx.lineTo(pt.x, pt.y);
        });
        ctx.stroke();
      });
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.wrapS = THREE.ClampToEdgeWrapping;
    tex.wrapT = THREE.ClampToEdgeWrapping;
    tex.needsUpdate = true;
    return tex;
  }, [img, layer.eraserPaths]);

  if (!texture || !img) return null;

  const isFront = layer.side === "Front";
  const x = layer.x;
  const y = layer.y;
  const rotRad = (layer.rotation * Math.PI) / 180;

  const Rx = 0.187;
  const Rz = 0.135;
  const maxSweep = (70 * Math.PI) / 180;
  const sleeveW = 260;

  const isSleeve = (x < sleeveW || x > 1024 - sleeveW) && y < 460;
  const py = -(y / 1024 - 0.5) * 0.64 - 0.0175;
  const shiftD = 0.02;

  const depth = isSleeve
    ? Math.max(0.08, layer.scale * 0.09)
    : Math.max(0.2, layer.scale * 0.18);

  let px = 0;
  let pz = 0;
  let rx = 0;
  let ry = 0;
  let rz = 0;

  if (isFront) {
    if (isSleeve) {
      if (x < sleeveW) {
        const t = x / sleeveW;
        const px_c = -0.276 + t * 0.1;
        const pz_c = -0.04 + t * 0.086;
        ry = -maxSweep;
        px = px_c + shiftD * Math.sin(ry);
        pz = pz_c + shiftD * Math.cos(ry);
        rz = 0.35 - rotRad;
      } else {
        const t = (1024 - x) / sleeveW;
        const px_c = 0.276 - t * 0.1;
        const pz_c = -0.04 + t * 0.086;
        ry = maxSweep;
        px = px_c + shiftD * Math.sin(ry);
        pz = pz_c + shiftD * Math.cos(ry);
        rz = -0.35 - rotRad;
      }
    } else {
      const tTorso = (x - sleeveW) / (1024 - 2 * sleeveW);
      const theta = (tTorso - 0.5) * (2 * maxSweep);
      px = Rx * Math.sin(theta);
      pz = Rz * Math.cos(theta) + shiftD;
      ry = theta;
      rz = -rotRad;
    }
  } else {
    if (isSleeve) {
      if (x < sleeveW) {
        const t = x / sleeveW;
        const px_c = 0.276 - t * 0.1;
        const pz_c = -0.04 + t * 0.086;
        ry = Math.PI - maxSweep;
        px = px_c + shiftD * Math.sin(ry);
        pz = pz_c + shiftD * Math.cos(ry);
        rz = -0.35 + rotRad;
      } else {
        const t = (1024 - x) / sleeveW;
        const px_c = -0.276 + t * 0.1;
        const pz_c = -0.04 + t * 0.086;
        ry = -Math.PI + maxSweep;
        px = px_c + shiftD * Math.sin(ry);
        pz = pz_c + shiftD * Math.cos(ry);
        rz = 0.35 + rotRad;
      }
    } else {
      const tTorso = (x - sleeveW) / (1024 - 2 * sleeveW);
      const theta = Math.PI + (tTorso - 0.5) * (2 * maxSweep);
      px = Rx * Math.sin(theta);
      pz = Rz * Math.cos(theta) - shiftD;
      ry = theta;
      rz = rotRad;
    }
  }

  const imgWidth = img.naturalWidth || img.width || 200;
  const imgHeight = img.naturalHeight || img.height || 200;
  const size = 0.15;
  const aspect = imgWidth / imgHeight;

  const decalScale = [size * layer.scale * aspect, size * layer.scale, depth];

  return (
    <Decal
      position={[px, py, pz]}
      rotation={[rx, ry, rz]}
      scale={decalScale}
      renderOrder={20}
    >
      <meshStandardMaterial
        map={texture}
        transparent
        alphaTest={0.5}
        depthWrite={false}
        polygonOffset
        polygonOffsetFactor={-8}
        roughness={roughness}
        normalMap={fabricConfig.normalMap || undefined}
        normalScale={fabricConfig.normalScale}
        envMapIntensity={0.2}
      />
    </Decal>
  );
}

export function Jersey3D({ colors, collar, texturesRef }) {
  const { nodes } = useGLTF("/models/shirt_baked.glb");
  const { front, back, patternFront, patternBack } = useJerseyDecals(colors);

  useEffect(() => {
    if (texturesRef) {
      texturesRef.current = { front, back, patternFront, patternBack };
    }
  }, [front, back, patternFront, patternBack, texturesRef]);

  const { collarDecal } = useStyleDecals(colors);
  const [logoTexture, setLogoTexture] = useState(null);
  const [logoAspect, setLogoAspect] = useState(1);

  useEffect(() => {
    if (!colors.logo) {
      setLogoTexture(null);
      return;
    }
    const loader = new THREE.TextureLoader();
    loader.setCrossOrigin("anonymous");
    loader.load(
      colors.logo,
      (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.minFilter = THREE.LinearMipmapLinearFilter;
        tex.magFilter = THREE.LinearFilter;
        tex.anisotropy = 16;
        tex.needsUpdate = true;
        const img = tex.image;
        if (img) {
          setLogoAspect(img.width / img.height);
        }
        setLogoTexture(tex);
      },
      undefined,
      (err) => {
        console.error("Error loading logo texture:", err);
      },
    );
  }, [colors.logo]);

  const logoParams = useMemo(() => {
    if (!logoTexture) return null;
    const size = colors.logoSize || 0.15;
    const aspect = logoAspect || 1.0;

    switch (colors.logoPosition) {
      case "Left Chest":
        return {
          position: [0.062, 0.16, 0.138],
          rotation: [0, 0, 0],
          scale: [size * aspect * 0.75, size * 0.75, 0.2],
        };
      case "Right Chest":
        return {
          position: [-0.062, 0.16, 0.138],
          rotation: [0, 0, 0],
          scale: [size * aspect * 0.75, size * 0.75, 0.2],
        };
      case "Center":
        return {
          position: [0.0, 0.08, 0.15],
          rotation: [0, 0, 0],
          scale: [size * aspect * 1.3, size * 1.3, 0.2],
        };
      case "Back Top":
        return {
          position: [0.0, 0.23, -0.135],
          rotation: [0, Math.PI, 0],
          scale: [size * aspect * 0.9, size * 0.9, 0.2],
        };
      case "Back Center":
        return {
          position: [0.0, 0.05, -0.15],
          rotation: [0, Math.PI, 0],
          scale: [size * aspect * 1.3, size * 1.3, 0.2],
        };
      case "Sleeve":
        return {
          position: [0.22, 0.16, 0.0],
          rotation: [0, Math.PI / 2, 0],
          scale: [size * aspect, size, 0.2],
        };
      default:
        return null;
    }
  }, [logoTexture, logoAspect, colors.logoPosition, colors.logoSize]);

  const meshNormalMap = useMemo(() => createMeshNormalMap(), []);
  const flexNormalMap = useMemo(() => createFlexNormalMap(), []);

  const fabricConfig = useMemo(() => {
    if (colors.fabric === "Flex") {
      return {
        roughness: 0.4,
        normalMap: flexNormalMap,
        normalScale: new THREE.Vector2(0.15, 0.15),
      };
    } else {
      return {
        roughness: 0.8,
        normalMap: meshNormalMap,
        normalScale: new THREE.Vector2(0.4, 0.4),
      };
    }
  }, [colors.fabric, meshNormalMap, flexNormalMap]);

  const shirtMat = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: colors.primaryFront || colors.primary,
      roughness: fabricConfig.roughness,
      metalness: 0.04,
      normalMap: fabricConfig.normalMap || undefined,
      normalScale: fabricConfig.normalScale,
      envMapIntensity: 0.25,
    });
  }, [fabricConfig, colors.primaryFront, colors.primary]);

  let scaleX = 2.2;
  let scaleZ = 2.2;
  if (colors.cutFit === "Slim Fit") {
    scaleX = 2.05;
    scaleZ = 2.05;
  } else if (colors.cutFit === "Relaxed") {
    scaleX = 2.35;
    scaleZ = 2.35;
  }

  const SLEEVE_SEAM_X = 0.187;
  const SLEEVE_SEAM_Y = 0.087;
  const SLEEVE_ROT_Z = Math.PI / 2 + 0.35;
  const SLEEVE_AX = Math.sin(SLEEVE_ROT_Z);
  const SLEEVE_AY = Math.cos(SLEEVE_ROT_Z);

  const sleeveLen = colors.sleeve === "Long" ? 0.34 : 0.17;
  const sleeveHalf = sleeveLen / 2;
  const sleeveCX = SLEEVE_SEAM_X + sleeveHalf * SLEEVE_AX;
  const sleeveCY = SLEEVE_SEAM_Y + sleeveHalf * SLEEVE_AY;
  const sleeveWristX = SLEEVE_SEAM_X + sleeveLen * SLEEVE_AX;
  const sleeveWristY = SLEEVE_SEAM_Y + sleeveLen * SLEEVE_AY;

  const trimColor = colors.designColor || colors.secondary || "#ffffff";
  const roughness = fabricConfig.roughness;

  return (
    <group name="jersey-group" scale={[scaleX, 2.2, scaleZ]} position={[0, -0.1, 0]}>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.T_Shirt_male.geometry}
        material={shirtMat}
        dispose={null}
      >
        {patternFront && (
          <Decal
            position={[0, 0.0, 0.155]}
            rotation={[0, 0, 0]}
            scale={[0.54, 0.86, 0.32]}
            renderOrder={1}
          >
            <meshStandardMaterial
              map={patternFront}
              transparent
              alphaTest={0.01}
              depthWrite={false}
              polygonOffset
              polygonOffsetFactor={-3}
              roughness={roughness}
              normalMap={fabricConfig.normalMap || undefined}
              normalScale={fabricConfig.normalScale}
              envMapIntensity={0.2}
            />
          </Decal>
        )}
        {patternBack && (
          <Decal
            position={[0, 0.0, -0.155]}
            rotation={[0, Math.PI, 0]}
            scale={[0.54, 0.86, 0.32]}
            renderOrder={1}
          >
            <meshStandardMaterial
              map={patternBack}
              transparent
              alphaTest={0.01}
              depthWrite={false}
              polygonOffset
              polygonOffsetFactor={-3}
              roughness={roughness}
              normalMap={fabricConfig.normalMap || undefined}
              normalScale={fabricConfig.normalScale}
              envMapIntensity={0.2}
            />
          </Decal>
        )}

        {front && (
          <Decal
            position={[0, 0.0, 0.155]}
            rotation={[0, 0, 0]}
            scale={[0.54, 0.86, 0.32]}
            renderOrder={10}
          >
            <meshStandardMaterial
              map={front}
              transparent
              alphaTest={0.02}
              depthWrite={false}
              polygonOffset
              polygonOffsetFactor={-4}
              roughness={roughness}
              normalMap={fabricConfig.normalMap || undefined}
              normalScale={fabricConfig.normalScale}
              envMapIntensity={0.2}
            />
          </Decal>
        )}
        {back && (
          <Decal
            position={[0, 0.0, -0.155]}
            rotation={[0, Math.PI, 0]}
            scale={[0.54, 0.86, 0.32]}
            renderOrder={10}
          >
            <meshStandardMaterial
              map={back}
              transparent
              alphaTest={0.02}
              depthWrite={false}
              polygonOffset
              polygonOffsetFactor={-4}
              roughness={roughness}
              normalMap={fabricConfig.normalMap || undefined}
              normalScale={fabricConfig.normalScale}
              envMapIntensity={0.2}
            />
          </Decal>
        )}
        {logoTexture && logoParams && (
          <Decal
            position={logoParams.position}
            rotation={logoParams.rotation}
            scale={logoParams.scale}
            renderOrder={20}
          >
            <meshStandardMaterial
              map={logoTexture}
              transparent
              alphaTest={0.002}
              depthWrite={false}
              polygonOffset
              polygonOffsetFactor={-8}
              roughness={roughness}
              normalMap={fabricConfig.normalMap || undefined}
              normalScale={fabricConfig.normalScale}
              envMapIntensity={0.2}
            />
          </Decal>
        )}

        {collarDecal && (
          <Decal
            position={[0.0, 0.19, 0.118]}
            rotation={[0.15, 0, 0]}
            scale={[0.22, 0.22, 0.12]}
            renderOrder={30}
          >
            <meshStandardMaterial
              map={collarDecal}
              transparent
              alphaTest={0.008}
              depthWrite={false}
              polygonOffset
              polygonOffsetFactor={-7}
              roughness={roughness}
              normalMap={fabricConfig.normalMap || undefined}
              normalScale={fabricConfig.normalScale}
              envMapIntensity={0.2}
            />
          </Decal>
        )}

        {(colors.logoLayers || [])
          .filter((l) => l.type === "logo" || !l.type)
          .map((layer) => (
            <LogoDecal
              key={layer.id}
              layer={layer}
              loadedLogoImages={colors.loadedLogoImages || {}}
              roughness={roughness}
              fabricConfig={fabricConfig}
            />
          ))}
      </mesh>

      {colors.collar && colors.collarType === "Polo" && (
        <group>
          <mesh
            castShadow
            receiveShadow
            position={[-0.038, 0.198, 0.045]}
            rotation={[0.35, -0.35, -0.4]}
          >
            <boxGeometry args={[0.055, 0.004, 0.065]} />
            <meshStandardMaterial
              color={colors.designColor || colors.secondary || "#ffffff"}
              roughness={0.7}
            />
          </mesh>
          <mesh
            castShadow
            receiveShadow
            position={[0.038, 0.198, 0.045]}
            rotation={[0.35, 0.35, 0.4]}
          >
            <boxGeometry args={[0.055, 0.004, 0.065]} />
            <meshStandardMaterial
              color={colors.designColor || colors.secondary || "#ffffff"}
              roughness={0.7}
            />
          </mesh>
        </group>
      )}

      {(colors.sleeve === "Long" || colors.sleeve === "3/4") && (
        <group>
          <mesh
            castShadow
            receiveShadow
            position={[sleeveCX, sleeveCY, -0.01]}
            rotation={[0, 0, -SLEEVE_ROT_Z]}
          >
            <cylinderGeometry
              args={[
                0.042,
                colors.sleeve === "Long" ? 0.028 : 0.034,
                sleeveLen,
                32,
              ]}
            />
            <meshStandardMaterial
              color={colors.primaryFront || colors.primary}
              roughness={roughness}
              normalMap={fabricConfig.normalMap || undefined}
              normalScale={fabricConfig.normalScale}
              metalness={0.03}
              envMapIntensity={1.1}
            />
          </mesh>
          {colors.sleeve === "Long" && (
            <mesh
              castShadow
              receiveShadow
              position={[sleeveWristX, sleeveWristY, -0.01]}
              rotation={[0, 0, -SLEEVE_ROT_Z]}
            >
              <cylinderGeometry args={[0.029, 0.028, 0.018, 32]} />
              <meshStandardMaterial
                color={trimColor}
                roughness={0.5}
                metalness={0.02}
              />
            </mesh>
          )}

          <mesh
            castShadow
            receiveShadow
            position={[-sleeveCX, sleeveCY, -0.01]}
            rotation={[0, 0, SLEEVE_ROT_Z]}
          >
            <cylinderGeometry
              args={[
                0.042,
                colors.sleeve === "Long" ? 0.028 : 0.034,
                sleeveLen,
                32,
              ]}
            />
            <meshStandardMaterial
              color={colors.primaryFront || colors.primary}
              roughness={roughness}
              normalMap={fabricConfig.normalMap || undefined}
              normalScale={fabricConfig.normalScale}
              metalness={0.03}
              envMapIntensity={1.1}
            />
          </mesh>
          {colors.sleeve === "Long" && (
            <mesh
              castShadow
              receiveShadow
              position={[-sleeveWristX, sleeveWristY, -0.01]}
              rotation={[0, 0, SLEEVE_ROT_Z]}
            >
              <cylinderGeometry args={[0.029, 0.028, 0.018, 32]} />
              <meshStandardMaterial
                color={trimColor}
                roughness={0.5}
                metalness={0.02}
              />
            </mesh>
          )}
        </group>
      )}

      {colors.sleeve === "Sleeveless" && (
        <group>
          <mesh
            castShadow
            receiveShadow
            position={[SLEEVE_SEAM_X, SLEEVE_SEAM_Y, -0.01]}
            rotation={[0, 0, -SLEEVE_ROT_Z]}
          >
            <torusGeometry args={[0.042, 0.006, 16, 48]} />
            <meshStandardMaterial color={trimColor} roughness={0.55} />
          </mesh>
          <mesh
            castShadow
            receiveShadow
            position={[-SLEEVE_SEAM_X, SLEEVE_SEAM_Y, -0.01]}
            rotation={[0, 0, SLEEVE_ROT_Z]}
          >
            <torusGeometry args={[0.042, 0.006, 16, 48]} />
            <meshStandardMaterial color={trimColor} roughness={0.55} />
          </mesh>
        </group>
      )}
    </group>
  );
}

// Preload shirt GLTF model
useGLTF.preload("/models/shirt_baked.glb");

export default function Jersey3DViewer({ threeRef, texturesRef }) {
  const state = useCustomizerStore((s) => s.state);
  const currentView = useCustomizerStore((s) => s.currentView);
  const selectedDesign = useCustomizerStore((s) => s.selectedDesign);
  const loadedPatterns = useCustomizerStore((s) => s.loadedPatterns);
  const textLayers = useCustomizerStore((s) => s.textLayers);
  const logoLayers = useCustomizerStore((s) => s.logoLayers);
  const loadedLogoImages = useCustomizerStore((s) => s.loadedLogoImages);
  const layersOrder = useCustomizerStore((s) => s.layersOrder);
  const dynamicShapes = useCustomizerStore((s) => s.dynamicShapes);

  return (
    <Canvas
      camera={{ position: [0, 0.1, 4], fov: 38 }}
      className="w-full h-full cursor-grab active:cursor-grabbing"
      gl={{
        antialias: true,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 0.9,
        preserveDrawingBuffer: true,
      }}
    >
      <ThreeGrabber threeRef={threeRef} />
      <color attach="background" args={["transparent"]} />
      <ambientLight intensity={1.2} />
      <Environment preset="city" />
      <directionalLight position={[1, 4, 5]} intensity={1.0} castShadow />
      <directionalLight position={[-1, 3, -5]} intensity={1.0} />
      <pointLight position={[-3, 1, 2]} intensity={0.5} />
      <pointLight position={[3, 1, -2]} intensity={0.5} />
      <Center>
        <Jersey3D
          texturesRef={texturesRef}
          colors={{
            ...state,
            designPattern: selectedDesign,
            dynamicShapes,
            loadedPatterns,
            textLayers,
            logoLayers,
            loadedLogoImages,
            layersOrder,
          }}
          collar={state.collar}
        />
      </Center>
      <ContactShadows
        position={[0, -1.5, 0]}
        opacity={0.3}
        scale={8}
        blur={3}
      />
      <ViewHandler currentView={currentView} />
    </Canvas>
  );
}
