// Research Galaxy — TEST visualization
// Click-only interaction. No mouse wheel zoom, no drag pan.
// Themes are suns; papers are planets orbiting them.
// Click theme → focus zoom; click paper → side panel with full info.

(function () {
  const stage = document.getElementById('galaxy-stage');
  if (!stage) return;

  const svgNS = 'http://www.w3.org/2000/svg';
  const W = 1100, H = 640;

  // ===== Data =====
  // Themes arranged on an ellipse — left, top, right, bottom (cyclic)
  const themes = [
    {
      id: 'hai', name: 'Human-AI\nInteraction', color: '#3ecf8e',
      pos: { x: 0.13, y: 0.50 },
      arrowText: 'How should AI agents behave?',
      papers: [
        { id: 'silent', title: '"What Keeps Fans on the Silent Field?": AI Sports Broadcasting in Non-Event Time', short: 'Soccer Commentary', venue: 'CHI 2026', authors: 'Kyusik Kim, Jaehoon Choi, Hoyeol Yang, Hyunsoo Choi, Minchae Kim, Minjeong Shin, Bongwon Suh', abstract: 'ARUA — a prototype that lets fans direct their own AI commentary, transforming uneventful moments into emotionally engaging viewing.', link: 'https://dl.acm.org/doi/full/10.1145/3772318.3791932' },
        { id: 'bleacher', title: 'BleacherBot: AI Agent as a Sports Co-Viewing Partner', short: 'Baseball Co-Viewing', venue: 'CHI 2025', authors: 'Kyusik Kim*, Hyungwoo Song*, Jeongwoo Ryu, Changhoon Oh, Bongwon Suh', abstract: 'A fine-tuned LLM-based AI agent that enhances emotional engagement during baseball co-viewing through context-aware commentary.', link: 'https://dl.acm.org/doi/10.1145/3706598.3714178' },
        { id: 'cml', title: 'Cinema Multiverse Lounge: Multi-Agent Film Appreciation', short: 'Film Multi-Agent', venue: 'CHI 2025', authors: 'Jeongwoo Ryu*, Kyusik Kim*, Dongseok Heo, Hyungwoo Song, Changhoon Oh, Bongwon Suh', abstract: 'Users converse with AI personas of directors, actors, and audiences to deepen film appreciation through diverse perspectives.', link: 'https://dl.acm.org/doi/10.1145/3706598.3713641' },
        { id: 'shop', title: 'Who Is Shopping With You? Persona Design in AI Shopping Agents', short: 'Shopping Persona', venue: 'SIGIR 2026', authors: 'Hyungwoo Song*, Kyusik Kim*, Hyeonseok Jeon, Minjeong Shin, Bongwon Suh', abstract: 'How persona design shapes cognitive and social engagement when AI agents accompany users during online shopping.' },
        { id: 'cogsci', title: 'Co-Overcooked: Cognitive Constraints on Partner Modeling in Human-AI Teams', short: 'Partner Modeling', venue: 'CogSci 2026', authors: 'Junghwan Kim*, Dongseok Heo*, Kyusik Kim, Jung Lee, Bongwon Suh', abstract: 'Partner modeling capacity constrains viable human-AI team configurations nonlinearly, revealing expectation conflicts in shared AI partner scenarios.' },
        { id: 'sre', title: 'Self-Referential Review: Self-Reference Effect in Review', short: 'Self-Reference', venue: 'SIGIR 2024', authors: 'Kyusik Kim*, Hyungwoo Song*, Bongwon Suh', abstract: 'How self-reference effects influence review behavior and evaluation quality in recommendation systems.', link: 'https://dl.acm.org/doi/10.1145/3626772.3657969' },
        { id: 'ikea', title: 'User-Participated Customization in Chatbot Failure', short: 'Chatbot Failure', venue: 'CHI EA 2024', authors: 'Hyungwoo Song, Kyusik Kim, Kitae Kim, Jeongwoo Ryu, Bongwon Suh', abstract: 'How user participation in chatbot customization affects tolerance and recovery from chatbot failures.', link: 'https://dl.acm.org/doi/full/10.1145/3613905.3651102' },
        { id: 'dice', title: 'DICE-BENCH: LLM Tool-Use in Multi-Round, Multi-Party Dialogues', short: 'LLM Tool-Use', venue: 'Findings of ACL 2025', authors: 'Kyochul Jang, Donghyeon Lee, Kyusik Kim, Dongseok Heo, Taewhoo Lee, Woojeong Kim, Bongwon Suh', abstract: 'A benchmark for evaluating LLM tool-use capabilities in complex multi-party dialogue scenarios.', link: 'https://aclanthology.org/2025.findings-acl.1375/' },
      ]
    },
    {
      id: 'align', name: 'Value\nAlignment', color: '#6c63ff',
      pos: { x: 0.50, y: 0.18 },
      arrowText: 'What harms must we prevent?',
      papers: [
        { id: 'sycophancy', title: 'Feeling Right vs. Being Right: AI Sycophancy in Value-Laden Deliberation', short: 'AI Sycophancy', venue: 'ACL 2026', authors: 'Jeongwoo Ryu, Soomin Kim, Jinsu Eun, Kyusik Kim, Changhoon Oh, Bongwon Suh', abstract: 'How sycophantic AI behavior undermines genuine moral reasoning — when AI agrees too readily, deliberation quality collapses.' },
        { id: 'argument', title: 'Conversational Argument Search Under Selective Exposure', short: 'Selective Exposure', venue: 'SIGIR 2025', authors: 'Kyusik Kim*, Jeongwoo Ryu*, Dongseok Heo, Hyungwoo Song, Changhoon Oh, Bongwon Suh', abstract: 'Strategies to counteract selective exposure in conversational argument search, enabling balanced access to diverse viewpoints.', link: 'https://dl.acm.org/doi/abs/10.1145/3726302.3730175' },
        { id: 'sink', title: 'Will LLMs Sink or Swim? Decision-Making Under Pressure', short: 'Decision Pressure', venue: 'Findings of EMNLP 2024', authors: 'Kyusik Kim, Hyeonseok Jeon, Jeongwoo Ryu, Bongwon Suh', abstract: 'Exploring how LLMs make decisions under pressure, revealing systematic biases in high-stakes scenarios.', link: 'https://aclanthology.org/2024.findings-emnlp.668' },
      ]
    },
    {
      id: 'fair', name: 'Fairness\n& Bias', color: '#ef6461',
      pos: { x: 0.87, y: 0.50 },
      arrowText: 'How to validate at scale?',
      papers: [
        { id: 'halo', title: 'Blinded by Context: Halo Effect of MLLM in AI Hiring', short: 'Hiring Halo', venue: 'Findings of ACL 2025', authors: 'Kyusik Kim*, Jeongwoo Ryu*, Hyeonseok Jeon, Bongwon Suh', abstract: 'Contextual cues in resumes create halo effects in MLLM-based hiring, biasing candidate evaluation regardless of qualifications.', link: 'https://aclanthology.org/2025.findings-acl.1338/' },
        { id: 'visual', title: 'Visual Interference in Speech Evaluation: Cultural Asymmetry in MLLMs', short: 'Hearing with Eyes', venue: 'Findings of ACL 2026', authors: 'Kyusik Kim*, Hyunwoo Yoo*, Jaehoon Choi, Gail Rosen, Bongwon Suh', abstract: 'MLLMs exhibit "Hearing with Eyes" — visual cues about a speaker\'s race interfere with speech evaluation, with culturally asymmetric patterns between Korean and English contexts.' },
        { id: 'voice', title: 'Whose Voice, Whose Avatar? Gender Matching Bias in Multimodal AI Teammates', short: 'Voice-Avatar', venue: 'Findings of ACL 2026', authors: 'Kyusik Kim*, Jaehoon Choi*, Hyunwoo Yoo, Bongwon Suh', abstract: 'In cooperative gaming, when an AI teammate\'s voice gender doesn\'t match its avatar appearance, MLLMs exhibit gender-congruence bias.' },
        { id: 'clini', title: 'CliniCAST: Acoustic Grounding vs. Text Dominance in Medical Triage', short: 'Clinical Audio', venue: 'Findings of ACL 2026', authors: 'Kyusik Kim*, Hyunwoo Yoo*, Jaehoon Choi, Kitae Kim, Gail Rosen, Bongwon Suh', abstract: 'LALMs fail to ground acoustic symptoms in medical triage, over-relying on text — a critical "text dominance" failure mode in healthcare AI.' },
        { id: 'mine', title: 'Mine over Yours: Authorship Bias in Generative IR', short: 'Authorship Bias', venue: 'SIGIR 2026', authors: 'Jeongwoo Ryu, Kyusik Kim, Soomin Kim, Jinsu Eun, Changhoon Oh, Bongwon Suh', abstract: 'How authorship biases evaluation in generative information retrieval — people favor their own generated content.' },
      ]
    },
    {
      id: 'sim', name: 'Social\nSimulation', color: '#f0a050',
      pos: { x: 0.50, y: 0.82 },
      arrowText: 'Simulation meets HAI',
      papers: []
    },
  ];

  // ===== Build SVG =====
  const svg = document.createElementNS(svgNS, 'svg');
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
  stage.insertBefore(svg, stage.firstChild);

  // Defs: glow filter, gradients per theme
  const defs = document.createElementNS(svgNS, 'defs');
  let gradientDefs = '';
  themes.forEach(t => {
    gradientDefs += `
      <radialGradient id="sun-${t.id}" cx="35%" cy="35%" r="65%">
        <stop offset="0%" stop-color="#ffffff" stop-opacity=".95"/>
        <stop offset="25%" stop-color="${t.color}" stop-opacity="1"/>
        <stop offset="100%" stop-color="${t.color}" stop-opacity=".85"/>
      </radialGradient>
      <radialGradient id="halo-${t.id}" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="${t.color}" stop-opacity=".6"/>
        <stop offset="60%" stop-color="${t.color}" stop-opacity=".15"/>
        <stop offset="100%" stop-color="${t.color}" stop-opacity="0"/>
      </radialGradient>`;
  });
  defs.innerHTML = `
    <filter id="sun-glow" x="-100%" y="-100%" width="300%" height="300%">
      <feGaussianBlur stdDeviation="6" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <filter id="strong-glow" x="-100%" y="-100%" width="300%" height="300%">
      <feGaussianBlur stdDeviation="14" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <radialGradient id="star-glow" cx="50%" cy="50%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="1"/>
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="nebula1" cx="50%" cy="50%">
      <stop offset="0%" stop-color="#3ecf8e" stop-opacity=".08"/>
      <stop offset="100%" stop-color="#3ecf8e" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="nebula2" cx="50%" cy="50%">
      <stop offset="0%" stop-color="#6c63ff" stop-opacity=".10"/>
      <stop offset="100%" stop-color="#6c63ff" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="nebula3" cx="50%" cy="50%">
      <stop offset="0%" stop-color="#ef6461" stop-opacity=".08"/>
      <stop offset="100%" stop-color="#ef6461" stop-opacity="0"/>
    </radialGradient>
    <marker id="arrow-end" markerWidth="12" markerHeight="10" refX="11" refY="5" orient="auto">
      <polygon points="0 0, 12 5, 0 10" fill="#8a9ec0"/>
    </marker>
    ${gradientDefs}
  `;
  svg.appendChild(defs);

  // Distant nebulae for depth
  const nebG = document.createElementNS(svgNS, 'g');
  nebG.setAttribute('class', 'nebulae');
  [
    { x: 0.18, y: 0.30, r: 240, fill: 'url(#nebula1)' },
    { x: 0.78, y: 0.72, r: 280, fill: 'url(#nebula2)' },
    { x: 0.55, y: 0.40, r: 200, fill: 'url(#nebula3)' },
  ].forEach(n => {
    const e = document.createElementNS(svgNS, 'circle');
    e.setAttribute('cx', n.x * W); e.setAttribute('cy', n.y * H);
    e.setAttribute('r', n.r); e.setAttribute('fill', n.fill);
    nebG.appendChild(e);
  });
  svg.appendChild(nebG);

  // Background star particles — varied sizes + colors + twinkle
  const starsG = document.createElementNS(svgNS, 'g');
  starsG.setAttribute('class', 'stars');
  const starCount = 180;
  const starColors = ['#ffffff', '#b8d4ff', '#ffe8b8', '#e0f0ff', '#ffffff'];
  for (let i = 0; i < starCount; i++) {
    const isBigStar = Math.random() < 0.08;
    const s = document.createElementNS(svgNS, 'circle');
    s.setAttribute('cx', Math.random() * W);
    s.setAttribute('cy', Math.random() * H);
    const r = isBigStar ? Math.random() * 1.5 + 1.4 : Math.random() * 0.9 + 0.3;
    s.setAttribute('r', r);
    s.setAttribute('fill', starColors[Math.floor(Math.random() * starColors.length)]);
    const baseOp = Math.random() * 0.55 + 0.25;
    s.setAttribute('opacity', baseOp);
    // Twinkle for some stars
    if (isBigStar || Math.random() < 0.25) {
      const anim = document.createElementNS(svgNS, 'animate');
      anim.setAttribute('attributeName', 'opacity');
      anim.setAttribute('values', `${baseOp};${Math.min(1, baseOp + 0.4)};${baseOp}`);
      anim.setAttribute('dur', (1.5 + Math.random() * 3) + 's');
      anim.setAttribute('repeatCount', 'indefinite');
      anim.setAttribute('begin', (Math.random() * 3) + 's');
      s.appendChild(anim);
    }
    // Glow for big stars
    if (isBigStar) {
      const halo = document.createElementNS(svgNS, 'circle');
      halo.setAttribute('cx', s.getAttribute('cx'));
      halo.setAttribute('cy', s.getAttribute('cy'));
      halo.setAttribute('r', r * 3);
      halo.setAttribute('fill', s.getAttribute('fill'));
      halo.setAttribute('opacity', '.15');
      starsG.appendChild(halo);
    }
    starsG.appendChild(s);
  }
  svg.appendChild(starsG);

  // Compute theme positions
  themes.forEach(t => {
    t._x = t.pos.x * W;
    t._y = t.pos.y * H;
  });

  // Cyclic arrows along an outer ellipse (clockwise)
  const arrowsG = document.createElementNS(svgNS, 'g');
  arrowsG.setAttribute('class', 'theme-arrows');

  // Each arrow + a separate label path (always upright)
  for (let i = 0; i < themes.length; i++) {
    const from = themes[i];
    const to = themes[(i + 1) % themes.length];
    const sunR = 44;

    // Direction
    const dx = to._x - from._x, dy = to._y - from._y;
    const len = Math.hypot(dx, dy);
    const ux = dx / len, uy = dy / len;
    const sx = from._x + ux * sunR;
    const sy = from._y + uy * sunR;
    const ex = to._x - ux * sunR;
    const ey = to._y - uy * sunR;

    // Curved arc bulging outward from galaxy center
    const galaxyCx = W / 2, galaxyCy = H / 2;
    const mx = (sx + ex) / 2, my = (sy + ey) / 2;
    let outX = mx - galaxyCx, outY = my - galaxyCy;
    const outLen = Math.hypot(outX, outY) || 1;
    outX /= outLen; outY /= outLen;
    const bulge = 60;
    const cx = mx + outX * bulge;
    const cy = my + outY * bulge;

    // Visible arrow
    const arrow = document.createElementNS(svgNS, 'path');
    arrow.setAttribute('d', `M ${sx} ${sy} Q ${cx} ${cy} ${ex} ${ey}`);
    arrow.setAttribute('fill', 'none');
    arrow.setAttribute('stroke', '#5a6a8a');
    arrow.setAttribute('stroke-width', '2');
    arrow.setAttribute('stroke-dasharray', '6,5');
    arrow.setAttribute('opacity', '.7');
    arrow.setAttribute('marker-end', 'url(#arrow-end)');
    arrow.setAttribute('class', 'theme-arrow');
    arrowsG.appendChild(arrow);

    // Label path — same arc but always drawn left-to-right (so text is upright)
    // If start is to the right of end, swap so text reads correctly
    const labelPathId = 'arrow-label-' + i;
    const labelPath = document.createElementNS(svgNS, 'path');
    let lsx = sx, lsy = sy, lex = ex, ley = ey, lcx = cx, lcy = cy;
    let dyOff = -12; // by default put label above the path
    if (lex < lsx) {
      // reverse path direction so text reads left-to-right
      [lsx, lex] = [lex, lsx];
      [lsy, ley] = [ley, lsy];
      // Now path goes the other way → label appears on opposite side; flip dy
      dyOff = 22;
    }
    labelPath.setAttribute('id', labelPathId);
    labelPath.setAttribute('d', `M ${lsx} ${lsy} Q ${lcx} ${lcy} ${lex} ${ley}`);
    labelPath.setAttribute('fill', 'none');
    labelPath.setAttribute('stroke', 'none');
    arrowsG.appendChild(labelPath);

    // Background pill for readability
    const labelText = document.createElementNS(svgNS, 'text');
    labelText.setAttribute('font-family', 'Inter,sans-serif');
    labelText.setAttribute('font-size', '15');
    labelText.setAttribute('fill', '#e0eaf7');
    labelText.setAttribute('font-weight', '600');
    labelText.setAttribute('font-style', 'italic');
    labelText.setAttribute('class', 'arrow-label');
    labelText.setAttribute('dy', dyOff);
    labelText.setAttribute('paint-order', 'stroke');
    labelText.setAttribute('stroke', '#0a0e1a');
    labelText.setAttribute('stroke-width', '5');
    labelText.setAttribute('stroke-linejoin', 'round');
    labelText.setAttribute('letter-spacing', '.01em');
    const tp = document.createElementNS(svgNS, 'textPath');
    tp.setAttribute('href', '#' + labelPathId);
    tp.setAttribute('startOffset', '50%');
    tp.setAttribute('text-anchor', 'middle');
    tp.textContent = from.arrowText;
    labelText.appendChild(tp);
    arrowsG.appendChild(labelText);
  }
  svg.appendChild(arrowsG);

  // Theme suns + paper planets
  const themesG = document.createElementNS(svgNS, 'g');
  themesG.setAttribute('class', 'themes');
  svg.appendChild(themesG);

  themes.forEach(t => {
    const g = document.createElementNS(svgNS, 'g');
    g.setAttribute('class', 'theme-node');
    g.setAttribute('data-id', t.id);
    g.setAttribute('transform', `translate(${t._x},${t._y})`);
    g.style.cursor = 'pointer';
    themesG.appendChild(g);

    // Outer atmospheric halo (large, soft)
    const halo = document.createElementNS(svgNS, 'circle');
    halo.setAttribute('r', 90);
    halo.setAttribute('fill', `url(#halo-${t.id})`);
    g.appendChild(halo);

    // Inner glow ring
    const innerHalo = document.createElementNS(svgNS, 'circle');
    innerHalo.setAttribute('r', 56);
    innerHalo.setAttribute('fill', t.color);
    innerHalo.setAttribute('opacity', '.18');
    innerHalo.setAttribute('filter', 'url(#sun-glow)');
    g.appendChild(innerHalo);

    // Sun core with radial gradient
    const core = document.createElementNS(svgNS, 'circle');
    core.setAttribute('r', 42);
    core.setAttribute('fill', `url(#sun-${t.id})`);
    core.setAttribute('stroke', '#ffffff');
    core.setAttribute('stroke-width', '1.5');
    core.setAttribute('stroke-opacity', '.5');
    core.setAttribute('class', 'sun-core');
    g.appendChild(core);

    // Sun label — larger, bolder
    const lines = t.name.split('\n');
    lines.forEach((line, i) => {
      const txt = document.createElementNS(svgNS, 'text');
      txt.setAttribute('text-anchor', 'middle');
      txt.setAttribute('y', (i - (lines.length - 1) / 2) * 16 + 6);
      txt.setAttribute('font-family', 'Inter,sans-serif');
      txt.setAttribute('font-size', '14');
      txt.setAttribute('font-weight', '700');
      txt.setAttribute('fill', '#fff');
      txt.setAttribute('pointer-events', 'none');
      txt.setAttribute('letter-spacing', '-.01em');
      txt.textContent = line;
      g.appendChild(txt);
    });

    // Subtle pulse animation on inner halo
    const pulse = document.createElementNS(svgNS, 'animate');
    pulse.setAttribute('attributeName', 'opacity');
    pulse.setAttribute('values', '.15;.28;.15');
    pulse.setAttribute('dur', (4 + Math.random() * 2) + 's');
    pulse.setAttribute('repeatCount', 'indefinite');
    innerHalo.appendChild(pulse);

    t._g = g;
    t._sun = core;
    t._halo = halo;
    t._innerHalo = innerHalo;

    // Click on sun → focus mode (auto-unfocus current first)
    g.addEventListener('click', function (e) {
      e.stopPropagation();
      if (focusedTheme === t) return; // already focused
      if (focusedTheme) {
        unfocus(() => focusTheme(t));
      } else {
        focusTheme(t);
      }
    });

    // Hover effect — gentle scale
    g.addEventListener('mouseenter', function () {
      if (focusedTheme !== t) core.setAttribute('r', 46);
    });
    g.addEventListener('mouseleave', function () {
      if (focusedTheme !== t) core.setAttribute('r', 42);
    });
  });

  // ===== State =====
  let focusedTheme = null;
  const planetsG = document.createElementNS(svgNS, 'g');
  planetsG.setAttribute('class', 'planets');
  svg.appendChild(planetsG);

  // Hint elements
  const backBtn = document.getElementById('galaxy-back');
  const hint = document.getElementById('galaxy-hint');
  const panel = document.getElementById('galaxy-panel');
  const panelClose = document.getElementById('galaxy-panel-close');
  const panelAccent = document.getElementById('galaxy-panel-accent');
  const panelBody = document.getElementById('galaxy-panel-body');

  function focusTheme(t) {
    focusedTheme = t;
    stage.classList.add('focused');
    t._g.classList.add('active');
    backBtn.classList.add('show');
    hint.classList.add('hide');

    const targetX = W / 2, targetY = H / 2 - 30;
    animateTransform(t._g, t._x, t._y, targetX, targetY, 550);
    t._sun.setAttribute('r', '58');
    t._innerHalo.setAttribute('r', '80');
    t._halo.setAttribute('r', '130');

    setTimeout(() => renderPlanets(t, targetX, targetY), 300);
  }

  function unfocus(cb) {
    if (!focusedTheme) { if (cb) cb(); return; }
    const t = focusedTheme;
    stage.classList.remove('focused');
    t._g.classList.remove('active');
    backBtn.classList.remove('show');
    hint.classList.remove('hide');
    closePanel();

    // Move sun back to its galaxy position
    animateTransform(t._g, W / 2, H / 2 - 30, t._x, t._y, 450);
    t._sun.setAttribute('r', '42');
    t._innerHalo.setAttribute('r', '56');
    t._halo.setAttribute('r', '90');

    Array.from(planetsG.children).forEach(p => p.style.opacity = '0');
    setTimeout(() => { planetsG.innerHTML = ''; if (cb) cb(); }, 300);
    focusedTheme = null;
  }

  function renderPlanets(t, cx, cy) {
    planetsG.innerHTML = '';
    const papers = t.papers;
    if (papers.length === 0) {
      const note = document.createElementNS(svgNS, 'text');
      note.setAttribute('x', cx);
      note.setAttribute('y', cy + 100);
      note.setAttribute('text-anchor', 'middle');
      note.setAttribute('font-family', 'Inter,sans-serif');
      note.setAttribute('font-size', '13');
      note.setAttribute('font-style', 'italic');
      note.setAttribute('fill', '#8a9ab8');
      note.textContent = 'Current postdoc focus — papers in progress';
      planetsG.appendChild(note);
      return;
    }

    const orbits = [
      { r: 130, count: Math.min(5, papers.length) },
      { r: 200, count: Math.max(0, papers.length - 5) },
    ];

    let pi = 0;
    orbits.forEach((orbit, oi) => {
      if (orbit.count === 0) return;

      // Orbit ring
      const ring = document.createElementNS(svgNS, 'circle');
      ring.setAttribute('cx', cx);
      ring.setAttribute('cy', cy);
      ring.setAttribute('r', orbit.r);
      ring.setAttribute('fill', 'none');
      ring.setAttribute('stroke', t.color);
      ring.setAttribute('stroke-width', '1');
      ring.setAttribute('stroke-dasharray', '3,5');
      ring.setAttribute('opacity', '0');
      planetsG.appendChild(ring);
      requestAnimationFrame(() => {
        ring.style.transition = 'opacity .5s';
        ring.setAttribute('opacity', '.18');
      });

      for (let i = 0; i < orbit.count; i++) {
        const paper = papers[pi++];
        const angle = (i / orbit.count) * Math.PI * 2 - Math.PI / 2 + (oi === 1 ? Math.PI / orbit.count : 0);
        const px = cx + Math.cos(angle) * orbit.r;
        const py = cy + Math.sin(angle) * orbit.r;

        const pg = document.createElementNS(svgNS, 'g');
        pg.style.cursor = 'pointer';
        pg.style.opacity = '0';
        pg.style.transition = 'opacity .4s ease ' + (i * 60) + 'ms, transform .25s';
        pg.setAttribute('transform', `translate(${px},${py})`);
        planetsG.appendChild(pg);

        // Connector line from sun to planet
        const line = document.createElementNS(svgNS, 'line');
        line.setAttribute('x1', cx - px);
        line.setAttribute('y1', cy - py);
        line.setAttribute('x2', 0);
        line.setAttribute('y2', 0);
        line.setAttribute('stroke', t.color);
        line.setAttribute('stroke-width', '0.5');
        line.setAttribute('opacity', '.25');
        pg.appendChild(line);

        // Planet glow
        const pglow = document.createElementNS(svgNS, 'circle');
        pglow.setAttribute('r', 18);
        pglow.setAttribute('fill', t.color);
        pglow.setAttribute('opacity', '.2');
        pg.appendChild(pglow);

        // Planet core
        const pcore = document.createElementNS(svgNS, 'circle');
        pcore.setAttribute('r', 11);
        pcore.setAttribute('fill', t.color);
        pcore.setAttribute('stroke', '#ffffff');
        pcore.setAttribute('stroke-width', '1.5');
        pcore.setAttribute('stroke-opacity', '.4');
        pg.appendChild(pcore);

        // Label outside planet, oriented away from sun
        const labelDist = 22;
        const dirX = Math.cos(angle), dirY = Math.sin(angle);
        const lx = dirX * labelDist;
        const ly = dirY * labelDist;
        const anchor = Math.abs(dirX) < 0.3 ? 'middle' : (dirX > 0 ? 'start' : 'end');

        const ltext = document.createElementNS(svgNS, 'text');
        ltext.setAttribute('x', lx);
        ltext.setAttribute('y', ly + 4);
        ltext.setAttribute('text-anchor', anchor);
        ltext.setAttribute('font-family', 'Inter,sans-serif');
        ltext.setAttribute('font-size', '13');
        ltext.setAttribute('font-weight', '600');
        ltext.setAttribute('fill', '#ffffff');
        ltext.setAttribute('letter-spacing', '-.005em');
        ltext.setAttribute('pointer-events', 'none');
        ltext.setAttribute('paint-order', 'stroke');
        ltext.setAttribute('stroke', '#0a0e1a');
        ltext.setAttribute('stroke-width', '4');
        ltext.setAttribute('stroke-linejoin', 'round');
        ltext.textContent = paper.short;
        pg.appendChild(ltext);

        // Venue mini-tag — brighter
        const venueTag = document.createElementNS(svgNS, 'text');
        venueTag.setAttribute('x', lx);
        venueTag.setAttribute('y', ly + 19);
        venueTag.setAttribute('text-anchor', anchor);
        venueTag.setAttribute('font-family', 'Inter,sans-serif');
        venueTag.setAttribute('font-size', '10.5');
        venueTag.setAttribute('font-weight', '500');
        venueTag.setAttribute('fill', t.color);
        venueTag.setAttribute('opacity', '.95');
        venueTag.setAttribute('pointer-events', 'none');
        venueTag.setAttribute('paint-order', 'stroke');
        venueTag.setAttribute('stroke', '#0a0e1a');
        venueTag.setAttribute('stroke-width', '3.5');
        venueTag.setAttribute('stroke-linejoin', 'round');
        venueTag.textContent = paper.venue;
        pg.appendChild(venueTag);

        pg.addEventListener('mouseenter', () => {
          pcore.setAttribute('r', '14');
          pglow.setAttribute('r', '22');
        });
        pg.addEventListener('mouseleave', () => {
          pcore.setAttribute('r', '11');
          pglow.setAttribute('r', '18');
        });
        pg.addEventListener('click', function (e) {
          e.stopPropagation();
          // If this planet's panel is already open, close it (toggle)
          if (panel.classList.contains('open') && panel.dataset.paperId === paper.id) {
            closePanel();
          } else {
            openPanel(paper, t.color);
            panel.dataset.paperId = paper.id;
          }
        });

        requestAnimationFrame(() => { pg.style.opacity = '1'; });
      }
    });
  }

  function openPanel(paper, color) {
    panelAccent.style.background = color;
    panelBody.innerHTML = `
      <span class="galaxy-panel-venue" style="background:${color}">${paper.venue}</span>
      <h3 class="galaxy-panel-title">${paper.title}</h3>
      <p class="galaxy-panel-authors">${paper.authors}</p>
      <p class="galaxy-panel-abstract">${paper.abstract}</p>
      ${paper.link ? `<a href="${paper.link}" target="_blank" class="galaxy-panel-link">Read paper <span style="font-size:14px">↗</span></a>` : '<p class="galaxy-panel-meta">Paper link not yet available</p>'}
    `;
    panel.classList.add('open');
  }
  function closePanel() {
    panel.classList.remove('open');
    delete panel.dataset.paperId;
  }
  panelClose.addEventListener('click', closePanel);

  backBtn.addEventListener('click', function (e) {
    e.stopPropagation();
    unfocus(null);
  });

  // Click on empty galaxy space → hierarchical back
  // Paper panel open → close panel (keep focused theme)
  // Theme focused but no panel → unfocus (back to galaxy overview)
  stage.addEventListener('click', function (e) {
    // Ignore clicks on interactive elements (sun, planet, panel, back button, zoom controls)
    if (e.target.closest('.theme-node')) return;
    if (e.target.closest('.planets > g')) return;
    if (e.target.closest('.galaxy-panel')) return;
    if (e.target.closest('.galaxy-back')) return;

    // Hierarchical back
    if (panel.classList.contains('open')) {
      closePanel();
    } else if (focusedTheme) {
      unfocus(null);
    }
  });

  // Smooth transform animation helper
  function animateTransform(el, fromX, fromY, toX, toY, duration) {
    const start = performance.now();
    function step(now) {
      const t = Math.min((now - start) / duration, 1);
      const e = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; // easeInOutQuad
      const x = fromX + (toX - fromX) * e;
      const y = fromY + (toY - fromY) * e;
      el.setAttribute('transform', `translate(${x},${y})`);
      if (t < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  // Slow rotation of background stars
  let starAngle = 0;
  function rotateStars() {
    starAngle += 0.02;
    starsG.setAttribute('transform', `rotate(${starAngle} ${W/2} ${H/2})`);
    requestAnimationFrame(rotateStars);
  }
  rotateStars();
})();
