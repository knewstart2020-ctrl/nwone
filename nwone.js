/* NWONE v1.0 - NuriWorks ONE Portal */

// === MENU CONFIG ===
var MENU = [
  { id:'dashboard', icon:'📊', label:'대시보드', group:null },
  { id:'merchant-search', icon:'🔍', label:'가맹점 조회', group:'가맹점' },
  { id:'merchant-register', icon:'➕', label:'신규 등록', group:'가맹점' },
  { id:'crm-edit', icon:'✏️', label:'CRM 정보 수정', group:'가맹점' },
  { id:'parking', icon:'🅿️', label:'주차검색', group:'가맹점' },
  { id:'counsel', icon:'📝', label:'상담이력', group:'가맹점' },
  { id:'schedule-register', icon:'📅', label:'일정등록', group:'일정관리' },
  { id:'schedule-dashboard', icon:'📋', label:'일정 대시보드', group:'일정관리' },
  { id:'schedule-report', icon:'📄', label:'익일리포트', group:'일정관리' },
  { id:'card-issue', icon:'📇', label:'카드발행', group:'일정관리' },
  { id:'complaint-status', icon:'🚨', label:'민원 현황', group:'민원관리' },
  { id:'complaint-dashboard', icon:'📊', label:'민원 대시보드', group:'민원관리' },
  { id:'kakao-inbox', icon:'💬', label:'카카오톡 수신', group:'민원관리' },
  { id:'sales-search', icon:'💰', label:'영업조회', group:'영업/계약' },
  { id:'estimate', icon:'📑', label:'견적서 발행', group:'영업/계약' },
  { id:'e-sign', icon:'✍️', label:'전자서명', group:'영업/계약' },
  { id:'contract-expiry', icon:'📆', label:'약정만기', group:'영업/계약' },
  { id:'equipment', icon:'🖥️', label:'장비 재고', group:'장비/물류' },
  { id:'used-terminal', icon:'♻️', label:'중고단말', group:'장비/물류' },
  { id:'visit-log', icon:'📒', label:'방문일지', group:'보고서' },
  { id:'daily-report', icon:'📊', label:'일일 보고서', group:'보고서' },
  { id:'weekly-report', icon:'📈', label:'주간/월간', group:'보고서' },
  { id:'staff', icon:'👥', label:'직원 관리', group:'관리' },
  { id:'emergency-sms', icon:'🚨', label:'긴급문자', group:'관리' },
  { id:'notice', icon:'📢', label:'공지사항', group:'관리' },
  { id:'settings', icon:'⚙️', label:'시스템 설정', group:'관리' }
];

// === STATE ===
var state = {
  active: 'dashboard',
  tabs: [{ id:'dashboard', label:'대시보드' }],
  collapsed: false,
  openGroups: {},
  timer: 7200,
  timerInterval: null,
  merchantDetail: null,
  detailTab: 0
};

// Initialize open groups
(function() {
  var groups = {};
  MENU.forEach(function(m) { if (m.group && !groups[m.group]) groups[m.group] = true; });
  state.openGroups = groups;
})();

// === LOGIN ===
function handleGoogleLogin() {
  var btn = document.getElementById('googleBtnText');
  btn.textContent = '연결 중...';
  setTimeout(function() {
    document.getElementById('loginStep1').style.display = 'none';
    document.getElementById('loginStep2').style.display = 'block';
    renderTotpInputs();
  }, 800);
}

function renderTotpInputs() {
  var wrap = document.getElementById('totpInputs');
  wrap.innerHTML = '';
  for (var i = 0; i < 6; i++) {
    var inp = document.createElement('input');
    inp.type = 'text';
    inp.inputMode = 'numeric';
    inp.maxLength = 1;
    inp.className = 'totp-input';
    inp.id = 'totp' + i;
    inp.setAttribute('data-idx', i);
    inp.addEventListener('input', handleTotpInput);
    inp.addEventListener('focus', function() { this.style.borderColor = '#F0B429'; });
    inp.addEventListener('blur', function() {
      if (!this.value) this.style.borderColor = '#e0e0e0';
    });
    wrap.appendChild(inp);
  }
  document.getElementById('totp0').focus();
}

