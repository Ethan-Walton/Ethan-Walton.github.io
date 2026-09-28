// Theme Switcher Logic
const themeBtn = document.getElementById('theme-btn');
const htmlElement = document.documentElement;

const savedTheme = localStorage.getItem('theme') || 'dark';
htmlElement.setAttribute('data-theme', savedTheme);
themeBtn.textContent = savedTheme === 'dark' ? 'Light Mode' : 'Dark Mode';

themeBtn.addEventListener('click', () => {
  const currentTheme = htmlElement.getAttribute('data-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  
  htmlElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
  themeBtn.textContent = newTheme === 'dark' ? 'Light Mode' : 'Dark Mode';
});

// Ambient Audio Mute/Unmute Logic
const audio = document.getElementById('ambient-audio');
const audioBtn = document.getElementById('audio-btn');

if (audio) {
  audio.volume = 0.3;
  
  const isMuted = sessionStorage.getItem('audioMuted') === 'true';
  if (isMuted) {
    audio.muted = true;
    audioBtn.textContent = 'Play Audio';
  }

  audioBtn.addEventListener('click', () => {
    audio.muted = !audio.muted;
    sessionStorage.setItem('audioMuted', audio.muted);
    audioBtn.textContent = audio.muted ? 'Play Audio' : 'Mute Audio';
    if (!audio.muted) audio.play().catch(() => {});
  });
}