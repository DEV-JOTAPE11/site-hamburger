import * as THREE from "three";

/**
 * Hambúrguer 3D procedural. Toda a geometria é gerada aqui (torno, planos
 * deformados, cilindros) e os materiais usam texturas recortadas da foto real
 * do hambúrguer (public/3d/*.jpg) + mapas de relevo derivados delas — por
 * isso a crosta do pão, a carne e o bacon têm a cara da foto, mas o objeto
 * tem volume de verdade e pode girar 360°.
 *
 * Unidades: raio do pão ≈ 1. A base do pão de baixo fica em y = 0.
 */

export interface Layer {
  obj: THREE.Object3D;
  /** altura de repouso (montado) */
  y: number;
  /** deslocamento extra quando "explodido" */
  lift: number;
  /** inclinação quando explodido */
  tiltX: number;
  tiltZ: number;
  /** giro próprio quando explodido */
  spin: number;
  /** peças extras: somem quando o hambúrguer se monta */
  extra?: boolean;
  /** para onde a peça extra voa (x, z) */
  out?: [number, number];
}

export interface BurgerModel {
  root: THREE.Group;
  layers: Layer[];
  shadow: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>;
  /** altura montado / explodido (para o enquadramento) */
  heightAssembled: number;
  heightExploded: number;
  dispose: () => void;
}

/* ---------------------------------------------------------------- ruído */
function hash(x: number, y: number) {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return s - Math.floor(s);
}
function noise2(x: number, y: number) {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const xf = x - xi;
  const yf = y - yi;
  const u = xf * xf * (3 - 2 * xf);
  const v = yf * yf * (3 - 2 * yf);
  const a = hash(xi, yi);
  const b = hash(xi + 1, yi);
  const c = hash(xi, yi + 1);
  const d = hash(xi + 1, yi + 1);
  return (a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v) * 2 - 1;
}
/** ruído periódico em θ (não deixa costura nas peças de torno) */
const ringNoise = (theta: number, y: number, freq: number) =>
  noise2(Math.cos(theta) * freq + 10, Math.sin(theta) * freq + y * 3) * 0.6 +
  noise2(Math.cos(theta) * freq * 2.3 + 40, Math.sin(theta) * freq * 2.3 + y * 7) * 0.4;
const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(Math.max((x - a) / (b - a), 0), 1);
  return t * t * (3 - 2 * t);
};

/* ---------------------------------------------------------------- texturas */
function loadTextures(maxAniso: number, manager?: THREE.LoadingManager) {
  const loader = new THREE.TextureLoader(manager);
  const cache: THREE.Texture[] = [];
  const get = (name: string, color = true, repeatX = 1, repeatY = 0) => {
    const t = loader.load(`/3d/${name}.jpg`);
    t.wrapS = THREE.RepeatWrapping;
    t.wrapT = repeatY ? THREE.RepeatWrapping : THREE.ClampToEdgeWrapping;
    t.repeat.set(repeatX, repeatY || 1);
    t.anisotropy = maxAniso;
    t.colorSpace = color ? THREE.SRGBColorSpace : THREE.NoColorSpace;
    cache.push(t);
    return t;
  };
  return { get, cache };
}

