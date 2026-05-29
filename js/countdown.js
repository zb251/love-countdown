// 倒计时 & 纪念日计算
(function() {

function update() {
  var now = new Date();
  var diffMs = now - START_DATE;
  var totalDays = Math.floor(diffMs / MS_DAY);
  document.getElementById('totalDays').textContent = totalDays.toLocaleString();

  var anniThisYear = new Date(now.getFullYear(), START_DATE.getMonth(), START_DATE.getDate(), 12, 0, 0);
  var lastAnni = anniThisYear <= now ? anniThisYear : new Date(now.getFullYear() - 1, START_DATE.getMonth(), START_DATE.getDate(), 12, 0, 0);

  var years = now.getFullYear() - START_DATE.getFullYear();
  if (anniThisYear > now) years--;

  var months = 0, cursor = new Date(lastAnni);
  while (true) {
    var next = new Date(cursor.getFullYear(), cursor.getMonth() + 1, cursor.getDate(), 12, 0, 0);
    if (next > now) break;
    months++; cursor = next;
  }

  document.getElementById('years').textContent = years;
  document.getElementById('months').textContent = months;

  var remainderMs = now - cursor;
  var remainderDays = Math.floor(remainderMs / MS_DAY);
  document.getElementById('weeks').textContent = Math.floor(remainderDays / 7);
  document.getElementById('days').textContent = remainderDays % 7;
  document.getElementById('hours').textContent = Math.floor((remainderMs % MS_DAY) / 3600000);
  document.getElementById('minutes').textContent = Math.floor((remainderMs % 3600000) / 60000);
  document.getElementById('seconds').textContent = Math.floor((remainderMs % 60000) / 1000);

  var nextAnni = anniThisYear <= now
    ? new Date(now.getFullYear() + 1, START_DATE.getMonth(), START_DATE.getDate(), 12, 0, 0)
    : anniThisYear;
  document.getElementById('countdown').textContent = Math.ceil((nextAnni - now) / MS_DAY) + ' 天';
}

update();
setInterval(update, 1000);

})();
