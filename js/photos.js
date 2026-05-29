// 合照墙 — 瀑布流展示所有照片
(function() {

var galleryOverlay = document.getElementById('galleryOverlay');
var galleryContainer = document.getElementById('galleryContainer');

function openGallery() {
  galleryOverlay.style.display = 'flex';
  renderGallery();
}

function closeGallery() {
  galleryOverlay.style.display = 'none';
}

function renderGallery() {
  var cols = window.innerWidth < 480 ? 2 : 4;
  var columns = [];
  for (var i = 0; i < cols; i++) { columns.push([]); }
  PHOTOS.forEach(function(src, i) {
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
}

// 大图查看
window.viewPhoto = function(src) {
  var lightbox = document.createElement('div');
  lightbox.className = 'gallery-lightbox';
  lightbox.innerHTML = '<img src="' + src + '" alt=""><button class="gallery-lightbox-close">✕</button>';
  lightbox.addEventListener('click', function(e) {
    if (e.target === lightbox || e.target.className === 'gallery-lightbox-close') {
      document.body.removeChild(lightbox);
    }
  });
  document.body.appendChild(lightbox);
};

galleryOverlay.addEventListener('click', function(e) {
  if (e.target === galleryOverlay) closeGallery();
});

document.getElementById('galleryBtn').addEventListener('click', function(e) {
  e.stopPropagation();
  openGallery();
});

})();