/** corte transversal do tomate desenhado em canvas (polpa, gomos e sementes) */
function tomatoFace(): THREE.CanvasTexture {
  const s = 1024;
  const c = document.createElement("canvas");
  c.width = c.height = s;
  const g = c.getContext("2d")!;
  const cx = s / 2;
  g.fillStyle = "#c81d10";
  g.beginPath();
  g.arc(cx, cx, s / 2, 0, Math.PI * 2);
  g.fill();
  const flesh = g.createRadialGradient(cx, cx, s * 0.05, cx, cx, s * 0.47);
  flesh.addColorStop(0, "#d93a22");
  flesh.addColorStop(0.7, "#c8220f");
  flesh.addColorStop(1, "#b0180a");
  g.fillStyle = flesh;
  g.beginPath();
  g.arc(cx, cx, s * 0.46, 0, Math.PI * 2);
  g.fill();
  // gomos com gel e sementes
  const lobes = 4;
  for (let i = 0; i < lobes; i++) {
    const a = (i / lobes) * Math.PI * 2 + 0.4;
    const lx = cx + Math.cos(a) * s * 0.24;
    const ly = cx + Math.sin(a) * s * 0.24;
    g.save();
    g.translate(lx, ly);
    g.rotate(a);
    const gel = g.createRadialGradient(0, 0, 4, 0, 0, s * 0.15);
    gel.addColorStop(0, "rgba(240,150,70,0.95)");
    gel.addColorStop(1, "rgba(200,50,20,0.9)");
    g.fillStyle = gel;
    g.beginPath();
    g.ellipse(0, 0, s * 0.15, s * 0.1, 0, 0, Math.PI * 2);
    g.fill();
    for (let k = 0; k < 9; k++) {
      const sa = (k / 9) * Math.PI * 2;
      g.fillStyle = "#f6dc8a";
      g.beginPath();
      g.ellipse(Math.cos(sa) * s * 0.08, Math.sin(sa) * s * 0.05, 12, 7, sa, 0, Math.PI * 2);
      g.fill();
    }
    g.restore();
  }
  // miolo claro
  g.fillStyle = "rgba(255,150,110,0.6)";
  g.beginPath();
  g.arc(cx, cx, s * 0.07, 0, Math.PI * 2);
  g.fill();
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/** molho da casa visto de cima: rosado, com pimenta-do-reino */
function sauceFace(): THREE.CanvasTexture {
  const s = 1024;
  const c = document.createElement("canvas");
  c.width = c.height = s;
  const g = c.getContext("2d")!;
  g.fillStyle = "#e58a45";
  g.fillRect(0, 0, s, s);
  for (let i = 0; i < 900; i++) {
    const x = hash(i, 1) * s;
    const y = hash(i, 2) * s;
    const r = 1 + hash(i, 3) * 3;
    g.fillStyle = i % 3 ? "rgba(255,214,180,0.35)" : "rgba(70,40,20,0.55)";
    g.beginPath();
    g.arc(x, y, r, 0, Math.PI * 2);
    g.fill();
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/** sombra de contato (gradiente radial) */
function shadowTexture(): THREE.CanvasTexture {
  const s = 512;
  const c = document.createElement("canvas");
  c.width = c.height = s;
  const g = c.getContext("2d")!;
  const gr = g.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
  gr.addColorStop(0, "rgba(60,20,0,0.55)");
  gr.addColorStop(0.55, "rgba(60,20,0,0.22)");
  gr.addColorStop(1, "rgba(60,20,0,0)");
  g.fillStyle = gr;
  g.fillRect(0, 0, s, s);
  return new THREE.CanvasTexture(c);
}

/* ---------------------------------------------------------------- peças */
function lathe(points: [number, number][], segments = 160) {
  return new THREE.LatheGeometry(
    points.map(([x, y]) => new THREE.Vector2(x, y)),
    segments,
  );
}

/** desloca radialmente os vértices de um torno com ruído (bordas irregulares) */
function roughen(geo: THREE.BufferGeometry, amount: number, freq: number, keepEnds = true) {
  const pos = geo.attributes.position as THREE.BufferAttribute;
  const uv = geo.attributes.uv as THREE.BufferAttribute;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const z = pos.getZ(i);
    const y = pos.getY(i);
    const r = Math.hypot(x, z);
    if (r < 1e-4) continue;
    const th = Math.atan2(z, x);
    const v = uv.getY(i);
    const w = keepEnds ? Math.sin(Math.PI * v) : 1;
    const k = 1 + ringNoise(th, y, freq) * amount * w;
    pos.setX(i, x * k);
    pos.setZ(i, z * k);
  }
  geo.computeVertexNormals();
}

/** pinta os vértices por altura (gradiente entre paradas [y, r, g, b]) */
function paintY(geo: THREE.BufferGeometry, stops: [number, number, number, number][]) {
  const p = geo.attributes.position as THREE.BufferAttribute;
  const col = new Float32Array(p.count * 3);
  for (let i = 0; i < p.count; i++) {
    const y = p.getY(i);
    let k = 0;
    while (k < stops.length - 2 && y > stops[k + 1][0]) k++;
    const [y0, r0, g0, b0] = stops[k];
    const [y1, r1, g1, b1] = stops[k + 1];
    const t = smooth(y0, y1, y);
    col.set([r0 + (r1 - r0) * t, g0 + (g1 - g0) * t, b0 + (b1 - b0) * t], i * 3);
  }
  geo.setAttribute("color", new THREE.BufferAttribute(col, 3));
}

export function buildBurger(renderer: THREE.WebGLRenderer, manager?: THREE.LoadingManager): BurgerModel {
  const aniso = renderer.capabilities.getMaxAnisotropy();
  const { get, cache } = loadTextures(aniso, manager);
  const geos: THREE.BufferGeometry[] = [];
  const mats: THREE.Material[] = [];
  const keep = <G extends THREE.BufferGeometry>(g: G) => (geos.push(g), g);
  const mk = <M extends THREE.Material>(m: M) => (mats.push(m), m);

  const root = new THREE.Group();
  const layers: Layer[] = [];

  /* ---------- materiais */
  /* brioche: textura real da crosta + gradiente por vértice (borda clara,
     topo dourado-escuro) e verniz de gema (clearcoat) */
  const bunTop = mk(
    new THREE.MeshPhysicalMaterial({
      map: get("bun-top", true, 3, 1.5),
      bumpMap: get("bun-top-bump", false, 3, 1.5),
      bumpScale: 0.35,
      vertexColors: true,
      roughness: 0.34,
      clearcoat: 0.7,
      clearcoatRoughness: 0.22,
      sheen: 0.3,
      sheenColor: new THREE.Color("#ffd9a0"),
    }),
  );
  const bunBottom = mk(
    new THREE.MeshPhysicalMaterial({
      map: get("bun-top", true, 4, 0.6),
      bumpMap: get("bun-top-bump", false, 4, 0.6),
      bumpScale: 0.3,
      vertexColors: true,
      roughness: 0.45,
      clearcoat: 0.25,
      clearcoatRoughness: 0.45,
    }),
  );
  const crumb = mk(
    new THREE.MeshStandardMaterial({ map: get("crumb", true, 1.5, 1.5), bumpMap: get("crumb-bump", false, 1.5, 1.5), bumpScale: 1.5, roughness: 0.92 }),
  );
  const bunBase = mk(new THREE.MeshStandardMaterial({ color: "#c98a3d", roughness: 0.7 }));
  /* lateral da carne: crosta recortada da própria foto do hambúrguer */
  const pattyTex = get("patty-side", true, 2);
  const pattyBump = get("patty-side-bump", false, 2);
  const patty = mk(
    new THREE.MeshPhysicalMaterial({
      map: pattyTex,
      bumpMap: pattyBump,
      color: new THREE.Color(1.15, 1.08, 1.02),
      bumpScale: 6,
      roughness: 0.55,
      clearcoat: 0.25,
      clearcoatRoughness: 0.45,
    }),
  );
  const pattyCap = mk(
    new THREE.MeshPhysicalMaterial({
      map: get("patty", true, 1, 2),
      bumpMap: get("patty-bump", false, 1, 2),
      bumpScale: 3,
      roughness: 0.6,
      clearcoat: 0.2,
    }),
  );
  const cheese = mk(
    new THREE.MeshPhysicalMaterial({
      color: "#f28c0f",
      roughness: 0.22,
      clearcoat: 0.9,
      clearcoatRoughness: 0.12,
      sheen: 0.4,
      sheenColor: new THREE.Color("#ffb347"),
      side: THREE.DoubleSide,
    }),
  );
  const bacon = mk(
    new THREE.MeshPhysicalMaterial({
      map: get("bacon", true, 1),
      bumpMap: get("bacon-bump", false, 1),
      color: "#ffe2d6",
      bumpScale: 2,
      roughness: 0.4,
      clearcoat: 0.55,
      clearcoatRoughness: 0.3,
      side: THREE.DoubleSide,
    }),
  );
  const tomatoSide = mk(
    new THREE.MeshPhysicalMaterial({ map: get("tomato-side", true, 2), roughness: 0.2, clearcoat: 1, clearcoatRoughness: 0.08 }),
  );
  const faceTex = tomatoFace();
  cache.push(faceTex);
  const tomatoTop = mk(new THREE.MeshPhysicalMaterial({ map: faceTex, roughness: 0.35, clearcoat: 0.35, clearcoatRoughness: 0.2, envMapIntensity: 0.4 }));
  const sauce = mk(
    new THREE.MeshPhysicalMaterial({ map: get("sauce", true, 2), roughness: 0.3, clearcoat: 0.8, clearcoatRoughness: 0.2 }),
  );
  const lettuce = mk(
    new THREE.MeshPhysicalMaterial({
      map: get("lettuce", true, 1, 1),
      bumpMap: get("lettuce-bump", false, 1, 1),
      bumpScale: 1.2,
      vertexColors: true,
      roughness: 0.42,
      clearcoat: 0.3,
      clearcoatRoughness: 0.35,
      sheen: 0.6,
      sheenColor: new THREE.Color("#e8ffb8"),
      side: THREE.DoubleSide,
    }),
  );

  /* ---------- construtores */
  const makeBottomBun = () => {
    const g = new THREE.Group();
    const side = keep(
      lathe([
        [0.92, 0],
        [0.99, 0.025],
        [1.03, 0.09],
        [1.045, 0.18],
        [1.04, 0.27],
        [1.02, 0.34],
        [0.985, 0.38],
      ]),
    );
    roughen(side, 0.012, 1.4);
    paintY(side, [
      [0, 1.05, 0.82, 0.6],
      [0.12, 1.4, 1.22, 0.95],
      [0.38, 1.5, 1.38, 1.1],
    ]);
    g.add(new THREE.Mesh(side, bunBottom));
    const base = keep(new THREE.CircleGeometry(0.93, 128));
    base.rotateX(Math.PI / 2);
    g.add(new THREE.Mesh(base, bunBase));
    const top = keep(new THREE.CircleGeometry(0.99, 128));
    top.rotateX(-Math.PI / 2);
    top.translate(0, 0.38, 0);
    g.add(new THREE.Mesh(top, crumb));
    return g;
  };

  const makeTopBun = () => {
    const g = new THREE.Group();
    const pts: [number, number][] = [[0.97, -0.03], [1.025, 0.02]];
    const N = 40;
    for (let k = 1; k <= N; k++) {
      const phi = (k / N) * (Math.PI / 2);
      const n = 2.35; // superelipse: domo mais "cheio" que uma meia-esfera
      const c = Math.cos(phi);
      const s = Math.sin(phi);
      pts.push([1.04 * Math.pow(c, 2 / n), 0.02 + 0.86 * Math.pow(s, 2 / n)]);
    }
    pts[pts.length - 1] = [0, pts[pts.length - 1][1]];
    const dome = keep(lathe(pts, 200));
    roughen(dome, 0.01, 1.2);
    paintY(dome, [
      [-0.03, 1.55, 1.42, 1.15],
      [0.1, 1.25, 1.02, 0.72],
      [0.4, 0.95, 0.7, 0.45],
      [0.88, 0.78, 0.52, 0.32],
    ]);
    g.add(new THREE.Mesh(dome, bunTop));
    const under = keep(new THREE.CircleGeometry(0.975, 128));
    under.rotateX(Math.PI / 2);
    under.translate(0, -0.03, 0);
    g.add(new THREE.Mesh(under, crumb));
    return g;
  };

  const makePatty = (seed: number) => {
    const g = new THREE.Group();
    const h = 0.3;
    const prof: [number, number][] = [];
    for (let k = 0; k <= 28; k++) {
      const t = k / 28;
      // perfil arredondado e levemente abaulado no meio
      const r = 0.965 + Math.sin(Math.PI * t) * 0.11 - Math.pow(Math.abs(t - 0.45), 3) * 0.1;
      prof.push([r, t * h]);
    }
    const side = keep(lathe(prof, 220));
    roughen(side, 0.05 + seed * 0.006, 2.6);
    roughen(side, 0.03, 11);
    g.add(new THREE.Mesh(side, patty));
    for (const y of [0, h]) {
      const cap = keep(new THREE.CircleGeometry(0.975, 128));
      cap.rotateX(y === 0 ? Math.PI / 2 : -Math.PI / 2);
      cap.translate(0, y, 0);
      g.add(new THREE.Mesh(cap, pattyCap));
    }
    return g;
  };

  const makeCheese = (rot: number) => {
    const g = new THREE.Group();
    const geo = keep(new THREE.PlaneGeometry(2.1, 2.1, 110, 110));
    geo.rotateX(-Math.PI / 2);
    geo.rotateY(rot);
    const p = geo.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i);
      const z = p.getZ(i);
      const r = Math.hypot(x, z);
      const th = Math.atan2(z, x);
      let y = 0.012 * noise2(x * 4, z * 4);
      let rr = r;
      if (r > 0.9) y -= smooth(0.9, 1.04, r) * 0.05;
      if (r > 1.02) {
        // além da borda da carne: a fatia escorre colada na lateral
        const over = r - 1.02;
        rr = 1.02 + over * 0.12;
        y -= Math.min(over * (1.25 + 0.5 * noise2(th * 3, 1)), 0.42);
      }
      const k = rr / (r || 1);
      p.setXYZ(i, x * k, y, z * k);
    }
    geo.computeVertexNormals();
    g.add(new THREE.Mesh(geo, cheese));
    // pingos
    const drips = 5;
    for (let i = 0; i < drips; i++) {
      const a = rot + (i / drips) * Math.PI * 2 + hash(i, rot) * 0.6;
      const len = 0.1 + hash(rot, i) * 0.22;
      const d = keep(new THREE.CapsuleGeometry(0.045, len, 6, 16));
      const m = new THREE.Mesh(d, cheese);
      m.position.set(Math.cos(a) * 1.04, -0.08 - len / 2, Math.sin(a) * 1.04);
      m.scale.set(1, 1, 0.6);
      m.rotation.y = -a;
      g.add(m);
    }
    return g;
  };

  const makeBaconStrip = (len: number, phase: number) => {
    const geo = keep(new THREE.PlaneGeometry(len, 0.36, 180, 10));
    const p = geo.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i);
      const y = p.getY(i);
      const wave = Math.sin(x * 6 + phase) * 0.05 + Math.sin(x * 15 + phase * 2) * 0.014;
      const cup = y * y * 0.4;
      const edge = Math.sin(x * 21 + y * 9) * 0.01 * Math.abs(y) * 6;
      const droop = -Math.max(Math.abs(x) - 0.95, 0) * 0.35;
      p.setZ(i, wave + cup + edge + droop);
    }
    geo.rotateX(-Math.PI / 2);
    geo.computeVertexNormals();
    return new THREE.Mesh(geo, bacon);
  };

  const makeBacon = (seed: number) => {
    const g = new THREE.Group();
    const n = 3;
    for (let i = 0; i < n; i++) {
      const s = makeBaconStrip(2.35 + hash(seed, i) * 0.3, seed * 3 + i * 1.7);
      s.rotation.y = seed + (i / n) * Math.PI + (hash(i, seed) - 0.5) * 0.3;
      s.position.y = i * 0.02;
      s.position.x = (hash(seed + 1, i) - 0.5) * 0.15;
      g.add(s);
    }
    return g;
  };

  const makeLettuce = () => {
    const geo = keep(new THREE.RingGeometry(0.02, 1.2, 320, 28));
    const p = geo.attributes.position as THREE.BufferAttribute;
    const colors = new Float32Array(p.count * 3);
    // tons multiplicam a textura da folha: miolo claro, bordas mais verdes
    const inner = new THREE.Color(1.25, 1.3, 1.0);
    const outer = new THREE.Color(0.92, 1.0, 0.78);
    const fold = new THREE.Color(0.55, 0.7, 0.45);
    const c = new THREE.Color();
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i);
      const y = p.getY(i);
      const r = Math.hypot(x, y);
      const th = Math.atan2(y, x);
      const ruf = (Math.sin(th * 31 + noise2(th * 3, 0) * 4) * 0.6 + Math.sin(th * 53 + 1.1) * 0.4) * smooth(0.78, 1.2, r);
      const big = Math.sin(th * 7 + 1.3 + noise2(th, 4) * 2) * smooth(0.5, 1.2, r);
      const z = ruf * 0.085 + big * 0.07 - smooth(0.8, 1.2, r) * 0.16;
      // contorno irregular: cada folha avança um pouco diferente
      const k = r > 0.6 ? 1 + (noise2(Math.cos(th) * 3 + 5, Math.sin(th) * 3) * 0.09) * smooth(0.6, 1.2, r) : 1;
      p.setXYZ(i, x * k, y * k, z);
      c.copy(inner).lerp(outer, smooth(0.35, 1.15, r));
      if (ruf < 0) c.lerp(fold, -ruf * 0.45);
      colors.set([c.r, c.g, c.b], i * 3);
    }
    geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    geo.rotateX(-Math.PI / 2);
    geo.computeVertexNormals();
    return new THREE.Mesh(geo, lettuce);
  };

  const makeTomato = () => {
    const geo = keep(new THREE.CylinderGeometry(0.42, 0.42, 0.09, 72));
    return new THREE.Mesh(geo, [tomatoSide, tomatoTop, tomatoTop]);
  };

  const sauceTopTex = sauceFace();
  cache.push(sauceTopTex);
  const sauceTop = mk(new THREE.MeshPhysicalMaterial({ map: sauceTopTex, roughness: 0.28, clearcoat: 0.9, clearcoatRoughness: 0.15 }));
  const makeSauce = (r = 1.0) => {
    const g = new THREE.Group();
    const band = keep(
      lathe([
        [r * 0.97, 0],
        [r * 1.04, 0.012],
        [r * 1.05, 0.03],
        [r * 0.95, 0.055],
      ]),
    );
    roughen(band, 0.035, 3, false);
    g.add(new THREE.Mesh(band, sauce));
    const top = keep(new THREE.CircleGeometry(r * 0.96, 128));
    top.rotateX(-Math.PI / 2);
    top.translate(0, 0.054, 0);
    g.add(new THREE.Mesh(top, sauceTop));
    return g;
  };

  /* ---------- empilhamento (de baixo para cima) */
  const add = (obj: THREE.Object3D, y: number, i: number, extra = false, out?: [number, number]) => {
    root.add(obj);
    layers.push({
      obj,
      y,
      lift: i * 0.21,
      tiltX: (hash(i, 7) - 0.5) * 0.5,
      tiltZ: (hash(i, 13) - 0.5) * 0.5,
      spin: (hash(i, 21) - 0.5) * 1.2,
      extra,
      out,
    });
  };

  let y = 0;
  const bottom = makeBottomBun();
  const s1 = makeSauce();
  s1.position.y = 0.38;
  bottom.add(s1);
  add(bottom, y, 0);
  y += 0.43;
  const tomatoes = new THREE.Group();
  for (let i = 0; i < 3; i++) {
    const t = makeTomato();
    const a = (i / 3) * Math.PI * 2 + 0.5;
    t.position.set(Math.cos(a) * 0.58, 0.045, Math.sin(a) * 0.58);
    t.rotation.set((hash(i, 3) - 0.5) * 0.08, a, (hash(i, 5) - 0.5) * 0.08);
    tomatoes.add(t);
  }
  add(tomatoes, y, 2);
  y += 0.1;
  add(makeLettuce(), y, 3);
  y += 0.06;
  add(makePatty(1), y, 4);
  y += 0.3;
  add(makeCheese(0.35), y + 0.005, 5);
  y += 0.02;
  add(makeBacon(1), y, 6);
  y += 0.07;
  add(makePatty(2), y, 7);
  y += 0.3;
  add(makeCheese(1.1), y + 0.005, 8);
  y += 0.02;
  add(makeBacon(4), y, 9);
  y += 0.07;
  const topBun = makeTopBun();
  const s2 = makeSauce(0.98);
  s2.position.y = -0.085;
  topBun.add(s2);
  add(topBun, y + 0.08, 10);
  const heightAssembled = y + 0.97;
  const top = layers[layers.length - 1];
  const heightExploded = heightAssembled + top.lift;

  /* ---------- peças extras da "explosão" (somem ao montar) */
  const extras: [THREE.Object3D, number, [number, number]][] = [
    [makeTomato(), 0.9, [-1.9, 0.6]],
    [makeTomato(), 2.6, [1.95, -0.4]],
    [makeBaconStrip(1.5, 2), 3.2, [-1.7, -0.2]],
    [makeBaconStrip(1.3, 5), 1.6, [1.8, 0.5]],
  ];
  extras.forEach(([o, yy, out], i) => {
    o.scale.setScalar(0.75);
    add(o, yy, 0, true, out);
    const l = layers[layers.length - 1];
    l.tiltX = 0.9 * (i % 2 ? 1 : -1);
    l.tiltZ = 0.6;
    l.spin = 2;
  });

  /* ---------- sombra de contato */
  const shadowTex = shadowTexture();
  cache.push(shadowTex);
  const shadowGeo = keep(new THREE.PlaneGeometry(3.2, 3.2));
  shadowGeo.rotateX(-Math.PI / 2);
  const shadowMat = mk(new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false }));
  const shadow = new THREE.Mesh(shadowGeo, shadowMat);
  shadow.position.y = -0.02;
  shadow.renderOrder = -1;
  root.add(shadow);

  const dispose = () => {
    geos.forEach((g) => g.dispose());
    mats.forEach((m) => m.dispose());
    cache.forEach((t) => t.dispose());
  };

  return { root, layers, shadow, heightAssembled, heightExploded, dispose };
}
