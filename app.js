const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const DAY_SHORTS = {
  "Sunday": "Sun",
  "Monday": "Mon",
  "Tuesday": "Tue",
  "Wednesday": "Wed",
  "Thursday": "Thu",
  "Friday": "Fri",
  "Saturday": "Sat"
};

let currentSelectedDay = "Monday";
let currentSelectedMinutes = 720;
let isLiveMode = false;
let currentCategoryFilter = "all";
let currentSearchQuery = "";
let currentSortMode = "status";
let isListView = false;
let openDrawers = new Set();

// LocalStorage for Starred Favorites
let favorites = new Set();
try {
  const savedFavs = localStorage.getItem('forge_favorites');
  if (savedFavs) {
    favorites = new Set(JSON.parse(savedFavs));
  }
} catch (e) {
  console.error("Could not load favorites from localStorage", e);
}

function saveFavorites() {
  try {
    localStorage.setItem('forge_favorites', JSON.stringify(Array.from(favorites)));
  } catch (e) {
    console.error("Could not save favorites to localStorage", e);
  }
}

const timeSlider = document.getElementById('timeSlider');
const sliderTimeDisplay = document.getElementById('sliderTimeDisplay');
const manualTimeInput = document.getElementById('manualTimeInput');
const btnLiveNow = document.getElementById('btnLiveNow');
const searchInput = document.getElementById('searchInput');
const searchClearBtn = document.getElementById('searchClearBtn');
const sortSelect = document.getElementById('sortSelect');
const viewToggleBtn = document.getElementById('viewToggleBtn');
const btnShare = document.getElementById('btnShare');
const toastMsg = document.getElementById('toastMsg');
const spotsGrid = document.getElementById('spotsGrid');
const headerClock = document.getElementById('headerClock');
const headerDate = document.getElementById('headerDate');
const dayButtons = document.querySelectorAll('.day-btn');
const catPills = document.querySelectorAll('.cat-pill');
const presetButtons = document.querySelectorAll('.preset-btn');

const countAll = document.getElementById('countAll');
const countOpen = document.getElementById('countOpen');
const countWarning = document.getElementById('countWarning');
const countFavorites = document.getElementById('countFavorites');
const countBasic = document.getElementById('countBasic');
const countPlus = document.getElementById('countPlus');
const visibleCount = document.getElementById('visibleCount');
const totalCount = document.getElementById('totalCount');

function showToast(message) {
  if (!toastMsg) return;
  toastMsg.textContent = message;
  toastMsg.classList.add('show');
  setTimeout(function() {
    toastMsg.classList.remove('show');
  }, 2500);
}

function formatTime12h(minutes) {
  if (minutes >= 1440) minutes = minutes % 1440;
  const h = Math.floor(minutes / 60) % 24;
  const m = minutes % 60;
  const ampm = h >= 12 ? "PM" : "AM";
  const dh = (h % 12 === 0) ? 12 : (h % 12);
  const mStr = m < 10 ? "0" + m : m;
  return dh + ":" + mStr + " " + ampm;
}

function formatTime24h(minutes) {
  const h = Math.floor(minutes / 60) % 24;
  const m = minutes % 60;
  const hStr = h < 10 ? "0" + h : h;
  const mStr = m < 10 ? "0" + m : m;
  return hStr + ":" + mStr;
}

function parseTime24hToMinutes(timeStr) {
  if (!timeStr) return null;
  const parts = timeStr.split(':');
  if (parts.length < 2) return null;
  const h = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10);
  if (isNaN(h) || isNaN(m)) return null;
  return (h * 60 + m) % 1440;
}

function updateTimeUI(minutes) {
  currentSelectedMinutes = minutes;
  timeSlider.value = minutes;
  sliderTimeDisplay.textContent = formatTime12h(minutes);
  manualTimeInput.value = formatTime24h(minutes);
}

