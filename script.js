// ── Theme toggle ──
const root        = document.documentElement;
const toggle      = document.querySelector('[data-theme-toggle]');
const themeIcon   = document.querySelector('.theme-icon');
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');

let currentTheme = prefersDark.matches ? 'dark' : 'light';
root.setAttribute('data-theme', currentTheme);
updateThemeUI(currentTheme);

if (toggle) {
  toggle.addEventListener('click', () => {
    currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', currentTheme);
    updateThemeUI(currentTheme);
  });
}

function updateThemeUI(theme) {
  if (!toggle || !themeIcon) return;
  const nextTheme = theme === 'dark' ? 'light' : 'dark';
  toggle.setAttribute('aria-label', `Switch to ${nextTheme} mode`);
  themeIcon.textContent = theme === 'dark' ? '◐' : '◑';
}

prefersDark.addEventListener('change', event => {
  currentTheme = event.matches ? 'dark' : 'light';
  root.setAttribute('data-theme', currentTheme);
  updateThemeUI(currentTheme);
});

// ── Scroll reveal ──
const revealItems = document.querySelectorAll('.reveal');
const observer = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.16 }
);
revealItems.forEach(item => observer.observe(item));

// ── Contact form → mailto ──
const form = document.getElementById('contact-form');
const status = document.getElementById('form-status');

if (form) {
  form.addEventListener('submit', e => {
    e.preventDefault();

    const name    = document.getElementById('cf-name').value.trim();
    const email   = document.getElementById('cf-email').value.trim();
    const message = document.getElementById('cf-message').value.trim();

    if (!name || !email || !message) {
      status.textContent = 'Please fill out all fields.';
      status.style.color = '#ff6a6a';
      status.style.display = 'block';
      return;
    }

    const subject = encodeURIComponent(`Portfolio contact from ${name}`);
    const body    = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\n${message}`);
    window.location.href =
      `mailto:EthanWalton0418@outlook.com?subject=${subject}&body=${body}`;

    status.textContent = 'Opening your mail client…';
    status.style.color = 'var(--accent-3)';
    status.style.display = 'block';
    form.reset();
  });
}

