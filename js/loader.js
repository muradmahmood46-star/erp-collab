import { onReady } from './main.js';

const COMPONENTS = [
  'header', 'hero', 'about', 'marquee', 'services',
  'portfolio', 'technologies', 'team',
  'why-choose-us', 'contact', 'footer'
];

const DATA_FILE = { 'header': 'nav' };

async function fetchAll() {
  const fetches = COMPONENTS.map(name => {
    const dataName = DATA_FILE[name] || name;
    return Promise.all([
      fetch(`components/${name}.html`).then(r => {
        if (!r.ok) throw new Error(`Component not found: ${name}.html`);
        return r.text();
      }),
      fetch(`data/${dataName}.json`).then(r => {
        if (!r.ok) throw new Error(`Data not found: ${dataName}.json`);
        return r.json();
      })
    ]);
  });
  return Promise.all(fetches);
}

const NO_SEP = new Set(['header', 'hero', 'footer', 'marquee']);

function mountComponent(html, mountId, name) {
  const wrapper = document.createElement('div');
  wrapper.innerHTML = html.trim();
  document.getElementById(mountId).appendChild(wrapper.firstElementChild);
  if (mountId === 'main-mount' && !NO_SEP.has(name)) {
    const hr = document.createElement('hr');
    hr.className = 'section-sep';
    document.getElementById(mountId).appendChild(hr);
  }
}

/* ── Renderers ─────────────────────────────────────────────────────────── */

function renderNav(data) {
  document.getElementById('nav-logo').textContent = data.logo;
  const ul = document.getElementById('nav-links');
  data.links.forEach(l => {
    const li = document.createElement('li');
    li.innerHTML = `<a href="${l.href}">${l.label}</a>`;
    ul.appendChild(li);
  });
  const cta = document.getElementById('nav-cta');
  cta.textContent = data.cta.label;
  cta.href = data.cta.href;
}

function renderHero(data) {
  const section = document.getElementById('home');
  section.style.backgroundImage = `url('${data.backgroundImage}')`;

  // Wrap first word in accent span for the underline animation
  const heroCompany = document.getElementById('hero-company');
  if (heroCompany) {
    const parts = data.company.split(' ');
    heroCompany.innerHTML = parts.length > 1
      ? `<span class="accent-word">${parts[0]}</span> ${parts.slice(1).join(' ')}`
      : `<span class="accent-word">${parts[0]}</span>`;
  }

  document.getElementById('hero-tagline').textContent = `"${data.tagline}"`;
  document.getElementById('hero-desc').textContent = data.description;

  const btns = document.getElementById('hero-btns');
  data.cta.forEach(b => {
    const a = document.createElement('a');
    a.href = b.href;
    a.className = `btn ${b.primary ? 'btn-primary' : 'btn-outline'}`;
    a.innerHTML = b.primary
      ? `${b.label} <i class="fas fa-arrow-right"></i>`
      : `${b.label} <i class="fas fa-chevron-down"></i>`;
    btns.appendChild(a);
  });
}

