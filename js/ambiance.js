// 背景氛围：花瓣、照片飘落、星星、情绪色彩
(function() {

// --- 花瓣 ---
const petalChars = ['🌸','💮','🌷','✿','❀','🩷','🌺','💐','🏵️'];
function spawnPetal() {
  const el = document.createElement('div');
  el.className = 'petal';
  el.textContent = petalChars[Math.floor(Math.random() * petalChars.length)];
  el.style.left = Math.random() * 100 + '%';
  el.style.top = '-40px';
  el.style.fontSize = (14 + Math.random() * 22) + 'px';
  el.style.animationDuration = (9 + Math.random() * 14) + 's';
  el.style.animationDelay = Math.random() * 3 + 's';
  el.style.opacity = 0.5 + Math.random() * 0.5;
  document.body.appendChild(el);
  setTimeout(function() { el.remove(); }, 27000);
}
for (var i = 0; i < (window.innerWidth < 480 ? 8 : 16); i++) {
  setTimeout(spawnPetal, i * 350);
}
setInterval(spawnPetal, window.innerWidth < 480 ? 3500 : 2000);

// --- 飘落照片 ---
function spawnPhoto() {
  if (typeof PHOTOS === 'undefined' || PHOTOS.length === 0) return;
  var src = PHOTOS[Math.floor(Math.random() * PHOTOS.length)];
  var wrapper = document.createElement('div');
  wrapper.className = 'photo-wrapper';
  wrapper.style.left = (10 + Math.random() * 80) + '%';
  wrapper.style.top = '-100px';
  wrapper.style.animationDuration = (10 + Math.random() * 14) + 's';
  var img = document.createElement('img');
  img.className = 'photo';
  img.src = src;
  var isMobile = window.innerWidth < 480;
  var size = isMobile ? (55 + Math.random() * 45) : (65 + Math.random() * 50);
  img.style.width = size + 'px';
  img.style.height = size + 'px';
  img.style.animationName = Math.random() > 0.5 ? 'photoSwayR' : 'photoSwayL';
  img.style.animationDuration = (2.5 + Math.random() * 3.5) + 's';
  wrapper.appendChild(img);
  document.body.appendChild(wrapper);
  setTimeout(function() { wrapper.remove(); }, 28000);
}
if (typeof PHOTOS !== 'undefined' && PHOTOS.length > 0) {
  spawnPhoto(); spawnPhoto(); spawnPhoto();
  setInterval(spawnPhoto, 4500);
}

// --- 星星 ---
var starChars = ['✨','⭐','·','✦','⋆','˚','✧'];
for (var i = 0; i < 55; i++) {
  var el = document.createElement('div');
  el.className = 'star';
  el.textContent = starChars[Math.floor(Math.random() * starChars.length)];
  el.style.setProperty('--dur', (2 + Math.random() * 3.5) + 's');
  el.style.setProperty('--delay', Math.random() * 4 + 's');
  el.style.left = Math.random() * 96 + '%';
  el.style.top = Math.random() * 96 + '%';
  el.style.fontSize = (9 + Math.random() * 15) + 'px';
  document.body.appendChild(el);
}

// --- 情绪色彩 ---
var MOODS = [
  { s: 0, e: 5,  name: '深夜', colors: ['#1a1528', '#120e20', '#1e1830', '#120e20', '#1a1528'] },
  { s: 5, e: 7,  name: '日出', colors: ['#3a2840', '#f2d8c8', '#fbe8d8', '#f2d8c8', '#3a2840'] },
  { s: 7, e: 10, name: '清晨', colors: ['#fce4ec', '#f8d7e8', '#fef0f5', '#f8d7e8', '#fce4ec'] },
  { s: 10, e: 14, name: '正午', colors: ['#fff5f2', '#ffeae2', '#fffaf7', '#ffeae2', '#fff5f2'] },
  { s: 14, e: 17, name: '午后', colors: ['#fff3e6', '#ffe6d4', '#fdf0e0', '#ffe6d4', '#fff3e6'] },
  { s: 17, e: 19, name: '日落', colors: ['#ffe4d0', '#ffd0bc', '#fce0d0', '#ffd0bc', '#ffe4d0'] },
  { s: 19, e: 21, name: '黄昏', colors: ['#4a3a50', '#342438', '#4e3e55', '#342438', '#4a3a50'] },
  { s: 21, e: 24, name: '夜晚', colors: ['#252038', '#1c1630', '#2a2240', '#1c1630', '#252038'] }
];

function hexToRgb(hex) {
  var r = parseInt(hex.slice(1,3), 16);
  var g = parseInt(hex.slice(3,5), 16);
  var b = parseInt(hex.slice(5,7), 16);
  return [r, g, b];
}
function rgbToHex(r, g, b) {
  return '#' + [r,g,b].map(function(v) {
    return Math.min(255, Math.max(0, Math.round(v))).toString(16).padStart(2,'0');
  }).join('');
}
function lerpColors(c1, c2, t) {
  var a = hexToRgb(c1), b = hexToRgb(c2);
  return rgbToHex(a[0]+(b[0]-a[0])*t, a[1]+(b[1]-a[1])*t, a[2]+(b[2]-a[2])*t);
}

function getGradient() {
  var now = new Date();
  var hour = now.getHours() + now.getMinutes() / 60;
  var m1 = MOODS[0], m2 = MOODS[0];
  for (var i = 0; i < MOODS.length; i++) {
    if (hour >= MOODS[i].s && hour < MOODS[i].e) { m1 = MOODS[i]; m2 = MOODS[i]; break; }
    if (i < MOODS.length - 1 && hour >= MOODS[i].e && hour < MOODS[i+1].s) { m1 = MOODS[i]; m2 = MOODS[i+1]; break; }
  }
  var ratio = 0;
  if (m1 !== m2) {
    ratio = m2.s > m1.e ? (hour - m1.e) / (m2.s - m1.e) : 0;
  }
  var c = [];
  for (var i = 0; i < 5; i++) { c.push(lerpColors(m1.colors[i], m2.colors[i], ratio)); }
  return 'linear-gradient(135deg, ' + c[0] + ' 0%, ' + c[1] + ' 25%, ' + c[2] + ' 50%, ' + c[3] + ' 75%, ' + c[4] + ' 100%)';
}

function updateMood() {
  document.body.style.background = getGradient();
}

updateMood();
setInterval(updateMood, 60000);

})();