function setLiveTime() {
  const now = new Date();
  currentSelectedDay = DAYS[now.getDay()];
  currentSelectedMinutes = now.getHours() * 60 + now.getMinutes();
  
  updateTimeUI(currentSelectedMinutes);
  
  dayButtons.forEach(function(btn) {
    btn.classList.toggle('active', btn.getAttribute('data-day') === currentSelectedDay);
  });
  
  isLiveMode = true;
  btnLiveNow.classList.add('active');
  render();
}

function updateHeaderClock() {
  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', second: '2-digit' });
  const dateStr = now.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
  if (headerClock) headerClock.textContent = timeStr;
  if (headerDate) headerDate.textContent = dateStr;

  if (isLiveMode) {
    currentSelectedMinutes = now.getHours() * 60 + now.getMinutes();
    timeSlider.value = currentSelectedMinutes;
    sliderTimeDisplay.textContent = formatTime12h(currentSelectedMinutes);
    manualTimeInput.value = formatTime24h(currentSelectedMinutes);
    render();
  }
}

setInterval(updateHeaderClock, 1000);

// Status Evaluator with Multi-Interval Support (Split Shifts)
function getSpotStatus(spot, day, testMinute) {
  const sched = spot.schedule[day];
  if (!sched || sched.closed) {
    return { status: 'closed', badgeText: 'Closed Today', badgeClass: 'badge-closed', subText: 'Closed all day', minLeft: null };
  }

  const intervals = (sched.intervals && sched.intervals.length > 0)
    ? sched.intervals
    : ((sched.open !== null && sched.close !== null) ? [{ open: sched.open, close: sched.close, openStr: sched.openStr, closeStr: sched.closeStr }] : []);

  if (intervals.length === 0) {
    return { status: 'closed', badgeText: 'Closed Today', badgeClass: 'badge-closed', subText: 'Closed all day', minLeft: null };
  }

  // 1. Check if open right now in any interval
  for (let i = 0; i < intervals.length; i++) {
    const itv = intervals[i];
    let isOpen = false;
    let minUntilClose = 0;

    if (itv.close > itv.open) {
      if (testMinute >= itv.open && testMinute < itv.close) {
        isOpen = true;
        minUntilClose = itv.close - testMinute;
      }
    } else {
      if (testMinute >= itv.open || testMinute < itv.close) {
        isOpen = true;
        minUntilClose = (testMinute >= itv.open) ? (1440 - testMinute + itv.close) : (itv.close - testMinute);
      }
    }

    if (isOpen) {
      if (minUntilClose <= 45) {
        return {
          status: 'warning',
          badgeText: `Closes in ${minUntilClose}m`,
          badgeClass: 'badge-warning',
          subText: `Closes at ${itv.closeStr}`,
          minLeft: minUntilClose
        };
      } else {
        return {
          status: 'open',
          badgeText: `Open until ${itv.closeStr}`,
          badgeClass: 'badge-open',
          subText: `Open until ${itv.closeStr}`,
          minLeft: minUntilClose
        };
      }
    }
  }

  // 2. Not currently open: check next upcoming interval today
  for (let i = 0; i < intervals.length; i++) {
    const itv = intervals[i];
    if (itv.open > testMinute) {
      const minUntilOpen = itv.open - testMinute;
      if (minUntilOpen <= 60) {
        return {
          status: 'closed',
          badgeText: `Opens in ${minUntilOpen}m`,
          badgeClass: 'badge-closed',
          subText: `Opens at ${itv.openStr}`,
          minLeft: null
        };
      } else {
        return {
          status: 'closed',
          badgeText: `Opens at ${itv.openStr}`,
          badgeClass: 'badge-closed',
          subText: `Opens at ${itv.openStr}`,
          minLeft: null
        };
      }
    }
  }

  // 3. All intervals today have already passed
  return {
    status: 'closed',
    badgeText: 'Closed for the day',
    badgeClass: 'badge-closed',
    subText: 'Closed for today',
    minLeft: null
  };
}

