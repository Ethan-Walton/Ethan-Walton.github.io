// Theme Manager
const themeBtn = document.getElementById('theme-btn');
const htmlElement = document.documentElement;

const savedTheme = localStorage.getItem('theme') || 'light';
htmlElement.setAttribute('data-theme', savedTheme);
themeBtn.textContent = savedTheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode';
themeBtn.setAttribute('aria-label', themeBtn.textContent);

themeBtn.addEventListener('click', () => {
  const currentTheme = htmlElement.getAttribute('data-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  
  htmlElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
  themeBtn.textContent = newTheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode';
  themeBtn.setAttribute('aria-label', themeBtn.textContent);
});