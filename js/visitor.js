// 身份识别 & 对方打开提醒
(function() {

var indicator = document.getElementById('visitorIndicator');
var label = document.getElementById('visitorLabel');
var dot = indicator.querySelector('.visitor-dot');
var nameZhang = document.getElementById('nameZhang');
var nameLi = document.getElementById('nameLi');

// 当前浏览者身份
var me = localStorage.getItem('viewer_name') || '';

function setMe(name) {
  me = name;
  localStorage.setItem('viewer_name', name);
  nameZhang.classList.toggle('me', name === '张彬');
  nameLi.classList.toggle('me', name === '李书瑶');
  // 记录本地访问
  localStorage.setItem('local_last_visit', JSON.stringify({ name: me, time: Date.now() }));
  syncToCloud();
}

if (me) {
  nameZhang.classList.toggle('me', me === '张彬');
  nameLi.classList.toggle('me', me === '李书瑶');
}

nameZhang.addEventListener('click', function(e) { e.stopPropagation(); setMe('张彬'); });
nameLi.addEventListener('click', function(e) { e.stopPropagation(); setMe('李书瑶'); });

// 生成本设备ID
var deviceId = localStorage.getItem('device_id');
if (!deviceId) {
  deviceId = 'd' + Date.now().toString(36) + Math.random().toString(36).slice(2,6);
  localStorage.setItem('device_id', deviceId);
}

// 上传最后访问记录（只写 lastVisit + bothTimes，不碰 mailbox）
function syncToCloud() {
  if (!me) return;
  fetch(CLOUD_URL)
    .then(function(r) { return r.json(); })
    .then(function(data) {
      var d = data || {};
      var bothTimes = d.bothTimes || {};
      bothTimes[me] = Date.now();
      var merged = Object.assign({}, d, {
        lastVisit: { name: me, time: Date.now(), device: deviceId },
        bothTimes: bothTimes
      });
      return fetch(CLOUD_URL, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(merged)
      });
    }).catch(function() {});
}

var lastSeenCloudTime = parseInt(localStorage.getItem('last_seen_cloud') || '0');
var bothOnlineEl = document.getElementById('bothOnline');

// 同时在线检测
function checkBothOnline() {
  if (!me) return;
  fetch(CLOUD_URL)
    .then(function(r) { return r.json(); })
    .then(function(data) {
      if (!data || !data.bothTimes) return;
      var bt = data.bothTimes;
      var now = Date.now();
      var zhangTime = bt['张彬'] || 0;
      var liTime = bt['李书瑶'] || 0;
      var FIVE_MIN = 5 * 60 * 1000;
      if (now - zhangTime < FIVE_MIN && now - liTime < FIVE_MIN) {
        if (!bothOnlineEl.classList.contains('show')) {
          bothOnlineEl.classList.add('show');
        }
      } else {
        bothOnlineEl.classList.remove('show');
      }
    }).catch(function() {});
}

function checkCloud() {
  if (!me) return;
  fetch(CLOUD_URL)
    .then(function(r) { return r.json(); })
    .then(function(data) {
      if (!data || !data.lastVisit || !data.lastVisit.name) return;
      var v = data.lastVisit;
      if (v.name === me) return;
      if (v.device === deviceId) return;
      if (v.time <= lastSeenCloudTime) return;
      lastSeenCloudTime = v.time;
      localStorage.setItem('last_seen_cloud', v.time);
      var elapsed = Math.floor((Date.now() - v.time) / 60000);
      showIndicator(elapsed <= 0 ? 'Ta 刚刚来过' : elapsed + ' 分钟前 Ta 来过');
    }).catch(function() {});
}

// 本地检测（同设备）
function checkLocal() {
  if (!me) return;
  try {
    var raw = localStorage.getItem('local_last_visit');
    if (!raw) return;
    var visit = JSON.parse(raw);
    if (!visit || visit.name === me) return;
    var elapsed = Math.floor((Date.now() - visit.time) / 60000);
    if (elapsed >= 0 && elapsed < 60) {
      showIndicator(elapsed <= 0 ? 'Ta 刚刚来过' : elapsed + ' 分钟前 Ta 来过');
    }
  } catch(e) {}
}

var indicatorTimer = null;
function showIndicator(msg) {
  if (indicator.classList.contains('alert')) return;
  indicator.classList.add('alert');
  dot.classList.add('pulse');
  label.textContent = msg;
  clearTimeout(indicatorTimer);
  indicatorTimer = setTimeout(function() {
    indicator.classList.remove('alert');
    dot.classList.remove('pulse');
  }, 18000);
}

// 点击查看详情（从云端查询）
indicator.addEventListener('click', function() {
  var info = me ? '当前是你：' + me : '请先点击名字选择身份';
  info += '\n\n正在查询对方访问记录...';
  fetch(CLOUD_URL)
    .then(function(r) { return r.json(); })
    .then(function(data) {
      if (data && data.lastVisit && data.lastVisit.name && data.lastVisit.name !== me) {
        var v = data.lastVisit;
        var d = new Date(v.time);
        info = (me ? '当前是你：' + me : '请先点击名字选择身份') + '\n\n' +
          v.name + ' 在 ' + d.toLocaleString('zh-CN', { month:'numeric', day:'numeric', hour:'2-digit', minute:'2-digit' }) + ' 来过';
      } else {
        info = (me ? '当前是你：' + me : '请先点击名字选择身份') + '\n\n暂无对方访问记录';
      }
      alert(info);
    }).catch(function() {
      info = (me ? '当前是你：' + me : '请先点击名字选择身份') + '\n\n网络不通，请稍后再试';
      alert(info);
    });
});

// 初始化
if (me) {
  localStorage.setItem('local_last_visit', JSON.stringify({ name: me, time: Date.now() }));
  syncToCloud();
}

checkLocal();
// 首次延迟检查云端（等 blob 创建完成）
setTimeout(function() { checkCloud(); checkBothOnline(); }, 4000);
setInterval(function() { checkLocal(); checkCloud(); checkBothOnline(); }, 60000);

window.addEventListener('beforeunload', function() {
  if (me) {
    localStorage.setItem('local_last_visit', JSON.stringify({ name: me, time: Date.now() }));
  }
});

})();