function renderAbout(data) {
  document.getElementById('about-heading').textContent = data.heading;
  document.getElementById('about-img').src = data.image;

  const keywords = [
    'ERP systems', 'intelligent integrations', 'digital transformation',
    'user-focused', 'scalable', 'backbone of business operations',
    'increase productivity', 'automate processes', 'improve collaboration',
    'seamless user experience', 'ErpCollab'
  ];

  function highlightKeywords(text) {
    let html = text;
    keywords.forEach(kw => {
      html = html.replace(
        new RegExp(`(${kw})`, 'gi'),
        '<mark class="about-highlight">$1</mark>'
      );
    });
    return html;
  }

  const introEl = document.getElementById('about-intro');
  let lineIndex = 0;

  data.intro.split('\n\n').forEach((paraText, pi) => {
    const sentences = paraText.match(/[^.!?]+[.!?]+/g) || [paraText];
    sentences.forEach(sentence => {
      const line = document.createElement('span');
      line.className = `about-line about-para-${pi + 1}`;
      line.style.animationDelay = `${0.1 + lineIndex * 0.22}s`;
      line.innerHTML = highlightKeywords(sentence.trim());
      introEl.appendChild(line);
      lineIndex++;
    });
  });

  // Vision card
  const vmGrid = document.getElementById('vm-grid');
  if (vmGrid && data.vision && data.mission) {
    [data.vision, data.mission].forEach((item, i) => {
      const type = i === 0 ? 'vision' : 'mission';
      const div = document.createElement('div');
      div.className = `vm-card ${type} reveal`;
      div.style.transitionDelay = `${i * 0.15}s`;
      div.innerHTML = `
        <div class="vm-card-top">
          <div class="vm-icon"><i class="fas ${item.icon}"></i></div>
          <h3>${item.title}</h3>
          <span class="vm-badge">${item.badge}</span>
        </div>
        <div class="vm-divider"></div>
        <p>${item.text}</p>
`;
      vmGrid.appendChild(div);
    });
  }

  // History card
  const historyWrap = document.getElementById('history-card-wrap');
  if (historyWrap && data.history) {
    const h = data.history;
    const timelineHTML = h.timeline.map(t => `
      <div class="ht-item reveal">
        <div class="ht-dot"><i class="fas ${t.icon}"></i></div>
        <div class="ht-year">${t.year}</div>
        <div class="ht-event">${t.event}</div>
      </div>`).join('');
    const card = document.createElement('div');
    card.className = 'history-card reveal';
    card.innerHTML = `
      <div class="history-top">
        <div class="history-icon"><i class="fas ${h.icon}"></i></div>
        <div><h3>${h.title}</h3><p>${h.subtitle}</p></div>
      </div>
      <div class="history-timeline">${timelineHTML}</div>`;
    historyWrap.appendChild(card);
  }
}

function renderMarquee(data) {
  const track = document.getElementById('marquee-track');
  const allItems = [...data.items, ...data.items];
  allItems.forEach(text => {
    const span = document.createElement('span');
    span.className = 'marquee-item';
    span.textContent = text;
    track.appendChild(span);
  });
}

function renderServices(data) {
  document.getElementById('services-heading').textContent = data.heading;
  document.getElementById('services-subheading').textContent = data.subheading;
  const grid = document.getElementById('services-grid');
  data.items.forEach((s, i) => {
    const div = document.createElement('div');
    div.className = 'svc-card reveal';
    div.style.transitionDelay = `${(i % 4) * 0.08}s`;
    div.innerHTML = `
      <span class="svc-num">${s.number}</span>
      <div class="svc-icon"><i class="fas ${s.icon}"></i></div>
      <h3>${s.title}</h3>
      <p>${s.description}</p>
      <span class="svc-link">Learn More <i class="fas fa-arrow-right"></i></span>`;
    grid.appendChild(div);
  });
}

function renderPortfolio(data) {
  document.getElementById('portfolio-heading').textContent = data.heading;
  document.getElementById('portfolio-subheading').textContent = data.subheading;
  const grid = document.getElementById('portfolio-grid');
  data.items.forEach((p, i) => {
    const div = document.createElement('div');
    div.className = 'pf-card reveal';
    div.style.transitionDelay = `${(i % 3) * 0.1}s`;
    const tags = p.tech.map(t => `<span class="tech-tag">${t}</span>`).join('');
    div.innerHTML = `
      <div class="pf-img-wrap">
        <img class="pf-img" src="${p.image}" alt="${p.title}" loading="lazy" />
        <div class="pf-overlay">
          <span class="pf-num">${String(i + 1).padStart(2, '0')}</span>
          <span class="pf-view-btn">View Project <i class="fas fa-arrow-right"></i></span>
        </div>
      </div>
      <div class="pf-body">
        <span class="pf-cat" style="background:${p.categoryColor}">${p.category}</span>
        <h3>${p.title}</h3>
        <p>${p.description}</p>
        <div class="pf-divider"></div>
        <div class="tech-tags">${tags}</div>
      </div>`;
    grid.appendChild(div);
  });
}