function handleTotpInput(e) {
  var idx = parseInt(e.target.getAttribute('data-idx'));
  var val = e.target.value;
  if (val.length > 1) { e.target.value = val[0]; return; }
  if (val) {
    e.target.classList.add('filled');
    if (idx < 5) document.getElementById('totp' + (idx + 1)).focus();
  } else {
    e.target.classList.remove('filled');
  }
  var allFilled = true;
  for (var i = 0; i < 6; i++) {
    if (!document.getElementById('totp' + i).value) { allFilled = false; break; }
  }
  if (allFilled) setTimeout(doLogin, 400);
}

function doLogin() {
  document.getElementById('loginScreen').style.display = 'none';
  document.getElementById('appShell').classList.remove('hidden');
  renderSidebar();
  renderTabs();
  renderPage();
  startTimer();
}

function handleLogout() {
  document.getElementById('loginScreen').style.display = 'flex';
  document.getElementById('appShell').classList.add('hidden');
  document.getElementById('loginStep1').style.display = 'block';
  document.getElementById('loginStep2').style.display = 'none';
  document.getElementById('googleBtnText').textContent = 'Google 계정으로 로그인';
  clearInterval(state.timerInterval);
  state.timer = 7200;
}

// === SESSION TIMER ===
function startTimer() {
  state.timer = 7200;
  updateTimerDisplay();
  state.timerInterval = setInterval(function() {
    state.timer = Math.max(0, state.timer - 1);
    updateTimerDisplay();
  }, 1000);
}
function resetTimer() { state.timer = 7200; }
function updateTimerDisplay() {
  var m = Math.floor(state.timer / 60);
  var s = state.timer % 60;
  var el = document.getElementById('timerDisplay');
  if (el) el.textContent = String(m).padStart(2,'0') + ':' + String(s).padStart(2,'0');
}

// === SIDEBAR ===
function toggleSidebar() {
  state.collapsed = !state.collapsed;
  document.getElementById('sidebar').classList.toggle('collapsed', state.collapsed);
}

function renderSidebar() {
  var nav = document.getElementById('sidebarNav');
  var html = '';
  var currentGroup = null;

  MENU.forEach(function(m) {
    if (m.group !== currentGroup) {
      if (m.group) {
        var isOpen = state.openGroups[m.group];
        html += '<div class="sidebar-group-label" onclick="toggleGroup(\'' + m.group + '\')">';
        html += '<span>' + m.group + '</span>';
        html += '<span class="arrow' + (isOpen ? '' : ' closed') + '">▼</span></div>';
        html += '<div class="sidebar-group-items" id="group-' + m.group.replace(/[\/]/g, '-') + '"' +
                (isOpen ? '' : ' style="display:none"') + '>';
      }
      currentGroup = m.group;
    }

    var isActive = state.active === m.id;
    var cls = 'sidebar-item' + (m.group ? ' indent' : '') + (isActive ? ' active' : '');
    html += '<div class="' + cls + '" onclick="selectMenu(\'' + m.id + '\')">';
    html += '<span class="item-icon">' + m.icon + '</span>';
    html += '<span class="item-label">' + m.label + '</span>';
    html += '</div>';
  });

  // Close any open group divs
  var groups = {};
  MENU.forEach(function(m) { if (m.group) groups[m.group] = true; });
  var groupKeys = Object.keys(groups);
  var lastGroup = null;
  var result = '';
  currentGroup = null;

  MENU.forEach(function(m, idx) {
    if (m.group !== currentGroup) {
      if (currentGroup && currentGroup !== null) result += '</div>';
      currentGroup = m.group;
      if (m.group) {
        var isOpen = state.openGroups[m.group];
        var gid = m.group.replace(/[\/]/g, '-');
        result += '<div class="sidebar-group-label" onclick="toggleGroup(\'' + m.group + '\')">';
        result += '<span>' + m.group + '</span>';
        result += '<span class="arrow' + (isOpen ? '' : ' closed') + '">▼</span></div>';
        result += '<div id="group-' + gid + '"' + (isOpen ? '' : ' style="display:none"') + '>';
      }
    }

    var isActive = state.active === m.id;
    var cls = 'sidebar-item' + (m.group ? ' indent' : '') + (isActive ? ' active' : '');
    result += '<div class="' + cls + '" onclick="selectMenu(\'' + m.id + '\')">';
    result += '<span class="item-icon">' + m.icon + '</span>';
    result += '<span class="item-label">' + m.label + '</span>';
    result += '</div>';
  });
  if (currentGroup) result += '</div>';

  nav.innerHTML = result;
}