// Workshopped 24-Hour Visual Schedule Bar: Red closed background track with fixed Green open blocks
function generateTimelineHtml(sched, testMinute) {
  if (!sched || sched.closed) {
    return `
      <div class="visual-timeline-container">
        <div class="visual-timeline-header">
          <div class="timeline-intervals-summary">
            <span class="timeline-shift-badge badge-all-closed">🔴 Closed All Day</span>
          </div>
          <div class="visual-timeline-legend">
            <span class="legend-item"><span class="legend-color-dot dot-closed"></span> Closed</span>
          </div>
        </div>
        <div class="visual-timeline-bar">
          <div class="timeline-now-marker" style="left: ${(testMinute / 1440) * 100}%;"></div>
        </div>
        <div class="visual-timeline-labels">
          <span>12 AM</span><span>6 AM</span><span>12 PM</span><span>6 PM</span><span>12 AM</span>
        </div>
      </div>
    `;
  }

  const intervals = (sched.intervals && sched.intervals.length > 0)
    ? sched.intervals
    : ((sched.open !== null && sched.close !== null) ? [{ open: sched.open, close: sched.close, openStr: sched.openStr, closeStr: sched.closeStr }] : []);

  if (intervals.length === 0) {
    return '';
  }

  let segmentsHtml = '';
  let shiftBadgesHtml = '';

  intervals.forEach(function(itv, idx) {
    let leftPct = (itv.open / 1440) * 100;
    let widthPct = 0;
    if (itv.close >= itv.open) {
      widthPct = ((itv.close - itv.open) / 1440) * 100;
    } else {
      widthPct = ((1440 - itv.open + itv.close) / 1440) * 100;
    }
    segmentsHtml += `<div class="timeline-segment-open" style="left: ${leftPct}%; width: ${widthPct}%;" title="Open: ${itv.openStr} - ${itv.closeStr}"></div>`;
    shiftBadgesHtml += `<span class="timeline-shift-badge">🟢 ${itv.openStr} – ${itv.closeStr}</span>`;
  });

  const markerPct = (testMinute / 1440) * 100;
  const markerHtml = `<div class="timeline-now-marker" style="left: ${markerPct}%;"></div>`;

  return `
    <div class="visual-timeline-container">
      <div class="visual-timeline-header">
        <div class="timeline-intervals-summary">
          ${shiftBadgesHtml}
        </div>
        <div class="visual-timeline-legend">
          <span class="legend-item"><span class="legend-color-dot dot-open"></span> Open</span>
          <span class="legend-item"><span class="legend-color-dot dot-closed"></span> Closed</span>
        </div>
      </div>
      <div class="visual-timeline-bar">
        ${segmentsHtml}
        ${markerHtml}
      </div>
      <div class="visual-timeline-labels">
        <span>12 AM</span><span>6 AM</span><span>12 PM</span><span>6 PM</span><span>12 AM</span>
      </div>
    </div>
  `;
}

// Highlight matched search text
function highlightText(text, query) {
  if (!query) return text;
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  return text.replace(regex, '<span class="highlight-match">$1</span>');
}

// Star Favorite Toggle
window.toggleFavorite = function(spotId, btnElement, event) {
  if (event) event.stopPropagation();
  if (favorites.has(spotId)) {
    favorites.delete(spotId);
    btnElement.classList.remove('favorited');
    btnElement.textContent = '☆';
    showToast("Removed from Favorites");
  } else {
    favorites.add(spotId);
    btnElement.classList.add('favorited');
    btnElement.textContent = '★';
    showToast("Added to Favorites ⭐");
  }
  saveFavorites();
  render();
};

