(function () {
  const won = (n) => n.toLocaleString('ko-KR');
  const gradeLabel = { N: '신품', S: 'S급', A: 'A급', USED: 'USED' };

  function cardHTML(p) {
    const off = p.was ? Math.round((1 - p.price / p.was) * 100) : 0;
    return `
      <a href="#" class="card${p.soldout ? ' soldout' : ''}" data-id="${p.id}">
        <span class="card-thumb">
          <img src="${p.img}" alt="${p.brand} ${p.name}" loading="lazy">
          ${p.soldout ? '<em class="badge-soldout">거래진행중</em>' : ''}
          <button type="button" class="wish" aria-label="찜하기" data-wish><svg viewBox="0 0 24 24"><path d="M12 21s-7-4.6-9.3-9A5.2 5.2 0 0 1 12 6.4 5.2 5.2 0 0 1 21.3 12C19 16.4 12 21 12 21z"/></svg></button>
        </span>
        <span class="card-body">
          <span class="brand">${p.brand}</span>
          <span class="name">${p.name}</span>
          ${p.tags ? '<span class="tags">' + p.tags.map(t => '<i>' + t + '</i>').join('') + '</span>' : ''}
          <span class="price"><b class="grade g-${p.grade}">${gradeLabel[p.grade] || p.grade}</b>${won(p.price)}${off ? '<s>' + won(p.was) + '</s><em class="off">' + off + '%</em>' : ''}</span>
        </span>
      </a>`;
  }

  // 상품 슬라이더 렌더링
  document.querySelectorAll('.product-swiper[data-products]').forEach((el) => {
    const list = PRODUCTS[el.dataset.products] || [];
    el.innerHTML = '<ul class="swiper-wrapper">' + list.map((p) => '<li class="swiper-slide">' + cardHTML(p) + '</li>').join('') +
      '</ul><button type="button" class="sw-prev" aria-label="이전"><svg viewBox="0 0 24 24"><path d="m15 6-6 6 6 6"/></svg></button><button type="button" class="sw-next" aria-label="다음"><svg viewBox="0 0 24 24"><path d="m9 6 6 6-6 6"/></svg></button>';
    new Swiper(el, {
      slidesPerView: 2.2, spaceBetween: 16, watchOverflow: true,
      navigation: { prevEl: el.querySelector('.sw-prev'), nextEl: el.querySelector('.sw-next') },
      breakpoints: { 640: { slidesPerView: 3.2, spaceBetween: 20 }, 1024: { slidesPerView: 4, spaceBetween: 24 }, 1280: { slidesPerView: 5, spaceBetween: 24 } },
    });
  });

  // 베스트 랭킹 그리드
  const rank = document.querySelector('.rank-grid');
  if (rank) rank.innerHTML = PRODUCTS.hot.map((p, i) => '<li><b class="rank">' + (i + 1) + '</b>' + cardHTML(p) + '</li>').join('');

  // 메인 배너
  const heroEl = document.querySelector('.hero-swiper');
  if (heroEl) {
    const cur = document.querySelector('.hero-page .cur');
    const bar = document.querySelector('.hero-progress span');
    const total = heroEl.querySelectorAll('.swiper-slide').length;
    new Swiper(heroEl, {
      slidesPerView: 1, spaceBetween: 0, loop: true, speed: 700,
      autoplay: { delay: 4500, disableOnInteraction: false },
      navigation: { prevEl: '.hero-prev', nextEl: '.hero-next' },
      breakpoints: { 768: { slidesPerView: 2, spaceBetween: 4 }, 1200: { slidesPerView: 3, spaceBetween: 4 } },
      on: { slideChange(s) { cur.textContent = s.realIndex + 1; bar.style.width = ((s.realIndex + 1) / total * 100) + '%'; } },
    });
    bar.style.width = (1 / total * 100) + '%';
  }

  // 띠배너
  if (document.querySelector('.band-swiper')) {
    new Swiper('.band-swiper', { slidesPerView: 1.1, spaceBetween: 12, loop: true, autoplay: { delay: 3500 }, breakpoints: { 768: { slidesPerView: 2, spaceBetween: 16 } } });
  }

  // 하이엔드 브랜드
  if (document.querySelector('.highend-swiper')) {
    const cur = document.querySelector('.hi-page .cur');
    new Swiper('.highend-swiper', {
      slidesPerView: 1, loop: true, speed: 800, autoplay: { delay: 5000 }, effect: 'fade', fadeEffect: { crossFade: true },
      navigation: { prevEl: '.hi-prev', nextEl: '.hi-next' },
      on: { slideChange(s) { cur.textContent = s.realIndex + 1; } },
    });
  }

  // 필터 탭 (시각적 선택만; 실제 서비스에서는 목록을 다시 요청)
  document.querySelectorAll('.filter-tabs, .seg').forEach((group) => {
    group.addEventListener('click', (e) => {
      const btn = e.target.closest('[role="tab"]');
      if (!btn) return;
      group.querySelectorAll('[role="tab"]').forEach((b) => b.setAttribute('aria-selected', b === btn));
      if (group.dataset.filter === 'region') renderStores(btn.firstChild.textContent.trim());
    });
  });

  // 찜 토글
  document.addEventListener('click', (e) => {
    const w = e.target.closest('[data-wish]');
    if (!w) return;
    e.preventDefault();
    w.classList.toggle('on');
  });

  // 매장
  const names = document.getElementById('store-names');
  const detail = document.getElementById('store-detail');
  function renderDetail(s) {
    detail.innerHTML = `
      <div class="store-map" aria-hidden="true"><span>MAP</span></div>
      <div class="store-info">
        <h3>${s.name}</h3>
        <p class="addr">${s.addr}</p>
        <dl><dt>영업시간</dt><dd>${s.hours}</dd><dt>전화</dt><dd>${s.tel}</dd></dl>
        <div class="store-actions">
          <a href="#" class="btn-outline sm">매장안내</a>
          <a href="#" class="btn-outline sm kakao">카톡상담</a>
          <a href="#" class="btn-solid sm">보유상품</a>
        </div>
      </div>`;
  }
  function renderStores(region) {
    const list = STORES[region] || [];
    names.innerHTML = list.map((s, i) => '<li><button type="button"' + (i === 0 ? ' class="on"' : '') + '>' + s.name + '</button></li>').join('');
    if (list[0]) renderDetail(list[0]);
    names.querySelectorAll('button').forEach((b, i) => b.addEventListener('click', () => {
      names.querySelectorAll('button').forEach((x) => x.classList.remove('on'));
      b.classList.add('on');
      renderDetail(list[i]);
    }));
  }
  if (names) renderStores('서울');

  // 타임세일 카운트다운
  const timer = document.getElementById('ts-timer');
  if (timer) {
    const end = Date.now() + (6 * 24 * 3600 + 17 * 3600 + 27 * 60 + 44) * 1000;
    const pad = (n) => String(n).padStart(2, '0');
    const tick = () => {
      let d = Math.max(0, Math.floor((end - Date.now()) / 1000));
      const days = Math.floor(d / 86400); d %= 86400;
      timer.textContent = days + ' DAY ' + pad(Math.floor(d / 3600)) + ':' + pad(Math.floor(d % 3600 / 60)) + ':' + pad(d % 60);
    };
    tick(); setInterval(tick, 1000);
  }

  // 헤더 축소 + 맨 위로
  const header = document.querySelector('.site-header');
  const toTop = document.querySelector('.to-top');
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    header.classList.toggle('compact', y > 120);
    toTop.classList.toggle('show', y > 600);
  }, { passive: true });
  toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
})();