function renderTechnologies(data) {
  document.getElementById('tech-heading').textContent = data.heading;
  document.getElementById('tech-subheading').textContent = data.subheading;
  document.getElementById('tech-tagline').textContent = data.tagline;

  const tabsEl   = document.getElementById('tech-tabs');
  const panelsEl = document.getElementById('tech-panels');

  data.categories.forEach((cat, idx) => {
    const btn = document.createElement('button');
    btn.className = `tech-tab${idx === 0 ? ' active' : ''}`;
    btn.setAttribute('role', 'tab');
    btn.setAttribute('data-tab', cat.id);
    btn.innerHTML = `<i class="fas ${cat.icon}"></i>${cat.name}`;
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tech-tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.tech-panel').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById(`panel-${cat.id}`).classList.add('active');
    });
    tabsEl.appendChild(btn);

    const panel = document.createElement('div');
    panel.className = `tech-panel${idx === 0 ? ' active' : ''}`;
    panel.id = `panel-${cat.id}`;

    cat.badges.forEach(badge => {
      const div = document.createElement('div');
      div.className = 'tech-badge';
      div.innerHTML = `
        <div class="tech-badge-icon"><i class="${badge.devicon}"></i></div>
        <span class="tech-badge-name">${badge.name}</span>`;
      panel.appendChild(div);
    });

    panelsEl.appendChild(panel);
  });
}

function renderTeam(data) {
  document.getElementById('team-heading').textContent = data.heading;
  document.getElementById('team-subheading').textContent = data.subheading;
  const container = document.getElementById('team-groups');

  data.groups.forEach(group => {
    const section = document.createElement('div');
    section.className = 'team-group';

    const label = document.createElement('p');
    label.className = 'team-group-label reveal';
    label.textContent = group.groupName;
    section.appendChild(label);

    const isLeadership = group.layout === 'leadership';
    const grid = document.createElement('div');
    grid.className = isLeadership ? 'team-grid-leadership' : 'team-grid';

    group.members.forEach((m, i) => {
      const card = document.createElement('div');
      card.className = `team-card reveal${m.isFounder ? ' founder' : ''}`;
      card.style.transitionDelay = `${(i % 4) * 0.1}s`;

      const badge = m.isFounder
        ? `<span class="founder-badge">Founder & CEO</span>` : '';

      const avatarInner = m.photo
        ? `<img class="team-photo" src="${m.photo}" alt="${m.name}" loading="lazy"
             onerror="this.style.display='none';this.nextElementSibling.style.display='flex'" />
           <span class="team-initials" style="display:none">${m.initials}</span>`
        : `<span class="team-initials">${m.initials}</span>`;

      card.innerHTML = `
        ${badge}
        <div class="team-avatar-wrap">
          <div class="team-avatar">${avatarInner}</div>
        </div>
        <div class="team-body">
          <h3>${m.name}</h3>
          <p class="team-role">${m.mobileRole ? `<span class="role-full">${m.role}</span><span class="role-mobile">${m.mobileRole}</span>` : m.role}</p>
          ${m.bio ? `<p class="team-bio">${m.bio}</p>` : ''}
        </div>`;

      grid.appendChild(card);
    });

    section.appendChild(grid);
    container.appendChild(section);
  });
}

function renderWhyChooseUs(data) {
  document.getElementById('why-heading').textContent = data.heading;
  document.getElementById('why-subheading').textContent = data.subheading;
  const grid = document.getElementById('why-grid');
  data.items.forEach((item, i) => {
    const div = document.createElement('div');
    div.className = 'card reveal';
    div.style.transitionDelay = `${(i % 3) * 0.1}s`;
    div.innerHTML = `
      <span class="card-num">${String(i + 1).padStart(2, '0')}</span>
      <div class="card-icon"><i class="fas ${item.icon}"></i></div>
      <h3>${item.title}</h3>
      <p>${item.text}</p>
      <span class="card-tag"><i class="fas fa-arrow-right"></i> Learn More</span>`;
    grid.appendChild(div);
  });
}

