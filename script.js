// Theme Manager
const themeBtn = document.getElementById('theme-btn');
const htmlElement = document.documentElement;

const savedTheme = localStorage.getItem('theme') || 'dark';
htmlElement.setAttribute('data-theme', savedTheme);
themeBtn.textContent = savedTheme === 'dark' ? '⚡ Cyber Dark' : '☀️ Light Mode';

themeBtn.addEventListener('click', () => {
  const currentTheme = htmlElement.getAttribute('data-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  
  htmlElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
  themeBtn.textContent = newTheme === 'dark' ? '⚡ Cyber Dark' : '☀️ Light Mode';
});

// Persistent Ambient Audio Engine
const audio = document.getElementById('ambient-audio');
const audioBtn = document.getElementById('audio-btn');

if (audio) {
  audio.volume = 0.20;

  const savedTime = sessionStorage.getItem('audioCurrentTime');
  const isPlaying = sessionStorage.getItem('audioPlaying') === 'true';
  const isMuted = sessionStorage.getItem('audioMuted') === 'true';

  if (savedTime) {
    audio.currentTime = parseFloat(savedTime);
  }

  audio.muted = isMuted;
  audioBtn.textContent = audio.muted ? '🔇 Audio Muted' : '🔊 Audio Active';

  if (isPlaying && !isMuted) {
    audio.play().catch(() => {
      const unlockAudio = () => {
        audio.play().catch(() => {});
        document.removeEventListener('click', unlockAudio);
      };
      document.addEventListener('click', unlockAudio);
    });
  }

  setInterval(() => {
    if (!audio.paused) {
      sessionStorage.setItem('audioCurrentTime', audio.currentTime);
    }
  }, 400);

  audioBtn.addEventListener('click', () => {
    audio.muted = !audio.muted;
    sessionStorage.setItem('audioMuted', audio.muted);
    audioBtn.textContent = audio.muted ? '🔇 Audio Muted' : '🔊 Audio Active';
    
    if (!audio.muted) {
      audio.play().catch(() => {});
      sessionStorage.setItem('audioPlaying', 'true');
    } else {
      sessionStorage.setItem('audioPlaying', 'false');
    }
  });

  audio.addEventListener('play', () => sessionStorage.setItem('audioPlaying', 'true'));
  audio.addEventListener('pause', () => sessionStorage.setItem('audioPlaying', 'false'));
}