// Accordion Dropdown Toggle
window.toggleDropdown = function(spotId, btnElement) {
  const card = btnElement.closest('.spot-card');
  if (!card) return;
  const drawer = card.querySelector('.weekly-drawer');
  if (!drawer) return;

  const isExpanded = btnElement.getAttribute('aria-expanded') === 'true';
  const newExpanded = !isExpanded;

  btnElement.setAttribute('aria-expanded', newExpanded ? 'true' : 'false');
  const labelSpan = btnElement.querySelector('.toggle-text');

  if (newExpanded) {
    drawer.classList.add('open');
    if (labelSpan) labelSpan.textContent = 'Hide Full Week Hours';
    openDrawers.add(spotId);
  } else {
    drawer.classList.remove('open');
    if (labelSpan) labelSpan.textContent = 'View Full Week Hours';
    openDrawers.delete(spotId);
  }
};

function render() {
  let openCount = 0;
  let warningCount = 0;
  let basicCount = 0;
  let plusCount = 0;
  let total = SPOTS_DATA.length;
  let visible = 0;

  const processedSpots = SPOTS_DATA.map(function(spot) {
    const statusInfo = getSpotStatus(spot, currentSelectedDay, currentSelectedMinutes);
    if (statusInfo.status === 'open') openCount++;
    if (statusInfo.status === 'warning') {
      openCount++;
      warningCount++;
    }
    const hasBasic = spot.swipeTypes && spot.swipeTypes.indexOf('Basic') !== -1;
    const hasPlus = spot.swipeTypes && spot.swipeTypes.indexOf('PLUS+') !== -1;
    if (hasBasic) basicCount++;
    if (hasPlus) plusCount++;

    return {
      ...spot,
      hasBasic: hasBasic,
      hasPlus: hasPlus,
      isFav: favorites.has(spot.id),
      statusInfo: statusInfo
    };
  });

  if (countAll) countAll.textContent = total;
  if (countOpen) countOpen.textContent = openCount;
  if (countWarning) countWarning.textContent = warningCount;
  if (countFavorites) countFavorites.textContent = favorites.size;
  if (countBasic) countBasic.textContent = basicCount;
  if (countPlus) countPlus.textContent = plusCount;
  if (totalCount) totalCount.textContent = total;

  const filtered = processedSpots.filter(function(spot) {
    if (currentSearchQuery) {
      const q = currentSearchQuery.toLowerCase();
      const matchName = spot.name.toLowerCase().indexOf(q) !== -1;
      const matchCat = spot.category.toLowerCase().indexOf(q) !== -1;
      const matchZone = spot.zone ? spot.zone.toLowerCase().indexOf(q) !== -1 : false;
      const matchCuisine = spot.cuisine ? spot.cuisine.toLowerCase().indexOf(q) !== -1 : false;
      const matchPayment = spot.payment ? spot.payment.toLowerCase().indexOf(q) !== -1 : false;
      if (!matchName && !matchCat && !matchZone && !matchCuisine && !matchPayment) return false;
    }

    if (currentCategoryFilter === 'favorites') {
      return spot.isFav;
    }
    if (currentCategoryFilter === 'basic-swipes') {
      return spot.hasBasic;
    }
    if (currentCategoryFilter === 'plus-swipes') {
      return spot.hasPlus;
    }
    if (currentCategoryFilter === 'open') {
      return spot.statusInfo.status === 'open' || spot.statusInfo.status === 'warning';
    }
    if (currentCategoryFilter === 'warning') {
      return spot.statusInfo.status === 'warning';
    }
    if (currentCategoryFilter !== 'all') {
      return spot.category === currentCategoryFilter;
    }

    return true;
  });

  if (visibleCount) visibleCount.textContent = filtered.length;

  if (filtered.length === 0) {
    spotsGrid.innerHTML = '<div class="no-results"><h3>No locations match your filter</h3><p style="margin-top: 6px; font-size: 0.85rem;">Try adjusting the time slider or clearing your search.</p></div>';
    return;
  }

  // Sorting
  filtered.sort(function(a, b) {
    if (currentSortMode === 'name') {
      return a.name.localeCompare(b.name);
    }
    if (currentSortMode === 'zone') {
      const zA = a.zone || '';
      const zB = b.zone || '';
      return zA.localeCompare(zB) || a.name.localeCompare(b.name);
    }
    if (currentSortMode === 'closing') {
      const minA = (a.statusInfo.minLeft !== null) ? a.statusInfo.minLeft : 9999;
      const minB = (b.statusInfo.minLeft !== null) ? b.statusInfo.minLeft : 9999;
      return minA - minB;
    }
    // Default Status sort: Favorites first, then closing soon, then open, then closed
    if (a.isFav && !b.isFav) return -1;
    if (!a.isFav && b.isFav) return 1;
    const rank = { warning: 0, open: 1, closed: 2 };
    return rank[a.statusInfo.status] - rank[b.statusInfo.status];
  });

  spotsGrid.innerHTML = '';

  const dayOrder = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  filtered.forEach(function(spot) {
    visible++;
    const card = document.createElement('div');
    card.className = 'spot-card status-' + spot.statusInfo.status + (spot.isFav ? ' is-favorite' : '');
    card.setAttribute('data-id', spot.id);
    
    const sched = spot.schedule[currentSelectedDay];
    const todayHoursDisplay = (sched && !sched.closed) ? (sched.displayStr || `${sched.openStr} - ${sched.closeStr}`) : 'Closed Today';
    const isDrawerOpen = openDrawers.has(spot.id);
    const timelineHtml = generateTimelineHtml(sched, currentSelectedMinutes);

    let drawerRowsHtml = '';
    dayOrder.forEach(function(d) {
      const s = spot.schedule[d];
      const isToday = (d === currentSelectedDay);
      const hStr = (s && !s.closed) ? (s.displayStr || `${s.openStr} - ${s.closeStr}`) : 'Closed';
      drawerRowsHtml += `
        <div class="drawer-row ${isToday ? 'highlight-day' : ''}">
          <span class="drawer-day-name">${DAY_SHORTS[d]}</span>
          <span class="drawer-day-hours">${hStr}</span>
        </div>
      `;
    });

    const displayName = currentSearchQuery ? highlightText(spot.name, currentSearchQuery) : spot.name;

    card.innerHTML = `
      <div class="card-top">
        <div class="card-title-col">
          <div class="spot-title">${displayName}</div>
          <div class="spot-meta-row">
            <span class="spot-category-tag">${spot.category}</span>
            ${spot.zone ? `<span class="spot-zone-tag">📍 ${spot.zone}</span>` : ''}
            ${spot.hasBasic ? `<span class="spot-swipe-tag tag-basic">🍽️ Basic Swipe</span>` : ''}
            ${spot.hasPlus ? `<span class="spot-swipe-tag tag-plus">💳 PLUS+ Swipe</span>` : ''}
          </div>
        </div>
        <div class="card-actions">
          <button class="btn-star ${spot.isFav ? 'favorited' : ''}" onclick="toggleFavorite('${spot.id}', this, event)" title="Pin to Favorites" aria-label="Pin to Favorites">
            ${spot.isFav ? '★' : '☆'}
          </button>
          <div class="status-badge ${spot.statusInfo.badgeClass}">
            <span class="pulse-dot"></span>
            ${spot.statusInfo.badgeText}
          </div>
        </div>
      </div>
      ${timelineHtml}
      <div class="card-hours-row">
        <span class="today-hours-label">${currentSelectedDay} Hours:</span>
        <span class="today-hours-val">${todayHoursDisplay}</span>
      </div>
      <div class="weekly-dropdown-wrapper">
        <button class="weekly-toggle-btn" aria-expanded="${isDrawerOpen ? 'true' : 'false'}" onclick="toggleDropdown('${spot.id}', this)">
          <span class="toggle-label">
            <span class="toggle-text">${isDrawerOpen ? 'Hide Full Week Hours' : 'View Full Week Hours'}</span>
          </span>
          <svg class="chevron-icon" viewBox="0 0 24 24">
            <path d="M7 10l5 5 5-5z"/>
          </svg>
        </button>
        <div class="weekly-drawer ${isDrawerOpen ? 'open' : ''}">
          ${drawerRowsHtml}
        </div>
      </div>
    `;

    spotsGrid.appendChild(card);
  });
}

