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

  function drawTrainingWires() {
    const cards = trainGrid.children;
    trainWires.forEach((wire) => {
      const [start, end] = wire.dataset.stages.split(",").map(Number);
      const from = cards[start - 1];
      const to = cards[end - 1];
      const fromX = from.offsetLeft + from.offsetWidth / 2;
      const toX = to.offsetLeft + to.offsetWidth / 2;
      const fromBottom = from.offsetTop + from.offsetHeight;
      let path;
      if (wire.classList.contains("dash")) {
        const y = trainGrid.offsetHeight + 20;
        path = `M ${fromX} ${fromBottom + 5} V ${y - 5} Q ${fromX} ${y} ${fromX - 5} ${y} H ${toX + 5} Q ${toX} ${y} ${toX} ${y - 5} V ${to.offsetTop + to.offsetHeight + 5}`;
      } else if (from.offsetTop !== to.offsetTop) {
        path = `M ${fromX} ${fromBottom + 3} V ${to.offsetTop - 3}`;
      } else {
        const y = from.offsetTop + from.offsetHeight / 2;
        const rightward = fromX < toX;
        const x1 = rightward ? from.offsetLeft + from.offsetWidth + 3 : from.offsetLeft - 3;
        const x2 = rightward ? to.offsetLeft - 3 : to.offsetLeft + to.offsetWidth + 3;
        path = `M ${x1} ${y} H ${x2}`;
      }
      wire.setAttribute("d", path);
    });
  }

  if (trainGrid && corpusGrid) {
    const play = document.getElementById("train-play");
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    let selectedDataset = null;
    let sequenceTimer = null;
    let observer;
    let playing = false;

    function finishSequence() {
      observer?.disconnect();
      clearTimeout(sequenceTimer);
      trainFlowWrap.closest(".train-shell").querySelectorAll(".train-pending").forEach(el => el.classList.remove("train-pending"));
      playing = false;
      play.textContent = "Replay stages";
    }

    function select(stage, dataset) {
      finishSequence();
      selectedStage = stage;
      selectedDataset = dataset;
      const stages = stage ? [stage] : TRAIN_STAGES.filter(st => st.datasets.includes(dataset));
      const stageIds = stages.map(st => st.id);
      const focused = Boolean(stage || dataset);
      [trainGrid, corpusGrid, trainFlowWrap].forEach(el => el.classList.toggle("has-focus", focused));
      for (const card of trainGrid.children) {
        card.classList.toggle("lit", stageIds.includes(Number(card.dataset.sid)));
        card.setAttribute("aria-pressed", String(Number(card.dataset.sid) === stage?.id));
      }
      for (const pill of corpusGrid.children) {
        const name = pill.dataset.ds;
        pill.classList.toggle("lit", stage ? stage.datasets.includes(name) : name === dataset);
        pill.setAttribute("aria-pressed", String(name === dataset));
        pill.style.setProperty("--lit-color", stage?.color || "var(--navy)");
      }
      trainWires.forEach(wire => {
        const ends = wire.dataset.stages.split(",").map(Number);
        wire.classList.toggle("lit", Boolean(stage && ends.includes(stage.id)));
      });
      trainBadge.textContent = stage ? `${stage.num} · ${stage.title} · ${stage.datasets.length} datasets`
        : dataset ? `${dataset} · Stage ${stageIds.join(", ")}`
        : "Select a stage or dataset to see its connections";
    }

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
      c.addEventListener("click", () => select(selectedStage === st ? null : st, null));
      c.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          c.click();
        }
      });
      trainGrid.appendChild(c);
    });
    if (trainWires.length) {
      drawTrainingWires();
      const trainResize = new ResizeObserver(drawTrainingWires);
      trainResize.observe(trainGrid);
      Array.from(trainGrid.children).forEach((card) => trainResize.observe(card));
    }
    CORPUS_18.forEach((ds) => {
      const p = document.createElement("button");
      p.type = "button";
      p.className = "ds-pill";
      p.dataset.ds = ds.name;
      p.setAttribute("aria-pressed", "false");
      p.innerHTML = `<span class="n">${ds.name}</span><span class="sz">${ds.size}</span>`;
      p.addEventListener("click", () => select(null, selectedDataset === ds.name ? null : ds.name));
      corpusGrid.appendChild(p);
    });

    const groups = TRAIN_STAGES.map((st, i) => [
      trainGrid.children[i],
      ...trainWires.filter(w => Number(w.dataset.stages.split(",")[1]) === st.id),
      ...Array.from(corpusGrid.children).filter(p =>
        TRAIN_STAGES.find(s => s.datasets.includes(p.dataset.ds)) === st),
    ]);

    function prepareSequence() {
      groups.flat().forEach(el => el.classList.add("train-pending"));
    }

    function showStage(index) {
      groups[index].forEach((el, i) => {
        el.classList.remove("train-pending");
        const wire = el.classList.contains("t-wire");
        el.animate(wire ? [{ opacity: 0 }, { opacity: 1 }] : [
          { opacity: 0, transform: "translateY(9px) scale(.98)" },
          { opacity: 1, transform: "translateY(-2px) scale(1.005)", offset: .76 },
          { opacity: 1, transform: "none" },
        ], { duration: 330, delay: i * 24, easing: "ease-out", fill: "backwards" });
      });
      sequenceTimer = setTimeout(() => {
        if (index === groups.length - 1) finishSequence();
        else showStage(index + 1);
      }, 690);
    }

    function startSequence() {
      select(null, null);
      if (motion.matches) return;
      prepareSequence();
      playing = true;
      play.textContent = "Show all stages";
      showStage(0);
    }

    play.addEventListener("click", () => playing ? finishSequence() : startSequence());
    function syncMotion() {
      if (motion.matches) finishSequence();
      play.hidden = motion.matches;
    }
    motion.addEventListener("change", syncMotion);
    syncMotion();
    if (!motion.matches) {
      prepareSequence();
      observer = new IntersectionObserver(entries => {
        if (entries.some(entry => entry.isIntersecting)) startSequence();
      }, { rootMargin: "0px 0px -8% 0px" });
      observer.observe(trainFlowWrap.closest(".train-shell"));
    }
  }

  // ---------- 6. Interactive Closed-Loop Camera Feedback ----------
  const FB_CASES = [
    { title: "Garage · Pitch −18.0°", drop: "−76%", detail: "Pitch error fell from 5.9° to 1.4°.", r: 0 },
    { title: "Garage · Roll +18.0°", drop: "−68%", detail: "Roll error fell from 2.5° to 0.8°.", r: 1 },
    { title: "Hallway · Roll", drop: "−38%", detail: "Roll error fell from 2.6° to 1.6°.", r: 2 },
    { title: "Street SUV · Roll +17.0°", drop: "−93%", detail: "Roll error fell from 3.0° to 0.2°.", r: 3 },
    { title: "Barbershop · Pitch +17.0°", drop: "−36%", detail: "Feedback revised the pitch estimate to +10.0°.", r: 4 },
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
    fbIter1.src = `static/img/feedback/hd/fb_r${c.r}_iter1.webp`;
    fbIter2.src = `static/img/feedback/hd/fb_r${c.r}_iter2.webp`;
    fbInput.src = `static/img/feedback/hd/fb_r${c.r}_input.webp`;
    fbTarget.src = `static/img/feedback/hd/fb_r${c.r}_target.webp`;
    fbNote.textContent = c.detail;
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
      note: "Neutral gray in the ground-truth normals marks missing sensor data near the TV and dark edges.",
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
      sub: "Geometric sketchpads support 2D and 3D questions",
      cap: "Examples cover spatial relations, counting, relative depth, and distance.",
      items: [
        {
          title: "2D Spatial Relation", tag: "Direct ✗ → CoGT ✓", tagCls: "fix",
          rgb: "static/img/reasoning/hd/cvbench_0_rgb.webp?v=native2",
          maps: "static/img/reasoning/hd/cvbench_0_maps.webp?v=source-hd2",
          q: "Where is the potted plant (red box) located relative to the TV? (A) above (B) below",
          direct: "Direct: (B) below ✗", directCls: "bad", cogt: "CoGT: (A) above ✓"
        },
        {
          title: "2D Visual Counting", tag: "Direct ✗ → CoGT ✓", tagCls: "fix",
          rgb: "static/img/reasoning/hd/cvbench_1_rgb.webp?v=native2",
          maps: "static/img/reasoning/hd/cvbench_1_maps.webp?v=source-hd2",
          q: "How many street lights are in the image? (A) 0 (B) 9 (C) 11 (D) 10 (E) 8 (F) 12",
          direct: "Direct: (E) 8 ✗", directCls: "bad", cogt: "CoGT: (D) 10 ✓"
        },
        {
          title: "3D Relative Depth", tag: "Anchored ✓", tagCls: "fix",
          rgb: "static/img/reasoning/hd/cvbench_2_rgb.webp?v=native2",
          maps: "static/img/reasoning/hd/cvbench_2_maps.webp?v=source-hd2",
          q: "Closer to the camera: keyboard (red box) or chair (blue box)? (A) keyboard (B) chair",
          direct: "Direct: Pose drift ✗", directCls: "bad", cogt: "CoGT: (A) keyboard ✓"
        },
        {
          title: "3D Metric Distance", tag: "Anchored ✓", tagCls: "fix",
          rgb: "static/img/reasoning/hd/cvbench_3_rgb.webp?v=native2",
          maps: "static/img/reasoning/hd/cvbench_3_maps.webp?v=source-hd2",
          q: "Closer to the lamp (red): night stand (blue) or chair (green)? (A) night stand (B) chair",
          direct: "Direct: Pose drift ✗", directCls: "bad", cogt: "CoGT: (A) night stand ✓"
        }
      ]
    },
    blink: {
      bench: "BLINK",
      title: "Fine-Grained Perceptual & 3D Surface Geometry",
      sub: "Depth, localization, reflectance, and spatial support on the protected600 split",
      cap: "BLINK validation covers 14 subtasks. CoGT scores 81.12% on spatial relations and 52.99% on reflectance.",
      items: [
        {
          title: "Relative Depth", tag: "Task: 75.0% → 82.3%", tagCls: "ok",
          rgb: "static/img/reasoning/hd/blink_0_rgb.webp?v=native2",
          maps: "static/img/reasoning/hd/blink_0_maps.webp?v=source-hd2",
          q: "Which circled point on the image is closer to the camera? (A) A is closer (B) B is closer",
          direct: "Direct: (A) A is closer ✓", directCls: "neutral", cogt: "CoGT: (A) A is closer ✓"
        },
        {
          title: "Object Localization", tag: "Task: 61.5% → 67.2%", tagCls: "ok",
          rgb: "static/img/reasoning/hd/blink_1_rgb.webp?v=native2",
          maps: "static/img/reasoning/hd/blink_1_maps.webp?v=source-hd2",
          q: "Which bounding box more accurately encloses the cow? (A) Box A (green) (B) Box B (red)",
          direct: "Direct: (A) Box A ✓", directCls: "neutral", cogt: "CoGT: (A) Box A ✓"
        },
        {
          title: "Relative Reflectance", tag: "Task: 48.5% → 53.0%", tagCls: "ok",
          rgb: "static/img/reasoning/hd/blink_2_rgb.webp?v=native2",
          maps: "static/img/reasoning/hd/blink_2_maps.webp?v=source-hd2",
          q: "Ignoring shading, which point has darker surface albedo? (A) A (B) B (C) Same",
          direct: "Direct: (B) B is darker ✓", directCls: "neutral", cogt: "CoGT: (B) B is darker ✓"
        },
        {
          title: "3D Spatial Relation", tag: "Task: 76.9% → 81.1%", tagCls: "ok",
          rgb: "static/img/reasoning/hd/blink_3_rgb.webp?v=native2",
          maps: "static/img/reasoning/hd/blink_3_maps.webp?v=source-hd2",
          q: "Considering 3D support and depth, is the cat on the chair? (A) yes (B) no",
          direct: "Direct: (B) no ✓", directCls: "neutral", cogt: "CoGT: (B) no ✓"
        }
      ]
    },
    mmsi: {
      bench: "MMSI-Bench",
      title: "Spatial Reasoning Across Views",
      sub: "Camera-object pose, cross-room doorway navigation, cardinal orientation, and 3D camera rotation",
      cap: "Examples cover relative camera–object pose, doorway navigation, and camera motion across views.",
      items: [
        {
          title: "Camera-Object Pose", tag: "Direct ✗ → CoGT ✓", tagCls: "fix",
          rgb: "static/img/reasoning/hd/mmsi_0_rgb.webp?v=source-hd2",
          maps: "static/img/reasoning/hd/mmsi_0_maps.webp?v=full1",
          q: "Continuous first-person views 1 → 2. At view 2, where is the bed? (A) Left (B) Behind (C) Right",
          direct: "Direct: (B) Behind ✗", directCls: "bad", cogt: "CoGT: (A) Left ✓"
        },
        {
          title: "Object-Region Layout", tag: "Direct ✗ → CoGT ✓", tagCls: "fix",
          rgb: "static/img/reasoning/hd/mmsi_1_rgb.webp?v=source-hd2",
          maps: "static/img/reasoning/hd/mmsi_1_maps.webp?v=full1",
          q: "Entering through the white door, how to reach the TV area? (A) Straight (B) Left (C) Unclear (D) Right",
          direct: "Direct: (C) Unclear ✗", directCls: "bad", cogt: "CoGT: (D) Go right ✓"
        },
        {
          title: "Camera-Region Frame", tag: "Direct ✗ → CoGT ✓", tagCls: "fix",
          rgb: "static/img/reasoning/hd/mmsi_2_rgb.webp?v=source-hd2",
          maps: "static/img/reasoning/hd/mmsi_2_maps.webp?v=full1",
          q: "Fig. 1: south of bathroom. In Fig. 2, direction relative to shower? (A) N (B) E (C) W (D) S",
          direct: "Direct: (A) North ✗", directCls: "bad", cogt: "CoGT: (C) West ✓"
        },
        {
          title: "Camera Ego-Motion", tag: "3D Rotation ✓", tagCls: "ok",
          rgb: "static/img/reasoning/hd/mmsi_3_rgb.webp?v=source-hd2",
          maps: "static/img/reasoning/hd/mmsi_3_maps.webp?v=full1",
          q: "From Figure 1 to Figure 2, in which direction does the camera mainly rotate? (A) Right (C) Left",
          direct: "Direct: (A) Right ✓", directCls: "neutral", cogt: "CoGT: (A) Right ✓"
        }
      ]
    },
    vsi: {
      bench: "VSI-Bench",
      title: "Embodied 3D Video & Metric Spatial Reasoning",
      sub: "Estimate distances, object sizes, room areas, and directions from 32-frame walkthroughs",
      items: [
        {
          title: "3D Distance", tag: "−78% metric error", tagCls: "fix",
          grid: "static/img/reasoning/hd/vsi_0_grid.webp?v=native2",
          scale: { label: "Scale (m)", gt: "GT = 2.7 m", d: 78, c: 56, g: 50 },
          q: "Closest-point 3D distance between the bookshelf (#1) and sofa (#10), in meters?",
          direct: "Direct: 3.6 m", directCls: "bad", cogt: "CoGT: 2.9 m (GT 2.7 m)"
        },
        {
          title: "3D Object Size", tag: "−77% size error", tagCls: "fix",
          grid: "static/img/reasoning/hd/vsi_1_grid.webp?v=native2",
          scale: { label: "Scale (cm)", gt: "GT = 133 cm", d: 42, c: 70, g: 77 },
          q: "Length of the longest dimension of the door (#7), measured in centimeters?",
          direct: "Direct: 107 cm", directCls: "bad", cogt: "CoGT: 127 cm (GT 133 cm)"
        },
        {
          title: "Room Floor Area", tag: "−85% area error", tagCls: "fix",
          grid: "static/img/reasoning/hd/vsi_2_grid.webp?v=native2",
          scale: { label: "Scale (m²)", gt: "GT = 26.1 m²", d: 84, c: 61, g: 56 },
          q: "Total floor area of this room (in m²) estimated across the walkthrough?",
          direct: "Direct: 32.1 m²", directCls: "bad", cogt: "CoGT: 27.0 m² (GT 26.1 m²)"
        },
        {
          title: "Egocentric Directions in 3D", tag: "Direct ✗ → CoGT ✓", tagCls: "fix",
          grid: "static/img/reasoning/hd/vsi_3_grid.webp?v=native2",
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
  let stopSrPlayback = () => {};

  function* typeSrLine(el, text, reducedMotion) {
    // Expose a complete line to assistive technology while animating its visual copy.
    const transcript = document.createElement("span");
    transcript.className = "sr-transcript";
    transcript.textContent = text;
    const ink = document.createElement("span");
    ink.setAttribute("aria-hidden", "true");
    el.replaceChildren(transcript, ink);
    if (reducedMotion) {
      ink.textContent = text;
      return;
    }
    ink.classList.add("sr-writing");
    const line = document.createTextNode("");
    ink.appendChild(line);
    for (const char of text) {
      line.appendData(char);
      if (/[.,?!:]/.test(char)) yield 125;
      else if (char === " ") yield 40;
      else yield 19 + Math.random() * 21;
    }
    ink.classList.remove("sr-writing");
  }

  function renderSrChat(key, caseIdx = 0) {
    stopSrPlayback();
    const v = SR_VIEWS[key];
    if (!v || !srGallery) return;
    if (caseIdx >= v.items.length) caseIdx = 0;
    const it = v.items[caseIdx];

    srChips.forEach((b) => b.classList.toggle("on", b.dataset.sr === key));
    if (srCap) srCap.textContent = v.cap || "";

    const caseBtns = v.items.map((item, ci) =>
      `<button class="sr-case-btn ${ci === caseIdx ? "on" : ""}" data-ci="${ci}">Case ${ci + 1}: ${item.title}</button>`
    ).join("");

    const userImg = it.grid || it.rgb;
    const imageLabel = it.grid ? "32-frame video" : key === "mmsi" ? "" : "Input RGB";
    const midHtml = it.scale
      ? `<div class="sr-scale-box">
           <div class="sr-scale-row"><span>${it.scale.label}</span><b>${it.scale.gt}</b></div>
           <div class="sr-scale-track">
             <span class="sr-dot g" style="left:${it.scale.g}%"></span>
             <span class="sr-dot d" style="left:${it.scale.d}%"></span>
             <span class="sr-dot c" style="left:${it.scale.c}%"></span>
           </div>
         </div>`
      : (it.meta
        ? `<div class="sr-scale-box"><div class="sr-scale-row" style="margin:0"><span>${it.meta.left}</span><b style="color:#15803d">${it.meta.right}</b></div></div>`
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
        <button type="button" class="sr-replay">Replay dialogue</button>
      </div>
      <div class="sr-chat-stage">
        <div class="sr-msg user">
          <div class="sr-avatar user" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          </div>
          <div class="sr-bubble user">
            <div class="sr-who"><span>USER · ${v.bench.toUpperCase()} QUERY</span><span>${it.title}</span></div>
            <div class="sr-chat-user-content">
              <a class="sr-chat-img sr-image-link" href="${userImg}" target="_blank" rel="noopener" aria-label="Open the full-size input image"><img src="${userImg}" alt="${it.title}">${imageLabel ? `<span class="sr-input-label${it.grid ? " grid" : ""}" aria-hidden="true">${imageLabel}</span>` : ""}</a>
              <p class="sr-q-txt" id="sr-q-type"></p>
            </div>
          </div>
        </div>
        <div class="sr-msg bot" id="sr-typing" style="display:none">
          <div class="sr-typing-row">
            <span>Generating CoGT Sketchpad (F, ρ, N)</span>
            <span class="sr-typing-dot"></span><span class="sr-typing-dot"></span><span class="sr-typing-dot"></span>
          </div>
          <div class="sr-avatar bot" aria-hidden="true"><img src="static/img/logo.png" alt="Robin-World"></div>
        </div>
        <div class="sr-msg bot" id="sr-bot-bubble" style="display:none">
          <div class="sr-bubble bot">
            <div class="sr-who">
              <span>ROBIN-WORLD · COGT GROUNDED RESPONSE</span>
              <span class="sr-tag ${it.tagCls}">${it.tag}</span>
            </div>
            ${it.maps ? `<a class="sr-image-link" href="${it.maps}" target="_blank" rel="noopener" aria-label="Open the full-size geometric sketchpads"><img class="sr-maps" src="${it.maps}" alt="F, rho, N geometric sketchpads"></a>` : ""}
            ${midHtml}
            <p class="sr-a-txt" id="sr-a-type"></p>
            <div class="sr-ans" id="sr-ans-pills" style="display:none">
              <span class="sr-pill ${it.directCls}"></span>
              <span class="sr-pill good" hidden></span>
            </div>
          </div>
          <div class="sr-avatar bot" aria-hidden="true"><img src="static/img/logo.png" alt="Robin-World"></div>
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

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    function* dialogue() {
      yield* typeSrLine(qEl, it.q, reducedMotion);
      typingEl.style.display = "flex";
      yield 650;
      typingEl.style.display = "none";
      botEl.style.display = "flex";
      yield* typeSrLine(aEl, botSummary, reducedMotion);
      pillsEl.style.display = "flex";
      yield* typeSrLine(pillsEl.firstElementChild, it.direct, reducedMotion);
      yield 180;
      pillsEl.lastElementChild.hidden = false;
      yield* typeSrLine(pillsEl.lastElementChild, it.cogt, reducedMotion);
    }

    srGallery.querySelector(".sr-replay").addEventListener("click", () => {
      renderSrChat(key, caseIdx);
      srGallery.querySelector(".sr-replay").focus({ preventScroll: true });
    });
    const sequence = dialogue();
    if (reducedMotion) {
      for (const delay of sequence) { /* Show the whole exchange immediately. */ }
      return;
    }
    let timer, visible = false, stopped = false;
    function advance() {
      if (stopped || !visible) return;
      const next = sequence.next();
      if (next.done) stopSrPlayback();
      else timer = setTimeout(advance, next.value);
    }
    const observer = new IntersectionObserver(entries => {
      const inView = entries[entries.length - 1].isIntersecting;
      if (stopped || visible === inView) return;
      visible = inView;
      clearTimeout(timer);
      if (visible) advance();
    }, { rootMargin: "0px 0px -6% 0px" });
    stopSrPlayback = () => {
      stopped = true;
      observer.disconnect();
      clearTimeout(timer);
    };
    observer.observe(srGallery.querySelector(".sr-chat-stage"));
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

  const expKeyHud = document.getElementById("exp-key-hud");
  function buildKeyHud(el) {
    if (!el) return;
    el.innerHTML = `
      <div class="key-cluster">
        <div class="keycap blank"></div>
        <div class="keycap" data-act="up">↑</div>
        <div class="keycap blank"></div>
        <div class="keycap" data-act="left">←</div>
        <div class="keycap" data-act="down">↓</div>
        <div class="keycap" data-act="right">→</div>
      </div>
      <div class="key-cluster">
        <div class="keycap blank"></div>
        <div class="keycap" data-act="W">W</div>
        <div class="keycap blank"></div>
        <div class="keycap" data-act="A">A</div>
        <div class="keycap" data-act="S">S</div>
        <div class="keycap" data-act="D">D</div>
      </div>`;
  }
  function syncKeyHud(el, demo, time, duration, badgeEl) {
    if (!demo) return 0;
    const acts = demo.actions || [];
    const turnCount = acts.length || 1;
    const length = Math.max(0.1, duration || demo.duration || 16);
    const activeTurn = Math.min(turnCount - 1, Math.floor(Math.max(0, time / length) * turnCount));
    const raw = acts[activeTurn] || "";
    const parts = raw.split("+").map((s) => s.trim());
    if (el) {
      el.querySelectorAll(".keycap[data-act]").forEach((k) => {
        k.classList.toggle("on", parts.includes(k.dataset.act));
      });
    }
    if (badgeEl) {
      badgeEl.textContent = `Turn ${activeTurn + 1} / ${turnCount} · ${raw}`;
    }
    return activeTurn;
  }
  buildKeyHud(expKeyHud);

  function updateExplorerTelemetry() {
    if (!expVid || !curExp) return;
    const dur = expVid.duration || curExp.duration || 16;
    const p = Math.max(0, Math.min(1, expVid.currentTime / dur));
    drawTraj(p);
    const activeTurn = syncKeyHud(expKeyHud, curExp, expVid.currentTime, dur, null);
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
    syncKeyHud(expKeyHud, demo, 0, demo.duration, null);
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
  if (discChips) {
    const rows = document.getElementById("disc-rows");
    const template = document.getElementById("disc-row");
    const preview = document.getElementById("jump-preview");
    const fullImage = document.getElementById("jump-preview-image");
    const caption = document.getElementById("jump-preview-caption");

    const pages = document.getElementById("disc-pages");
    const play = document.getElementById("disc-play");
    const pageButtons = [...pages.querySelectorAll("[data-page]")];
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    const jumpControllers = new Map();
    const jumpObserver = new IntersectionObserver(changes => {
      for (const { target, isIntersecting } of changes) {
        if (isIntersecting) jumpControllers.get(target).replay();
        else jumpControllers.get(target).reset();
      }
    }, { threshold: 0.45 });

    function connectJumps(row) {
      const svg = row.querySelector(".jump-routes");
      const source = row.querySelector(".jump-source img");
      const origin = svg.querySelector(".jump-origin");
      const templateRoute = svg.querySelector(".jump-route");
      templateRoute.remove();
      const routes = Array.from(row.querySelectorAll(".jump-card:not(.jump-source)"), card => {
        const target = card.querySelector("[data-view]");
        const echo = card.querySelector(".jump-echo");
        echo.src = source.src;
        const group = templateRoute.cloneNode(true);
        group.dataset.view = target.dataset.view;
        group.setAttribute("aria-label", "Replay jump to " + target.alt);
        svg.insertBefore(group, origin);
        const route = { group, target, card, echo, ink: group.querySelector(".jump-ink"),
          head: group.querySelector(".jump-head"), frame: 0, generation: 0, length: 0 };
        group.addEventListener("click", () => replay([route]));
        group.addEventListener("keydown", event => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            replay([route]);
          }
        });
        return route;
      });

      function draw(route, fraction) {
        const distance = fraction * route.length;
        const pos = route.ink.getPointAtLength(distance);
        const before = route.ink.getPointAtLength(Math.max(0, distance - 1));
        const after = route.ink.getPointAtLength(Math.min(route.length, distance + 1));
        const angle = Math.atan2(after.y - before.y, after.x - before.x) * 180 / Math.PI;
        route.head.setAttribute("transform", `translate(${pos.x} ${pos.y}) rotate(${angle})`);
        route.ink.style.strokeDashoffset = String(1 - fraction);
        route.echo.style.opacity = fraction < 1 ? "1" : "0";
      }
      function reset() {
        for (const route of routes) {
          route.generation++;
          cancelAnimationFrame(route.frame);
          if (route.length) draw(route, 1);
          route.group.setAttribute("tabindex", reducedMotion.matches ? "-1" : "0");
          route.group.setAttribute("aria-disabled", String(reducedMotion.matches));
        }
      }
      function layout() {
        const bounds = svg.getBoundingClientRect();
        if (!bounds.width) return;
        const center = node => {
          const box = node.getBoundingClientRect();
          return box.left + box.width / 2 - bounds.left;
        };
        const x = center(source);
        const mobile = source.getBoundingClientRect().top < bounds.top;
        const end = bounds.height - 4;
        const start = mobile ? 2 : end;
        origin.setAttribute("cx", x);
        origin.setAttribute("cy", start);
        routes.forEach((route, i) => {
          const tx = center(route.card);
          const bend = mobile ? bounds.height / 2 : 33 - 16 * i;
          const path = `M ${x} ${start} C ${x} ${bend}, ${tx} ${bend}, ${tx} ${end}`;
          for (const part of route.group.querySelectorAll("path:not(.jump-head)")) part.setAttribute("d", path);
          route.length = route.ink.getTotalLength();
        });
        reset();
      }
      function replay(selected = routes) {
        if (row.hidden || preview.open || document.hidden || reducedMotion.matches) return;
        if (!routes[0].length) layout();
        selected.forEach(async (route, i) => {
          const generation = ++route.generation;
          cancelAnimationFrame(route.frame);
          try { await Promise.all([route.echo.decode(), route.target.decode()]); } catch { return; }
          if (generation !== route.generation || !route.length || preview.open || document.hidden || row.hidden || reducedMotion.matches) return;
          const start = performance.now();
          const duration = 760 + i * 200;
          function advance(now) {
            const t = Math.max(0, Math.min(1, (now - start) / duration));
            draw(route, t * t * (3 - 2 * t));
            if (t < 1) route.frame = requestAnimationFrame(advance);
          }
          advance(start);
        });
      }
      layout();
      const resize = new ResizeObserver(layout);
      resize.observe(svg);
      row.querySelector(".jump-replay").addEventListener("click", () => replay());
      return { replay, reset };
    }

    const entries = DISCRETE_SCENES.flatMap(scene => scene.queries.map(query => {
      const row = template.content.firstElementChild.cloneNode(true);
      row.querySelector("h4").textContent = scene.queries.length > 1
        ? scene.label + " · " + query.qLabel : scene.label;
      row.querySelector(".jump-score").textContent = scene.tag;
      for (const image of row.querySelectorAll("img[data-view]")) {
        image.src = `static/img/world/${query.prefix}_${image.dataset.view}.jpg`;
      }
      rows.appendChild(row);
      jumpControllers.set(row, connectJumps(row));
      jumpObserver.observe(row);
      return { scene, row };
    }));
    reducedMotion.addEventListener("change", () => jumpControllers.forEach(controller => controller.reset()));
    const half = Math.ceil(entries.length / 2);
    let selected = null;
    let page = 0;
    let expanded = false;
    let playing = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let timer;
    pageButtons[0].textContent = `1–${half}`;
    pageButtons[1].textContent = `${half + 1}–${entries.length}`;
    pageButtons[2].textContent = `Show all ${entries.length}`;

    function schedule() {
      clearTimeout(timer);
      if (document.hidden || selected || expanded || !playing || preview.open) return;
      timer = setTimeout(() => {
        const bounds = rows.getBoundingClientRect();
        if (bounds.bottom > 0 && bounds.top < window.innerHeight && !rows.contains(document.activeElement)) {
          page = 1 - page;
          updateGallery();
        } else {
          schedule();
        }
      }, 6000);
    }

    function updateGallery() {
      entries.forEach(({ scene, row }, i) => {
        row.hidden = selected ? scene !== selected : !expanded && Math.floor(i / half) !== page;
      });
      pages.hidden = Boolean(selected);
      for (const button of pageButtons) {
        const active = button.dataset.page === (expanded ? "all" : String(page));
        button.classList.toggle("on", active);
        button.setAttribute("aria-pressed", String(active));
      }
      play.hidden = expanded;
      play.textContent = playing ? "Pause slideshow" : "Play slideshow";
      schedule();
    }

    for (const button of pageButtons) {
      button.addEventListener("click", () => {
        expanded = button.dataset.page === "all";
        if (!expanded) page = Number(button.dataset.page);
        updateGallery();
      });
    }
    play.addEventListener("click", () => {
      playing = !playing;
      updateGallery();
    });
    document.addEventListener("visibilitychange", schedule);
    preview.addEventListener("close", schedule);

    rows.addEventListener("click", event => {
      const card = event.target.closest(".jump-card");
      if (!card) return;
      const image = card.querySelector("img");
      fullImage.src = image.src;
      fullImage.alt = image.alt;
      caption.textContent = card.closest(".jump-row").querySelector("h4").textContent + " · " + card.querySelector(".j-badge").textContent;
      preview.showModal();
      schedule();
    });
    preview.addEventListener("click", event => {
      if (event.target === preview) preview.close();
    });
    for (const scene of [null, ...DISCRETE_SCENES]) {
      const button = document.createElement("button");
      button.className = scene ? "chip" : "chip on";
      button.setAttribute("aria-pressed", String(!scene));
      button.textContent = scene ? scene.label : "All scenes";
      button.addEventListener("click", () => {
        for (const chip of discChips.children) {
          chip.classList.toggle("on", chip === button);
          chip.setAttribute("aria-pressed", String(chip === button));
        }
        selected = scene;
        updateGallery();
      });
      discChips.appendChild(button);
    }
    updateGallery();
  }

  // ---------- 12. Fixed-Time Bullet-Time Video Showcase ----------
  const FREEZE_CASES = [
    {
      key: "die360",
      label: "Tumbling die · 360°",
      note: "A single die freezes mid-tumble. The camera makes a full turn around its six faces before the die falls again.",
      vid: "static/video/bullet_time/wide-die360.mp4",
      poster: "static/video/bullet_time/wide-die360.jpg"
    },
    {
      key: "kickflip",
      label: "Kickflip · 160°",
      note: "A skateboard freezes halfway through a flip. The camera sweeps 160° around the deck and wheels, then returns.",
      vid: "static/video/bullet_time/wide-kickflip.mp4",
      poster: "static/video/bullet_time/wide-kickflip.jpg"
    },
    {
      key: "spintop",
      label: "Spinning top · 360°",
      note: "The tilted top stops spinning while the camera makes a full turn around it.",
      vid: "static/video/bullet_time/wide-spintop.mp4",
      poster: "static/video/bullet_time/wide-spintop.jpg"
    },
    {
      label: "Bookfall · Orbit",
      vid: "static/video/bullet_time/01_bookfall_orbit.mp4?v=freeze-en1",
      poster: "static/video/bullet_time/01_bookfall_orbit.jpg?v=freeze-en1"
    },
    {
      label: "Tram · Wide Orbit",
      vid: "static/video/bullet_time/02_tram_wide_orbit.mp4?v=freeze-en1",
      poster: "static/video/bullet_time/02_tram_wide_orbit.jpg?v=freeze-en1"
    },
    {
      label: "Airfield · Truck",
      vid: "static/video/bullet_time/03_airfield_truck.mp4?v=freeze-en1",
      poster: "static/video/bullet_time/03_airfield_truck.jpg?v=freeze-en1"
    },
    {
      label: "Plaza · Truck & Return",
      phaseNote: "The crowd freezes at 1.50 s and resumes walking at 6.77 s.",
      vid: "static/video/bullet_time/wildtrack-plaza-c3.mp4?v=plaza-short1",
      poster: "static/video/bullet_time/wildtrack-plaza-c3.jpg?v=plaza-short1"
    },
    {
      key: "real-kneeboard",
      label: "Kneeboard backflip",
      note: "The rider and board hang over the wake mid-flip. The camera arcs around the frozen spray before the rider lands.",
      movement: "The 3.10-second frozen move uses the return arc of a generated take, played backward and then forward. In this edit, the rider and board are reprojected together from the filmed freeze frame along the same camera path.",
      comparisonLabel: "Compare board stabilization",
      originalTake: "static/video/bullet_time/real-kneeboard-native.mp4",
      comparison: "static/video/bullet_time/real-kneeboard-comparison.mp4",
      source: {
        title: "Kneeboard backflip",
        url: "https://commons.wikimedia.org/wiki/File:Kneeboard_backflip.webm",
        author: "Jake",
        license: "CC BY 3.0",
        licenseUrl: "https://creativecommons.org/licenses/by/3.0"
      },
      vid: "static/video/bullet_time/real-kneeboard.mp4?v=board52",
      poster: "static/video/bullet_time/real-kneeboard.jpg?v=board52"
    },
    {
      key: "real-toytrain",
      label: "Mountain railway",
      note: "A blue train pauses on a bend in the Darjeeling Himalayan Railway.",
      movement: "During the 5.27-second camera move, visible scenery is reprojected from the filmed freeze frame using depth and camera poses. The generated take supplies the train and newly revealed areas.",
      comparisonLabel: "Compare background stabilization",
      originalTake: "static/video/bullet_time/real-toytrain-native.mp4",
      comparison: "static/video/bullet_time/real-toytrain-comparison.mp4",
      source: {
        title: "Darjeeling toy train",
        url: "https://commons.wikimedia.org/wiki/File:Darjeeling_toy_train.webm",
        author: "Gannu03",
        license: "CC BY-SA 4.0",
        licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0"
      },
      vid: "static/video/bullet_time/real-toytrain.mp4?v=rail54",
      poster: "static/video/bullet_time/real-toytrain.jpg?v=rail54"
    },
  ];
  const freezeGrid = document.getElementById("freeze-grid");
  if (freezeGrid) {
    const dialog = document.getElementById("freeze-dialog");
    const player = dialog.querySelector("video");
    const note = document.getElementById("freeze-note");
    let selectedPreview = null;

    function enlarge(clip, preview) {
      selectedPreview = preview;
      const start = preview.currentTime || 0;
      document.getElementById("freeze-title").textContent = clip.label;
      if (clip.phaseNote) {
        const link = document.createElement("a");
        link.href = "https://www.epfl.ch/labs/cvlab/data/data-wildtrack/";
        link.textContent = "WILDTRACK";
        note.replaceChildren("Generated from a ", link, " plaza image. " + clip.phaseNote);
      } else if (clip.source) {
        const source = document.createElement("a");
        source.href = clip.source.url;
        source.textContent = clip.source.title;
        const license = document.createElement("a");
        license.href = clip.source.licenseUrl;
        license.textContent = clip.source.license;
        const movement = clip.movement;
        note.replaceChildren(clip.note + " The opening and ending are filmed. " + movement + " Adapted from ",
          source, " by " + clip.source.author + ". This edit is available under ", license, ".");
        if (clip.originalTake) {
          const take = document.createElement("a");
          take.href = clip.originalTake;
          take.textContent = "Watch the full 158-frame model output";
          note.append(" ", take, ".");
        }
        if (clip.comparison) {
          const comparison = document.createElement("a");
          comparison.href = clip.comparison;
          comparison.textContent = clip.comparisonLabel;
          note.append(" ", comparison, ".");
        }
      } else if (clip.key) {
        note.textContent = clip.note + " The moving opening and ending are simulated. The 158-frame frozen orbit is generated using multi-view RGB-D guidance.";
      } else {
        note.textContent = "20.42 dB PSNR and 0.934 static consistency across 128 clips.";
      }
      player.poster = clip.poster;
      if (preview.videoHeight) dialog.style.setProperty("--clip-ratio", preview.videoWidth / preview.videoHeight);
      player.onloadedmetadata = () => {
        dialog.style.setProperty("--clip-ratio", player.videoWidth / player.videoHeight);
        player.currentTime = start % player.duration;
      };
      player.src = clip.vid;
      dialog.showModal();
      player.play().catch(() => {});
    }

    dialog.addEventListener("close", () => {
      if (selectedPreview && selectedPreview.readyState >= 1 && player.readyState >= 1) {
        selectedPreview.currentTime = player.currentTime % selectedPreview.duration;
      }
      selectedPreview = null;
      player.onloadedmetadata = null;
      player.pause();
      player.removeAttribute("src");
      player.load();
    });
    dialog.addEventListener("click", event => {
      if (event.target === dialog) dialog.close();
    });

    for (const clip of FREEZE_CASES) {
      const tile = document.createElement("button");
      tile.type = "button";
      tile.className = "freeze-tile";
      tile.setAttribute("aria-haspopup", "dialog");
      tile.setAttribute("aria-label", "Enlarge " + clip.label);
      if (clip.key) tile.dataset.orbit = clip.key;
      const preview = document.createElement("video");
      preview.muted = preview.defaultMuted = true;
      preview.playsInline = true;
      preview.loop = true;
      preview.autoplay = true;
      preview.poster = clip.poster;
      preview.src = clip.vid.replace("/bullet_time/", "/bullet_time/previews/");
      const title = document.createElement("span");
      title.textContent = clip.label;
      tile.append(preview, title);
      tile.addEventListener("click", () => enlarge(clip, preview));
      freezeGrid.appendChild(tile);
    }

    const requestedOrbit = new URLSearchParams(location.search).get("bullet");
    for (const tile of freezeGrid.querySelectorAll("[data-orbit]")) {
      if (tile.dataset.orbit === requestedOrbit) tile.click();
    }
  }

  // ---------- 13. Filterable World Rollout Gallery ----------
  const galGrid = document.getElementById("gal-grid");
  const modal = document.getElementById("gal-modal");
  const modalVid = document.getElementById("modal-vid");
  const modalCap = document.getElementById("modal-cap");
  const modalActs = document.getElementById("modal-acts");
  const modalKeyHud = document.getElementById("modal-key-hud");
  const modalTurnBadge = document.getElementById("modal-turn-badge");
  let curModalDemo = null;
  buildKeyHud(modalKeyHud);
  modalVid?.addEventListener("timeupdate", () => {
    if (curModalDemo) syncKeyHud(modalKeyHud, curModalDemo, modalVid.currentTime, modalVid.duration, modalTurnBadge);
  });

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
          <div class="vid-key-hud compact" aria-hidden="true"></div>
        </div>
        <div class="meta">
          <div class="t">${d.title}</div>
          <div class="s">[${(d.actions || []).join(" → ")}]</div>
        </div>`;
      const preview = card.querySelector("video");
      const previewHud = card.querySelector(".vid-key-hud");
      buildKeyHud(previewHud);
      syncKeyHud(previewHud, d, 0, d.duration);
      preview.addEventListener("timeupdate", () => {
        syncKeyHud(previewHud, d, preview.currentTime, preview.duration);
      });
      card.addEventListener("click", () => {
        curModalDemo = d;
        modalVid.src = d.video;
        syncKeyHud(modalKeyHud, d, 0, d.duration, modalTurnBadge);
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
  const teaserDemoOverlay = document.getElementById("teaser-demo-overlay");
  const teaserDemoName = document.getElementById("teaser-demo-name");
  const teaserKeyHud = document.getElementById("teaser-key-hud");
  const museumDemo = demos.find((demo) => demo.key === "5_memory");

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
      vid: museumDemo?.video || "static/video/pillars/sim.mp4",
      poster: museumDemo?.poster || "static/video/pillars/sim.jpg",
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

  function syncTeaserKeyHud() {
    if (teaserActiveKey !== "sim" || !museumDemo || !teaserStageVid) return;
    syncKeyHud(teaserKeyHud, museumDemo, teaserStageVid.currentTime, teaserStageVid.duration);
  }

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
    if (teaserDemoOverlay) teaserDemoOverlay.hidden = key !== "sim" || !museumDemo;
    syncTeaserKeyHud();
    if (teaserJump) teaserJump.href = spec.href;
    requestAnimationFrame(() => drawTeaserWires(key));
  }

  if (teaserExp) {
    buildKeyHud(teaserKeyHud);
    if (teaserDemoName && museumDemo) teaserDemoName.textContent = museumDemo.title;
    setTeaserBranch("cam");
    if (teaserStageVid) {
      teaserStageVid.addEventListener("timeupdate", syncTeaserKeyHud);
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
