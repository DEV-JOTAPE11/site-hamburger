"use client";

import { useEffect, useRef } from "react";

import { useStage } from "@/components/StageProvider";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { clamp, easeInOut, hasFinePointer, lerp, prefersReducedMotion, smoothstep } from "@/lib/motion";

/**
 * Hambúrguer 3D (Three.js) que vive num canvas fixo do tamanho da tela.
 *
 * - Na hero ele aparece "explodido": cada camada flutua separada, inclinada,
 *   com fatias de tomate e bacon voando em volta (o estilo da referência).
 * - Ao rolar, as camadas se juntam, ele gira 360° e desce até pousar na
 *   placa de vidro da seção de destaque.
 *
 * A posição na tela vem dos "slots" da hero e do destaque (getBoundingClientRect
 * a cada frame), então o objeto acompanha a página sem salto em nenhum ponto.
 * Sem WebGL ou com movimento reduzido, ficam as fotos estáticas dos slots.
 */
export default function Burger3D() {
  const { heroRef, heroSlotRef, featureSlotRef } = useStage();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const hero = heroRef.current;
    const a = heroSlotRef.current;
    const b = featureSlotRef.current;
    if (!canvas || !hero || !a || !b || prefersReducedMotion()) return;

    let disposed = false;
    let cleanup: (() => void) | undefined;

    (async () => {
      const THREE = await import("three");
      const { RoomEnvironment } = await import("three/examples/jsm/environments/RoomEnvironment.js");
      const { buildBurger } = await import("@/three/buildBurger");
      if (disposed) return;

      let renderer: InstanceType<typeof THREE.WebGLRenderer>;
      try {
        renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
      } catch {
        return; // sem WebGL: as fotos estáticas continuam visíveis
      }
      const small = window.matchMedia("(max-width: 899.98px)").matches;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, small ? 1.75 : 2));
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 0.92;

      const scene = new THREE.Scene();
      const pmrem = new THREE.PMREMGenerator(renderer);
      const env = pmrem.fromScene(new RoomEnvironment(), 0.04);
      scene.environment = env.texture;
      scene.environmentIntensity = 0.45;

      scene.add(new THREE.HemisphereLight("#fff6ea", "#6b4a30", 0.6));
      const key = new THREE.DirectionalLight("#fff1dc", 1.9);
      key.position.set(-4, 6, 7);
      scene.add(key);
      const rim = new THREE.DirectionalLight("#ffb466", 2.2);
      rim.position.set(5, 3, -6);
      scene.add(rim);
      const fill = new THREE.DirectionalLight("#ffe2c0", 0.45);
      fill.position.set(6, -1, 5);
      scene.add(fill);

      const FOV = 26;
      const CAM_Z = 16;
      const camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 100);
      camera.position.set(0, 0, CAM_Z);

      const manager = new THREE.LoadingManager();
      const loaded = new Promise<void>((res) => {
        manager.onLoad = () => res();
        manager.onError = () => res();
      });
      const model = buildBurger(renderer, manager);

      /* pivô no centro do hambúrguer: o grupo externo gira e anda */
      const pivot = new THREE.Group();
      const inner = model.root;
      pivot.add(inner);
      scene.add(pivot);

      const resize = () => {
        const w = window.innerWidth;
        const h = window.innerHeight;
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
      };
      resize();
      window.addEventListener("resize", resize);

      await loaded;
      if (disposed) {
        model.dispose();
        renderer.dispose();
        return;
      }

      const root = document.documentElement;
      root.dataset.fly = "1";

      const st = ScrollTrigger.create({
        trigger: hero,
        start: "top top",
        endTrigger: b,
        end: "center 55%",
        invalidateOnRefresh: true,
      });

      const intro = { v: 0 };
      const introTween = gsap.to(intro, { v: 1, duration: 2.4, delay: 0.1, ease: "brasa" });
      const pointer = { x: 0, y: 0 };
      const ps = { x: 0, y: 0 };
      const onMove = (e: PointerEvent) => {
        pointer.x = e.clientX / window.innerWidth - 0.5;
        pointer.y = e.clientY / window.innerHeight - 0.5;
      };
      if (hasFinePointer()) window.addEventListener("pointermove", onMove, { passive: true });

      const tick = (time: number) => {
        const ra = a.getBoundingClientRect();
        const rb = b.getBoundingClientRect();
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        const p = st.progress;
        const e = easeInOut(p);
        const arc = Math.sin(Math.PI * p);
        const iv = intro.v;

        /* explosão: total na hero, some na primeira metade do voo */
        const explode = (1 - smoothstep(p / 0.6)) * lerp(2.2, 1, iv);

        /* camadas */
        model.layers.forEach((l, i) => {
          const o = l.obj;
          const bob = Math.sin(time * 1.3 + i * 0.9) * 0.05 * Math.min(explode, 1);
          if (l.extra) {
            const k = clamp(explode, 0, 1.6);
            o.visible = k > 0.02;
            o.position.set(l.out![0] * k, l.y + bob * 2, l.out![1] * k);
            o.rotation.set(l.tiltX * k + time * 0.4, l.spin * time * 0.3, l.tiltZ * k);
            o.scale.setScalar(0.75 * Math.min(k, 1));
            return;
          }
          o.position.y = l.y + l.lift * explode + bob;
          o.rotation.x = l.tiltX * explode * 0.85;
          o.rotation.z = l.tiltZ * explode * 0.85;
          o.rotation.y = l.spin * explode;
        });
        model.shadow.material.opacity = clamp(1 - explode * 0.6, 0.25, 1);

        const H = lerp(model.heightAssembled, model.heightExploded, clamp(explode, 0, 1));
        inner.position.y = -H / 2;

        /* trajetória entre os dois slots */
        const ax = ra.left + ra.width / 2;
        const ay = ra.top + ra.height / 2;
        const bx = rb.left + rb.width / 2;
        const by = rb.top + rb.height / 2;
        const cx = lerp(ax, bx, e) + arc * vw * 0.1;
        const cy = lerp(ay, by, e);
        const hpx = lerp(ra.height, rb.height, e);

        const perPx = (2 * CAM_Z * Math.tan(((FOV / 2) * Math.PI) / 180)) / vh;
        const scale = ((hpx * lerp(0.76, 0.86, e) * perPx) / H) * lerp(0.6, 1, iv);
        pivot.scale.setScalar(scale);
        pivot.position.set((cx - vw / 2) * perPx, -(cy - vh / 2) * perPx, 0);

        ps.x = lerp(ps.x, pointer.x, 0.05);
        ps.y = lerp(ps.y, pointer.y, 0.05);
        const still = 1 - arc;
        pivot.rotation.y = time * 0.22 + e * Math.PI * 2 + ps.x * 0.6 * still - (1 - iv) * 3;
        pivot.rotation.x = lerp(0.34, 0.2, e) + ps.y * 0.18 * still + arc * 0.12;
        pivot.rotation.z = -0.14 * arc;

        /* fora da tela? não renderiza */
        const half = (H * scale) / perPx / 2;
        const off = cy + half < -100 || cy - half > vh + 100;
        canvas.style.visibility = off ? "hidden" : "visible";
        canvas.style.opacity = String(clamp(iv * 2, 0, 1));
        if (!off) renderer.render(scene, camera);
      };
      gsap.ticker.add(tick);

      cleanup = () => {
        gsap.ticker.remove(tick);
        introTween.kill();
        st.kill();
        window.removeEventListener("resize", resize);
        window.removeEventListener("pointermove", onMove);
        delete root.dataset.fly;
        model.dispose();
        env.texture.dispose();
        pmrem.dispose();
        renderer.dispose();
      };
    })();

    return () => {
      disposed = true;
      cleanup?.();
    };
  }, [heroRef, heroSlotRef, featureSlotRef]);

  return <canvas ref={canvasRef} className="burger3d" aria-hidden />;
}