// Event Listeners
timeSlider.addEventListener('input', function(e) {
  isLiveMode = false;
  btnLiveNow.classList.remove('active');
  updateTimeUI(parseInt(e.target.value, 10));
  render();
});

// Keyboard Left / Right arrow navigation for fine-tuning time
window.addEventListener('keydown', function(e) {
  if (document.activeElement === searchInput || document.activeElement === manualTimeInput) return;
  if (e.key === 'ArrowLeft') {
    isLiveMode = false;
    btnLiveNow.classList.remove('active');
    const newMins = Math.max(0, currentSelectedMinutes - 15);
    updateTimeUI(newMins);
    render();
  } else if (e.key === 'ArrowRight') {
    isLiveMode = false;
    btnLiveNow.classList.remove('active');
    const newMins = Math.min(1439, currentSelectedMinutes + 15);
    updateTimeUI(newMins);
    render();
  }
});

manualTimeInput.addEventListener('change', function(e) {
  const parsedMins = parseTime24hToMinutes(e.target.value);
  if (parsedMins !== null) {
    isLiveMode = false;
    btnLiveNow.classList.remove('active');
    updateTimeUI(parsedMins);
    render();
  }
});

manualTimeInput.addEventListener('input', function(e) {
  const parsedMins = parseTime24hToMinutes(e.target.value);
  if (parsedMins !== null) {
    isLiveMode = false;
    btnLiveNow.classList.remove('active');
    updateTimeUI(parsedMins);
    render();
  }
});

