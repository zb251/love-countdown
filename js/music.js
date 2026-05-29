// 音乐播放控制
(function() {

var audio = document.getElementById('bgMusic');
var musicBtn = document.getElementById('musicBtn');
var noteEl = musicBtn.querySelector('.note');
var playing = false;
var loading = false;

audio.src = MUSIC_FILE;
audio.load();

function toggleMusic() {
  if (playing) {
    audio.pause();
    playing = false;
    musicBtn.classList.remove('playing');
    noteEl.textContent = '🎵';
  } else if (!loading) {
    loading = true;
    noteEl.textContent = '⏳';
    musicBtn.classList.add('playing');
    audio.play().then(function() {
      playing = true;
      loading = false;
      noteEl.textContent = '🎶';
    }).catch(function() {
      loading = false;
      musicBtn.classList.remove('playing');
      noteEl.textContent = '🎵';
    });
  }
}

musicBtn.addEventListener('click', function(e) {
  e.stopPropagation();
  toggleMusic();
});

})();
