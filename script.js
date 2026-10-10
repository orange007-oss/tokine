(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Header: スクロールで背景を付ける
  const header = document.querySelector('.site-header');
  const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 40);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  // Reveal: 画面に入った要素をフェードイン（同じ親の中では少しずつ遅らせる）
  const reveals = document.querySelectorAll('.reveal');
  if (reduceMotion || !('IntersectionObserver' in window)) {
    reveals.forEach((el) => el.classList.add('is-in'));
  } else {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const siblings = [...el.parentElement.children].filter((c) => c.classList.contains('reveal'));
        el.style.transitionDelay = `${Math.max(0, siblings.indexOf(el)) * 0.12}s`;
        el.classList.add('is-in');
        io.unobserve(el);
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach((el) => io.observe(el));
  }

  // Movement: 目盛りを生成
  const ring = document.querySelector('.tick-ring');
  if (ring) {
    const ns = 'http://www.w3.org/2000/svg';
    for (let i = 0; i < 60; i++) {
      const major = i % 5 === 0;
      const a = (i / 60) * Math.PI * 2;
      const r1 = 176, r2 = major ? 160 : 168;
      const line = document.createElementNS(ns, 'line');
      line.setAttribute('x1', 200 + Math.sin(a) * r1);
      line.setAttribute('y1', 200 - Math.cos(a) * r1);
      line.setAttribute('x2', 200 + Math.sin(a) * r2);
      line.setAttribute('y2', 200 - Math.cos(a) * r2);
      if (major) line.classList.add('major');
      ring.appendChild(line);
    }
  }

  // Hero: スクロールに合わせてコピーをゆっくり沈める
  const heroCopy = document.querySelector('.hero__copy');
  if (heroCopy && !reduceMotion) {
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = Math.min(window.scrollY, window.innerHeight);
        heroCopy.style.transform = `translateY(${y * 0.25}px)`;
        heroCopy.style.opacity = String(1 - y / (window.innerHeight * 0.8));
        ticking = false;
      });
    }, { passive: true });
  }

  // Reserve: デモ用フォーム（送信はしない）
  const form = document.getElementById('reserve-form');
  if (form) {
    const dateInput = form.querySelector('#f-date');
    const today = new Date();
    today.setDate(today.getDate() + 1);
    dateInput.min = today.toISOString().slice(0, 10);

    const note = form.querySelector('.form-note');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      let ok = true;
      form.querySelectorAll('[required]').forEach((input) => {
        const valid = input.checkValidity();
        input.closest('.field').classList.toggle('is-invalid', !valid);
        if (!valid) ok = false;
      });
      if (!ok) {
        note.textContent = '未入力または形式が正しくない項目があります。';
        return;
      }
      const name = form.elements.name.value;
      note.textContent = `${name} 様、ご予約の申し込みを承りました。（デモのため実際には送信されません）`;
      form.reset();
    });
  }
})();
