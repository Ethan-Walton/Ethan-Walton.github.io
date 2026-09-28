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

// Ambient Audio Management
const audio = document.getElementById('ambient-audio');
const audioBtn = document.getElementById('audio-btn');

if (audio) {
  audio.volume = 0.25;
  
  // Check user preference
  const isMuted = sessionStorage.getItem('audioMuted') === 'true';
  if (isMuted) {
    audio.muted = true;
    audioBtn.textContent = 'Play Audio';
  } else {
    // Attempt automatic playback; browsers block this unless interacted with,
    // so we catch the error and enable playback on the first page click.
    audio.play().catch(() => {
      const startAudioOnClick = () => {
        if (!audio.muted) {
          audio.play().catch(() => {});
        }
        document.removeEventListener('click', startAudioOnClick);
      };
      document.addEventListener('click', startAudioOnClick);
    });
  }

  audioBtn.addEventListener('click', () => {
    audio.muted = !audio.muted;
    sessionStorage.setItem('audioMuted', audio.muted);
    audioBtn.textContent = audio.muted ? 'Play Audio' : 'Mute Audio';
    if (!audio.muted) {
      audio.play().catch(() => {});
    }
  });
}
