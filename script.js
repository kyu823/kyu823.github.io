// ===== Shared: Nav =====
const nav = document.getElementById('nav');
if (nav) window.addEventListener('scroll', () => nav.classList.toggle('scrolled', window.scrollY > 50));

const mobileBtn = document.getElementById('navMobileBtn');
const mobileNav = document.getElementById('navMobile');
if (mobileBtn) {
  mobileBtn.addEventListener('click', () => mobileNav.classList.toggle('open'));
  mobileNav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => mobileNav.classList.remove('open')));
}

// Smooth scroll for same-page anchors only
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', function(e) {
    const href = this.getAttribute('href');
    if (href.startsWith('#')) {
      e.preventDefault();
      const t = document.querySelector(href);
      if (t) t.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// ===== Shared: Active Nav =====
const page = document.body.dataset.page || 'home';
document.querySelectorAll('.nav-links a').forEach(a => {
  const href = a.getAttribute('href');
  if (page === 'home' && (href === 'index.html' || href === '#')) a.classList.add('active');
  else if (page === 'publications' && href.includes('publications')) a.classList.add('active');
  else if (page === 'research' && href.includes('research')) a.classList.add('active');
  else if (page === 'about' && href.includes('about')) a.classList.add('active');
});

// ===== Shared: Fade-in =====
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => { if (entry.isIntersecting) entry.target.classList.add('visible'); });
}, { threshold: 0.08, rootMargin: '0px 0px -20px 0px' });
document.querySelectorAll('.section-title,.section-label,.about-grid,.project-card,.garden-viz,.pub-item,.pub-highlight-card,.theme-card-summary,.award-item,.theme-detail,.theme-paper-item').forEach(el => {
  // Skip everything inside #contact — always visible
  if (el.closest('#contact') || el.closest('.contact')) return;
  el.classList.add('fade-in'); observer.observe(el);
});
// Photo rotator handled by inline script in HTML

document.querySelectorAll('.hero-text,.hero-photo,.hero-stats').forEach((el, i) => {
  el.classList.add('fade-in');
  setTimeout(() => el.classList.add('visible'), 100 + i * 150);
});

// ===== Publications Page: Filters + Toggle =====
if (document.querySelector('.publications-full')) {
  const venueFilters = document.querySelectorAll('[data-filter="venue"]');
  const yearFilters = document.querySelectorAll('[data-filter="year"]');
  const pubItems = document.querySelectorAll('.pub-item');
  const yearHeadings = document.querySelectorAll('.pub-year-heading');
  let activeVenue = 'all', activeYear = 'all';

  function applyFilters() {
    pubItems.forEach(item => {
      const venueMatch = activeVenue === 'all' || item.dataset.venue === activeVenue;
      const yearMatch = activeYear === 'all' || item.dataset.year === activeYear;
      item.classList.toggle('hidden', !(venueMatch && yearMatch));
    });
    // Hide year headings if all their papers are hidden
    yearHeadings.forEach(heading => {
      const yr = heading.dataset.year;
      const visible = [...pubItems].some(item => item.dataset.year === yr && !item.classList.contains('hidden'));
      heading.style.display = visible ? '' : 'none';
    });
  }

  venueFilters.forEach(btn => {
    btn.addEventListener('click', () => {
      venueFilters.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeVenue = btn.dataset.value;
      applyFilters();
    });
  });
  yearFilters.forEach(btn => {
    btn.addEventListener('click', () => {
      yearFilters.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeYear = btn.dataset.value;
      applyFilters();
    });
  });

  pubItems.forEach(item => {
    item.addEventListener('click', (e) => {
      if (e.target.closest('.pub-link')) return;
      item.classList.toggle('expanded');
    });
  });
}