function renderContact(data) {
  document.getElementById('contact-heading').textContent = data.heading;
  document.getElementById('contact-subheading').textContent = data.subheading;
  const info = document.getElementById('contact-info');
  data.details.forEach(d => {
    const div = document.createElement('div');
    div.className = 'contact-detail';
    const valueHtml = d.href
      ? `<a href="${d.href}">${d.value}</a>`
      : `<span>${d.value}</span>`;
    div.innerHTML = `
      <div class="contact-detail-icon"><i class="fas ${d.icon}"></i></div>
      <div class="contact-detail-text">
        <strong>${d.label}</strong>${valueHtml}
      </div>`;
    info.appendChild(div);
  });
  document.getElementById('contact-map').src = data.mapEmbedUrl;
  const form = document.getElementById('contact-form');
  form.action = 'https://formspree.io/f/mojgnrob';
  form.method = 'POST';
  const fieldsEl = document.getElementById('form-fields');
  data.form.fields.forEach(f => {
    const div = document.createElement('div');
    div.className = 'form-field';
    if (f.type === 'textarea') {
      div.innerHTML = `<textarea name="${f.name}" placeholder="${f.placeholder}" ${f.required ? 'required' : ''}></textarea>`;
    } else {
      div.innerHTML = `<input type="${f.type}" name="${f.name}" placeholder="${f.placeholder}" ${f.required ? 'required' : ''} />`;
    }
    fieldsEl.appendChild(div);
  });
  document.getElementById('form-submit').textContent = data.form.submitLabel;
}

function renderFooter(data) {
  document.getElementById('footer-logo').textContent = data.logo;
  document.getElementById('footer-tagline').textContent = `"${data.tagline}"`;
  document.getElementById('footer-about-text').textContent = data.about;
  document.getElementById('footer-copyright').textContent = data.copyright;

  const social = document.getElementById('footer-social');
  data.social.forEach(s => {
    const a = document.createElement('a');
    a.href = s.href;
    a.className = 'social-link';
    a.setAttribute('aria-label', s.label);
    a.innerHTML = `<i class="fab ${s.icon}"></i>`;
    social.appendChild(a);
  });

  const links = document.getElementById('footer-links');
  data.quickLinks.forEach(l => {
    const li = document.createElement('li');
    li.innerHTML = `<a href="${l.href}">${l.label}</a>`;
    links.appendChild(li);
  });

  document.getElementById('footer-nl-heading').textContent = data.newsletter.heading;
  document.getElementById('footer-nl-text').textContent = data.newsletter.text;
  document.getElementById('nl-email').placeholder = data.newsletter.placeholder;
  document.getElementById('nl-btn').textContent = data.newsletter.buttonLabel;
}

/* ── Renderer map ───────────────────────────────────────────────────────── */
const RENDERERS = {
  header:          renderNav,
  hero:            renderHero,
  about:           renderAbout,
  marquee:         renderMarquee,
  services:        renderServices,
  portfolio:       renderPortfolio,
  technologies:    renderTechnologies,
  team:            renderTeam,
  'why-choose-us': renderWhyChooseUs,
  contact:         renderContact,
  footer:          renderFooter
};

/* ── Bootstrap ──────────────────────────────────────────────────────────── */
async function init() {
  const results = await fetchAll();
  results.forEach(([html, data], idx) => {
    const name = COMPONENTS[idx];
    const mountId = name === 'header' ? 'header-mount'
                  : name === 'footer' ? 'footer-mount'
                  : 'main-mount';
    mountComponent(html, mountId, name);
    RENDERERS[name](data);
  });
  onReady();
}

init();