function toggleGroup(group) {
  state.openGroups[group] = !state.openGroups[group];
  renderSidebar();
}

function selectMenu(id) {
  state.active = id;
  state.merchantDetail = null;
  state.detailTab = 0;
  if (!state.tabs.find(function(t) { return t.id === id; })) {
    var item = MENU.find(function(m) { return m.id === id; });
    state.tabs.push({ id: id, label: item ? item.label : id });
  }
  renderSidebar();
  renderTabs();
  renderPage();
}

// === TAB BAR ===
function renderTabs() {
  var bar = document.getElementById('tabBar');
  var html = '';
  state.tabs.forEach(function(t) {
    var cls = 'tab-item' + (state.active === t.id ? ' active' : '');
    html += '<div class="' + cls + '" onclick="selectMenu(\'' + t.id + '\')">';
    html += t.label;
    if (t.id !== 'dashboard') {
      html += ' <span class="tab-close" onclick="event.stopPropagation();closeTab(\'' + t.id + '\')">×</span>';
    }
    html += '</div>';
  });
  bar.innerHTML = html;
}

function closeTab(id) {
  state.tabs = state.tabs.filter(function(t) { return t.id !== id; });
  if (state.active === id) {
    state.active = state.tabs[state.tabs.length - 1].id;
  }
  renderTabs();
  renderSidebar();
  renderPage();
}

// === PAGE ROUTING ===
function renderPage() {
  var content = document.getElementById('pageContent');
  switch (state.active) {
    case 'dashboard': content.innerHTML = renderDashboard(); break;
    case 'merchant-search': content.innerHTML = renderMerchantSearch(); break;
    default: content.innerHTML = renderPlaceholder(); break;
  }
}

// === HELPER ===
function badge(text, type) {
  var map = { '방문':'info', '원격':'warning', '대기':'danger', '처리중':'warning',
    '완료':'success', '예정':'info', '진행중':'warning', '긴급':'danger',
    '정상':'success', '스마트로':'info', '나이스':'info', 'KPN':'info' };
  var cls = 'badge-' + (map[type || text] || 'info');
  return '<span class="badge ' + cls + '">' + text + '</span>';
}

function getDateString() {
  var d = new Date();
  var dn = ['일','월','화','수','목','금','토'];
  return d.getFullYear() + '.' + String(d.getMonth()+1).padStart(2,'0') + '.' +
    String(d.getDate()).padStart(2,'0') + ' (' + dn[d.getDay()] + ')';
}