// ===== Research Page: Orbit Visualization =====
if (document.getElementById('storyline-viz')) {
  function buildStorylineViz() {
    const container = document.getElementById('storyline-viz');
    if (!container) return;
    const w = Math.max(container.clientWidth, 700);
    const h = 560;
    const svgNS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '100%');
    svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
    container.appendChild(svg);

    // Zoom controls
    const controls = document.createElement('div');
    controls.className = 'zoom-controls';
    controls.innerHTML = '<button class="zoom-btn" data-zoom="in">+</button><button class="zoom-btn" data-zoom="out">&minus;</button><button class="zoom-btn" data-zoom="reset" style="font-size:11px">&#8634;</button>';
    container.appendChild(controls);

    // Pan & zoom state
    let scale = 1, panX = 0, panY = 0, isPanning = false, startX, startY;
    function applyTransform() {
      svg.setAttribute('viewBox', `${-panX/scale} ${-panY/scale} ${w/scale} ${h/scale}`);
    }

    // Mouse wheel zoom
    container.addEventListener('wheel', function(e) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      scale = Math.max(0.5, Math.min(3, scale * delta));
      applyTransform();
    }, {passive: false});

    // Mouse pan
    container.addEventListener('mousedown', function(e) {
      if (e.target.closest('.zoom-btn') || e.target.closest('.paper-dot')) return;
      isPanning = true; startX = e.clientX - panX; startY = e.clientY - panY;
    });
    window.addEventListener('mousemove', function(e) {
      if (!isPanning) return;
      panX = e.clientX - startX; panY = e.clientY - startY;
      applyTransform();
    });
    window.addEventListener('mouseup', function() { isPanning = false; });

    // Touch pan & pinch zoom
    let lastTouchDist = 0;
    container.addEventListener('touchstart', function(e) {
      if (e.touches.length === 1) {
        isPanning = true; startX = e.touches[0].clientX - panX; startY = e.touches[0].clientY - panY;
      } else if (e.touches.length === 2) {
        lastTouchDist = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
      }
    }, {passive: true});
    container.addEventListener('touchmove', function(e) {
      if (e.touches.length === 1 && isPanning) {
        panX = e.touches[0].clientX - startX; panY = e.touches[0].clientY - startY;
        applyTransform();
      } else if (e.touches.length === 2) {
        const dist = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
        if (lastTouchDist > 0) {
          scale = Math.max(0.5, Math.min(3, scale * (dist / lastTouchDist)));
          applyTransform();
        }
        lastTouchDist = dist;
      }
    }, {passive: true});
    container.addEventListener('touchend', function() { isPanning = false; lastTouchDist = 0; });

    // Button controls
    controls.addEventListener('click', function(e) {
      const btn = e.target.closest('.zoom-btn');
      if (!btn) return;
      if (btn.dataset.zoom === 'in') scale = Math.min(3, scale * 1.3);
      else if (btn.dataset.zoom === 'out') scale = Math.max(0.5, scale * 0.7);
      else { scale = 1; panX = 0; panY = 0; }
      applyTransform();
    });

    let tooltipEl = document.querySelector('.viz-tooltip');
    if (!tooltipEl) {
      tooltipEl = document.createElement('div');
      tooltipEl.className = 'viz-tooltip';
      document.body.appendChild(tooltipEl);
    }

    const cx = w / 2, cy = h / 2;
    const orbitR = Math.min(w, h) * 0.32; // circular orbit
    const orbitRx = orbitR, orbitRy = orbitR;

    // 4 themes on the orbit ellipse (positioned by angle on ellipse)
    const themes = [
      { id: 'interaction', label: 'Human-AI\nInteraction', color: '#3ecf8e', orbitAngle: 180,
        edgeLabel: 'How should AI agents behave?',
        papers: [
          { short: 'Soccer Commentary', title: 'AI Sports Broadcasting for Lean-Back Football Fans', venue: 'CHI \'26' },
          { short: 'Baseball Co-Viewing', title: 'BleacherBot: AI Agent as a Sports Co-Viewing Partner', venue: 'CHI \'25' },
          { short: 'Film Multi-Agent', title: 'Cinema Multiverse Lounge: Multi-Agent Film Appreciation', venue: 'CHI \'25' },
          { short: 'Shopping Persona', title: 'How Persona Design Shapes Engagement in AI Shopping', venue: 'SIGIR \'26' },
          { short: 'Self-Reference Review', title: 'Self-Referential Review: Self-Reference Effect in Review', venue: 'SIGIR \'24' },
          { short: 'Chatbot Customization', title: 'User-Participated Customization in Chatbot Failure', venue: 'CHI EA \'24' },
          { short: 'LLM Tool-Use', title: 'DICE-BENCH: LLM Tool-Use in Multi-Party Dialogues', venue: 'ACL \'25' },
        ]},
      { id: 'alignment', label: 'Value\nAlignment', color: '#6c63ff', orbitAngle: 270,
        edgeLabel: 'What harms must we prevent?',
        papers: [
          { short: 'AI Sycophancy', title: 'Feeling Right vs. Being Right: AI Sycophancy in Value-Laden Deliberation', venue: 'ACL \'26' },
          { short: 'Selective Exposure', title: 'Argument Search Under Selective Exposure for Balanced Perspectives', venue: 'SIGIR \'25' },
          { short: 'Decision Pressure', title: 'Will LLMs Sink or Swim? Decision-Making Under Pressure', venue: 'EMNLP \'24' },
        ]},
      { id: 'fairness', label: 'Fairness\n& Bias', color: '#ef6461', orbitAngle: 0,
        edgeLabel: 'How to validate at scale?',
        papers: [
          { short: 'Hiring Halo Effect', title: 'Blinded by Context: Halo Effect of MLLM in AI Hiring', venue: 'ACL \'25' },
          { short: 'Hearing with Eyes', title: 'Visual Interference in Speech Evaluation: Cultural Asymmetry in MLLMs', venue: 'ACL \'26' },
          { short: 'Voice-Avatar Conflict', title: 'Gender Matching Bias When Voice and Avatar Conflict in Game AI Teammates', venue: 'ACL \'26' },
          { short: 'Authorship Bias', title: 'Mine over Yours: Authorship Biases Evaluation in Generative IR', venue: 'SIGIR \'26' },
          { short: 'Clinical Audio Bias', title: 'CliniCAST: LALMs Ignore Acoustic Symptoms, Over-Rely on Text in Medical Triage', venue: 'ACL \'26' },
        ]},
      { id: 'simulation', label: 'Social\nSimulation', color: '#f0a050', orbitAngle: 90,
        edgeLabel: 'Simulation meets HAI',
        papers: []},
    ];

    const defs = document.createElementNS(svgNS, 'defs');
    defs.innerHTML = '<marker id="ah" markerWidth="10" markerHeight="8" refX="9" refY="4" orient="auto"><polygon points="0 0,10 4,0 8" fill="#ccc"/></marker>';
    svg.appendChild(defs);

    // Place themes on the orbit
    themes.forEach((t) => {
      const a = t.orbitAngle * Math.PI / 180;
      t._x = cx + Math.cos(a) * orbitRx;
      t._y = cy + Math.sin(a) * orbitRy;
    });

    // Draw orbit ring (subtle)
    const orbitEl = document.createElementNS(svgNS, 'circle');
    orbitEl.setAttribute('cx', cx); orbitEl.setAttribute('cy', cy);
    orbitEl.setAttribute('r', orbitR);
    orbitEl.setAttribute('fill', 'none');
    orbitEl.setAttribute('stroke', '#e0e0e0');
    orbitEl.setAttribute('stroke-width', '1.5');
    svg.appendChild(orbitEl);

    // Draw arrows between themes along the orbit (arc segments)
    themes.forEach((t, ti) => {
      const next = themes[(ti + 1) % themes.length];

      // Calculate start/end angles for the arc
      let a1 = t.orbitAngle;
      let a2 = next.orbitAngle;
      if (a2 <= a1) a2 += 360;
      const midDeg = (a1 + a2) / 2;

      // Start/end points offset from theme centers along the orbit
      const offDeg = 18; // degrees offset from theme center (wide gap so arrows are visible outside theme circles)
      const sA = (a1 + offDeg) * Math.PI / 180;
      const eA = ((a2 - offDeg) % 360) * Math.PI / 180;
      const sx = cx + Math.cos(sA) * orbitR;
      const sy = cy + Math.sin(sA) * orbitR;
      const ex = cx + Math.cos(eA) * orbitR;
      const ey = cy + Math.sin(eA) * orbitR;

      // SVG arc
      const arcSpan = a2 - a1 - offDeg * 2;
      const largeArc = arcSpan > 180 ? 1 : 0;
      const pathId = 'orbit-seg-' + ti;
      const seg = document.createElementNS(svgNS, 'path');
      seg.setAttribute('id', pathId);
      seg.setAttribute('d', `M ${sx} ${sy} A ${orbitR} ${orbitR} 0 ${largeArc} 1 ${ex} ${ey}`);
      seg.setAttribute('fill', 'none');
      seg.setAttribute('stroke', '#bbb');
      seg.setAttribute('stroke-width', '2.5');
      seg.setAttribute('marker-end', 'url(#ah)');
      svg.appendChild(seg);

      // Edge label — positioned at midpoint of arc, outside the orbit
      if (t.edgeLabel) {
        const mA = midDeg * Math.PI / 180;
        const labelR = orbitR + 22;
        const lx = cx + Math.cos(mA) * labelR;
        const ly = cy + Math.sin(mA) * labelR;

        // Rotate text to be tangent and always readable (not upside-down)
        let rotation = midDeg + 90;
        if (rotation > 90 && rotation < 270) rotation += 180;

        const txt = document.createElementNS(svgNS, 'text');
        txt.setAttribute('x', lx); txt.setAttribute('y', ly);
        txt.setAttribute('text-anchor', 'middle');
        txt.setAttribute('font-size', '9px');
        txt.setAttribute('font-weight', '600');
        txt.setAttribute('fill', '#aaa');
        txt.setAttribute('font-style', 'italic');
        txt.setAttribute('pointer-events', 'none');
        txt.setAttribute('transform', `rotate(${rotation} ${lx} ${ly})`);
        txt.textContent = t.edgeLabel;
        svg.appendChild(txt);
      }
    });

    // Draw theme nodes + paper dots
    themes.forEach((t) => {
      const tx = t._x, ty = t._y;
      const g = document.createElementNS(svgNS, 'g');
      g.classList.add('viz-node');
      g.style.cursor = 'pointer';

      // Glow
      const glow = document.createElementNS(svgNS, 'circle');
      glow.setAttribute('cx', tx); glow.setAttribute('cy', ty);
      glow.setAttribute('r', 48);
      glow.setAttribute('fill', t.color); glow.setAttribute('opacity', '0.07');
      g.appendChild(glow);

      // Main circle
      const circle = document.createElementNS(svgNS, 'circle');
      circle.setAttribute('cx', tx); circle.setAttribute('cy', ty);
      circle.setAttribute('r', 38);
      circle.setAttribute('fill', t.color); circle.setAttribute('opacity', '0.9');
      circle.setAttribute('stroke', '#fff'); circle.setAttribute('stroke-width', '3');
      g.appendChild(circle);

      // Label
      t.label.split('\n').forEach((line, i, arr) => {
        const txt = document.createElementNS(svgNS, 'text');
        txt.setAttribute('x', tx);
        txt.setAttribute('y', ty + (i - (arr.length-1)/2) * 14 + 5);
        txt.setAttribute('text-anchor', 'middle');
        txt.setAttribute('font-size', '11px');
        txt.setAttribute('font-weight', '700');
        txt.setAttribute('fill', '#fff');
        txt.setAttribute('pointer-events', 'none');
        txt.textContent = line;
        g.appendChild(txt);
      });
      svg.appendChild(g);

      // Theme hover: just enlarge circle slightly
      g.addEventListener('mouseenter', function() {
        circle.setAttribute('r', 43);
        glow.setAttribute('r', 54);
      });
      g.addEventListener('mouseleave', function() {
        circle.setAttribute('r', 38);
        glow.setAttribute('r', 48);
      });

      // Paper dots radiating outward from orbit
      const paperR = 72;
      const paperCount = t.papers.length;
      const outAngle = t.orbitAngle;
      t.papers.forEach((p, pi) => {
        // Fan from top to bottom (first paper at top of fan)
        const spread = paperCount <= 1 ? 0 : 130;
        const startA = outAngle - spread/2;
        const stepA = paperCount <= 1 ? 0 : spread / (paperCount - 1);
        // Reverse: first paper at top (smallest angle = upward)
        const pa = (startA + stepA * (paperCount - 1 - pi)) * Math.PI / 180;
        const px = tx + Math.cos(pa) * paperR;
        const py = ty + Math.sin(pa) * paperR;

        // Thin line from theme to dot
        const line = document.createElementNS(svgNS, 'line');
        line.setAttribute('x1', tx); line.setAttribute('y1', ty);
        line.setAttribute('x2', px); line.setAttribute('y2', py);
        line.setAttribute('stroke', t.color); line.setAttribute('stroke-width', '1');
        line.setAttribute('opacity', '0.15');
        svg.insertBefore(line, g);

        const dot = document.createElementNS(svgNS, 'circle');
        dot.setAttribute('cx', px); dot.setAttribute('cy', py);
        dot.setAttribute('r', 11);
        dot.setAttribute('fill', t.color); dot.setAttribute('opacity', '0.55');
        dot.setAttribute('stroke', '#fff'); dot.setAttribute('stroke-width', '2');
        dot.classList.add('paper-dot');
        dot.style.cursor = 'pointer';
        svg.appendChild(dot);

        // Label outward
        const lx = px + Math.cos(pa) * 18;
        const ly = py + Math.sin(pa) * 18;
        const anchor = Math.abs(Math.cos(pa)) < 0.3 ? 'middle' : (Math.cos(pa) > 0 ? 'start' : 'end');
        const dtxt = document.createElementNS(svgNS, 'text');
        dtxt.setAttribute('x', lx); dtxt.setAttribute('y', ly + 3);
        dtxt.setAttribute('text-anchor', anchor);
        dtxt.setAttribute('font-size', '8px'); dtxt.setAttribute('font-weight', '600');
        dtxt.setAttribute('fill', '#777'); dtxt.setAttribute('pointer-events', 'none');
        dtxt.textContent = p.short;
        svg.appendChild(dtxt);

        dot.addEventListener('mouseenter', function(e) {
          this.setAttribute('r', 15); this.setAttribute('opacity', '1');
          tooltipEl.innerHTML = `<strong>${p.title}</strong><br><span style="opacity:.7">${p.venue}</span>`;
          tooltipEl.style.opacity = '1';
          // Position near the dot using SVG coordinates
          const rect = container.getBoundingClientRect();
          tooltipEl.style.left = (rect.left + px + 18) + 'px';
          tooltipEl.style.top = (rect.top + py - 30 + window.scrollY) + 'px';
        });
        dot.addEventListener('mousemove', function(e) {
          tooltipEl.style.left = (e.clientX + 15) + 'px';
          tooltipEl.style.top = (e.clientY - 15) + 'px';
        });
        dot.addEventListener('mouseleave', function() {
          this.setAttribute('r', 11); this.setAttribute('opacity', '0.55');
          tooltipEl.style.opacity = '0';
        });
        dot.addEventListener('click', function() {
          const section = document.getElementById('theme-' + t.id);
          if (section) section.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
      });

      g.addEventListener('click', function() {
        const section = document.getElementById('theme-' + t.id);
        if (section) section.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
  }

  const vizObs2 = new IntersectionObserver((entries) => {
    entries.forEach(entry => { if (entry.isIntersecting) { buildStorylineViz(); vizObs2.disconnect(); } });
  }, { threshold: 0.05 });
  vizObs2.observe(document.getElementById('storyline-viz'));
}

// ===== Research Page: Garden (legacy, only if #garden-viz exists) =====
if (document.getElementById('garden-viz')) {
  function buildGarden() {
    const container = document.getElementById('garden-viz');
    if (!container) return;

    const papers = [
      { id:'bleacher', short:'BleacherBot', title:'BleacherBot: AI Agent as a Sports Co-Viewing Partner', venue:'CHI \'25', themes:['interaction','simulation'], x:0.18, y:0.28 },
      { id:'cml', short:'Cinema Multiverse', title:'Cinema Multiverse Lounge: Multi-Agent Film Appreciation', venue:'CHI \'25', themes:['interaction','simulation'], x:0.12, y:0.45 },
      { id:'silent', short:'Silent Field', title:'"What Keeps Fans on the Silent Field?" AI Sports Broadcasting', venue:'CHI \'26', themes:['interaction','simulation'], x:0.25, y:0.15 },
      { id:'shopping', short:'AI Shopping', title:'Who Is Shopping With You? Persona Design in AI Shopping Agents', venue:'SIGIR \'26', themes:['interaction','alignment'], x:0.32, y:0.52 },
      { id:'ikea', short:'Chatbot Failure', title:'User-Participated Customization in Chatbot Failure', venue:'CHI EA \'24', themes:['interaction'], x:0.08, y:0.62 },
      { id:'sre', short:'Self-Ref Review', title:'Self-Referential Review: Self-Reference Effect', venue:'SIGIR \'24', themes:['interaction','bias'], x:0.22, y:0.65 },
      { id:'halo', short:'Halo Effect', title:'Blinded by Context: Halo Effect of MLLM in AI Hiring', venue:'Findings of ACL \'25', themes:['bias','alignment'], x:0.55, y:0.22 },
      { id:'visual', short:'Visual Interference', title:'Visual Interference in Speech Evaluation: Cross-Modal Bias', venue:'Findings of ACL \'26', themes:['bias'], x:0.65, y:0.12 },
      { id:'voice', short:'Gender Matching', title:'Whose Voice, Whose Avatar? Gender Matching Bias', venue:'Findings of ACL \'26', themes:['bias','interaction'], x:0.48, y:0.38 },
      { id:'clincast', short:'CliniCAST', title:'CliniCAST: Acoustic Grounding in Medical Triage', venue:'Findings of ACL \'26', themes:['bias','simulation'], x:0.72, y:0.30 },
      { id:'mine', short:'Authorship Bias', title:'Mine over Yours: Authorship Bias in Generative IR', venue:'SIGIR \'26', themes:['bias','alignment'], x:0.62, y:0.45 },
      { id:'feeling', short:'AI Sycophancy', title:'Feeling Right vs. Being Right: AI Sycophancy', venue:'ACL \'26', themes:['alignment','bias'], x:0.78, y:0.55 },
      { id:'argument', short:'Argument Search', title:'Conversational Argument Search Under Selective Exposure', venue:'SIGIR \'25', themes:['alignment','interaction'], x:0.58, y:0.62 },
      { id:'sink', short:'Sink or Swim', title:'Will LLMs Sink or Swim? Decision-Making Under Pressure', venue:'Findings of EMNLP \'24', themes:['alignment','simulation'], x:0.72, y:0.70 },
      { id:'dice', short:'DICE-BENCH', title:'DICE-BENCH: Tool-Use in Multi-Party Dialogues', venue:'Findings of ACL \'25', themes:['simulation','interaction'], x:0.40, y:0.78 },
      { id:'symphonei', short:'SymphoNEI', title:'SymphoNEI: Heterophilic Graphs', venue:'DASFAA \'24', themes:['simulation'], x:0.85, y:0.82 },
      { id:'hoplearn', short:'HopLearn', title:'HopLearn: GNNs with Missing Features', venue:'DASFAA \'24', themes:['simulation'], x:0.90, y:0.72 },
    ];

    const themes = [
      { id:'interaction', label:'Human-AI\nInteraction', color:'#3ecf8e', cx:0.20, cy:0.42, rx:0.22, ry:0.30 },
      { id:'bias', label:'Fairness\n& Bias', color:'#ef6461', cx:0.62, cy:0.30, rx:0.20, ry:0.24 },
      { id:'alignment', label:'Value\nAlignment', color:'#6c63ff', cx:0.65, cy:0.60, rx:0.18, ry:0.22 },
      { id:'simulation', label:'Simulation &\nBenchmarks', color:'#f0a050', cx:0.55, cy:0.78, rx:0.30, ry:0.18 },
    ];

    const connections = [
      ['bleacher','silent'],['bleacher','cml'],['cml','silent'],
      ['halo','visual'],['halo','voice'],['visual','clincast'],
      ['sink','feeling'],['argument','feeling'],['argument','shopping'],
      ['sre','mine'],['voice','shopping'],['symphonei','hoplearn'],
      ['dice','sink'],['halo','mine'],['clincast','dice'],
    ];

    const w = container.clientWidth;
    const h = Math.max(520, w * 0.45);
    container.style.height = h + 'px';
    container.innerHTML = '';

    const svgNS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('width', w); svg.setAttribute('height', h);
    container.appendChild(svg);

    const defs = document.createElementNS(svgNS, 'defs');
    const blur = document.createElementNS(svgNS, 'filter');
    blur.setAttribute('id', 'blob-blur');
    blur.innerHTML = '<feGaussianBlur stdDeviation="30"/>';
    defs.appendChild(blur);
    svg.appendChild(defs);

    // Theme blobs
    const blobG = document.createElementNS(svgNS, 'g');
    blobG.setAttribute('filter', 'url(#blob-blur)');
    themes.forEach(t => {
      const e = document.createElementNS(svgNS, 'ellipse');
      e.setAttribute('cx', t.cx*w); e.setAttribute('cy', t.cy*h);
      e.setAttribute('rx', t.rx*w); e.setAttribute('ry', t.ry*h);
      e.setAttribute('fill', t.color); e.setAttribute('opacity', '0.12');
      blobG.appendChild(e);
    });
    svg.appendChild(blobG);

    // Theme labels
    themes.forEach(t => {
      t.label.split('\n').forEach((line, i) => {
        const txt = document.createElementNS(svgNS, 'text');
        txt.setAttribute('x', t.cx*w); txt.setAttribute('y', t.cy*h + (i-0.5)*16);
        txt.setAttribute('text-anchor', 'middle'); txt.setAttribute('font-size', '13px');
        txt.setAttribute('font-weight', '700'); txt.setAttribute('fill', t.color);
        txt.setAttribute('opacity', '0.35'); txt.setAttribute('pointer-events', 'none');
        txt.textContent = line;
        svg.appendChild(txt);
      });
    });

    // Connections
    connections.forEach(([aId, bId]) => {
      const a = papers.find(p => p.id===aId), b = papers.find(p => p.id===bId);
      if (!a||!b) return;
      const line = document.createElementNS(svgNS, 'line');
      line.setAttribute('x1', a.x*w); line.setAttribute('y1', a.y*h);
      line.setAttribute('x2', b.x*w); line.setAttribute('y2', b.y*h);
      line.setAttribute('stroke', '#d0d0d0'); line.setAttribute('stroke-width', '1');
      line.setAttribute('opacity', '0.4');
      line.dataset.from = aId; line.dataset.to = bId;
      line.classList.add('conn-line');
      svg.appendChild(line);
    });

    // Tooltip
    let tooltipEl = document.querySelector('.garden-tooltip');
    if (!tooltipEl) {
      tooltipEl = document.createElement('div');
      tooltipEl.className = 'garden-tooltip';
      document.body.appendChild(tooltipEl);
    }

    // Flowers
    papers.forEach(p => {
      const cx = p.x*w, cy = p.y*h;
      const primaryTheme = themes.find(t => t.id === p.themes[0]);
      const color = primaryTheme ? primaryTheme.color : '#999';
      const r = 18;

      const g = document.createElementNS(svgNS, 'g');
      g.style.cursor = 'pointer'; g.classList.add('flower-group'); g.dataset.id = p.id;

      for (let i = 0; i < 6; i++) {
        const angle = (i*60-90)*Math.PI/180;
        const px = cx+Math.cos(angle)*(r*0.65), py = cy+Math.sin(angle)*(r*0.65);
        const petal = document.createElementNS(svgNS, 'ellipse');
        petal.setAttribute('cx', px); petal.setAttribute('cy', py);
        petal.setAttribute('rx', r*0.45); petal.setAttribute('ry', r*0.35);
        petal.setAttribute('transform', `rotate(${i*60} ${px} ${py})`);
        petal.setAttribute('fill', color); petal.setAttribute('opacity', '0.25');
        petal.classList.add('petal');
        g.appendChild(petal);
      }

      if (p.themes.length > 1) {
        const st = themes.find(t => t.id === p.themes[1]);
        if (st) {
          const ring = document.createElementNS(svgNS, 'circle');
          ring.setAttribute('cx', cx); ring.setAttribute('cy', cy); ring.setAttribute('r', r*0.75);
          ring.setAttribute('fill', 'none'); ring.setAttribute('stroke', st.color);
          ring.setAttribute('stroke-width', '2'); ring.setAttribute('opacity', '0.4');
          ring.setAttribute('stroke-dasharray', '3,3');
          g.appendChild(ring);
        }
      }

      const center = document.createElementNS(svgNS, 'circle');
      center.setAttribute('cx', cx); center.setAttribute('cy', cy);
      center.setAttribute('r', r*0.42); center.setAttribute('fill', color);
      center.setAttribute('opacity', '0.9'); center.classList.add('flower-center');
      g.appendChild(center);
      svg.appendChild(g);

      // Label
      const label = document.createElementNS(svgNS, 'text');
      label.setAttribute('x', cx); label.setAttribute('y', cy+r+14);
      label.setAttribute('text-anchor', 'middle'); label.setAttribute('font-size', '9px');
      label.setAttribute('font-weight', '600'); label.setAttribute('fill', '#666');
      label.setAttribute('pointer-events', 'none'); label.classList.add('flower-label');
      label.dataset.id = p.id; label.textContent = p.short;
      svg.appendChild(label);

      const venueT = document.createElementNS(svgNS, 'text');
      venueT.setAttribute('x', cx); venueT.setAttribute('y', cy+r+24);
      venueT.setAttribute('text-anchor', 'middle'); venueT.setAttribute('font-size', '7px');
      venueT.setAttribute('fill', '#aaa'); venueT.setAttribute('pointer-events', 'none');
      venueT.textContent = p.venue;
      svg.appendChild(venueT);

      // Hover
      g.addEventListener('mouseenter', function(e) {
        this.querySelectorAll('.petal').forEach(pt => { pt.setAttribute('opacity', '0.6'); });
        this.querySelector('.flower-center').setAttribute('r', r*0.55);
        svg.querySelectorAll('.conn-line').forEach(l => {
          if (l.dataset.from===p.id||l.dataset.to===p.id) { l.setAttribute('stroke', color); l.setAttribute('stroke-width', '2.5'); l.setAttribute('opacity', '0.7'); }
          else { l.setAttribute('opacity', '0.08'); }
        });
        svg.querySelectorAll('.flower-group').forEach(fg => {
          if (fg.dataset.id !== p.id) {
            const connected = connections.some(([a,b]) => (a===p.id&&b===fg.dataset.id)||(b===p.id&&a===fg.dataset.id));
            if (!connected) fg.setAttribute('opacity', '0.2');
          }
        });
        svg.querySelectorAll('.flower-label').forEach(fl => {
          if (fl.dataset.id !== p.id) {
            const connected = connections.some(([a,b]) => (a===p.id&&b===fl.dataset.id)||(b===p.id&&a===fl.dataset.id));
            if (!connected) fl.setAttribute('opacity', '0.2');
          }
        });
        const themeTags = p.themes.map(tid => {
          const t = themes.find(th => th.id===tid);
          return t ? `<span style="background:${t.color};color:#fff;padding:1px 6px;border-radius:3px;font-size:10px;margin-right:3px">${t.label.replace('\n',' ')}</span>` : '';
        }).join('');
        tooltipEl.innerHTML = `<strong>${p.title}</strong><br><span style="opacity:.7">${p.venue}</span><br><div style="margin-top:4px">${themeTags}</div>`;
        tooltipEl.style.opacity = '1';
        tooltipEl.style.left = (e.pageX+18)+'px'; tooltipEl.style.top = (e.pageY-20)+'px';
      });
      g.addEventListener('mousemove', function(e) {
        tooltipEl.style.left = (e.pageX+18)+'px'; tooltipEl.style.top = (e.pageY-20)+'px';
      });
      g.addEventListener('mouseleave', function() {
        this.querySelectorAll('.petal').forEach(pt => pt.setAttribute('opacity', '0.25'));
        this.querySelector('.flower-center').setAttribute('r', r*0.42);
        svg.querySelectorAll('.conn-line').forEach(l => { l.setAttribute('stroke', '#d0d0d0'); l.setAttribute('stroke-width', '1'); l.setAttribute('opacity', '0.4'); });
        svg.querySelectorAll('.flower-group').forEach(fg => fg.setAttribute('opacity', '1'));
        svg.querySelectorAll('.flower-label').forEach(fl => fl.setAttribute('opacity', '1'));
        tooltipEl.style.opacity = '0';
      });
    });
  }

  const vizObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => { if (entry.isIntersecting) { buildGarden(); vizObs.disconnect(); } });
  }, { threshold: 0.05 });
  vizObs.observe(document.getElementById('garden-viz'));
}
