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

// Persistent Ambient Audio Management
const audio = document.getElementById('ambient-audio');
const audioBtn = document.getElementById('audio-btn');

if (audio) {
  audio.volume = 0.25;

  // Restore previous playback time and state across page navigations
  const savedTime = sessionStorage.getItem('audioCurrentTime');
  const isPlaying = sessionStorage.getItem('audioPlaying') === 'true';
  const isMuted = sessionStorage.getItem('audioMuted') === 'true';

  if (savedTime) {
    audio.currentTime = parseFloat(savedTime);
  }

  audio.muted = isMuted;
  audioBtn.textContent = audio.muted ? 'Play Audio' : 'Mute Audio';

  if (isPlaying && !isMuted) {
    audio.play().catch(() => {
      // If browser blocks initial resume, unlock on first click anywhere
      const unlockAudio = () => {
        audio.play().catch(() => {});
        document.removeEventListener('click', unlockAudio);
      };
      document.addEventListener('click', unlockAudio);
    });
  }

  // Continuously save current timestamp so it carries over when clicking links
  setInterval(() => {
    if (!audio.paused) {
      sessionStorage.setItem('audioCurrentTime', audio.currentTime);
    }
  }, 500);

  audioBtn.addEventListener('click', () => {
    audio.muted = !audio.muted;
    sessionStorage.setItem('audioMuted', audio.muted);
    audioBtn.textContent = audio.muted ? 'Play Audio' : 'Mute Audio';
    
    if (!audio.muted) {
      audio.play().catch(() => {});
      sessionStorage.setItem('audioPlaying', 'true');
    } else {
      sessionStorage.setItem('audioPlaying', 'false');
    }
  });

  // Track play/pause state changes
  audio.addEventListener('play', () => sessionStorage.setItem('audioPlaying', 'true'));
  audio.addEventListener('pause', () => sessionStorage.setItem('audioPlaying', 'false'));
}
