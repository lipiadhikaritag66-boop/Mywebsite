// ============================================================
// HIMT Nepal — site script
// Loads XML data and renders each page's dynamic sections.
// ============================================================

async function fetchXML(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to load ${url} (${res.status})`);
  const text = await res.text();
  const parser = new DOMParser();
  const doc = parser.parseFromString(text, 'application/xml');
  if (doc.querySelector('parsererror')) throw new Error(`Invalid XML in ${url}`);
  return doc;
}

function text(el, tag) {
  const n = el.querySelector(tag);
  return n ? n.textContent.trim() : '';
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}

function renderLoading(container) {
  container.innerHTML = '<div class="loading"><div class="spinner"></div>Loading…</div>';
}

function renderError(container, msg) {
  container.innerHTML = `<div class="loading" style="color:#c0392b;">⚠️ ${escapeHtml(msg)}</div>`;
}

// ------------------------------------------------------------
// Gallery
// ------------------------------------------------------------
async function loadGallery(containerId, filter = 'all') {
  const container = document.getElementById(containerId);
  if (!container) return;
  renderLoading(container);
  try {
    const doc = await fetchXML('gallery.xml');
    let items = [...doc.querySelectorAll('item')];
    if (filter && filter !== 'all') {
      const f = filter.toLowerCase();
      items = items.filter((it) => text(it, 'category').toLowerCase() === f);
    }
    if (!items.length) {
      container.innerHTML = '<div class="loading">No items in this category.</div>';
      return;
    }
    container.className = 'gallery-grid';
    container.innerHTML = items
      .map((it) => {
        const caption = escapeHtml(text(it, 'caption'));
        const emoji = text(it, 'emoji');
        const color = text(it, 'color') || '#1a3a5c';
        return `<div class="gallery-item" style="background:${color};">
          <div class="gallery-emoji">${emoji}</div>
          <div class="gallery-caption">${caption}</div>
        </div>`;
      })
      .join('');
  } catch (e) {
    renderError(container, e.message);
  }
}

// ------------------------------------------------------------
// Testimonials
// ------------------------------------------------------------
async function loadTestimonials(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  renderLoading(container);
  try {
    const doc = await fetchXML('testimonials.xml');
    const items = [...doc.querySelectorAll('testimonial')];
    container.className = 'grid-4';
    container.innerHTML = items
      .map((t) => {
        const name = escapeHtml(text(t, 'n') || text(t, 'name'));
        const prog = escapeHtml(text(t, 'program'));
        const quote = escapeHtml(text(t, 'quote'));
        const rating = parseInt(text(t, 'rating'), 10) || 5;
        const avatar = escapeHtml(text(t, 'avatar'));
        const company = escapeHtml(text(t, 'company'));
        const stars = '★'.repeat(rating) + '☆'.repeat(5 - rating);
        return `<div class="card testimonial-card">
          <p class="testimonial-text">${quote}</p>
          <div class="testimonial-author">
            <div class="avatar">${avatar}</div>
            <div>
              <h4>${name}</h4>
              <span>${prog}</span>
              <div class="stars">${stars}</div>
              <span>${company}</span>
            </div>
          </div>
        </div>`;
      })
      .join('');
  } catch (e) {
    renderError(container, e.message);
  }
}

// ------------------------------------------------------------
// Departments
// ------------------------------------------------------------
async function loadDepartments(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  renderLoading(container);
  try {
    const doc = await fetchXML('departments.xml');
    const items = [...doc.querySelectorAll('department')];
    container.className = 'grid-4';
    container.innerHTML = items
      .map((d) => {
        const name = escapeHtml(text(d, 'n') || text(d, 'name'));
        const hod = escapeHtml(text(d, 'hod'));
        const est = escapeHtml(text(d, 'established'));
        const desc = escapeHtml(text(d, 'description'));
        const icon = escapeHtml(text(d, 'icon')) || 'fas fa-book';
        const color = text(d, 'color') || '#1a3a5c';
        return `<div class="card dept-card" style="border-top-color:${color};">
          <div class="card-body">
            <div class="card-icon" style="color:${color};"><i class="${icon}"></i></div>
            <h3>${name}</h3>
            <p>${desc}</p>
            <div class="dept-meta">
              <span>👤 HOD: ${hod}</span>
              <span>📅 Est. ${est}</span>
            </div>
          </div>
        </div>`;
      })
      .join('');
  } catch (e) {
    renderError(container, e.message);
  }
}

// ------------------------------------------------------------
// Courses
// ------------------------------------------------------------
async function loadCourses(containerId, filter = 'all') {
  const container = document.getElementById(containerId);
  if (!container) return;
  renderLoading(container);
  try {
    const doc = await fetchXML('courses.xml');
    let items = [...doc.querySelectorAll('course')];
    if (filter && filter !== 'all') {
      items = items.filter((c) => text(c, 'level') === filter);
    }
    if (!items.length) {
      container.innerHTML = '<div class="loading">No courses in this category.</div>';
      return;
    }
    container.className = 'grid-3';
    container.innerHTML = items
      .map((c) => {
        const title = escapeHtml(text(c, 'title'));
        const level = escapeHtml(text(c, 'level'));
        const duration = escapeHtml(text(c, 'duration'));
        const seats = escapeHtml(text(c, 'seats'));
        const affiliation = escapeHtml(text(c, 'affiliation'));
        const eligibility = escapeHtml(text(c, 'eligibility'));
        const fee = escapeHtml(text(c, 'fee'));
        const desc = escapeHtml(text(c, 'description'));
        const subjects = escapeHtml(text(c, 'subjects'));
        const career = escapeHtml(text(c, 'career'));
        const badgeClass = level === 'Postgraduate' ? 'badge-pg' : 'badge-ug';
        return `<div class="card course-card">
          <div class="card-body">
            <span class="course-badge ${badgeClass}">${level}</span>
            <h3>${title}</h3>
            <p>${desc}</p>
            <div class="course-meta">
              <div><strong>Duration</strong>${duration}</div>
              <div><strong>Seats</strong>${seats}</div>
              <div><strong>Fee</strong>${fee}</div>
              <div><strong>Affiliation</strong>${affiliation}</div>
            </div>
            <p style="margin-top:10px;font-size:0.82rem;"><strong>Eligibility:</strong> ${eligibility}</p>
            <p style="margin-top:6px;font-size:0.82rem;"><strong>Core Subjects:</strong> ${subjects}</p>
            <p style="margin-top:6px;font-size:0.82rem;"><strong>Career:</strong> ${career}</p>
          </div>
        </div>`;
      })
      .join('');
  } catch (e) {
    renderError(container, e.message);
  }
}

// ------------------------------------------------------------
// Faculty
// ------------------------------------------------------------
async function loadFaculty(containerId, filter = 'all') {
  const container = document.getElementById(containerId);
  if (!container) return;
  renderLoading(container);
  try {
    const doc = await fetchXML('faculty.xml');
    let items = [...doc.querySelectorAll('member')];
    if (filter && filter !== 'all') {
      items = items.filter((m) => text(m, 'department') === filter);
    }
    if (!items.length) {
      container.innerHTML = '<div class="loading">No faculty in this department.</div>';
      return;
    }
    container.className = 'grid-4';
    container.innerHTML = items
      .map((m) => {
        const name = escapeHtml(text(m, 'name') || text(m, 'n'));
        const role = escapeHtml(text(m, 'designation'));
        const dept = escapeHtml(text(m, 'department'));
        const qual = escapeHtml(text(m, 'qualification'));
        const exp = escapeHtml(text(m, 'experience'));
        const email = escapeHtml(text(m, 'email'));
        const avatar = escapeHtml(text(m, 'avatar'));
        return `<div class="card faculty-card">
          <div class="avatar">${avatar}</div>
          <h3>${name}</h3>
          <div class="role">${role}</div>
          <span class="dept-badge">${dept}</span>
          <div class="qual">${qual}</div>
          <div class="qual" style="margin-top:4px;">${exp} experience</div>
          <div class="qual"><a href="mailto:${email}">${email}</a></div>
        </div>`;
      })
      .join('');
  } catch (e) {
    renderError(container, e.message);
  }
}

// ------------------------------------------------------------
// Downloads
// ------------------------------------------------------------
async function loadDownloads(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  renderLoading(container);
  try {
    const doc = await fetchXML('downloads.xml');
    const items = [...doc.querySelectorAll('file')];
    container.className = 'grid-3';
    container.innerHTML = items
      .map((f) => {
        const title = escapeHtml(text(f, 'title'));
        const category = escapeHtml(text(f, 'category'));
        const size = escapeHtml(text(f, 'size'));
        const format = escapeHtml(text(f, 'format'));
        const desc = escapeHtml(text(f, 'description'));
        const icon = text(f, 'icon');
        return `<div class="card">
          <div class="card-body">
            <div class="card-icon">${icon}</div>
            <span class="course-badge badge-ug">${category}</span>
            <h3 style="margin-top:10px;">${title}</h3>
            <p>${desc}</p>
            <div class="dept-meta">
              <span>📄 ${format}</span>
              <span>💾 ${size}</span>
            </div>
            <button class="btn btn-primary" style="margin-top:16px;width:100%;" onclick="alert('Download will be available soon.')">Download</button>
          </div>
        </div>`;
      })
      .join('');
  } catch (e) {
    renderError(container, e.message);
  }
}

// ------------------------------------------------------------
// Filter buttons
// ------------------------------------------------------------
function setupFilters(filterBarId, loadFn, containerId) {
  const bar = document.getElementById(filterBarId);
  if (!bar) return;
  bar.addEventListener('click', (e) => {
    const btn = e.target.closest('.filter-btn');
    if (!btn) return;
    bar.querySelectorAll('.filter-btn').forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    loadFn(containerId, btn.dataset.filter || 'all');
  });
}

// ------------------------------------------------------------
// Scroll animations
// ------------------------------------------------------------
function initScrollAnimations() {
  const targets = document.querySelectorAll('.animate-on-scroll');
  if (!targets.length) return;
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -10% 0px' }
  );
  targets.forEach((el) => observer.observe(el));
}

// ------------------------------------------------------------
// Mobile nav
// ------------------------------------------------------------
function initMobileNav() {
  const btn = document.getElementById('hamburger') || document.querySelector('.hamburger');
  const nav = document.querySelector('#main-nav ul') || document.querySelector('nav ul');
  if (!btn || !nav) return;
  btn.addEventListener('click', () => nav.classList.toggle('open'));
}

document.addEventListener('DOMContentLoaded', initMobileNav);

// ------------------------------------------------------------
// Counter animation (safe no-op if no [data-counter] on page)
// ------------------------------------------------------------
function animateCounters() {
  document.querySelectorAll('[data-counter]').forEach((el) => {
    const target = parseInt(el.dataset.counter, 10);
    if (!target) return;
    const duration = 1200;
    const start = performance.now();
    function tick(t) {
      const p = Math.min((t - start) / duration, 1);
      el.textContent = Math.round(target * p).toLocaleString();
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  });
}