// === DASHBOARD PAGE ===
function renderDashboard() {
  var stats = [
    { label:'오늘 일정', value:'12', sub:'방문 8 / 원격 4', color:'var(--info)', icon:'📅' },
    { label:'민원 미처리', value:'3', sub:'평균 27분', color:'var(--danger)', icon:'🚨' },
    { label:'오늘 상담', value:'24', sub:'아톡 등록 100%', color:'var(--success)', icon:'📞' },
    { label:'카카오톡', value:'5', sub:'응답대기 2건', color:'var(--warning)', icon:'💬' }
  ];
  var schedules = [
    { w:'김기택', s:'밴스성형외과', t:'10~11', st:'예정' },
    { w:'조성우', s:'자반고천안동남점', t:'13~14', st:'예정' },
    { w:'허지호', s:'김밥천국상봉점', t:'시간무관', st:'진행중' },
    { w:'이영규', s:'카페산', t:'14~15', st:'완료' }
  ];
  var complaints = [
    { s:'맛칼국수', c:'메뉴수정 요청', t:'12분', st:'대기' },
    { s:'경성술집', c:'IC인식불량', t:'8분', st:'처리중' },
    { s:'학돌이네', c:'서명완료 확인', t:'', st:'완료' }
  ];
  var notices = [
    { title:'[긴급] 스마트로 전산 점검 안내 (04/17)', date:'04-16', urgent:true },
    { title:'2026년 2분기 프로모션 안내', date:'04-15', urgent:false },
    { title:'카카오톡 비즈니스 연동 완료 공지', date:'04-15', urgent:false },
    { title:'방문일지 웹폼 업데이트 예정', date:'04-14', urgent:false }
  ];
  var chartData = [
    {d:'4/10',a:3,b:2},{d:'4/11',a:5,b:1},{d:'4/12',a:2,b:3},
    {d:'4/13',a:4,b:2},{d:'4/14',a:7,b:3},{d:'4/15',a:11,b:4},{d:'4/16',a:0,b:0}
  ];
  var maxV = Math.max.apply(null, chartData.map(function(d){return d.a+d.b;})) || 1;

  var h = '';
  // Header
  h += '<div class="page-header"><div>';
  h += '<div class="page-title">대시보드</div>';
  h += '<div class="page-date">' + getDateString() + ' · 누리네트웍스</div></div>';
  h += '<div class="btn-group">';
  h += '<button class="btn btn-primary" onclick="selectMenu(\'schedule-register\')">일정등록</button>';
  h += '<button class="btn btn-outline" onclick="selectMenu(\'merchant-search\')">가맹점조회</button>';
  h += '<button class="btn btn-outline" onclick="selectMenu(\'complaint-status\')">민원현황</button>';
  h += '</div></div>';

  // Stats
  h += '<div class="stats-grid">';
  stats.forEach(function(s) {
    h += '<div class="stat-card" style="border-left-color:' + s.color + '">';
    h += '<div class="stat-card-header"><span class="stat-label">' + s.label + '</span>';
    h += '<span class="stat-icon">' + s.icon + '</span></div>';
    h += '<div class="stat-value" style="color:' + s.color + '">' + s.value + '</div>';
    h += '<div class="stat-sub">' + s.sub + '</div></div>';
  });
  h += '</div>';

  // Schedule + Complaints
  h += '<div class="grid-2">';
  h += '<div class="card"><div class="card-header"><span class="card-title">오늘 일정</span>';
  h += '<span class="card-link" onclick="selectMenu(\'schedule-dashboard\')">전체보기 →</span></div>';
  schedules.forEach(function(s) {
    h += '<div class="list-item"><div style="display:flex;align-items:center">';
    h += '<div class="list-dot" style="background:var(--info)"></div>';
    h += '<div><div class="list-primary">' + s.s + '</div>';
    h += '<div class="list-secondary">' + s.w + ' · ' + s.t + '</div></div></div>';
    h += '<div class="list-right">' + badge(s.st) + '</div></div>';
  });
  h += '</div>';

  h += '<div class="card"><div class="card-header"><span class="card-title">민원 처리 현황</span>';
  h += '<span class="card-link" onclick="selectMenu(\'complaint-status\')">전체보기 →</span></div>';
  complaints.forEach(function(c) {
    h += '<div class="list-item"><div><div class="list-primary">' + c.s + '</div>';
    h += '<div class="list-secondary">' + c.c + '</div></div>';
    h += '<div class="list-right">';
    if (c.st !== '완료' && c.t) h += '<span class="list-time">' + c.t + '</span>';
    h += badge(c.st) + '</div></div>';
  });
  h += '</div></div>';

  // Chart + Notices
  h += '<div class="grid-2">';
  h += '<div class="card"><div class="card-header"><span class="card-title">주간 설치 현황</span>';
  h += '<div class="btn-group"><button class="btn btn-sm btn-secondary">주별</button>';
  h += '<button class="btn btn-sm btn-ghost">월별</button></div></div>';
  h += '<div class="chart-bar-wrap" style="height:130px">';
  chartData.forEach(function(d) {
    var hA = Math.max(2, (d.a / maxV) * 100);
    var hB = Math.max(2, (d.b / maxV) * 100);
    h += '<div class="chart-col">';
    h += '<div class="chart-bar navy" style="height:' + hA + 'px"></div>';
    h += '<div class="chart-bar orange" style="height:' + hB + 'px"></div>';
    h += '<span class="chart-label">' + d.d + '</span></div>';
  });
  h += '</div>';
  h += '<div class="chart-legend">';
  h += '<div class="chart-legend-item"><div class="chart-legend-dot" style="background:var(--navy)"></div>방문</div>';
  h += '<div class="chart-legend-item"><div class="chart-legend-dot" style="background:var(--orange)"></div>원격</div>';
  h += '</div></div>';

  h += '<div class="card"><div class="card-header"><span class="card-title">공지사항</span>';
  h += '<span class="card-link" onclick="selectMenu(\'notice\')">더보기 →</span></div>';
  notices.forEach(function(n) {
    h += '<div class="notice-item"><div class="notice-title' + (n.urgent ? ' urgent' : '') + '">' + n.title + '</div>';
    h += '<span class="notice-date">' + n.date + '</span></div>';
  });
  h += '</div></div>';

  // Map
  h += '<div class="card"><div class="card-header"><span class="card-title">방문 지도</span></div>';
  h += '<div class="map-placeholder">카카오맵 SDK — 오늘 방문 가맹점 핀 표시 + 최적 경로</div></div>';

  return h;
}