btnLiveNow.addEventListener('click', function() {
  setLiveTime();
});

dayButtons.forEach(function(btn) {
  btn.addEventListener('click', function() {
    isLiveMode = false;
    btnLiveNow.classList.remove('active');
    dayButtons.forEach(function(b) { b.classList.remove('active'); });
    btn.classList.add('active');
    currentSelectedDay = btn.getAttribute('data-day');
    render();
  });
});

presetButtons.forEach(function(btn) {
  btn.addEventListener('click', function() {
    isLiveMode = false;
    btnLiveNow.classList.remove('active');
    const min = parseInt(btn.getAttribute('data-time'), 10);
    updateTimeUI(min);
    render();
  });
});

searchInput.addEventListener('input', function(e) {
  currentSearchQuery = e.target.value.trim();
  if (searchClearBtn) {
    searchClearBtn.style.display = currentSearchQuery ? 'block' : 'none';
  }
  render();
});

if (searchClearBtn) {
  searchClearBtn.addEventListener('click', function() {
    searchInput.value = '';
    currentSearchQuery = '';
    searchClearBtn.style.display = 'none';
    searchInput.focus();
    render();
  });
}

if (sortSelect) {
  sortSelect.addEventListener('change', function(e) {
    currentSortMode = e.target.value;
    render();
  });
}

if (viewToggleBtn) {
  viewToggleBtn.addEventListener('click', function() {
    isListView = !isListView;
    spotsGrid.classList.toggle('list-view', isListView);
    viewToggleBtn.textContent = isListView ? '🗂️ Grid View' : '📋 List View';
  });
}

if (btnShare) {
  btnShare.addEventListener('click', function() {
    if (navigator.share) {
      navigator.share({
        title: 'LU Food Compass',
        text: 'Check what is open right now on campus!',
        url: window.location.href
      }).catch(function() {});
    } else {
      navigator.clipboard.writeText(window.location.href).then(function() {
        showToast("Link copied to clipboard! 📋");
      }).catch(function() {
        showToast("Compass is ready!");
      });
    }
  });
}

catPills.forEach(function(pill) {
  pill.addEventListener('click', function() {
    catPills.forEach(function(p) { p.classList.remove('active'); });
    pill.classList.add('active');
    currentCategoryFilter = pill.getAttribute('data-cat');
    render();
  });
});

// Initialization
setLiveTime();
updateHeaderClock();