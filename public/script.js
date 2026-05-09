// ----- Theme toggle -----
(() => {
  const root = document.documentElement;
  const saved = localStorage.getItem('hm-theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const initial = saved || (prefersDark ? 'dark' : 'light');
  root.setAttribute('data-theme', initial);

  const toggle = document.querySelector('.theme-toggle');
  if (toggle) {
    toggle.addEventListener('click', () => {
      const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      localStorage.setItem('hm-theme', next);
    });
  }
})();

// ----- Reveal on scroll -----
(() => {
  const items = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window) || items.length === 0) {
    items.forEach(el => el.classList.add('in'));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  items.forEach(el => io.observe(el));
})();

// ----- Active nav link on scroll -----
(() => {
  const sections = document.querySelectorAll('section[id]');
  const links = document.querySelectorAll('.nav-links a[href^="#"]');
  if (!sections.length || !links.length) return;

  const setActive = (id) => {
    links.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + id));
  };

  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) setActive(e.target.id); });
  }, { rootMargin: '-40% 0px -55% 0px' });
  sections.forEach(s => io.observe(s));
})();

// ----- GitHub repos -----
async function loadRepos() {
  const wrap = document.getElementById('repos');
  if (!wrap) return;

  const langDot = (lang) => {
    const colors = {
      JavaScript: '#F1E05A', TypeScript: '#3178C6', Python: '#3572A5',
      C: '#555555', 'C++': '#F34B7D', Java: '#B07219', Shell: '#89E051',
      HTML: '#E34C26', CSS: '#563D7C', Verilog: '#B2B7F8', Tcl: '#E4CC98',
    };
    return colors[lang] || 'currentColor';
  };

  try {
    const res = await fetch('https://api.github.com/users/Hagai-Mozes/repos?sort=updated&per_page=100');
    if (!res.ok) throw new Error('GitHub API ' + res.status);
    let repos = await res.json();
    repos = repos
      .filter(r => !r.fork)
      .sort((a, b) => (b.stargazers_count - a.stargazers_count) || (new Date(b.pushed_at) - new Date(a.pushed_at)))
      .slice(0, 6);

    if (repos.length === 0) {
      wrap.innerHTML = '<div class="repos-error">No public repositories yet — check back soon.</div>';
      return;
    }

    wrap.innerHTML = repos.map(r => {
      const desc = r.description ? escapeHtml(r.description) : '<em style="color:var(--muted);font-style:italic;">No description provided.</em>';
      const lang = r.language ? `<span class="lang">${escapeHtml(r.language)}</span>` : '';
      const stars = r.stargazers_count > 0 ? `<span class="stars">★ ${r.stargazers_count}</span>` : '';
      const updated = new Date(r.pushed_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short' });
      return `
        <a class="repo" href="${r.html_url}" target="_blank" rel="noopener">
          <span class="repo-name">${escapeHtml(r.name)}</span>
          <span class="repo-desc">${desc}</span>
          <span class="repo-meta">
            ${lang}
            ${stars}
            <span style="margin-left:auto;">${updated}</span>
          </span>
        </a>`;
    }).join('');
  } catch (err) {
    wrap.innerHTML = `
      <div class="repos-error">
        Couldn’t reach GitHub right now.
        <a href="https://github.com/Hagai-Mozes" target="_blank" rel="noopener" style="color:var(--accent);">Visit the profile →</a>
      </div>`;
  }
}

function escapeHtml(str) {
  return str.replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}

document.addEventListener('DOMContentLoaded', loadRepos);
