// Nav state
  const nav = document.getElementById('nav');
  const topbar = document.getElementById('topbar');
  const onScroll = () => topbar.classList.toggle('scrolled', window.scrollY > 40);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Mobile menu
  const toggle = document.getElementById('navToggle');
  const menu = document.getElementById('mobileMenu');
  toggle.addEventListener('click', () => {
    const open = menu.classList.toggle('open');
    nav.classList.toggle('menu-open', open);
    toggle.setAttribute('aria-expanded', open);
    document.body.style.overflow = open ? 'hidden' : '';
  });
  menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    menu.classList.remove('open');
    nav.classList.remove('menu-open');
    toggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }));

  // Reveal on scroll
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));

  // Animated counters
  const counterIO = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      counterIO.unobserve(e.target);
      const el = e.target;
      const target = parseInt(el.dataset.count, 10);
      const prefix = el.dataset.prefix || '';
      const suffix = el.dataset.suffix || '';
      const t0 = performance.now();
      const dur = 1400;
      const tick = now => {
        const p = Math.min((now - t0) / dur, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = prefix + Math.round(target * eased) + suffix;
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
  }, { threshold: 0.6 });
  document.querySelectorAll('.stat .num').forEach(el => counterIO.observe(el));

  // FAQ accordion
  document.querySelectorAll('.faq-item').forEach(item => {
    const btn = item.querySelector('.faq-q');
    const panel = item.querySelector('.faq-a');
    btn.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item.open').forEach(o => {
        o.classList.remove('open');
        o.querySelector('.faq-a').style.maxHeight = null;
        o.querySelector('.faq-q').setAttribute('aria-expanded', 'false');
      });
      if (!isOpen) {
        item.classList.add('open');
        panel.style.maxHeight = panel.scrollHeight + 'px';
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });

  // Before/after slider
  const baRange = document.getElementById('baRange');
  const baClip = document.getElementById('baClip');
  const baHandle = document.getElementById('baHandle');
  if (baRange) {
    const setBA = v => {
      baClip.style.clipPath = `inset(0 0 0 ${v}%)`;
      baHandle.style.left = v + '%';
    };
    baRange.addEventListener('input', () => setBA(baRange.value));
    setBA(50);
  }

  // Current year
  document.getElementById('year').textContent = new Date().getFullYear();
