// 信箱系统（含云端同步）
(function() {

var PRESET_BASE = new Date('2025-09-22T12:00:00').getTime();
var PRESET_LETTERS = [
  { author: '张彬', title: '遇见你', text: '遇见你之前，我不知道时间可以过得这么快，又这么慢。快的是和你在一起的每一天，慢的是等待下一次见你的每一秒。', time: PRESET_BASE - 86400000*270 },
  { author: '李书瑶', title: '因为是你', text: '有人说爱情是化学反应，有人说爱情是缘分注定。我觉得都不对——爱情就是你。你就是那个让一切变得合理的原因。', time: PRESET_BASE - 86400000*180 },
  { author: '张彬', title: '平行宇宙', text: '有时候我在想，如果平行宇宙真的存在，那在每一个宇宙里，我一定都会找到你，然后重新爱上你。', time: PRESET_BASE - 86400000*90 }
];

function loadLetters() {
  try { return JSON.parse(localStorage.getItem('mailbox_letters') || 'null'); } catch(e) {}
  return null;
}

var mailboxLetters = loadLetters();

function saveLetters(letters, sync) {
  mailboxLetters = letters;
  try { localStorage.setItem('mailbox_letters', JSON.stringify(letters)); } catch(e) {}
  if (sync !== false) syncMailboxToCloud();
}

// 信箱云端同步（写）
function syncMailboxToCloud() {
  var me = localStorage.getItem('viewer_name');
  var deviceId = localStorage.getItem('device_id');
  fetch(CLOUD_URL)
    .then(function(r) { return r.json(); })
    .then(function(data) {
      var merged = Object.assign({}, data || {}, {
        mailbox: mailboxLetters,
        lastVisit: me ? { name: me, time: Date.now(), device: deviceId } : (data && data.lastVisit)
      });
      return fetch(CLOUD_URL, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(merged)
      });
    }).catch(function() {});
}

// 信箱云端同步（读）
function syncMailboxFromCloud() {
  fetch(CLOUD_URL)
    .then(function(r) { return r.json(); })
    .then(function(data) {
      if (!data || !data.mailbox || !Array.isArray(data.mailbox)) return;
      var cloudLetters = data.mailbox;
      if (cloudLetters.length === 0) return;
      var merged = [].concat(mailboxLetters);
      var existingKeys = new Set();
      merged.forEach(function(l) { existingKeys.add(l.author + '|' + l.title + '|' + l.time); });
      var hasNew = false;
      cloudLetters.forEach(function(l) {
        var key = l.author + '|' + l.title + '|' + l.time;
        if (!existingKeys.has(key)) { merged.push(l); existingKeys.add(key); hasNew = true; }
      });
      if (hasNew) {
        merged.sort(function(a, b) { return a.time - b.time; });
        saveLetters(merged, false);
        updateBadge();
      }
    }).catch(function() {});
}

if (!mailboxLetters) {
  mailboxLetters = [].concat(PRESET_LETTERS);
  saveLetters(mailboxLetters);
}

// 首次从云端拉取
setTimeout(function() { syncMailboxFromCloud(); }, 5000);
setInterval(function() { syncMailboxFromCloud(); }, 60000);

var mailboxOverlay = document.getElementById('mailboxOverlay');
var mailboxContainer = document.getElementById('mailboxContainer');
var mailboxBadge = document.getElementById('mailboxBadge');

function getIcon(author) { return author === '张彬' ? '💙' : '💗'; }
function getEnvelopeIcon(author) { return author === '张彬' ? '✉️' : '💌'; }

function formatTime(ts) {
  var d = new Date(ts);
  return d.getFullYear() + '/' + (d.getMonth()+1) + '/' + d.getDate() + ' ' +
    String(d.getHours()).padStart(2,'0') + ':' + String(d.getMinutes()).padStart(2,'0');
}

function updateBadge() {
  var seen = JSON.parse(localStorage.getItem('mailbox_seen') || '0');
  var count = mailboxLetters.length - Math.min(seen, mailboxLetters.length);
  if (count > 0) {
    mailboxBadge.style.display = 'flex';
    mailboxBadge.textContent = count > 99 ? '99+' : count;
  } else {
    mailboxBadge.style.display = 'none';
  }
}

function markSeen() {
  localStorage.setItem('mailbox_seen', mailboxLetters.length);
  updateBadge();
}

function renderMailboxList() {
  var sorted = [].concat(mailboxLetters).reverse();
  mailboxContainer.innerHTML =
    '<div class="mailbox-header">' +
      '<span class="mailbox-title">💌 我们的信箱</span>' +
      '<button class="mailbox-close" id="mailboxClose">✕</button>' +
    '</div>' +
    '<div class="mailbox-list" id="mailboxList">' +
      (sorted.length === 0 ? '<div class="mailbox-empty">📭 信箱还是空的<br>写第一封信吧</div>' : '') +
      sorted.map(function(l) {
        var idx = mailboxLetters.indexOf(l);
        return '<div class="envelope" data-idx="' + idx + '">' +
          '<div class="envelope-icon">' + getEnvelopeIcon(l.author) + '</div>' +
          '<div class="envelope-info">' +
            '<div class="envelope-author">' + getIcon(l.author) + ' ' + l.author + '</div>' +
            '<div class="envelope-title">' + l.title + '</div>' +
            '<div class="envelope-date">' + formatTime(l.time) + '</div>' +
          '</div>' +
          '<div class="envelope-arrow">›</div>' +
        '</div>';
      }).join('') +
    '</div>' +
    '<div class="mailbox-footer">' +
      '<button class="mailbox-compose-btn" id="mailboxComposeBtn">✍️ 写一封信</button>' +
    '</div>';

  mailboxContainer.querySelectorAll('.envelope').forEach(function(el) {
    el.addEventListener('click', function() {
      var idx = parseInt(el.dataset.idx);
      showLetter(idx);
    });
  });

  mailboxContainer.querySelector('#mailboxClose').addEventListener('click', closeMailbox);
  mailboxContainer.querySelector('#mailboxComposeBtn').addEventListener('click', showCompose);
}

function showLetter(idx) {
  var l = mailboxLetters[idx];
  mailboxContainer.innerHTML =
    '<div class="letter-view">' +
      '<div class="letter-view-icon">' + getEnvelopeIcon(l.author) + '</div>' +
      '<div class="letter-view-author">' + getIcon(l.author) + ' ' + l.author + '</div>' +
      '<div class="letter-view-title">' + l.title + '</div>' +
      '<div class="letter-view-date">' + formatTime(l.time) + '</div>' +
      '<div class="letter-view-body">' + l.text.replace(/\n/g, '<br>') + '</div>' +
      '<button class="letter-view-back" id="letterBack">← 返回信箱</button>' +
    '</div>';
  mailboxContainer.querySelector('#letterBack').addEventListener('click', renderMailboxList);
  markSeen();
}

function showCompose() {
  mailboxContainer.innerHTML =
    '<div class="mailbox-header">' +
      '<span class="mailbox-title">✍️ 写一封信</span>' +
      '<button class="mailbox-close" id="mailboxClose">✕</button>' +
    '</div>' +
    '<div class="compose-panel">' +
      '<div class="compose-author-toggle">' +
        '<button class="compose-author-btn active" data-author="张彬">💙 张彬</button>' +
        '<button class="compose-author-btn" data-author="李书瑶">💗 李书瑶</button>' +
      '</div>' +
      '<input class="compose-input" id="composeTitle" placeholder="信的主题..." maxlength="30">' +
      '<textarea class="compose-textarea" id="composeText" placeholder="写下你想说的话..." rows="5" maxlength="500"></textarea>' +
      '<div class="compose-actions">' +
        '<button class="compose-cancel" id="composeCancel">取消</button>' +
        '<button class="compose-send" id="composeSend">💌 投进信箱</button>' +
      '</div>' +
    '</div>';

  var selectedAuthor = '张彬';
  mailboxContainer.querySelectorAll('.compose-author-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      selectedAuthor = btn.dataset.author;
      mailboxContainer.querySelectorAll('.compose-author-btn').forEach(function(b) { b.classList.remove('active'); });
      btn.classList.add('active');
    });
  });

  mailboxContainer.querySelector('#mailboxClose').addEventListener('click', closeMailbox);
  mailboxContainer.querySelector('#composeCancel').addEventListener('click', renderMailboxList);
  mailboxContainer.querySelector('#composeSend').addEventListener('click', function() {
    var title = mailboxContainer.querySelector('#composeTitle').value.trim();
    var text = mailboxContainer.querySelector('#composeText').value.trim();
    if (!title || !text) return;
    mailboxLetters.push({ author: selectedAuthor, title: title, text: text, time: Date.now() });
    saveLetters(mailboxLetters);
    markSeen();
    renderMailboxList();
  });
}

function openMailbox() {
  renderMailboxList();
  mailboxOverlay.style.display = 'flex';
  markSeen();
}

function closeMailbox() {
  mailboxOverlay.style.display = 'none';
}

mailboxOverlay.addEventListener('click', function(e) {
  if (e.target === mailboxOverlay) closeMailbox();
});

document.getElementById('mailboxBtn').addEventListener('click', function(e) {
  e.stopPropagation();
  openMailbox();
});

updateBadge();

})();
