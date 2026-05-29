// 合照墙 — 自动轮播浏览
(function() {

var galleryOverlay = document.getElementById('galleryOverlay');
var galleryContainer = document.getElementById('galleryContainer');
var currentIndex = 0;
var autoTimer = null;
var paused = false;
var shuffled = [];

function shuffle(arr) {
  var a = [].concat(arr);
  for (var i = a.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var tmp = a[i]; a[i] = a[j]; a[j] = tmp;
  }
  return a;
}

function openGallery() {
  shuffled = shuffle(PHOTOS);
  currentIndex = 0;
  paused = false;
  galleryOverlay.style.display = 'flex';
  showSlide();
  startAuto();
}

function closeGallery() {
  galleryOverlay.style.display = 'none';
  stopAuto();
}

function startAuto() {
  stopAuto();
  if (paused) return;
  autoTimer = setInterval(function() {
    currentIndex = (currentIndex + 1) % shuffled.length;
    updateSlide();
  }, 4000);
}

function stopAuto() {
  if (autoTimer) { clearInterval(autoTimer); autoTimer = null; }
}

function showSlide() {
  var src = shuffled[currentIndex];
  var total = shuffled.length;
  galleryContainer.innerHTML =
    '<div class="slideshow">' +
      '<div class="slideshow-img-wrap">' +
        '<img src="' + src + '" alt="" id="slideImg">' +
      '</div>' +
      '<div class="slideshow-controls">' +
        '<button class="slide-btn" id="slidePrev">‹</button>' +
        '<span class="slide-counter">' + (currentIndex + 1) + ' / ' + total + '</span>' +
        '<button class="slide-btn" id="slideNext">›</button>' +
      '</div>' +
      '<div class="slideshow-bar">' +
        '<button class="slide-action" id="slidePause">⏸</button>' +
        '<button class="slide-action" id="slideGrid">▦</button>' +
        '<button class="slide-action" id="slideClose">✕</button>' +
      '</div>' +
    '</div>';

  bindSlideEvents();
}

function updateSlide() {
  var src = shuffled[currentIndex];
  document.getElementById('slideImg').src = src;
  document.querySelector('.slide-counter').textContent = (currentIndex + 1) + ' / ' + shuffled.length;
}

function bindSlideEvents() {
  document.getElementById('slidePrev').addEventListener('click', function() {
    currentIndex = (currentIndex - 1 + shuffled.length) % shuffled.length;
    updateSlide();
    if (!paused) startAuto();
  });
  document.getElementById('slideNext').addEventListener('click', function() {
    currentIndex = (currentIndex + 1) % shuffled.length;
    updateSlide();
    if (!paused) startAuto();
  });
  document.getElementById('slidePause').addEventListener('click', function() {
    paused = !paused;
    if (paused) {
      stopAuto();
      document.getElementById('slidePause').textContent = '▶';
    } else {
      document.getElementById('slidePause').textContent = '⏸';
      startAuto();
    }
  });
  document.getElementById('slideGrid').addEventListener('click', function() {
    stopAuto();
    renderGrid();
  });
  document.getElementById('slideClose').addEventListener('click', closeGallery);
}

// 瀑布流网格（从轮播模式切换过来）
function renderGrid() {
  var cols = window.innerWidth < 480 ? 2 : 4;
  var columns = [];
  for (var i = 0; i < cols; i++) { columns.push([]); }
  shuffled.forEach(function(src, i) {
    columns[i % cols].push(src);
  });

  var html = '<div class="gallery-header"><span class="gallery-title">🖼️ 我们的合照</span><button class="gallery-close" id="galleryClose">✕</button></div>';
  html += '<div class="gallery-scroll"><div class="gallery-grid">';

  for (var c = 0; c < cols; c++) {
    html += '<div class="gallery-col">';
    columns[c].forEach(function(src) {
      html += '<div class="gallery-item" onclick="window.viewPhoto(\'' + src + '\')"><img src="' + src + '" alt="" loading="lazy"></div>';
    });
    html += '</div>';
  }

  html += '</div></div>';
  galleryContainer.innerHTML = html;

  galleryContainer.querySelector('#galleryClose').addEventListener('click', closeGallery);

  // 从网格点照片进入轮播
  window.viewPhoto = function(src) {
    currentIndex = shuffled.indexOf(src);
    if (currentIndex < 0) currentIndex = 0;
    paused = false;
    showSlide();
    startAuto();
  };
}

galleryOverlay.addEventListener('click', function(e) {
  if (e.target === galleryOverlay) closeGallery();
});

document.getElementById('galleryBtn').addEventListener('click', function(e) {
  e.stopPropagation();
  openGallery();
});

})();