// === MERCHANT SEARCH ===
function renderMerchantSearch() {
  if (state.merchantDetail !== null) return renderMerchantDetail();

  var sampleData = [
    ['1','509-30-01823','밴스성형외과의원','서울 강남구','스마트로','3,200','정상'],
    ['2','123-45-67890','김밥천국원흥점','경기 고양시','나이스','1,800','정상'],
    ['3','234-56-78901','카페산(안재철)','서울 마포구','KPN','950','정상'],
    ['4','345-67-89012','경성술집진천역점','충북 진천군','스마트로','2,500','정상'],
    ['5','456-78-90123','학돌이네금호점','서울 성동구','나이스','1,200','정상']
  ];

  var h = '';
  h += '<div class="page-header"><div class="page-title">가맹점 조회</div>';
  h += '<div class="btn-group">';
  h += '<button class="btn btn-primary">조회</button>';
  h += '<button class="btn btn-secondary">엑셀</button>';
  h += '<button class="btn btn-ghost">초기화</button>';
  h += '</div></div>';

  // Filters
  h += '<div class="filter-box"><div class="filter-grid">';
  h += filterRow('상호', '<input class="filter-input" placeholder="상호명 입력">', true);
  h += filterRow('사업자번호', '<input class="filter-input" placeholder="사업자번호 입력">');
  h += filterRow('전화번호', '<input class="filter-input" placeholder="전화번호 입력">');
  h += filterRow('VAN', '<select class="filter-select"><option>전체</option><option>스마트로</option><option>나이스</option><option>KPN</option></select>');
  h += filterRow('지역', '<select class="filter-select"><option>전체</option><option>서울</option><option>경기</option><option>충청</option></select>');
  h += filterRow('상태', '<select class="filter-select"><option>전체</option><option>정상</option><option>해지</option><option>휴업</option></select>');
  h += '</div></div>';

  // Table
  h += '<div class="card"><div class="table-wrap"><table>';
  h += '<thead><tr><th>No</th><th>사업자번호</th><th>상호</th><th>지역</th><th>VAN</th><th>TR</th><th>상태</th></tr></thead>';
  h += '<tbody>';
  sampleData.forEach(function(row, idx) {
    h += '<tr>';
    row.forEach(function(cell, j) {
      if (j === 2) {
        h += '<td><span class="td-link" onclick="openMerchantDetail(' + idx + ')">' + cell + '</span></td>';
      } else if (j === 6) {
        h += '<td>' + badge(cell) + '</td>';
      } else {
        h += '<td>' + cell + '</td>';
      }
    });
    h += '</tr>';
  });
  h += '</tbody></table></div>';
  h += renderPagination(5638);
  h += '</div>';
  return h;
}

