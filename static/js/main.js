(() => {
  const demos = window.ROBIN_DEMOS || [];

  // ---------- 1. Sticky nav + scrollspy ----------
  const nav = document.getElementById("topnav");
  const navLinks = [...document.querySelectorAll(".topnav .links a")];
  const sections = navLinks.map((a) => document.querySelector(a.getAttribute("href"))).filter(Boolean);

  const onScroll = () => {
    nav.classList.toggle("solid", window.scrollY > 40);
    const y = window.scrollY + 120;
    let cur = sections[0];
    for (const s of sections) {
      if (s.offsetTop <= y) cur = s;
    }
    navLinks.forEach((a) => a.classList.toggle("active", cur && a.getAttribute("href") === `#${cur.id}`));
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // ---------- 2. Hero drifting mosaic (World Sim + Depth + Normals + 3D Point Clouds + Camera Fields) ----------
  const mosaic = document.getElementById("mosaic");
  if (mosaic && demos.length) {
    const worldPosters = demos.map((d) => d.poster);
    const camTiles = [
      "static/img/mosaic/cam_aurora_field.jpg",
      "static/img/mosaic/cam_rooftops_field.jpg",
      "static/img/mosaic/cam_classroom_field.jpg",
      "static/img/feedback/fb_r0_target.jpg",
      "static/img/feedback/fb_r1_target.jpg",
      "static/img/dense/dense_0_2.jpg",
    ];
    const pts3dTiles = [
      "static/img/mosaic/pts3d_library.jpg",
      "static/img/mosaic/pts3d_staircase.jpg",
      "static/img/mosaic/pts3d_racer.jpg",
      "static/img/mosaic/pts3d_courtyard.jpg",
      "static/img/mosaic/pts3d_living.jpg",
      "static/img/mosaic/pts3d_desert.jpg",
    ];
    const geoMapTiles = [
      "static/img/mosaic/depth_racer.jpg",
      "static/img/dense/dense_1_6.jpg",
      "static/img/mosaic/depth_courtyard.jpg",
      "static/img/dense/dense_gt_2_4.jpg",
      "static/img/dense/dense_gt_3_4.jpg",
      "static/img/dense/dense_gt_4_4.jpg",
      "static/img/dense/dense_0_6.jpg",
      "static/img/dense/dense_gt_2_2.jpg",
    ];
    const mixed = [];
    const maxLen = Math.max(worldPosters.length, camTiles.length, pts3dTiles.length, geoMapTiles.length);
    for (let i = 0; i < maxLen; i++) {
      mixed.push(worldPosters[i % worldPosters.length]);
      mixed.push(pts3dTiles[i % pts3dTiles.length]);
      mixed.push(geoMapTiles[i % geoMapTiles.length]);
      mixed.push(camTiles[i % camTiles.length]);
    }
    for (let r = 0; r < 5; r++) {
      const row = document.createElement("div");
      row.className = "row";
      const offset = (r * 5) % mixed.length;
      const shifted = mixed.slice(offset).concat(mixed.slice(0, offset));
      const doubled = shifted.concat(shifted);
      doubled.forEach((src) => {
        const img = document.createElement("img");
        img.src = src;
        img.alt = "";
        img.loading = "eager";
        row.appendChild(img);
      });
      mosaic.appendChild(row);
    }
  }

  // ---------- 3. Reveal, staggered bar charts & count-up KPI metrics ----------
  function animateBars(box) {
    if (!box || box.dataset.barsDone) return;
    box.dataset.barsDone = "1";
    const min = parseFloat(box.dataset.min || "0");
    const max = parseFloat(box.dataset.max || "100");
    box.classList.add("animated");
    box.querySelectorAll(".fill").forEach((f, idx) => {
      const targetVal = parseFloat(f.dataset.v || "0");
      const dec = (f.dataset.v || "").includes(".") ? (f.dataset.v.split(".")[1] || "").length : 0;
      const pct = Math.max(4, Math.min(100, ((targetVal - min) / (max - min)) * 100));
      f.style.transitionDelay = `${idx * 95}ms`;
      setTimeout(() => {
        f.style.width = `${pct.toFixed(1)}%`;
        const t0 = performance.now();
        const dur = 820;
        const startVal = Math.max(min, targetVal * 0.65);
        function step(now) {
          const p = Math.min(1, (now - t0) / dur);
          const ease = 1 - Math.pow(1 - p, 3);
          const cur = startVal + (targetVal - startVal) * ease;
          f.textContent = cur.toFixed(dec);
          if (p < 1) requestAnimationFrame(step);
          else f.textContent = f.dataset.v;
        }
        requestAnimationFrame(step);
      }, idx * 95);
    });
  }

  function animateVBars(container) {
    if (container.dataset.done) return;
    container.dataset.done = "1";
    const min = parseFloat(container.dataset.min || "0");
    const max = parseFloat(container.dataset.max || "100");
    const cols = [...container.querySelectorAll(".vcol")];
    cols.forEach((col, idx) => {
      const f = col.querySelector(".vfill");
      const valEl = col.querySelector(".vval");
      if (!f) return;
      const v = parseFloat(f.dataset.v);
      const pct = Math.max(12, Math.min(100, ((v - min) / (max - min)) * 100));
      setTimeout(() => {
        f.style.height = pct + "%";
        if (valEl) {
          const t0 = performance.now();
          const dur = 850;
          const start = min;
          function step(now) {
            const p = Math.min(1, (now - t0) / dur);
            const ease = 1 - Math.pow(1 - p, 3);
            valEl.textContent = (start + (v - start) * ease).toFixed(2) + "%";
            if (p < 1) requestAnimationFrame(step);
            else valEl.textContent = v.toFixed(2) + "%";
          }
          requestAnimationFrame(step);
        }
      }, idx * 95);
    });
  }

  const barObs = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          if (e.target.hasAttribute("data-vbars")) animateVBars(e.target);
          else animateBars(e.target);
          barObs.unobserve(e.target);
        }
      });
    },
    { threshold: 0.25 }
  );
  document.querySelectorAll("[data-bars], [data-vbars]").forEach((b) => barObs.observe(b));

  const revObs = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("in");
          revObs.unobserve(e.target);
        }
      });
    },
    { threshold: 0.08 }
  );
  function revealVisible() {
    const vh = window.innerHeight || 900;
    document.querySelectorAll(".reveal:not(.in)").forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.top < vh * 0.96 && r.bottom > 40) {
        el.classList.add("in");
      }
    });
  }
  document.querySelectorAll(".reveal").forEach((el) => revObs.observe(el));
  window.addEventListener("scroll", revealVisible, { passive: true });
  window.addEventListener("hashchange", () => setTimeout(revealVisible, 80));
  setTimeout(revealVisible, 120);

  // ---------- 4. Image comparison slider ----------
  function initCmp(el) {
    const knob = el.querySelector(".knob");
    const min = 0.02;
    const max = 0.98;
    let pos = 0.52;
    const set = (p) => {
      pos = Math.max(min, Math.min(max, p));
      const pct = (pos * 100).toFixed(2);
      el.style.setProperty("--cmp-pos", `${pct}%`);
      knob.setAttribute("aria-valuenow", pct);
    };
    let activePointer = null;
    const setManual = (p) => {
      el.classList.add("touched");
      set(p);
    };
    const move = (clientX) => {
      const rect = el.getBoundingClientRect();
      setManual((clientX - rect.left - el.clientLeft) / el.clientWidth);
    };
    el.addEventListener("pointerdown", (e) => {
      if (activePointer !== null || !e.isPrimary || e.button !== 0) return;
      e.preventDefault();
      activePointer = e.pointerId;
      el.setPointerCapture(e.pointerId);
      el.classList.add("dragging");
      move(e.clientX);
    });
    el.addEventListener("pointermove", (e) => {
      if (activePointer === e.pointerId) move(e.clientX);
    });
    el.addEventListener("lostpointercapture", (e) => {
      if (activePointer !== e.pointerId) return;
      activePointer = null;
      el.classList.remove("dragging");
    });
    knob.addEventListener("keydown", (e) => {
      const step = 0.02;
      switch (e.key) {
        case "ArrowLeft":
        case "ArrowDown": setManual(pos - step); break;
        case "ArrowRight":
        case "ArrowUp": setManual(pos + step); break;
        case "Home": setManual(min); break;
        case "End": setManual(max); break;
        default: return;
      }
      e.preventDefault();
    });
  }
  document.querySelectorAll(".cmp").forEach(initCmp);

  // ---------- 5. Exact Remotion-Aligned Architecture Overlay (2048x820) ----------
  const archBoard = document.getElementById("arch-board");
  const archCutouts = document.getElementById("arch-cutouts");
  const archActiveArrows = document.getElementById("arch-active-arrows");
  const archModuleOutlines = document.getElementById("arch-module-outlines");
  const archHotspots = document.getElementById("arch-hotspots");
  const archFlows = [...document.querySelectorAll("#arch-flows .flow-pulse")];
  const archChoiceBtns = [...document.querySelectorAll("#arch-choices button")];
  const archAllBtn = document.getElementById("arch-all-btn");
  const archPlayBtn = document.getElementById("arch-play-btn");
  const inspTitle = document.getElementById("insp-title");
  const inspDesc = document.getElementById("insp-desc");
  const inspMeta = document.getElementById("insp-meta");
  const defaultArchDescription = inspDesc?.textContent;

  // Tight inner module boxes ONLY (zero empty white card backgrounds!) from Remotion TSX (2048x820)
  const ARCH_BOXES = {
    in_imgs: { x: 20,   y: 50,  w: 226, h: 126, r: 6, color: "#94a3b8", routes: ["cam", "geo", "qa", "sim"], wires: ["w-img-vis", "w-img-dino", "w-img-vae"], title: "Input Images I₀", meta: "Observed RGB / Video Frames", desc: "Input observation frames passed into Vision Encoder, VAE, and DINOv3." },
    in_q:    { x: 26,   y: 212, w: 120, h: 66,  r: 6, color: "#94a3b8", routes: ["qa", "sim"], wires: ["w-in-text"], title: "Caption & Spatial Question q", meta: "Text Prompts", desc: "Text caption and spatial question tokens encoded into shared context T and Understanding." },
    in_cam:  { x: 18,   y: 342, w: 226, h: 144, r: 6, color: "#38bdf8", routes: ["sim"], wires: ["w-in-rope"], title: "Continuous Camera Path {Cₖ}", meta: "Cₖ = (Rₖ, tₖ, Kₖ)", desc: "Target 6-DoF camera trajectory injected into the shared SolarWM-H3 DiT via camera-aware RoPE." },
    in_pose: { x: 24,   y: 580, w: 220, h: 98,  r: 6, color: "#38bdf8", routes: ["sim"], wires: ["w-in-rope"], title: "Discrete Pose Queries Cₖ", meta: "Independent Viewpoint Jumps", desc: "Specifies arbitrary target viewpoints Cₖ without generating intermediate frames." },
    in_time: { x: 24,   y: 696, w: 220, h: 102, r: 6, color: "#38bdf8", routes: ["sim"], wires: ["w-in-rope"], title: "Physical Time Queries τₖ | t*", meta: "Evolving τₖ = tₖ vs. Fixed t*", desc: "Decouples scene time from camera motion for evolving or bullet-time observations." },

    enc_cap: { x: 352,  y: 289, w: 34,  h: 34,  r: 6, color: "#22d3ee", routes: ["qa", "sim"], wires: ["w-in-text"], title: "Caption Token", meta: "Text Input", desc: "Text prompt entering the Text Tokenizer." },
    enc_tok: { x: 320,  y: 369, w: 98,  h: 46,  r: 5, color: "#22d3ee", routes: ["qa", "sim"], wires: ["w-in-text"], title: "Text Tokenizer", meta: "Text Embeddings", desc: "Tokenizes captions and prompts into the shared context sequence T." },
    enc_ctx: { x: 452,  y: 338, w: 42,  h: 108, r: 6, color: "#22d3ee", routes: ["cam", "geo", "qa", "sim"], wires: ["w-in-text", "w-img-vis", "w-enc-vlm", "w-ctx-dit"], title: "Shared Context T", meta: "Multimodal Context Tokens", desc: "Shared visual-text context sent up to Understanding and down to the DiT generator." },
    enc_img: { x: 551,  y: 272, w: 118, h: 68,  r: 5, color: "#22d3ee", routes: ["cam", "geo", "qa", "sim"], wires: ["w-img-vis", "w-img-dino", "w-img-vae"], title: "Observed Frame I₀", meta: "Visual Input", desc: "Source observation encoded simultaneously by Vision Encoder, DINOv3, and VAE." },
    enc_vis: { x: 512,  y: 369, w: 88,  h: 46,  r: 5, color: "#22d3ee", routes: ["cam", "geo", "qa", "sim"], wires: ["w-img-vis"], title: "Vision Encoder", meta: "Qwen3-VL Vision Tokens", desc: "Encodes visual patches into shared context T." },
    enc_dino:{ x: 626,  y: 369, w: 80,  h: 46,  r: 5, color: "#a78bfa", routes: ["qa"], wires: ["w-img-dino", "w-dino-fusion"], title: "DINOv3 Encoder", meta: "16×16 Dense Correspondence", desc: "Extracts auxiliary dense geometric correspondence features H_aux." },
    enc_vae: { x: 574,  y: 432, w: 72,  h: 40,  r: 5, color: "#38bdf8", routes: ["geo", "sim"], wires: ["w-img-vae", "w-vae-dit"], title: "Visual VAE", meta: "Image Latents", desc: "Encodes image observations into continuous DiT latent space." },

    vlm_ctx: { x: 323,  y: 48,  w: 310, h: 134, r: 6, color: "#a78bfa", routes: ["cam", "geo", "qa", "sim"], wires: ["w-enc-vlm", "w-vlm-s0"], title: "Qwen3-VL Self-Attention Blocks", meta: "Context T → VLM Blocks", desc: "Unified visual-language transformer shared across camera estimation, spatial QA, and DiT conditioning." },
    vlm_s0:  { x: 654,  y: 54,  w: 114, h: 118, r: 6, color: "#a78bfa", routes: ["cam", "geo", "qa", "sim"], wires: ["w-vlm-s0", "w-s0-trk"], title: "Shared State S₀", meta: "Layer-50 State · All Tasks", desc: "Base multimodal state before CoGT geometric grounding." },
    vlm_trk: { x: 795,  y: 76,  w: 507, h: 74,  r: 10, color: "#a78bfa", routes: ["cam", "qa"], wires: ["w-s0-trk", "w-fusion-vlm", "w-fit-vlm", "w-vlm-cam", "w-vlm-qa"], title: "Reasoning & Answer Track", meta: "views S′ · question q · <think> · <answer> c A", desc: "Receives grounded tokens H and refined camera ĉ to emit <think> traces, camera c, and answer A." },

    cogt_fus:{ x: 772,  y: 278, w: 158, h: 198, r: 6, color: "#a78bfa", routes: ["qa"], wires: ["w-dino-fusion", "w-sketch-fusion", "w-fusion-vlm"], title: "CoGT · Spatial-Grounded Fusion", meta: "DINO + Sketch → Grounded Tokens H", desc: "Pools generated geometric maps on the 16×16 grid, merges DINOv3 correspondence, and injects tokens H via SGF (Eq. 4)." },
    cogt_skt:{ x: 942,  y: 278, w: 198, h: 198, r: 6, color: "#34d399", routes: ["cam", "qa"], wires: ["w-geo-sketch", "w-sketch-fusion", "w-sketch-fit"], title: "CoGT · Geometric Sketchpad", meta: "Self-Generated Maps G = (F, ρ, N)", desc: "Holds pixel-aligned perspective field F, normalized inverse depth ρ, and surface normals N fed back from Generation." },
    cogt_fit:{ x: 1152, y: 278, w: 140, h: 198, r: 6, color: "#fb7185", routes: ["cam"], wires: ["w-sketch-fit", "w-fit-vlm"], title: "CoGT · Camera-Field Fit", meta: "Residual Gate w_F(E) → Refined ĉ", desc: "Optimizes roll, pitch, and log vFoV against field F and refines camera orientation gated by residual consistency E(c^F)." },

    rope:    { x: 292,  y: 696, w: 84,  h: 30,  r: 12, color: "#38bdf8", routes: ["sim"], wires: ["w-in-rope"], title: "Camera-Time RoPE", meta: "Rotary Positional Encoding", desc: "Injects 6-DoF camera trajectory and physical time queries into DiT attention." },
    dit:     { x: 409,  y: 604, w: 410, h: 174, r: 6,  color: "#38bdf8", routes: ["cam", "geo", "qa", "sim"], wires: ["w-in-rope", "w-ctx-dit", "w-vae-dit", "w-dit-rgb", "w-dit-geo"], title: "Generation · Shared SolarWM-H3 DiT", meta: "Context || Image latents || Noise · DiT blocks", desc: "Diffusion transformer where RGB appearance and geometry tokens cross-attend to image context and each other over 40 Euler steps." },
    rgb_head:{ x: 858,  y: 573, w: 64,  h: 46,  r: 5,  color: "#38bdf8", routes: ["sim"], wires: ["w-dit-rgb"], title: "RGB Appearance Head", meta: "RGB Head → Synthesized View Iₖ", desc: "Decodes RGB appearance tokens from shared DiT attention blocks." },
    geo_head:{ x: 858,  y: 700, w: 64,  h: 46,  r: 5,  color: "#34d399", routes: ["cam", "geo", "qa"], wires: ["w-dit-geo"], title: "Dense Geometry Head", meta: "Geo Head → G = (F, ρ, N)", desc: "Jointly decodes perspective field F, inverse depth ρ, and surface normals N." },
    out_rgb: { x: 958,  y: 544, w: 108, h: 127, r: 6,  color: "#38bdf8", routes: ["sim"], wires: ["w-dit-rgb", "w-rgb-sim"], title: "Generated RGB View Iₖ", meta: "RGB Head Output", desc: "Synthesized view at queried camera pose Cₖ and physical time τₖ." },
    out_geo1:{ x: 1070, y: 544, w: 108, h: 127, r: 6,  color: "#34d399", routes: ["cam", "geo", "qa"], wires: ["w-dit-geo", "w-geo-sketch", "w-geo-3d"], title: "Generated Field F", meta: "Geo Head Output", desc: "Dense perspective field encoding pixel up-vectors and ray latitudes." },
    out_geo2:{ x: 958,  y: 675, w: 220, h: 127, r: 6,  color: "#34d399", routes: ["cam", "geo", "qa"], wires: ["w-dit-geo", "w-geo-sketch", "w-geo-3d"], title: "Generated Depth ρ & Normals N", meta: "Geo Head Output", desc: "Hole-free inverse depth and surface normals for 3D lifting and CoGT reasoning." },

    cam_in:  { x: 1347, y: 49,  w: 292, h: 80,  r: 5, color: "#fb7185", routes: ["cam"], wires: ["w-vlm-cam"], title: "Camera Perception · Visual & Field", meta: "Image I₀ → Field F", desc: "Predicted horizon and pixel up-vectors overlaid on the input frame." },
    cam_out: { x: 1649, y: 42,  w: 378, h: 96,  r: 5, color: "#fb7185", routes: ["cam"], wires: ["w-vlm-cam"], title: "Camera Calibration & Active Re-Level", meta: "31/36 #1 · MegaDepth 0.24° / 0.81° / 1.57°", desc: "Outputs roll, pitch, vFoV, elevation category, and active re-leveling feedback (−41.9% error)." },

    qa_in:   { x: 1347, y: 205, w: 262, h: 106, r: 5, color: "#a78bfa", routes: ["qa"], wires: ["w-vlm-qa"], title: "Spatial Reasoning · Image + Sketchpad", meta: "I₀ + (ρ, N) Sketchpad", desc: "Self-generated depth and surface normals aligned with the observed room." },
    qa_out:  { x: 1622, y: 213, w: 405, h: 94,  r: 5, color: "#a78bfa", routes: ["qa"], wires: ["w-vlm-qa"], title: "Geometry-Grounded Answer", meta: "CV 87.4% · VSI 76.50% · MMSI 37.2% · BLINK 50.08%", desc: "CoGT evidence resolves relative 3D layout where direct inference fails." },

    geo_in:  { x: 1347, y: 372, w: 680, h: 138, r: 6, color: "#34d399", routes: ["geo"], wires: ["w-geo-3d"], title: "3D Geometry & Uncalibrated Lifting", meta: "NYUv2 δ₁ 0.992 (#1) · Normals 12.3° (#1) · Relᴾ 0.0340", desc: "Jointly generates perspective fields, inverse depth, and normals, lifting intrinsic-free 3D point clouds." },

    sim_in:  { x: 1219, y: 578, w: 138, h: 222, r: 6, color: "#38bdf8", routes: ["sim"], wires: ["w-rgb-sim"], title: "World Sim · Anchor, JEPA Z & 3D Cloud", meta: "I₀ · JEPA State Z · 3D Cloud X*", desc: "Shared anchor frame paired with V-JEPA 2.1 world state and lifted 3D point cloud." },
    sim_out: { x: 1381, y: 578, w: 646, h: 222, r: 6, color: "#38bdf8", routes: ["sim"], wires: ["w-rgb-sim"], title: "Discrete Space & Frozen Time", meta: "WBench 79.0 · WMB 7.98 · JEPA Z (+7.74 dB) · 3D Cloud (0.934)", desc: "Generates discrete viewpoint jumps and fixed-time bullet-time views from one model." },
  };
  const ARCH_ROUTES = {
    cam: {
      boxes: ["in_imgs", "enc_img", "enc_vis", "enc_ctx", "vlm_ctx", "vlm_s0", "vlm_trk", "dit", "geo_head", "out_geo1", "out_geo2", "cogt_skt", "cogt_fit", "cam_in", "cam_out"],
      wires: ["w-img-vis", "w-enc-vlm", "w-ctx-dit", "w-vlm-s0", "w-s0-trk", "w-dit-geo", "w-geo-sketch", "w-sketch-fit", "w-fit-vlm", "w-vlm-cam"],
      color: "#9f3e52",
      title: "Camera Perception & Closed-Loop Feedback",
      meta: "I → ĉ ← w_F(E)·c^F  |  η = 0.85 Feedback (−41.9%)",
      desc: "Camera-Field Fit refines the initial pose using the perspective field generated by the DiT.",
    },
    geo: {
      boxes: ["in_imgs", "enc_img", "enc_vis", "enc_vae", "enc_ctx", "vlm_ctx", "vlm_s0", "dit", "geo_head", "out_geo1", "out_geo2", "geo_in"],
      wires: ["w-img-vis", "w-img-vae", "w-enc-vlm", "w-ctx-dit", "w-vae-dit", "w-vlm-s0", "w-dit-geo", "w-geo-3d"],
      color: "#2b7a5e",
      title: "Dense 3D Geometry & Intrinsic-Free Lifting",
      meta: "G = (F, ρ, N) → X_cam = d(p)·K⁻¹·p̃",
      desc: "The shared DiT predicts geometry maps for lifting 3D point clouds without ground-truth intrinsics.",
    },
    qa: {
      boxes: ["in_imgs", "in_q", "enc_cap", "enc_tok", "enc_img", "enc_vis", "enc_dino", "enc_ctx", "vlm_ctx", "vlm_s0", "vlm_trk", "dit", "geo_head", "out_geo1", "out_geo2", "cogt_skt", "cogt_fus", "qa_in", "qa_out"],
      wires: ["w-in-text", "w-img-vis", "w-img-dino", "w-enc-vlm", "w-ctx-dit", "w-vlm-s0", "w-s0-trk", "w-dino-fusion", "w-dit-geo", "w-geo-sketch", "w-sketch-fusion", "w-fusion-vlm", "w-vlm-qa"],
      color: "#5b4d96",
      title: "Spatial Reasoning via Chain of Geometric Thought",
      meta: "S' = S + tanh(α)·W_o·softmax(QKᵀ/√d + log(π(S)+ε))V(H)",
      desc: "CoGT feeds generated geometry and DINOv3 features back into Qwen3-VL.",
    },
    sim: {
      boxes: ["in_imgs", "in_q", "in_cam", "in_pose", "in_time", "enc_cap", "enc_tok", "enc_img", "enc_vis", "enc_vae", "enc_ctx", "vlm_ctx", "vlm_s0", "rope", "dit", "rgb_head", "out_rgb", "sim_in", "sim_out"],
      wires: ["w-in-text", "w-img-vis", "w-img-vae", "w-enc-vlm", "w-ctx-dit", "w-vae-dit", "w-vlm-s0", "w-in-rope", "w-dit-rgb", "w-rgb-sim"],
      color: "#2563a8",
      title: "Controllable World Simulation",
      meta: "Îₖ = R_θ(Z, I, Cₖ, τₖ)  |  V̂ = R_θ(Z, V, {Cₖ}, t*, Ṽ)",
      desc: "SolarWM-H3 takes camera and time queries, while V-JEPA 2.1 state guides discrete viewpoint jumps.",
    },
  };

  let archPlaying = true;

  function renderArchOverlay(boxIds, wireIds, color, info) {
    if (!archBoard || !archCutouts || !archModuleOutlines || !archActiveArrows) return;
    archCutouts.innerHTML = "";
    archModuleOutlines.innerHTML = "";
    archActiveArrows.innerHTML = "";
    if (!boxIds || !boxIds.length) {
      archBoard.classList.remove("is-focused");
      archFlows.forEach((f) => f.classList.remove("is-dim"));
      inspTitle.textContent = "Unified Spatial Architecture";
      inspMeta.textContent = "Qwen3-VL ↔ SolarWM-H3 DiT ↔ CoGT";
      inspDesc.textContent = defaultArchDescription;
      return;
    }

    archBoard.classList.add("is-focused");
    // 1. Tight cutouts ONLY around exact inner module boxes (NO ugly white sausage masks on wires!)
    boxIds.forEach((id) => {
      const b = ARCH_BOXES[id];
      if (!b) return;
      const cut = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      cut.setAttribute("x", b.x); cut.setAttribute("y", b.y);
      cut.setAttribute("width", b.w); cut.setAttribute("height", b.h);
      cut.setAttribute("rx", b.r || 8); cut.setAttribute("fill", "black");
      archCutouts.appendChild(cut);

      const outline = cut.cloneNode();
      outline.removeAttribute("fill");
      outline.setAttribute("class", "module-outline");
      outline.style.color = color || b.color;
      archModuleOutlines.appendChild(outline);
    });

    // 2. Render crisp animated flowing dashed arrows ON TOP of the dimmed scrim (no white sausage!)
    const activeWires = wireIds || [];
    archFlows.forEach((f) => {
      const hit = activeWires.includes(f.dataset.id);
      f.classList.toggle("is-dim", true);
      if (hit) {
        f.querySelectorAll("path.flow-ink").forEach((p) => {
          const arrow = document.createElementNS("http://www.w3.org/2000/svg", "path");
          arrow.setAttribute("class", "active-flow-arrow");
          arrow.setAttribute("d", p.getAttribute("d"));
          arrow.setAttribute("marker-end", "url(#flow-arr)");
          arrow.style.stroke = color || "#38bdf8";
          arrow.style.color = color || "#38bdf8";
          archActiveArrows.appendChild(arrow);
        });
      }
    });

    if (info) {
      inspTitle.textContent = info.title;
      inspMeta.textContent = info.meta;
      inspDesc.textContent = info.desc;
    }
  }

  function applyArchState({ route = null, boxId = null }) {
    if (boxId && ARCH_BOXES[boxId]) {
      const b = ARCH_BOXES[boxId];
      renderArchOverlay([boxId], b.wires || [], b.color, b);
    } else if (route && ARCH_ROUTES[route]) {
      const rObj = ARCH_ROUTES[route];
      renderArchOverlay(rObj.boxes, rObj.wires, rObj.color, rObj);
    } else {
      renderArchOverlay(null);
    }
  }

  // Coarse capability hotspots directly on the diagram (no micro-module clicking!)
  const CAPABILITY_HOTSPOTS = [
    { route: "cam", x: 1332, y: 6,   w: 710, h: 150, label: "Camera Perception" },
    { route: "cam", x: 1152, y: 278, w: 140, h: 198, label: "Camera-Field Fit" },
    { route: "qa",  x: 1332, y: 168, w: 710, h: 156, label: "Spatial Reasoning" },
    { route: "qa",  x: 772,  y: 278, w: 368, h: 198, label: "CoGT Fusion & Sketchpad" },
    { route: "geo", x: 1332, y: 336, w: 710, h: 184, label: "3D Geometry" },
    { route: "geo", x: 858,  y: 544, w: 320, h: 258, label: "Dense Geometry Outputs" },
    { route: "sim", x: 1204, y: 532, w: 838, h: 282, label: "World Simulation" },
    { route: "sim", x: 6,    y: 302, w: 250, h: 512, label: "Camera & Time Queries" },
  ];

  if (archHotspots) {
    CAPABILITY_HOTSPOTS.forEach((h) => {
      const btn = document.createElement("button");
      btn.className = "module-hotspot";
      btn.setAttribute("aria-label", h.label);
      btn.style.left = `${(h.x / 20.48).toFixed(2)}%`;
      btn.style.top = `${(h.y / 8.20).toFixed(2)}%`;
      btn.style.width = `${(h.w / 20.48).toFixed(2)}%`;
      btn.style.height = `${(h.h / 8.20).toFixed(2)}%`;
      btn.addEventListener("click", () => {
        archAllBtn?.classList.remove("on");
        archChoiceBtns.forEach((c) => c.classList.toggle("on", c.dataset.route === h.route));
        applyArchState({ route: h.route });
      });
      archHotspots.appendChild(btn);
    });

    archChoiceBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        const r = btn.dataset.route;
        archAllBtn?.classList.remove("on");
        archChoiceBtns.forEach((c) => c.classList.toggle("on", c === btn));
        applyArchState({ route: r });
      });
    });

    archAllBtn?.addEventListener("click", () => {
      archAllBtn.classList.add("on");
      archChoiceBtns.forEach((c) => c.classList.remove("on"));
      applyArchState({});
    });

    archPlayBtn?.addEventListener("click", () => {
      archPlaying = !archPlaying;
      archPlayBtn.textContent = archPlaying ? "Pause Pulse" : "Play Pulse";
      archFlows.forEach((f) => {
        f.style.animationPlayState = archPlaying ? "running" : "paused";
      });
    });

  }

  // ---------- 5B. High-Contrast Interactive 6-Stage Training Curriculum ----------
  const TRAIN_STAGES = [
    {
      id: 1, num: "STAGE 1", title: "Camera Perception",
      color: "#9f3e52", bg: "rgba(159,62,82,.09)", tint: "rgba(159,62,82,.045)", fg: "#881337", bd: "rgba(159,62,82,.28)",
      modules: "Qwen3-VL Backbone (I₀ → c) · LoRA r=64", params: "615.3M params",
      datasets: ["Puffin-4M", "Puffin-Cam-15M"],
    },
    {
      id: 2, num: "STAGE 2", title: "Spatial Reasoning",
      color: "#5b4d96", bg: "rgba(91,77,150,.09)", tint: "rgba(91,77,150,.045)", fg: "#4c1d95", bd: "rgba(91,77,150,.28)",
      modules: "VLM (r=32) + Frozen DINOv3 + Spatial Fusion", params: "45.2M SGF",
      datasets: ["VSI-590K", "CoVT", "Puffin-4M"],
    },
    {
      id: 3, num: "STAGE 3", title: "Generator Alignment",
      color: "#2563a8", bg: "rgba(37,99,168,.09)", tint: "rgba(37,99,168,.045)", fg: "#1e3a8a", bd: "rgba(37,99,168,.28)",
      modules: "33B SolarWM-H3 DiT (Layer-50 + Cam RoPE) · r=384", params: "2.08B params",
      datasets: ["Puffin-Traj-1M", "RealEstate10K"],
    },
    {
      id: 4, num: "STAGE 4", title: "Dense 3D Geometry",
      color: "#2b7a5e", bg: "rgba(43,122,94,.09)", tint: "rgba(43,122,94,.045)", fg: "#14532d", bd: "rgba(43,122,94,.28)",
      modules: "DiT Geo Head (F, ρ, N) · r=64 + Map Emb.", params: "681.1M params",
      datasets: ["SceneNet-RGBD", "ARKitScenes", "OmniWorld-Game", "TartanAir", "TUM RGB-D", "vKITTI 2", "LaMAR", "MegaDepth"],
    },
    {
      id: 5, num: "STAGE 5", title: "World Simulation",
      color: "#0e7490", bg: "rgba(14,116,144,.09)", tint: "rgba(14,116,144,.045)", fg: "#155e75", bd: "rgba(14,116,144,.28)",
      modules: "V-JEPA 2.1 Predictor + State Bridges + 3D Branch", params: "92.4M + 268.6M + 2.9M",
      datasets: ["Static Orbits", "DL3DV", "ScanNet", "RealEstate10K", "OmniWorld-Game", "uCO3D"],
    },
    {
      id: 6, num: "STAGE 6", title: "CoGT Closed Loop",
      color: "#b45309", bg: "rgba(180,83,9,.09)", tint: "rgba(180,83,9,.045)", fg: "#78350f", bd: "rgba(180,83,9,.28)",
      modules: "Map Encoder + Spatial Fusion + Field Fit Loop", params: "26.8M + 45.2M",
      datasets: ["VSI-590K", "CoVT", "Puffin-4M", "Puffin-Cam-15M"],
    },
  ];
  const CORPUS_18 = [
    { name: "Puffin-Traj-1M", size: "102.3M" },
    { name: "Puffin-Cam-15M", size: "15.3M" },
    { name: "Puffin-4M", size: "4.0M" },
    { name: "ScanNet", size: "2.3M" },
    { name: "DL3DV", size: "2.2M" },
    { name: "SceneNet-RGBD", size: "1.8M" },
    { name: "Static Orbits", size: "1.2M" },
    { name: "RealEstate10K", size: "595K" },
    { name: "VSI-590K", size: "590K" },
    { name: "ARKitScenes", size: "432K" },
    { name: "OmniWorld-Game", size: "406K" },
    { name: "uCO3D", size: "237K" },
    { name: "TartanAir", size: "232K" },
    { name: "CoVT", size: "150K" },
    { name: "MegaDepth", size: "130K" },
    { name: "TUM RGB-D", size: "56K" },
    { name: "vKITTI 2", size: "26K" },
    { name: "LaMAR", size: "19K" },
  ];

  const trainFlowWrap = document.querySelector(".train-flow-wrap");
  const trainGrid = document.getElementById("train-grid");
  const corpusGrid = document.getElementById("corpus-grid");
  const trainBadge = document.getElementById("train-stage-badge");
  const trainWires = [...document.querySelectorAll(".train-wires-svg .t-wire")];
  let selectedStage = null;

  function focusStage(st) {
    if (!trainGrid || !corpusGrid) return;
    selectedStage = st;
    trainGrid.querySelectorAll(".st-card").forEach((card) => {
      const selected = Number(card.dataset.sid) === st?.id;
      card.classList.toggle("lit", selected);
      card.setAttribute("aria-pressed", String(selected));
    });
    const dsEls = [...corpusGrid.querySelectorAll(".ds-pill")];

    if (!st) {
      trainFlowWrap?.classList.remove("has-focus");
      trainGrid.classList.remove("has-focus");
      corpusGrid.classList.remove("has-focus");
      dsEls.forEach((p) => p.classList.remove("lit"));
      trainWires.forEach((w) => w.classList.remove("lit"));
      trainBadge.textContent = "Select a stage to highlight its datasets";
      return;
    }

    trainFlowWrap?.classList.add("has-focus");
    trainGrid.classList.add("has-focus");
    corpusGrid.classList.add("has-focus");
    dsEls.forEach((p) => {
      const hit = st.datasets.includes(p.dataset.ds);
      p.classList.toggle("lit", hit);
      if (hit) p.style.setProperty("--lit-color", st.color);
    });
    trainWires.forEach((w) => {
      const sts = (w.dataset.stages || "").split(",").map(Number);
      w.classList.toggle("lit", sts.includes(st.id));
    });
    trainBadge.textContent = `${st.num} · ${st.title} (${st.params}) — ${st.datasets.length} datasets`;
  }

  if (trainGrid && corpusGrid) {
    TRAIN_STAGES.forEach((st) => {
      const c = document.createElement("div");
      c.className = "st-card";
      c.tabIndex = 0;
      c.setAttribute("role", "button");
      c.setAttribute("aria-pressed", "false");
      c.dataset.sid = st.id;
      c.style.setProperty("--st-color", st.color);
      c.style.setProperty("--st-bg", st.bg);
      c.style.setProperty("--st-tint", st.tint);
      c.style.setProperty("--st-fg", st.fg);
      c.style.setProperty("--st-bd", st.bd);
      c.innerHTML = `
        <div class="top">
          <span class="badge-s">${st.num}</span>
          <span class="params">${st.params}</span>
        </div>
        <h4>${st.title}</h4>
        <div class="mod">${st.modules}</div>
        <div class="dat"><b>Data:</b> ${st.datasets.join(", ")}</div>`;
      c.addEventListener("click", () => focusStage(selectedStage === st ? null : st));
      c.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          c.click();
        }
      });
      trainGrid.appendChild(c);
    });
    CORPUS_18.forEach((ds) => {
      const p = document.createElement("div");
      p.className = "ds-pill";
      p.dataset.ds = ds.name;
      p.innerHTML = `<div class="n">${ds.name}</div><div class="sz">${ds.size}</div>`;
      corpusGrid.appendChild(p);
    });
  }

  // ---------- 6. Interactive Closed-Loop Camera Feedback ----------
  const FB_CASES = [
    { title: "Garage · Pitch −18.0°", drop: "−76%", detail: "Open-loop Iter 1 reaches −12.1° (5.9° error); 1-step CoGT feedback revises to −16.6° (1.4° error, −76%).", r: 0 },
    { title: "Garage · Roll +18.0°", drop: "−68%", detail: "Open-loop Iter 1 overshoots to +20.5° (2.5° error); 1-step feedback corrects to +17.2° (0.8° error, −68%).", r: 1 },
    { title: "Hallway · Roll +17.0°", drop: "−38%", detail: "Tilted hallway target (+11.8° roll): Iter 1 drifts 2.6°; closed-loop Iter 2 cuts error to 1.6° (−38%).", r: 2 },
    { title: "Street SUV · Roll +17.0°", drop: "−93%", detail: "Roll error drops from 3.0° down to 0.2° (−93%) in a single residual revision step (η = 0.85).", r: 3 },
    { title: "Barbershop · Pitch +17.0°", drop: "−36%", detail: "Upward pitch from −10.4° to +6.6°: Iter 1 falls short (+1.0°), Iter 2 reaches +10.0° (−36% error).", r: 4 },
  ];
  const fbChips = document.getElementById("fb-chips");
  const fbIter1 = document.getElementById("fb-iter1");
  const fbIter2 = document.getElementById("fb-iter2");
  const fbInput = document.getElementById("fb-input");
  const fbTarget = document.getElementById("fb-target");
  const fbNote = document.getElementById("fb-note");
  function setFb(idx) {
    const c = FB_CASES[idx];
    fbChips.querySelectorAll(".chip").forEach((b, i) => b.classList.toggle("on", i === idx));
    fbIter1.src = `static/img/feedback/fb_r${c.r}_iter1.jpg`;
    fbIter2.src = `static/img/feedback/fb_r${c.r}_iter2.jpg`;
    fbInput.src = `static/img/feedback/fb_r${c.r}_input.jpg`;
    fbTarget.src = `static/img/feedback/fb_r${c.r}_target.jpg`;
    fbNote.innerHTML = `<b>${c.title} (${c.drop} pose error)</b> — ${c.detail}`;
  }
  if (fbChips) {
    FB_CASES.forEach((c, i) => {
      const b = document.createElement("button");
      b.className = "chip" + (i === 0 ? " on" : "");
      b.innerHTML = `${c.title}<span class="v">${c.drop}</span>`;
      b.addEventListener("click", () => setFb(i));
      fbChips.appendChild(b);
    });
    setFb(0);
  }

  // ---------- 7. Interactive 3D Geometry Inspection (6 Scenes) ----------
  const GEO_SCENES = [
    {
      label: "Monument · Spirit of Freedom",
      rgb: "static/img/dense/dense_0_0.jpg",
      maps: {
        field:   { pred: "static/img/dense/dense_0_2.jpg", ref: "static/img/dense/dense_0_1.jpg", name: "Perspective Field F" },
        depth:   { pred: "static/img/dense/dense_0_4.jpg", ref: "static/img/dense/dense_0_3.jpg", name: "Inverse Depth ρ" },
        normals: { pred: "static/img/dense/dense_0_6.jpg", ref: "static/img/dense/dense_0_5.jpg", name: "Surface Normals N" },
      },
      note: "Hole-free depth & normals around foreground tripod legs and carved granite lettering where DA3/sensor maps drop out.",
    },
    {
      label: "Urban Street · Tilted Sign",
      rgb: "static/img/dense/dense_1_0.jpg",
      maps: {
        field:   { pred: "static/img/dense/dense_1_2.jpg", ref: "static/img/dense/dense_1_1.jpg", name: "Perspective Field F" },
        depth:   { pred: "static/img/dense/dense_1_4.jpg", ref: "static/img/dense/dense_1_3.jpg", name: "Inverse Depth ρ" },
        normals: { pred: "static/img/dense/dense_1_6.jpg", ref: "static/img/dense/dense_1_5.jpg", name: "Surface Normals N" },
      },
      note: "Captures steep camera roll via perspective field F alongside crisp street-tree & sign surface geometry.",
    },
    {
      label: "NYUv2 Bedroom",
      rgb: "static/img/dense/dense_gt_0_0.jpg",
      maps: {
        depth:   { pred: "static/img/dense/dense_gt_0_2.jpg", ref: "static/img/dense/dense_gt_0_1.jpg", name: "Inverse Depth ρ" },
        normals: { pred: "static/img/dense/dense_gt_0_4.jpg", ref: "static/img/dense/dense_gt_0_3.jpg", name: "Surface Normals N" },
      },
      note: "Zero-shot NYUv2: completes missing Kinect sensor dropouts cleanly with smooth planar bedding & wall normals.",
    },
    {
      label: "NYUv2 Living Room",
      rgb: "static/img/dense/dense_gt_1_0.jpg",
      maps: {
        depth:   { pred: "static/img/dense/dense_gt_1_2.jpg", ref: "static/img/dense/dense_gt_1_1.jpg", name: "Inverse Depth ρ" },
        normals: { pred: "static/img/dense/dense_gt_1_4.jpg", ref: "static/img/dense/dense_gt_1_3.jpg", name: "Surface Normals N" },
      },
      note: "Completes glossy TV screen & dark edge sensor holes (neutral gray in GT normals) with crisp furniture geometry.",
    },
    {
      label: "NYUv2 Glass Office",
      rgb: "static/img/dense/dense_gt_3_0.jpg",
      maps: {
        depth:   { pred: "static/img/dense/dense_gt_3_2.jpg", ref: "static/img/dense/dense_gt_3_1.jpg", name: "Inverse Depth ρ" },
        normals: { pred: "static/img/dense/dense_gt_3_4.jpg", ref: "static/img/dense/dense_gt_3_3.jpg", name: "Surface Normals N" },
      },
      note: "Dense surface recovery across glass partitions where raw depth sensors fail.",
    },
    {
      label: "NYUv2 Hallway",
      rgb: "static/img/dense/dense_gt_4_0.jpg",
      maps: {
        depth:   { pred: "static/img/dense/dense_gt_4_2.jpg", ref: "static/img/dense/dense_gt_4_1.jpg", name: "Inverse Depth ρ" },
        normals: { pred: "static/img/dense/dense_gt_4_4.jpg", ref: "static/img/dense/dense_gt_4_3.jpg", name: "Surface Normals N" },
      },
      note: "Zero-shot NYUv2 example.",
    },
  ];
  let geoSceneIdx = 0;
  let geoMod = "depth";
  let geoLeftMode = "rgb";
  const geoSceneChips = document.getElementById("geo-scene-chips");
  const geoModChips = document.getElementById("geo-mod-chips");
  const geoLeftChips = document.getElementById("geo-left-chips");
  const geoLeftImg = document.getElementById("geo-left-img");
  const geoRightImg = document.getElementById("geo-right-img");
  const geoLeftLab = document.getElementById("geo-left-lab");
  const geoRightLab = document.getElementById("geo-right-lab");
  const geoNote = document.getElementById("geo-note");

  // ---------- 7B. Interactive Three.js 3D Point Cloud & Frustum Viewer ----------
  const pcStage = document.getElementById("pc3d-stage");
  const pcCanvas = document.getElementById("pc3d-canvas");
  const pcSceneBadge = document.getElementById("pc3d-scene-badge");
  const pcColorChips = document.getElementById("pc3d-color-chips");
  const pcFrustumBtn = document.getElementById("pc3d-frustum-btn");
  const pcOrbitBtn = document.getElementById("pc3d-orbit-btn");
  const pcResetBtn = document.getElementById("pc3d-reset-btn");
  const pcSizeSlider = document.getElementById("pc3d-size");

  let pcViewer = null;
  if (pcStage && pcCanvas && window.THREE && THREE.OrbitControls) {
    try {
      const renderer = new THREE.WebGLRenderer({ canvas: pcCanvas, antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setClearColor(0xf1f5f9, 1);

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(44, 1, 0.05, 80);
      const controls = new THREE.OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.08;
      controls.autoRotate = true;
      controls.autoRotateSpeed = 0.9;
      controls.minDistance = 0.7;
      controls.maxDistance = 14;

      const worldGroup = new THREE.Group();
      scene.add(worldGroup);

      // Subtle academic floor grid & camera frustum group
      const gridHelper = new THREE.GridHelper(7.2, 18, 0x94a3b8, 0xcbd5e1);
      gridHelper.position.set(0, -1.35, -2.2);
      worldGroup.add(gridHelper);

      const frustumGroup = new THREE.Group();
      worldGroup.add(frustumGroup);

      const ptMat = new THREE.PointsMaterial({
        size: 0.044,
        vertexColors: true,
        sizeAttenuation: true,
      });
      const ptGeo = new THREE.BufferGeometry();
      const pointsMesh = new THREE.Points(ptGeo, ptMat);
      worldGroup.add(pointsMesh);

      const pcCache = new Map();
      let pcColorMode = "rgb";
      let pcCurData = null;
      let pcDefaultView = { target: [0, 0, -2.2], pos: [1.55, 0.78, 0.95] };
      let pcVisible = false;
      let pcReqId = 0;

      function loadImg(src) {
        return new Promise((res, rej) => {
          const im = new Image();
          im.crossOrigin = "anonymous";
          im.onload = () => res(im);
          im.onerror = rej;
          im.src = src;
        });
      }

      // Perceptual Viridis/Turbo-style colormap for Depth mode
      function depthColormap(t) {
        const x = Math.max(0, Math.min(1, t));
        const r = Math.min(1, Math.max(0, 1.5 * x - 0.15 + 0.35 * Math.sin(x * Math.PI * 1.3)));
        const g = Math.min(1, Math.max(0, Math.sin(x * Math.PI) * 0.92 + 0.08));
        const b = Math.min(1, Math.max(0, 0.92 - 1.15 * x + 0.25 * Math.sin(x * Math.PI * 2)));
        return [r, g, b];
      }

      function buildFrustum(aspect) {
        frustumGroup.clear();
        const fz = -0.58;
        const hh = Math.tan((28 * Math.PI) / 180) * Math.abs(fz);
        const hw = hh * aspect;
        const verts = new Float32Array([
          0, 0, 0, -hw,  hh, fz,
          0, 0, 0,  hw,  hh, fz,
          0, 0, 0,  hw, -hh, fz,
          0, 0, 0, -hw, -hh, fz,
          -hw,  hh, fz,  hw,  hh, fz,
           hw,  hh, fz,  hw, -hh, fz,
           hw, -hh, fz, -hw, -hh, fz,
          -hw, -hh, fz, -hw,  hh, fz,
        ]);
        const fg = new THREE.BufferGeometry();
        fg.setAttribute("position", new THREE.BufferAttribute(verts, 3));
        const fl = new THREE.LineSegments(fg, new THREE.LineBasicMaterial({ color: 0x9f3e52 }));
        frustumGroup.add(fl);
        const dot = new THREE.Mesh(
          new THREE.SphereGeometry(0.032, 12, 12),
          new THREE.MeshBasicMaterial({ color: 0x9f3e52 })
        );
        frustumGroup.add(dot);
      }

      function applyPointColors() {
        if (!pcCurData) return;
        const colArr = pcColorMode === "normals"
          ? pcCurData.colNorm
          : pcColorMode === "depth"
            ? pcCurData.colDepth
            : pcCurData.colRgb;
        ptGeo.setAttribute("color", new THREE.BufferAttribute(colArr, 3));
        ptGeo.attributes.color.needsUpdate = true;
      }

      function resetCameraView() {
        const [tx, ty, tz] = pcDefaultView.target;
        const [px, py, pz] = pcDefaultView.pos;
        controls.target.set(tx, ty, tz);
        camera.position.set(px, py, pz);
        controls.update();
      }

      async function buildSceneCloud(sc) {
        const key = sc.label;
        if (pcCache.has(key)) return pcCache.get(key);
        const [rgbIm, depIm, normIm] = await Promise.all([
          loadImg(sc.rgb),
          loadImg(sc.maps.depth.pred),
          loadImg(sc.maps.normals ? sc.maps.normals.pred : sc.rgb),
        ]);
        const W = 224;
        const H = Math.max(112, Math.round((W * rgbIm.naturalHeight) / Math.max(1, rgbIm.naturalWidth)));
        const readPixels = (im) => {
          const c = document.createElement("canvas");
          c.width = W; c.height = H;
          const x = c.getContext("2d", { willReadFrequently: true });
          x.drawImage(im, 0, 0, W, H);
          return x.getImageData(0, 0, W, H).data;
        };
        const dRgb = readPixels(rgbIm);
        const dDep = readPixels(depIm);
        const dNorm = readPixels(normIm);

        const rhoAt = (px, py) => {
          const i = (py * W + px) * 4;
          return 0.299 * dDep[i] + 0.587 * dDep[i + 1] + 0.114 * dDep[i + 2];
        };

        const f = (H / 2) / Math.tan((28 * Math.PI) / 180);
        const posList = [];
        const rgbList = [];
        const normList = [];
        const depthList = [];
        let sumX = 0, sumY = 0, sumZ = 0, minY = Infinity;

        for (let y = 1; y < H - 1; y++) {
          for (let x = 1; x < W - 1; x++) {
            const r = rhoAt(x, y);
            if (r < 12) continue;
            const gx = Math.abs(rhoAt(x + 1, y) - rhoAt(x - 1, y));
            const gy = Math.abs(rhoAt(x, y + 1) - rhoAt(x, y - 1));
            if (Math.max(gx, gy) > 28) continue;

            const rn = Math.max(0.04, Math.min(1.0, (r - 14) / 228));
            const d = 1.0 / (0.24 + 0.76 * rn);
            const X = ((x - W / 2) / f) * d;
            const Y = -((y - H / 2) / f) * d;
            const Z = -d;

            posList.push(X, Y, Z);
            sumX += X; sumY += Y; sumZ += Z;
            if (Y < minY) minY = Y;

            const idx = (y * W + x) * 4;
            rgbList.push(dRgb[idx] / 255, dRgb[idx + 1] / 255, dRgb[idx + 2] / 255);
            normList.push(dNorm[idx] / 255, dNorm[idx + 1] / 255, dNorm[idx + 2] / 255);
            const [dr, dg, db] = depthColormap(rn);
            depthList.push(dr, dg, db);
          }
        }

        const nPts = posList.length / 3;
        const data = {
          nPts,
          aspect: W / H,
          positions: new Float32Array(posList),
          colRgb: new Float32Array(rgbList),
          colNorm: new Float32Array(normList),
          colDepth: new Float32Array(depthList),
          center: nPts ? [sumX / nPts, sumY / nPts, sumZ / nPts] : [0, 0, -2.0],
          floorY: Number.isFinite(minY) ? Math.max(-2.2, minY - 0.05) : -1.1,
        };
        pcCache.set(key, data);
        return data;
      }

      async function set3DScene(sc, resetView = true) {
        const myReq = ++pcReqId;
        if (pcSceneBadge) pcSceneBadge.textContent = `Lifting ${sc.label.split(" · ")[0]}…`;
        try {
          const data = await buildSceneCloud(sc);
          if (myReq !== pcReqId) return;
          pcCurData = data;
          ptGeo.setAttribute("position", new THREE.BufferAttribute(data.positions, 3));
          ptGeo.computeBoundingSphere();
          applyPointColors();
          buildFrustum(data.aspect);
          gridHelper.position.set(data.center[0], data.floorY, data.center[2]);
          pcDefaultView = {
            target: [data.center[0], data.center[1] - 0.05, data.center[2] + 0.48],
            pos: [data.center[0] + 2.35, data.center[1] + 1.25, 1.55],
          };
          if (resetView) resetCameraView();
          if (pcSceneBadge) pcSceneBadge.textContent = `${sc.label.split(" · ")[0]} · ${(data.nPts / 1000).toFixed(1)}k 3D pts`;
        } catch (err) {
          if (pcSceneBadge) pcSceneBadge.textContent = "3D preview unavailable";
        }
      }

      function resize3D() {
        const rect = pcStage.getBoundingClientRect();
        if (!rect.width || !rect.height) return;
        renderer.setSize(rect.width, rect.height, false);
        camera.aspect = rect.width / rect.height;
        camera.updateProjectionMatrix();
      }
      resize3D();
      new ResizeObserver(resize3D).observe(pcStage);

      let rafId = 0;
      function animate3D() {
        if (!pcVisible) { rafId = 0; return; }
        controls.update();
        renderer.render(scene, camera);
        rafId = requestAnimationFrame(animate3D);
      }
      new IntersectionObserver((entries) => {
        pcVisible = entries.some((e) => e.isIntersecting);
        if (pcVisible && !rafId) {
          resize3D();
          animate3D();
        }
      }, { threshold: 0.05 }).observe(pcStage);

      pcColorChips?.querySelectorAll(".chip").forEach((b) => {
        b.addEventListener("click", () => {
          pcColorMode = b.dataset.pcColor;
          pcColorChips.querySelectorAll(".chip").forEach((x) => x.classList.toggle("on", x === b));
          applyPointColors();
        });
      });
      pcFrustumBtn?.addEventListener("click", () => {
        frustumGroup.visible = !frustumGroup.visible;
        pcFrustumBtn.classList.toggle("on", frustumGroup.visible);
      });
      pcOrbitBtn?.addEventListener("click", () => {
        controls.autoRotate = !controls.autoRotate;
        pcOrbitBtn.classList.toggle("on", controls.autoRotate);
      });
      pcResetBtn?.addEventListener("click", resetCameraView);
      pcSizeSlider?.addEventListener("input", () => {
        ptMat.size = Number(pcSizeSlider.value) / 1000;
      });
      controls.addEventListener("start", () => {
        controls.autoRotate = false;
        pcOrbitBtn?.classList.remove("on");
      });

      pcViewer = { setScene: set3DScene };
    } catch (e) {
      if (pcSceneBadge) pcSceneBadge.textContent = "WebGL unavailable";
    }
  }

  function renderGeo(sync3D = true) {
    const sc = GEO_SCENES[geoSceneIdx];
    if (!sc.maps[geoMod]) geoMod = "depth";
    const m = sc.maps[geoMod];
    geoSceneChips.querySelectorAll(".chip").forEach((b, i) => b.classList.toggle("on", i === geoSceneIdx));
    geoModChips.querySelectorAll(".chip").forEach((b) => {
      const avail = !!sc.maps[b.dataset.mod];
      b.style.display = avail ? "" : "none";
      b.classList.toggle("on", b.dataset.mod === geoMod);
    });
    geoLeftChips.querySelectorAll(".chip").forEach((b) => b.classList.toggle("on", b.dataset.left === geoLeftMode));
    geoLeftImg.src = geoLeftMode === "rgb" ? sc.rgb : m.ref;
    geoRightImg.src = m.pred;
    geoLeftLab.textContent = geoLeftMode === "rgb" ? "Input RGB" : `Ref / Sensor ${m.name}`;
    geoRightLab.textContent = `Robin-World · ${m.name}`;
    geoNote.textContent = sc.note;
    if (sync3D && pcViewer) pcViewer.setScene(sc, true);
  }
  if (geoSceneChips) {
    GEO_SCENES.forEach((sc, i) => {
      const b = document.createElement("button");
      b.className = "chip" + (i === 0 ? " on" : "");
      b.textContent = sc.label;
      b.addEventListener("click", () => {
        geoSceneIdx = i;
        renderGeo(true);
      });
      geoSceneChips.appendChild(b);
    });
    geoModChips.querySelectorAll(".chip").forEach((b) => {
      b.addEventListener("click", () => { geoMod = b.dataset.mod; renderGeo(false); });
    });
    geoLeftChips.querySelectorAll(".chip").forEach((b) => {
      b.addEventListener("click", () => { geoLeftMode = b.dataset.left; renderGeo(false); });
    });
    renderGeo(true);
  }

  // ---------- 8. Spatial Reasoning Gallery ----------
  const SR_VIEWS = {
    cvbench: {
      bench: "CV-Bench",
      title: "Single-Image 2D & 3D Geometric QA",
      sub: "2D spatial relation & counting, plus 3D depth & metric distance via (F, ρ, N) sketchpads",
      cap: "Examples cover spatial relations, counting, relative depth, and distance.",
      items: [
        {
          title: "2D Spatial Relation", tag: "Direct ✗ → CoGT ✓", tagCls: "fix",
          rgb: "static/img/reasoning/crops/cvbench_0_rgb.png",
          maps: "static/img/reasoning/crops/cvbench_0_maps.png",
          q: "Where is the potted plant (red box) located relative to the TV? (A) above (B) below",
          direct: "Direct: (B) below ✗", directCls: "bad", cogt: "CoGT: (A) above ✓"
        },
        {
          title: "2D Visual Counting", tag: "Direct ✗ → CoGT ✓", tagCls: "fix",
          rgb: "static/img/reasoning/crops/cvbench_1_rgb.png",
          maps: "static/img/reasoning/crops/cvbench_1_maps.png",
          q: "How many street lights are in the image? (A) 0 (B) 9 (C) 11 (D) 10 (E) 8 (F) 12",
          direct: "Direct: (E) 8 ✗", directCls: "bad", cogt: "CoGT: (D) 10 ✓"
        },
        {
          title: "3D Relative Depth", tag: "Anchored ✓", tagCls: "fix",
          rgb: "static/img/reasoning/crops/cvbench_2_rgb.png",
          maps: "static/img/reasoning/crops/cvbench_2_maps.png",
          q: "Closer to the camera: keyboard (red box) or chair (blue box)? (A) keyboard (B) chair",
          direct: "Direct: Pose drift ✗", directCls: "bad", cogt: "CoGT: (A) keyboard ✓"
        },
        {
          title: "3D Metric Distance", tag: "Anchored ✓", tagCls: "fix",
          rgb: "static/img/reasoning/crops/cvbench_3_rgb.png",
          maps: "static/img/reasoning/crops/cvbench_3_maps.png",
          q: "Closer to the lamp (red): night stand (blue) or chair (green)? (A) night stand (B) chair",
          direct: "Direct: Pose drift ✗", directCls: "bad", cogt: "CoGT: (A) night stand ✓"
        }
      ]
    },
    blink: {
      bench: "BLINK",
      title: "Fine-Grained Perceptual & 3D Surface Geometry",
      sub: "Held-out unseen split (protected600): relative depth, tight 3D localization, surface albedo, and 3D support",
      cap: "BLINK validation covers 14 subtasks. CoGT scores 81.12% on spatial relations and 52.99% on reflectance.",
      items: [
        {
          title: "Relative Depth", tag: "Task: 75.0% → 82.3%", tagCls: "ok",
          rgb: "static/img/reasoning/crops/blink_0_rgb.png",
          maps: "static/img/reasoning/crops/blink_0_maps.png",
          q: "Which circled point on the image is closer to the camera? (A) A is closer (B) B is closer",
          direct: "Direct: (A) A is closer ✓", directCls: "neutral", cogt: "CoGT: (A) A is closer ✓"
        },
        {
          title: "Object Localization", tag: "Task: 61.5% → 67.2%", tagCls: "ok",
          rgb: "static/img/reasoning/crops/blink_1_rgb.png",
          maps: "static/img/reasoning/crops/blink_1_maps.png",
          q: "Which bounding box more accurately encloses the cow? (A) Box A (green) (B) Box B (red)",
          direct: "Direct: (A) Box A ✓", directCls: "neutral", cogt: "CoGT: (A) Box A ✓"
        },
        {
          title: "Relative Reflectance", tag: "Task: 48.5% → 53.0%", tagCls: "ok",
          rgb: "static/img/reasoning/crops/blink_2_rgb.png",
          maps: "static/img/reasoning/crops/blink_2_maps.png",
          q: "Ignoring shading, which point has darker surface albedo? (A) A (B) B (C) Same",
          direct: "Direct: (B) B is darker ✓", directCls: "neutral", cogt: "CoGT: (B) B is darker ✓"
        },
        {
          title: "3D Spatial Relation", tag: "Task: 76.9% → 81.1%", tagCls: "ok",
          rgb: "static/img/reasoning/crops/blink_3_rgb.png",
          maps: "static/img/reasoning/crops/blink_3_maps.png",
          q: "Considering 3D support and depth, is the cat on the chair? (A) yes (B) no",
          direct: "Direct: (B) no ✓", directCls: "neutral", cogt: "CoGT: (B) no ✓"
        }
      ]
    },
    mmsi: {
      bench: "MMSI-Bench",
      title: "Multi-Image Cross-View Spatial & Frame Reasoning",
      sub: "Camera-object pose, cross-room doorway navigation, cardinal orientation, and 3D camera rotation",
      cap: "Examples cover relative camera–object pose, doorway navigation, and camera motion across views.",
      items: [
        {
          title: "Camera-Object Pose", tag: "Direct ✗ → CoGT ✓", tagCls: "fix",
          rgb: "static/img/reasoning/crops/mmsi_0_rgb.png",
          maps: "static/img/reasoning/crops/mmsi_0_maps.png",
          q: "Continuous first-person views 1 → 2. At view 2, where is the bed? (A) Left (B) Behind (C) Right",
          direct: "Direct: (B) Behind ✗", directCls: "bad", cogt: "CoGT: (A) Left ✓"
        },
        {
          title: "Object-Region Layout", tag: "Direct ✗ → CoGT ✓", tagCls: "fix",
          rgb: "static/img/reasoning/crops/mmsi_1_rgb.png",
          maps: "static/img/reasoning/crops/mmsi_1_maps.png",
          q: "Entering through the white door, how to reach the TV area? (A) Straight (B) Left (C) Unclear (D) Right",
          direct: "Direct: (C) Unclear ✗", directCls: "bad", cogt: "CoGT: (D) Go right ✓"
        },
        {
          title: "Camera-Region Frame", tag: "Direct ✗ → CoGT ✓", tagCls: "fix",
          rgb: "static/img/reasoning/crops/mmsi_2_rgb.png",
          maps: "static/img/reasoning/crops/mmsi_2_maps.png",
          q: "Fig. 1: south of bathroom. In Fig. 2, direction relative to shower? (A) N (B) E (C) W (D) S",
          direct: "Direct: (A) North ✗", directCls: "bad", cogt: "CoGT: (C) West ✓"
        },
        {
          title: "Camera Ego-Motion", tag: "3D Rotation ✓", tagCls: "ok",
          rgb: "static/img/reasoning/crops/mmsi_3_rgb.png",
          maps: "static/img/reasoning/crops/mmsi_3_maps.png",
          q: "From Figure 1 to Figure 2, in which direction does the camera mainly rotate? (A) Right (C) Left",
          direct: "Direct: (A) Right ✓", directCls: "neutral", cogt: "CoGT: (A) Right ✓"
        }
      ]
    },
    vsi: {
      bench: "VSI-Bench",
      title: "Embodied 3D Video & Metric Spatial Reasoning",
      sub: "32-frame indoor walkthroughs: metric distance (m), object dimension (cm), room area (m²), and 3D ego-quadrant",
      cap: "CoGT reduced errors in distance by 78%, object size by 77%, and floor area by 85%.",
      items: [
        {
          title: "Metric Distance (3D)", tag: "−78% metric error", tagCls: "fix",
          grid: "static/img/reasoning/crops/vsi_0_grid.png",
          scale: { label: "Scale (m)", gt: "GT = 2.7 m", d: 78, c: 56, g: 50 },
          q: "Closest-point 3D distance between the bookshelf (#1) and sofa (#10), in meters?",
          direct: "Direct: 3.6 m", directCls: "bad", cogt: "CoGT: 2.9 m (GT 2.7 m)"
        },
        {
          title: "3D Object Size", tag: "−77% size error", tagCls: "fix",
          grid: "static/img/reasoning/crops/vsi_1_grid.png",
          scale: { label: "Scale (cm)", gt: "GT = 133 cm", d: 42, c: 70, g: 77 },
          q: "Length of the longest dimension of the door (#7), measured in centimeters?",
          direct: "Direct: 107 cm", directCls: "bad", cogt: "CoGT: 127 cm (GT 133 cm)"
        },
        {
          title: "Room Floor Area", tag: "−85% area error", tagCls: "fix",
          grid: "static/img/reasoning/crops/vsi_2_grid.png",
          scale: { label: "Scale (m²)", gt: "GT = 26.1 m²", d: 84, c: 61, g: 56 },
          q: "Total floor area of this room (in m²) estimated across the walkthrough?",
          direct: "Direct: 32.1 m²", directCls: "bad", cogt: "CoGT: 27.0 m² (GT 26.1 m²)"
        },
        {
          title: "3D Ego-Quadrant (Hard)", tag: "Direct ✗ → CoGT ✓", tagCls: "fix",
          grid: "static/img/reasoning/crops/vsi_3_grid.png",
          meta: { left: "3D Cartesian Transform", right: "Origin: sofa → +y: backpack" },
          q: "Standing at sofa (#19), facing backpack: where is the telephone (#25)? (A) front-left (B) front-right",
          direct: "Direct: (B) front-right ✗", directCls: "bad", cogt: "CoGT: (A) front-left ✓"
        }
      ]
    }
  };
  const srGallery = document.getElementById("sr-gallery");
  const srCap = document.getElementById("sr-cap");
  const srChips = [...document.querySelectorAll("#sr-chips .chip")];
  let srRunId = 0;
  let srTimers = [];

  function clearSrTimers() {
    srTimers.forEach((id) => clearTimeout(id));
    srTimers = [];
  }

  function typeText(el, text, msPerChar, runId, onDone) {
    let i = 0;
    const step = () => {
      if (runId !== srRunId) return;
      i = Math.min(text.length, i + 2);
      el.innerHTML = text.slice(0, i) + (i < text.length ? '<span class="sr-cursor"></span>' : "");
      if (i < text.length) {
        srTimers.push(setTimeout(step, msPerChar));
      } else if (onDone) {
        onDone();
      }
    };
    step();
  }

  function renderSrChat(key, caseIdx = 0) {
    clearSrTimers();
    const runId = ++srRunId;
    const v = SR_VIEWS[key];
    if (!v || !srGallery) return;
    if (caseIdx >= v.items.length) caseIdx = 0;
    const it = v.items[caseIdx];

    srChips.forEach((b) => b.classList.toggle("on", b.dataset.sr === key));
    if (srCap) srCap.textContent = v.cap;

    const caseBtns = v.items.map((item, ci) =>
      `<button class="sr-case-btn ${ci === caseIdx ? "on" : ""}" data-ci="${ci}">Case ${ci + 1}: ${item.title}</button>`
    ).join("");

    const userImg = it.grid || it.rgb;
    const midHtml = it.scale
      ? `<div class="sr-scale-box" style="margin-top:8px">
           <div class="sr-scale-row"><span>${it.scale.label}</span><b>${it.scale.gt}</b></div>
           <div class="sr-scale-track">
             <span class="sr-dot g" style="left:${it.scale.g}%"></span>
             <span class="sr-dot d" style="left:${it.scale.d}%"></span>
             <span class="sr-dot c" style="left:${it.scale.c}%"></span>
           </div>
         </div>`
      : (it.meta
        ? `<div class="sr-scale-box" style="margin-top:8px"><div class="sr-scale-row" style="margin:0"><span>${it.meta.left}</span><b style="color:#15803d">${it.meta.right}</b></div></div>`
        : "");

    srGallery.innerHTML = `
      <div class="sr-head">
        <div class="sr-head-l">
          <span class="sr-badge-bench">${v.bench}</span>
          <span class="sr-head-title">${v.title}</span>
          <span class="sr-head-sub">${v.sub}</span>
        </div>
      </div>
      <div class="sr-case-bar">
        <span class="lbl">Dialogue Case</span>
        ${caseBtns}
      </div>
      <div class="sr-chat-stage">
        <div class="sr-bubble user">
          <div class="sr-who"><span>USER · ${v.bench.toUpperCase()} QUERY</span><span>${it.title}</span></div>
          <div class="sr-chat-user-row">
            <div class="sr-chat-img"><img src="${userImg}" alt="${it.title}"></div>
            <p class="sr-q-txt" id="sr-q-type"></p>
          </div>
        </div>
        <div class="sr-typing-row" id="sr-typing" style="display:none">
          <span>Generating CoGT Sketchpad (F, ρ, N)</span>
          <span class="sr-typing-dot"></span><span class="sr-typing-dot"></span><span class="sr-typing-dot"></span>
        </div>
        <div class="sr-bubble bot" id="sr-bot-bubble" style="display:none">
          <div class="sr-who">
            <span>ROBIN-WORLD · COGT GROUNDED RESPONSE</span>
            <span class="sr-tag ${it.tagCls}">${it.tag}</span>
          </div>
          ${it.maps ? `<img class="sr-maps" src="${it.maps}" alt="F, rho, N geometric sketchpads">` : ""}
          ${midHtml}
          <p class="sr-a-txt" id="sr-a-type"></p>
          <div class="sr-ans" id="sr-ans-pills" style="display:none">
            <span class="sr-pill ${it.directCls}">${it.direct}</span>
            <span class="sr-pill good">${it.cogt}</span>
          </div>
        </div>
      </div>`;

    srGallery.querySelectorAll(".sr-case-btn").forEach((btn) => {
      btn.addEventListener("click", () => renderSrChat(key, Number(btn.dataset.ci)));
    });

    const qEl = document.getElementById("sr-q-type");
    const typingEl = document.getElementById("sr-typing");
    const botEl = document.getElementById("sr-bot-bubble");
    const aEl = document.getElementById("sr-a-type");
    const pillsEl = document.getElementById("sr-ans-pills");

    const botSummary = it.maps
      ? "Conditioning Qwen3-VL on self-generated (F, ρ, N) sketchpad geometry resolves the spatial relation:"
      : "Fusing 3D sketchpads across frames recovers metric room geometry:";

    typeText(qEl, it.q, 24, runId, () => {
      if (typingEl) typingEl.style.display = "inline-flex";
      srTimers.push(setTimeout(() => {
        if (runId !== srRunId) return;
        if (typingEl) typingEl.style.display = "none";
        if (botEl) botEl.style.display = "block";
        typeText(aEl, botSummary, 22, runId, () => {
          if (pillsEl) pillsEl.style.display = "flex";
        });
      }, 650));
    });
  }

  if (srGallery) renderSrChat("cvbench");
  srChips.forEach((btn) => {
    btn.addEventListener("click", () => renderSrChat(btn.dataset.sr));
  });

  // ---------- 9. EponaX-inspired Interactive Trajectory & Video Explorer ----------
  const EXPLORER_IDS = ["5_memory", "50", "2", "112_memory", "38", "55", "111", "15", "80", "29"];
  const explorerList = EXPLORER_IDS.map((k) => demos.find((d) => d.key === k)).filter(Boolean);
  let curExp = explorerList[0];

  const expChips = document.getElementById("exp-chips");
  const expVid = document.getElementById("exp-vid");
  const expTitle = document.getElementById("exp-title");
  const expModeBadge = document.getElementById("exp-mode-badge");
  const expTurns = document.getElementById("exp-turns");
  const expPrompt = document.getElementById("exp-prompt");
  const expCanvas = document.getElementById("traj-canvas");

  function drawTraj(progress) {
    if (!expCanvas || !curExp) return;
    const ctx = expCanvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    const rect = expCanvas.getBoundingClientRect();
    const w = Math.max(260, Math.round(rect.width * dpr));
    const h = Math.max(200, Math.round(rect.height * dpr));
    if (expCanvas.width !== w || expCanvas.height !== h) {
      expCanvas.width = w;
      expCanvas.height = h;
    }
    ctx.clearRect(0, 0, w, h);

    ctx.strokeStyle = "rgba(15, 23, 42, 0.08)";
    ctx.lineWidth = 1 * dpr;
    for (let x = 0; x <= w; x += Math.round(w / 6)) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
    }
    for (let y = 0; y <= h; y += Math.round(h / 5)) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
    }

    const gt = (curExp.traj && curExp.traj.gt_xz) || [];
    if (gt.length < 2) return;

    let minX = Infinity, maxX = -Infinity, minZ = Infinity, maxZ = -Infinity;
    for (const [x, z] of gt) {
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (z < minZ) minZ = z;
      if (z > maxZ) maxZ = z;
    }
    const rawSpan = Math.max(maxX - minX, maxZ - minZ);

    // Pure in-place rotation (yaw / pitch): render centered GT orientation sweep dial
    if (rawSpan < 0.05) {
      const acts = curExp.actions || [];
      const cx = w / 2, cy = h / 2 + 4 * dpr;
      const rad = Math.min(w, h) * 0.34;
      // Build piecewise target angle curve from actions
      const angs = [ -Math.PI / 2 ];
      const stepRad = Math.PI / 4; // 45 deg per turn
      acts.forEach((a) => {
        const last = angs[angs.length - 1];
        const s = (a === "left" || a === "up") ? -1 : (a === "right" || a === "down") ? 1 : 0;
        angs.push(last + s * stepRad);
      });
      const totalSeg = Math.max(1, angs.length - 1);
      const pos = Math.max(0, Math.min(totalSeg, progress * totalSeg));
      const idx = Math.min(totalSeg - 1, Math.floor(pos));
      const frac = pos - idx;
      const curAng = angs[idx] + (angs[idx + 1] - angs[idx]) * frac;

      ctx.strokeStyle = "rgba(15, 23, 42, 0.22)";
      ctx.lineWidth = 2 * dpr;
      ctx.setLineDash([4 * dpr, 4 * dpr]);
      ctx.beginPath(); ctx.arc(cx, cy, rad, 0, Math.PI * 2); ctx.stroke();
      ctx.setLineDash([]);

      // Draw swept arc up to current turn
      ctx.strokeStyle = "#1d4ed8";
      ctx.lineWidth = 3.2 * dpr;
      ctx.beginPath();
      const samples = 48;
      for (let i = 0; i <= samples; i++) {
        const t = (i / samples) * pos;
        const si = Math.min(totalSeg - 1, Math.floor(t));
        const sf = t - si;
        const a = angs[si] + (angs[si + 1] - angs[si]) * sf;
        const px = cx + Math.cos(a) * rad;
        const py = cy + Math.sin(a) * rad;
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.stroke();

      // Start marker
      ctx.fillStyle = "#b91c1c";
      ctx.beginPath();
      ctx.arc(cx + Math.cos(angs[0]) * rad, cy + Math.sin(angs[0]) * rad, 4.5 * dpr, 0, Math.PI * 2);
      ctx.fill();

      // Camera FOV wedge from center pointing to curAng
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(curAng);
      ctx.fillStyle = "rgba(37, 99, 235, 0.20)";
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(rad * 0.92, -rad * 0.36);
      ctx.lineTo(rad * 0.92, rad * 0.36);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "#0f172a";
      ctx.beginPath(); ctx.arc(0, 0, 5 * dpr, 0, Math.PI * 2); ctx.fill();
      ctx.restore();

      ctx.fillStyle = "#475569";
      ctx.font = `${10.5 * dpr}px JetBrains Mono, monospace`;
      ctx.fillText("— GT Orientation Sweep (In-Place)", 10 * dpr, h - 10 * dpr);
      return;
    }

    const spanX = Math.max(0.25, maxX - minX);
    const spanZ = Math.max(0.25, maxZ - minZ);
    const pad = 28 * dpr;
    const scale = Math.min((w - 2 * pad) / spanX, (h - 2 * pad) / spanZ);
    const ox = (w - spanX * scale) / 2 - minX * scale;
    const oy = h - ((h - spanZ * scale) / 2 - minZ * scale);
    const mapPt = ([x, z]) => [ox + x * scale, oy - z * scale];

    // Full GT path dashed outline
    ctx.save();
    ctx.setLineDash([5 * dpr, 5 * dpr]);
    ctx.strokeStyle = "rgba(15, 23, 42, 0.26)";
    ctx.lineWidth = 2.2 * dpr;
    ctx.beginPath();
    gt.forEach((p, idx) => {
      const [px, py] = mapPt(p);
      if (idx === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    });
    ctx.stroke();
    ctx.restore();

    // Progressive active GT path up to current playback
    const nDraw = Math.max(1, Math.min(gt.length, Math.round(progress * (gt.length - 1)) + 1));
    const grad = ctx.createLinearGradient(0, h, w, 0);
    grad.addColorStop(0, "#1d4ed8");
    grad.addColorStop(1, "#0f766e");
    ctx.strokeStyle = grad;
    ctx.lineWidth = 3.4 * dpr;
    ctx.beginPath();
    for (let i = 0; i < nDraw; i++) {
      const [px, py] = mapPt(gt[i]);
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.stroke();

    const [sx, sy] = mapPt(gt[0]);
    ctx.fillStyle = "#b91c1c";
    ctx.beginPath(); ctx.arc(sx, sy, 4.5 * dpr, 0, Math.PI * 2); ctx.fill();

    const curIdx = nDraw - 1;
    const [cx, cy] = mapPt(gt[curIdx]);
    const prevIdx = Math.max(0, curIdx - 1);
    const [px0, py0] = mapPt(gt[prevIdx]);
    let ang = Math.atan2(cy - py0, cx - px0);
    if (curIdx === 0 && gt.length > 1) {
      const [nx, ny] = mapPt(gt[1]);
      ang = Math.atan2(ny - cy, nx - cx);
    }
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(ang);
    ctx.fillStyle = "rgba(37, 99, 235, 0.22)";
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(22 * dpr, -10 * dpr);
    ctx.lineTo(22 * dpr, 10 * dpr);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#0f172a";
    ctx.beginPath(); ctx.arc(0, 0, 5 * dpr, 0, Math.PI * 2); ctx.fill();
    ctx.restore();

    ctx.fillStyle = "#475569";
    ctx.font = `${10.5 * dpr}px JetBrains Mono, monospace`;
    ctx.fillText("— GT Camera Trajectory (Active)   -- Full Path", 10 * dpr, h - 10 * dpr);
  }

  function updateExplorerTelemetry() {
    if (!expVid || !curExp) return;
    const dur = expVid.duration || curExp.duration || 16;
    const p = Math.max(0, Math.min(1, expVid.currentTime / dur));
    drawTraj(p);
    const nTurns = (curExp.actions || []).length || 1;
    const activeTurn = Math.min(nTurns - 1, Math.floor(p * nTurns));
    expTurns.querySelectorAll(".turn-pill").forEach((el, i) => {
      el.classList.toggle("active", i === activeTurn);
    });
  }

  function selectExplorer(demo, autoPlay = true) {
    curExp = demo;
    expChips.querySelectorAll(".chip").forEach((b) => b.classList.toggle("on", b.dataset.key === demo.key));
    expVid.src = demo.video;
    expVid.poster = demo.poster;
    expVid.load();
    if (autoPlay) expVid.play().catch(() => {});
    expTitle.textContent = demo.title;
    expModeBadge.textContent = demo.perspective === "third_person" ? "Third-Person Orbit" : "First-Person 6-DoF";
    expModeBadge.className = "pill-tag";

    expTurns.innerHTML = "";
    (demo.actions || []).forEach((act, i) => {
      const sp = document.createElement("span");
      sp.className = "turn-pill" + (i === 0 ? " active" : "");
      sp.textContent = `T${i + 1}: ${act}`;
      sp.addEventListener("click", () => {
        const dur = expVid.duration || demo.duration || 16;
        expVid.currentTime = (i / demo.actions.length) * dur + 0.05;
        expVid.play().catch(() => {});
      });
      expTurns.appendChild(sp);
    });

    expPrompt.textContent = demo.prompt;
    drawTraj(0);
  }

  if (expChips && explorerList.length) {
    explorerList.forEach((d) => {
      const b = document.createElement("button");
      b.className = "chip";
      b.dataset.key = d.key;
      b.textContent = d.title.split(" · ")[0];
      b.addEventListener("click", () => selectExplorer(d, true));
      expChips.appendChild(b);
    });
    expVid.addEventListener("timeupdate", updateExplorerTelemetry);
    window.addEventListener("resize", () => updateExplorerTelemetry());
    selectExplorer(explorerList[0], false);
    new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          expVid.play().catch(() => {});
        } else {
          expVid.pause();
        }
      },
      { threshold: 0.25 }
    ).observe(expVid);
  }

  // ---------- 11. Discrete Viewpoint Jumps (8 cases -> Jump-Frame Showcase, no drag slider) ----------
  const DISCRETE_SCENES = [
    { label: "Hardware Store", queries: [{ prefix: "traj_c1", qLabel: "Jump Query 1" }], tag: "+3.50 dB PSNR (16.52 → 20.02 dB)" },
    { label: "Atrium Skylight", queries: [{ prefix: "traj_c2", qLabel: "Jump Query 1" }], tag: "+3.50 dB PSNR (16.52 → 20.02 dB)" },
    { label: "Pantry Shelf", queries: [{ prefix: "traj_m1", qLabel: "Jump Query 1" }], tag: "+3.50 dB PSNR (16.52 → 20.02 dB)" },
    { label: "Sports Store", queries: [{ prefix: "traj_m2", qLabel: "Jump Query 1" }], tag: "+3.50 dB PSNR (16.52 → 20.02 dB)" },
    { label: "Garden Pavilion", queries: [{ prefix: "xview_c1", qLabel: "Cross-View Jump" }], tag: "+7.74 dB PSNR (10.50 → 18.25 dB)" },
    { label: "Coastal Path", queries: [{ prefix: "xview_c2", qLabel: "Cross-View Jump" }], tag: "+7.74 dB PSNR (10.50 → 18.25 dB)" },
    {
      label: "Mountain Ridge · 2 Jumps",
      queries: [
        { prefix: "xview_m1", qLabel: "Jump Query 1 / 2" },
        { prefix: "xview_m2", qLabel: "Jump Query 2 / 2" }
      ],
      tag: "+7.74 dB PSNR (10.50 → 18.25 dB)"
    },
  ];
  const discChips = document.getElementById("disc-chips");
  const discQChips = document.getElementById("disc-qchips");
  const discInput = document.getElementById("disc-input");
  const discTarget = document.getElementById("disc-target");
  const discFrozen = document.getElementById("disc-frozen");
  const discOurs = document.getElementById("disc-ours");
  const discJumpBadge = document.getElementById("disc-jump-badge");
  const discNote = document.getElementById("disc-note");
  let discSceneIdx = 0;
  let discQueryIdx = 0;

  function renderDiscFrame() {
    const sc = DISCRETE_SCENES[discSceneIdx];
    if (discQueryIdx >= sc.queries.length) discQueryIdx = 0;
    const q = sc.queries[discQueryIdx];
    discChips.querySelectorAll(".chip").forEach((b, i) => b.classList.toggle("on", i === discSceneIdx));
    if (discQChips) {
      if (sc.queries.length > 1) {
        discQChips.style.display = "";
        discQChips.innerHTML = sc.queries.map((qq, qi) => `<button class="chip ${qi === discQueryIdx ? "on" : ""}" data-qi="${qi}">${qq.qLabel}</button>`).join("");
        discQChips.querySelectorAll(".chip").forEach((qb) => {
          qb.addEventListener("click", () => {
            discQueryIdx = Number(qb.dataset.qi);
            renderDiscFrame();
          });
        });
      } else {
        discQChips.style.display = "none";
      }
    }
    const oursCard = discOurs?.closest(".jump-card");
    oursCard?.classList.add("jump-flash");
    setTimeout(() => oursCard?.classList.remove("jump-flash"), 180);
    discInput.src = `static/img/world/${q.prefix}_0.jpg`;
    discTarget.src = `static/img/world/${q.prefix}_1.jpg`;
    discFrozen.src = `static/img/world/${q.prefix}_2.jpg`;
    discOurs.src = `static/img/world/${q.prefix}_3.jpg`;
    if (discJumpBadge) discJumpBadge.textContent = `${q.qLabel} · JEPA Z`;
    discNote.textContent = `${sc.label} · ${sc.tag} — JEPA predictive state Z synthesizes discrete viewpoint jumps directly from Anchor I without geometric drift.`;
  }

  if (discChips) {
    DISCRETE_SCENES.forEach((sc, i) => {
      const b = document.createElement("button");
      b.className = "chip" + (i === 0 ? " on" : "");
      b.textContent = sc.label;
      b.addEventListener("click", () => {
        discSceneIdx = i;
        discQueryIdx = 0;
        renderDiscFrame();
      });
      discChips.appendChild(b);
    });
    renderDiscFrame();
  }

  // ---------- 12. Fixed-Time Bullet-Time Video Showcase ----------
  const FREEZE_CASES = [
    {
      label: "Bookfall · Orbit",
      badge: "Bookfall · Orbit",
      vid: "static/video/bullet_time/01_bookfall_orbit.mp4?v=freeze-en1",
      poster: "static/video/bullet_time/01_bookfall_orbit.jpg?v=freeze-en1"
    },
    {
      label: "Tram · Wide Orbit",
      badge: "Tram · Wide Orbit",
      vid: "static/video/bullet_time/02_tram_wide_orbit.mp4?v=freeze-en1",
      poster: "static/video/bullet_time/02_tram_wide_orbit.jpg?v=freeze-en1"
    },
    {
      label: "Airfield · Truck",
      badge: "Airfield · Lateral Truck",
      vid: "static/video/bullet_time/03_airfield_truck.mp4?v=freeze-en1",
      poster: "static/video/bullet_time/03_airfield_truck.jpg?v=freeze-en1"
    },
    {
      label: "Bookfall · Return",
      badge: "Bookfall · Return Sweep",
      vid: "static/video/bullet_time/04_bookfall_return.mp4?v=freeze-en1",
      poster: "static/video/bullet_time/04_bookfall_return.jpg?v=freeze-en1"
    },
    {
      label: "Full reel",
      badge: "All four scenes",
      vid: "static/video/bullet_time/00_motion_freeze_reel.mp4?v=freeze-en1",
      poster: "static/video/bullet_time/01_bookfall_orbit.jpg?v=freeze-en1"
    },
  ];
  const frzChips = document.getElementById("frz-chips");
  const frzVid = document.getElementById("frz-vid");
  const frzBadge = document.getElementById("frz-badge");
  function selectFrz(idx, autoPlay = true) {
    const c = FREEZE_CASES[idx];
    frzChips.querySelectorAll(".chip").forEach((b, i) => b.classList.toggle("on", i === idx));
    if (frzVid) {
      frzVid.src = c.vid;
      frzVid.poster = c.poster;
      frzVid.load();
      if (autoPlay) frzVid.play().catch(() => {});
    }
    if (frzBadge) frzBadge.textContent = c.badge;
  }
  if (frzChips && frzVid) {
    FREEZE_CASES.forEach((c, i) => {
      const b = document.createElement("button");
      b.className = "chip" + (i === 0 ? " on" : "");
      b.textContent = c.label;
      b.addEventListener("click", () => selectFrz(i, true));
      frzChips.appendChild(b);
    });
    selectFrz(0, false);
    new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          frzVid.play().catch(() => {});
        } else {
          frzVid.pause();
        }
      },
      { threshold: 0.25 }
    ).observe(frzVid);
  }

  // ---------- 13. Filterable 16-Video Gallery + Modal ----------
  const galGrid = document.getElementById("gal-grid");
  const modal = document.getElementById("gal-modal");
  const modalVid = document.getElementById("modal-vid");
  const modalCap = document.getElementById("modal-cap");
  const modalActs = document.getElementById("modal-acts");

  if (galGrid) {
    demos.forEach((d) => {
      const card = document.createElement("div");
      card.className = "gcard reveal";
      card.dataset.group = d.group === "memory" ? "first_person" : d.group;
      const badgeCls = "badge-corner";
      const badgeTxt = d.perspective === "third_person" ? "3RD-PERSON" : "1ST-PERSON";
      card.innerHTML = `
        <div class="media">
          <img src="${d.poster}" alt="${d.title}" loading="lazy">
          <video muted loop playsinline preload="none" data-src="${d.video}"></video>
          <span class="${badgeCls}">${badgeTxt}</span>
        </div>
        <div class="meta">
          <div class="t">${d.title}</div>
          <div class="s">[${(d.actions || []).join(" → ")}]</div>
        </div>`;
      card.addEventListener("click", () => {
        modalVid.src = d.video;
        modalVid.play().catch(() => {});
        modalCap.textContent = d.title;
        modalActs.textContent = `Actions: [${(d.actions || []).join(" → ")}] · ${d.prompt}`;
        modal.showModal();
      });
      galGrid.appendChild(card);
      revObs.observe(card);
    });

    const vidObs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          const v = e.target;
          if (e.isIntersecting) {
            if (!v.src) v.src = v.dataset.src;
            v.play().then(() => v.classList.add("ready")).catch(() => {});
          } else {
            v.pause();
          }
        });
      },
      { threshold: 0.25 }
    );
    galGrid.querySelectorAll("video").forEach((v) => vidObs.observe(v));

    const galFilterBtns = [...document.querySelectorAll("#gal-filters .chip")];
    galFilterBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        galFilterBtns.forEach((b) => b.classList.toggle("on", b === btn));
        const filter = btn.dataset.filter;
        galGrid.querySelectorAll(".gcard").forEach((card) => {
          card.classList.toggle("hide", filter !== "all" && card.dataset.group !== filter);
        });
      });
    });

    document.getElementById("modal-close")?.addEventListener("click", () => {
      modalVid.pause();
      modal.close();
    });
    modal?.addEventListener("click", (e) => {
      if (e.target === modal) {
        modalVid.pause();
        modal.close();
      }
    });
  }

  // ---------- 1b. Interactive Teaser Explorer (#overview) ----------
  const teaserExp = document.getElementById("teaser-explorer");
  const teaserFlowWrap = document.getElementById("teaser-flow-wrap");
  const teaserWiresSvg = document.getElementById("teaser-wires-svg");
  const teaserStageDot = document.getElementById("teaser-stage-dot");
  const teaserStageTitle = document.getElementById("teaser-stage-title");
  const teaserStageMetric = document.getElementById("teaser-stage-metric");
  const teaserStageVid = document.getElementById("teaser-stage-vid");
  const teaserStageWrap = document.querySelector(".teaser-stage-imgwrap");
  const teaserJump = document.getElementById("teaser-jump");

  const TEASER_BRANCHES = {
    cam: {
      title: "Camera Perception",
      metric: "31/36 #1",
      vid: "static/video/pillars/cam.mp4",
      poster: "static/video/pillars/cam.jpg",
      color: "#9f3e52",
      mods: ["image", "cam"],
      lanes: ["und"],
      cogt: false,
      toks: ["img", "c"],
      href: "#camera"
    },
    geo: {
      title: "3D Geometry",
      metric: "0.992 δ₁ · 12.3°",
      vid: "static/video/pillars/geo.mp4?v=2",
      poster: "static/video/pillars/geo.jpg",
      color: "#2b7a5e",
      mods: ["image", "video"],
      lanes: ["gen"],
      cogt: false,
      toks: ["grid", "pts", "F", "rho", "N"],
      href: "#geometry"
    },
    qa: {
      title: "Spatial Reasoning",
      metric: "87.4% / 76.50%",
      vid: "static/video/pillars/qa.mp4",
      poster: "static/video/pillars/qa.jpg",
      color: "#5b4d96",
      mods: ["image", "video", "lang"],
      lanes: ["und", "gen"],
      cogt: true,
      toks: ["img", "txt", "q", "a", "grid", "F", "rho", "N"],
      href: "#reasoning"
    },
    sim: {
      title: "World Simulation",
      metric: "79.0 Qual · 7.98 WMB",
      vid: "static/video/pillars/sim.mp4",
      poster: "static/video/pillars/sim.jpg",
      color: "#2563a8",
      mods: ["image", "video", "lang", "cam", "time"],
      lanes: ["und", "gen"],
      cogt: true,
      toks: ["img", "txt", "c", "grid", "pts", "F", "rho", "N", "It"],
      href: "#world"
    }
  };
  let teaserVisible = false;
  let teaserActiveKey = "cam";

  function drawTeaserWires(activeKey) {
    if (!teaserFlowWrap || !teaserWiresSvg) return;
    const wr = teaserFlowWrap.getBoundingClientRect();
    if (!wr.width || !wr.height) return;
    teaserWiresSvg.setAttribute("viewBox", `0 0 ${wr.width} ${wr.height}`);

    const core = document.getElementById("teaser-core");
    const undEl = core?.querySelector('[data-core="und"]');
    const genEl = core?.querySelector('[data-core="gen"]');
    if (!core || !undEl || !genEl) return;

    const coreR = core.getBoundingClientRect();
    const undR = undEl.getBoundingClientRect();
    const genR = genEl.getBoundingClientRect();

    const rel = (r, side) => {
      const x = side === "left" ? r.left - wr.left : r.right - wr.left;
      const y = r.top + r.height / 2 - wr.top;
      return [x, y];
    };
    const coreInUnd = [coreR.left - wr.left, undR.top + undR.height / 2 - wr.top];
    const coreInGen = [coreR.left - wr.left, genR.top + genR.height / 2 - wr.top];
    const coreOutUnd = [coreR.right - wr.left, undR.top + undR.height / 2 - wr.top];
    const coreOutGen = [coreR.right - wr.left, genR.top + genR.height / 2 - wr.top];

    const spec = TEASER_BRANCHES[activeKey] || TEASER_BRANCHES.cam;
    const activeColor = spec.color;

    const paths = [];
    const bez = (p0, p1) => {
      const dx = Math.abs(p1[0] - p0[0]) * 0.52;
      return `M ${p0[0].toFixed(1)} ${p0[1].toFixed(1)} C ${(p0[0] + dx).toFixed(1)} ${p0[1].toFixed(1)}, ${(p1[0] - dx).toFixed(1)} ${p1[1].toFixed(1)}, ${p1[0].toFixed(1)} ${p1[1].toFixed(1)}`;
    };

    teaserFlowWrap.querySelectorAll(".t-mod").forEach((m) => {
      const key = m.dataset.mod;
      const p0 = rel(m.getBoundingClientRect(), "right");
      const target = (key === "cam" || key === "time" || activeKey === "geo") ? coreInGen : coreInUnd;
      const isAct = spec.mods.includes(key);
      const cls = isAct ? "t-wire active" : "t-wire dim";
      const st = isAct ? `style="stroke:${activeColor}"` : "";
      paths.push(`<path class="${cls}" ${st} d="${bez(p0, target)}"/>`);
      if (key === "cam" && activeKey === "cam") {
        paths.push(`<path class="t-wire active" style="stroke:${activeColor}" d="${bez(p0, coreInUnd)}"/>`);
      }
    });

    teaserFlowWrap.querySelectorAll(".t-branch").forEach((b) => {
      const bk = b.dataset.branch;
      const p1 = rel(b.getBoundingClientRect(), "left");
      const src = (bk === "cam" || bk === "qa") ? coreOutUnd : coreOutGen;
      const isAct = activeKey === bk;
      const bColor = TEASER_BRANCHES[bk].color;
      const cls = isAct ? "t-wire active" : "t-wire dim";
      const st = isAct ? `style="stroke:${bColor}"` : "";
      paths.push(`<path class="${cls}" ${st} d="${bez(src, p1)}"/>`);
    });

    teaserWiresSvg.innerHTML = paths.join("");
  }

  function setTeaserBranch(key) {
    if (!teaserExp) return;
    const spec = TEASER_BRANCHES[key] || TEASER_BRANCHES.cam;
    teaserActiveKey = key;

    teaserExp.querySelectorAll(".t-branch").forEach((b) => {
      const match = b.dataset.branch === key;
      b.classList.toggle("active", match);
      b.classList.toggle("dim", !match);
    });
    teaserExp.querySelectorAll(".t-mod").forEach((m) => {
      const match = spec.mods.includes(m.dataset.mod);
      m.classList.toggle("active", match);
      m.classList.toggle("dim", !match);
    });
    teaserExp.querySelectorAll(".t-lane").forEach((l) => {
      const match = spec.lanes.includes(l.dataset.core);
      l.classList.toggle("active", match);
      l.classList.toggle("dim", !match);
    });
    const cogt = teaserExp.querySelector('[data-core="cogt"]');
    if (cogt) {
      cogt.classList.toggle("active", spec.cogt);
      cogt.classList.toggle("dim", !spec.cogt);
    }
    teaserExp.querySelectorAll(".t-tok").forEach((t) => {
      const match = spec.toks.includes(t.dataset.tok);
      t.classList.toggle("active", match);
      t.classList.toggle("dim", !match);
    });

    if (teaserStageVid && teaserStageVid.getAttribute("src") !== spec.vid) {
      teaserStageVid.src = spec.vid;
      teaserStageVid.poster = spec.poster;
      teaserStageVid.load();
      if (teaserVisible) teaserStageVid.play().catch(() => {});
    }
    if (teaserStageTitle) teaserStageTitle.textContent = spec.title;
    if (teaserStageMetric) teaserStageMetric.textContent = spec.metric;
    if (teaserStageDot) teaserStageDot.style.background = spec.color;
    if (teaserStageWrap) {
      teaserStageWrap.style.borderColor = `${spec.color}44`;
    }
    if (teaserJump) teaserJump.href = spec.href;
    requestAnimationFrame(() => drawTeaserWires(key));
  }

  if (teaserExp) {
    setTeaserBranch("cam");
    if (teaserStageVid) {
      new IntersectionObserver((entries) => {
        teaserVisible = entries.some((e) => e.isIntersecting);
        if (teaserVisible) teaserStageVid.play().catch(() => {});
        else teaserStageVid.pause();
      }, { threshold: 0.25 }).observe(teaserStageVid);
    }
    teaserExp.querySelectorAll(".t-branch").forEach((el) => {
      el.addEventListener("click", () => setTeaserBranch(el.dataset.branch));
    });
    window.addEventListener("resize", () => drawTeaserWires(teaserActiveKey));
  }

  // ---------- 14. Benchmark Tabs ----------
  const benchTabs = [...document.querySelectorAll("#bench-tabs .chip")];
  const benchPanels = document.querySelectorAll("[data-bench-panel]");
  benchTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      benchTabs.forEach((b) => b.classList.toggle("on", b === tab));
      benchPanels.forEach((panel) => {
        panel.style.display = panel.dataset.benchPanel === tab.dataset.bench ? "" : "none";
      });
    });
  });

  // ---------- 15. Copy BibTeX ----------
  const copyBtn = document.getElementById("copy-bib");
  if (copyBtn) {
    copyBtn.addEventListener("click", () => {
      const txt = document.getElementById("bib").textContent;
      navigator.clipboard?.writeText(txt).then(() => {
        copyBtn.textContent = "Copied!";
        setTimeout(() => (copyBtn.textContent = "Copy"), 1500);
      });
    });
  }

  const focusId = new URLSearchParams(location.search).get("focus");
  const traceRoute = new URLSearchParams(location.search).get("trace");
  const traceStage = new URLSearchParams(location.search).get("stage");
  if (focusId === "showall") {
    document.querySelectorAll(".reveal").forEach((el) => {
      el.classList.add("in");
    });
    document.querySelectorAll("[data-bars]").forEach(animateBars);
    document.querySelectorAll("[data-vbars]").forEach(animateVBars);
  }
  if (archChoiceBtns.some((btn) => btn.dataset.route === traceRoute)) {
    archAllBtn?.classList.remove("on");
    archChoiceBtns.forEach((b) => b.classList.toggle("on", b.dataset.route === traceRoute));
    applyArchState({ route: traceRoute });
  }
  if (traceStage) {
    const st = TRAIN_STAGES.find((s) => String(s.id) === traceStage);
    if (st) focusStage(st);
  }
})();