function filterRow(label, input, req) {
  return '<div class="filter-row"><span class="filter-label">' +
    (req ? '<span class="req">*</span>' : '') + label + '</span>' + input + '</div>';
}

function renderPagination(total) {
  var h = '<div class="pagination"><span class="page-info">총 ' + total.toLocaleString() + ' 건</span>';
  h += '<div class="page-btns">';
  h += '<button class="page-btn">⏮</button><button class="page-btn">⏪</button>';
  for (var i = 1; i <= 5; i++) {
    h += '<button class="page-btn' + (i===1?' active':'') + '">' + i + '</button>';
  }
  h += '<button class="page-btn">⏩</button><button class="page-btn">⏭</button>';
  h += '</div></div>';
  return h;
}

// === MERCHANT DETAIL ===
function openMerchantDetail(idx) {
  state.merchantDetail = idx;
  state.detailTab = 0;
  renderPage();
}

function setDetailTab(idx) {
  state.detailTab = idx;
  renderPage();
}

function renderMerchantDetail() {
  var sample = { name:'밴스성형외과의원', biz:'509-30-01823', ceo:'김영희', tel:'02-1234-5678',
    mobile:'010-9876-5432', addr:'서울 강남구 논현로 123 4층', van:'스마트로', tr:'3,200',
    unit:'15,000', sales:'4,800만', parking:'건물 지하 2시간 무료', hw:'N250 1대', sw:'업포스',
    code:'SM-12345', worker:'김기택', installer:'이영규', contract:'2024-06-01 ~ 2026-05-31',
    cms:'20,000원/월', memo:'주말 운영 안 함. 오전 10시 이후 방문 가능' };

  var tabs = ['기본정보','거래이력','계약정보','상담이력','장비정보'];
  var h = '';

  // Header
  h += '<div class="page-header"><div style="display:flex;align-items:center;gap:12px">';
  h += '<button class="btn btn-outline btn-sm" onclick="state.merchantDetail=null;renderPage()">← 목록</button>';
  h += '<span class="page-title">' + sample.name + '</span>';
  h += badge('정상') + ' ' + badge('스마트로');
  h += '</div><div class="btn-group">';
  h += '<button class="btn btn-primary btn-sm">상담등록</button>';
  h += '<button class="btn btn-outline btn-sm">일정등록</button>';
  h += '<button class="btn btn-outline btn-sm">주차검색</button>';
  h += '<button class="btn btn-outline btn-sm">견적서</button>';
  h += '<button class="btn btn-outline btn-sm">계약서</button>';
  h += '</div></div>';

  // Tabs
  h += '<div class="detail-tabs">';
  tabs.forEach(function(tab, i) {
    h += '<div class="detail-tab' + (state.detailTab===i?' active':'') + '" onclick="setDetailTab(' + i + ')">' + tab + '</div>';
  });
  h += '</div>';

  // Tab Content
  h += '<div class="detail-content">';
  if (state.detailTab === 0) {
    h += '<div class="info-grid">';
    var fields = [
      ['사업자번호',sample.biz],['대표자',sample.ceo],['상호',sample.name],['전화번호',sample.tel],
      ['주소',sample.addr],['휴대폰',sample.mobile],['VAN',sample.van],['전산코드',sample.code],
      ['카드TR',sample.tr],['객단가',sample.unit],['월매출',sample.sales],['영업자',sample.worker],
      ['주차',sample.parking],['설치자',sample.installer],['CMS',sample.cms],['메모',sample.memo]
    ];
    fields.forEach(function(f) {
      h += '<div class="info-row"><span class="info-label">' + f[0] + '</span>';
      h += '<span class="info-value">' + f[1] + '</span></div>';
    });
    h += '</div>';
  } else if (state.detailTab === 1) {
    h += '<div class="table-wrap"><table><thead><tr>';
    ['No','거래일시','구분','카드사','금액','승인번호','상태'].forEach(function(c){h+='<th>'+c+'</th>';});
    h += '</tr></thead><tbody>';
    [['1','2026-04-15 14:32','승인','삼성','45,000','12345678','정상'],
     ['2','2026-04-15 13:15','승인','현대','32,000','87654321','정상'],
     ['3','2026-04-14 16:45','취소','KB','-28,000','11223344','취소'],
     ['4','2026-04-14 11:20','승인','신한','55,000','99887766','정상']
    ].forEach(function(r){h+='<tr>';r.forEach(function(c){h+='<td>'+c+'</td>';});h+='</tr>';});
    h += '</tbody></table></div>' + renderPagination(156);
  } else if (state.detailTab === 2) {
    h += '<div class="info-grid">';
    [['약정기간',sample.contract],['CMS 금액',sample.cms],['수수료율','1.5% (일반)'],
     ['할부 수수료','2~3개월 무이자'],['만기일','2026-05-31'],['재계약 여부','미정']
    ].forEach(function(f){h+='<div class="info-row"><span class="info-label">'+f[0]+'</span><span class="info-value">'+f[1]+'</span></div>';});
    h += '</div>';
  } else if (state.detailTab === 3) {
    h += '<div class="table-wrap"><table><thead><tr>';
    ['No','날짜','상담내용','상담자','유형','상태'].forEach(function(c){h+='<th>'+c+'</th>';});
    h += '</tr></thead><tbody>';
    [['1','2026-04-15 10:38','단말기 할부설정 완료','강길봉','call','성공'],
     ['2','2026-04-10 14:20','메뉴 수정 요청 처리','신보람','call','성공'],
     ['3','2026-04-02 09:15','영수증 발급 문의','김진근','sms','성공']
    ].forEach(function(r){h+='<tr>';r.forEach(function(c){h+='<td>'+c+'</td>';});h+='</tr>';});
    h += '</tbody></table></div>' + renderPagination(8);
  } else if (state.detailTab === 4) {
    h += '<div class="table-wrap"><table><thead><tr>';
    ['No','장비명','시리얼번호','설치일','상태'].forEach(function(c){h+='<th>'+c+'</th>';});
    h += '</tr></thead><tbody>';
    [['1','N250 포스','N250-2024-00123','2024-06-15','정상'],
     ['2','토스프론트','TF-2024-00456','2024-06-15','정상'],
     ['3','SLK-TS100 프린터','SLK-2024-00789','2024-06-15','정상']
    ].forEach(function(r){h+='<tr>';r.forEach(function(c){h+='<td>'+c+'</td>';});h+='</tr>';});
    h += '</tbody></table></div>' + renderPagination(3);
  }
  h += '</div>';
  return h;
}

// === PLACEHOLDER ===
function renderPlaceholder() {
  var item = MENU.find(function(m) { return m.id === state.active; });
  var label = item ? item.label : state.active;
  return '<div class="empty-state"><div class="empty-icon">🚧</div>' +
    '<div class="empty-title">' + label + '</div>' +
    '<div class="empty-desc">개발 예정입니다.</div></div>';
}
