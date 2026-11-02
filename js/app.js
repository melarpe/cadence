/* Cadence · UI (v2)
 * Plain JavaScript, no build step. Each view returns an HTML string; clicks are handled
 * by one delegated listener that reads data-action attributes. */
(function () {
  'use strict';

  // ================================================================ helpers
  const $ = (sel, root = document) => root.querySelector(sel);
  const S = () => Store.state;
  const lang = () => Store.lang();
  const tpl = () => TEMPLATES[S().settings.template] || TEMPLATES.generic;

  /** Text lookup: template wording first ("Encargos"), then the language file. */
  const t = (key, ...args) => {
    const termed = tpl().terms?.[lang()]?.[key];
    const v = termed ?? (I18N[lang()] || I18N.es)[key] ?? I18N.es[key];
    return typeof v === 'function' ? v(...args) : (v ?? key);
  };
  const esc = (v) => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const label = (item) => item ? (item[lang()] || item.es || item.en || '') : '';
  const mod = (name) => !!S().settings.modules?.[name];
  const bizMoney = () => S().settings.modules?.finance === 'business';
  const personalMoney = () => S().settings.modules?.finance === 'personal';

  // dates are local YYYY-MM-DD strings (never UTC, so 8 pm in Bogotá is still "today")
  const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const today = () => iso(new Date());
  const parse = (s) => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
  const addDays = (s, n) => { const d = parse(s); d.setDate(d.getDate() + n); return iso(d); };
  const diffDays = (a, b) => Math.round((parse(b) - parse(a)) / 86400000);
  const monthKey = (s) => (s || '').slice(0, 7);
  const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
  const fmtDate = (s, opts = { weekday: 'short', day: 'numeric', month: 'short' }) => s ? parse(s).toLocaleDateString(t('locale'), opts) : '';
  const fmtMonth = (key) => { const [y, m] = key.split('-').map(Number); return cap(new Date(y, m - 1, 1).toLocaleDateString(t('locale'), { month: 'long', year: 'numeric' })); };
  const shiftMonth = (key, n) => { const [y, m] = key.split('-').map(Number); const d = new Date(y, m - 1 + n, 1); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`; };
  const money = (n, compact = false) => {
    try {
      return new Intl.NumberFormat(t('locale'), {
        style: 'currency', currency: S().settings.currency,
        maximumFractionDigits: compact ? 1 : (['COP', 'CLP'].includes(S().settings.currency) ? 0 : 2),
        notation: compact ? 'compact' : 'standard'
      }).format(Number(n) || 0);
    } catch (e) { return String(n); }
  };
  /** Accepts "1.500.000", "1,500,000", "1500000" or "1.500,50". */
  const num = (v) => {
    let s = String(v ?? '').trim().replace(/[^\d.,-]/g, '');
    if (!s) return 0;
    const lastSep = Math.max(s.lastIndexOf('.'), s.lastIndexOf(','));
    const decimals = lastSep >= 0 ? s.length - lastSep - 1 : 0;
    if (lastSep >= 0 && decimals > 0 && decimals <= 2) s = s.slice(0, lastSep).replace(/[.,]/g, '') + '.' + s.slice(lastSep + 1);
    else s = s.replace(/[.,]/g, '');
    return Number(s) || 0;
  };
  const sum = (arr, f = (x) => x) => arr.reduce((a, x) => a + (Number(f(x)) || 0), 0);

  // ================================================================ domain
  const stages = () => S().settings.stages;
  const finalStageId = () => stages()[stages().length - 1]?.id;
  const stageOf = (p) => stages().find(s => s.id === p.stage) || stages()[0];
  const isClosed = (p) => stageOf(p)?.id === finalStageId();
  const clientName = (id) => Store.client(id)?.name || '—';
  const incomesOf = (refId) => S().incomes.filter(x => x.refId === refId);
  const paidOf = (refId) => sum(incomesOf(refId), x => x.amount);
  const balance = (p) => Number(p.total || 0) - paidOf(p.id);
  const INCOME_TYPES = ['project', 'salary', 'event', 'sale', 'recurring', 'other'];
  const typeEnabled = (type) => ({ project: bizMoney(), salary: personalMoney(), other: mod('finance'), event: bizMoney() && mod('events'), sale: bizMoney() && mod('inventory'), recurring: bizMoney() && mod('recurring') }[type]);
  const typeLabel = (type) => t('type_' + type);

  /** Second line under a deliverable: project and client, or just what makes sense. */
  const delivSub = (d, p) => [d.title !== p.title ? p.title : '', mod('clients') && p.clientId ? clientName(p.clientId) : '', d.title === p.title && !(mod('clients') && p.clientId) ? label(stageOf(p)) : ''].filter(Boolean).join(' · ');

  function nextDeliverable(p) {
    return (p.deliverables || []).filter(d => !d.done && d.date).sort((a, b) => a.date.localeCompare(b.date))[0];
  }

  function allDeliverables({ pendingOnly = false } = {}) {
    const out = [];
    S().projects.forEach(p => (p.deliverables || []).forEach(d => {
      if (!d.date) return;
      const done = d.done || isClosed(p);
      if (pendingOnly && done) return;
      out.push({ ...d, done, project: p });
    }));
    return out.sort((a, b) => a.date.localeCompare(b.date));
  }

  // recurring income (sponsorships, retainers)
  const monthEnd = (mk) => iso(new Date(+mk.slice(0, 4), +mk.slice(5, 7), 0));
  const sessionsIn = (group, mk) => S().sessions.filter(s => (s.group || '') === (group || '') && monthKey(s.date) === mk);
  function dueFor(a, mk) {
    if (!a.active || (a.startDate && a.startDate > monthEnd(mk))) return 0;
    if (a.frequency === 'per_session') return sessionsIn(a.group, mk).length * Number(a.amount || 0);
    return Number(a.amount || 0);
  }
  const paidFor = (a, mk) => sum(S().incomes.filter(x => x.type === 'recurring' && x.refId === a.id && monthKey(x.date) === mk), x => x.amount);
  function statusFor(a, mk) {
    const due = dueFor(a, mk), paid = paidFor(a, mk);
    if (!due) return { key: paid ? 'paid' : 'none', due, paid, missing: 0 };
    if (paid >= due) return { key: 'paid', due, paid, missing: 0 };
    return { key: paid > 0 ? 'partial' : 'pending', due, paid, missing: due - paid };
  }
  const recurringPending = (mk) => mod('recurring') && bizMoney()
    ? S().recurring.map(a => ({ a, st: statusFor(a, mk) })).filter(x => x.st.missing > 0) : [];

  const eventBalance = (e) => Math.max(0, Number(e.total || 0) - paidOf(e.id));

  function monthStats(mk) {
    const inc = S().incomes.filter(x => monthKey(x.date) === mk);
    const byType = {}; INCOME_TYPES.forEach(k => { byType[k] = sum(inc.filter(x => x.type === k), x => x.amount); });
    const received = sum(inc, x => x.amount);
    const spent = sum(S().expenses.filter(e => monthKey(e.date) === mk), e => e.amount);
    const pending = !bizMoney() ? 0 : sum(S().projects, p => Math.max(0, balance(p)))
      + (mod('events') ? sum(S().events, eventBalance) : 0)
      + sum(recurringPending(monthKey(today())), x => x.st.missing);
    return { received, spent, profit: received - spent, pending, byType };
  }

  // ================================================================ icons
  const ICON = {
    home: '<path d="M3 11.5 12 4l9 7.5"/><path d="M5 10v10h14V10"/>',
    calendar: '<rect x="3.5" y="5" width="17" height="15" rx="2"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
    projects: '<rect x="3.5" y="4" width="5" height="16" rx="1.5"/><rect x="10" y="4" width="5" height="11" rx="1.5"/><rect x="16.5" y="4" width="4" height="7" rx="1.5"/>',
    clients: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.8-3.6 3.4-5.5 6.5-5.5s5.7 1.9 6.5 5.5"/><path d="M16 4.6a3.5 3.5 0 0 1 0 6.8M18 14.8c2 .7 3.2 2.5 3.6 5.2"/>',
    finance: '<path d="M4 20V10M10 20V4M16 20v-7M21 20H3"/>',
    recurring: '<path d="M20 11a8 8 0 0 0-14.3-4.9L4 8M4 4v4h4M4 13a8 8 0 0 0 14.3 4.9L20 16M20 20v-4h-4"/>',
    events: '<path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.3-4.1 5.9-.9z"/>',
    inventory: '<rect x="3.5" y="4.5" width="17" height="15" rx="1.5"/><path d="m3.5 16 5-5 4 4 3-3 5 5"/><circle cx="15.5" cy="8.5" r="1.5"/>',
    more: '<circle cx="5.5" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="18.5" cy="12" r="1.6"/>',
    help: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9.3a2.6 2.6 0 0 1 5 .9c0 1.7-2.5 2.2-2.5 3.8M12 17.2v.01"/>',
    settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
    alert: '<path d="M12 3.5 2.5 20h19z"/><path d="M12 10v4.5M12 17.5v.01"/>',
    clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
    cal_add: '<rect x="3.5" y="5" width="17" height="15" rx="2"/><path d="M3.5 10h17M8 3v4M16 3v4M12 13v5M9.5 15.5h5"/>',
    chevL: '<path d="m15 5-7 7 7 7"/>', chevR: '<path d="m9 5 7 7-7 7"/>',
    close: '<path d="M6 6l12 12M18 6 6 18"/>',
    money: '<rect x="2.5" y="6" width="19" height="12" rx="2"/><circle cx="12" cy="12" r="2.5"/>',
    receipt: '<path d="M6 3h12v18l-3-2-3 2-3-2-3 2z"/><path d="M9 8h6M9 12h6"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c1-4 4-6 8-6s7 2 8 6"/>',
    download: '<path d="M12 4v11M7 10l5 5 5-5M5 20h14"/>',
    whatsapp: '<path d="M4 20l1.3-4A8 8 0 1 1 8 18.8z"/>',
    mail: '<rect x="3" y="5.5" width="18" height="13" rx="2"/><path d="m3.5 7 8.5 6 8.5-6"/>',
    pin: '<path d="M12 21s-6.5-6-6.5-11a6.5 6.5 0 0 1 13 0c0 5-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.3"/>',
    cloud: '<path d="M7 18.5h10.5a4 4 0 0 0 .4-8 6 6 0 0 0-11.5 1.6A3.3 3.3 0 0 0 7 18.5z"/>',
    tag: '<path d="M3.5 12.5V4.5h8l9 9-8 8z"/><circle cx="8" cy="9" r="1.4"/>',
    brush: '<path d="M14.5 4.5l5 5-8 8-5-5z"/><path d="M6.5 12.5c-2 0-3 1.5-3 3.5 0 1.5-.5 2.5-1 3 3 0 6.5-.5 6.5-4"/>'
  };
  const icon = (name, size = 20) =>
    `<svg class="ico" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICON[name] || ''}</svg>`;

  /** The "?" button: opens a plain-language explanation with an example. */
  const helpBtn = (key) => `<button type="button" class="help-btn" data-action="help" data-key="${key}" aria-label="${esc(t('whatIsThis'))}">?</button>`;

  // ================================================================ device
  const PLATFORM = (() => {
    const ua = navigator.userAgent || '';
    if (/iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1)) return 'ios';
    if (/Android/.test(ua)) return 'android';
    if (/Windows/.test(ua)) return 'windows';
    if (/Macintosh|Mac OS X/.test(ua)) return 'mac';
    return 'other';
  })();
  const PLATFORM_GUIDE = { ios: 'iphone', android: 'android', windows: 'windows', mac: 'mac', other: 'windows' }[PLATFORM];
  const isStandalone = () => !!(window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) || navigator.standalone === true;
  let installPrompt = null; // Chrome / Edge (Android, Windows): one-tap install
  const lsGet = (k) => { try { return localStorage.getItem(k); } catch (e) { return null; } };
  const lsSet = (k, v) => { try { localStorage.setItem(k, v); } catch (e) { /* ignore */ } };
  const CAL_KEY = 'cadence:calendar';            // per device: 'google' | 'device'
  const calPref = () => lsGet(CAL_KEY);
  const PRIVACY_VERSION = '2026-11';

  // ================================================================ UI state
  const ui = {
    view: 'home', calMonth: monthKey(today()), calDay: today(), finMonth: monthKey(today()), recMonth: monthKey(today()),
    projSearch: '', projClient: '', invFilter: 'all', showTable: false
  };

  // ================================================================ navigation
  function navItems() {
    return [
      { v: 'home', show: 'both' }, { v: 'calendar', show: 'both' }, { v: 'projects', show: 'both' },
      { v: 'recurring', show: mod('recurring') ? 'desk' : 'none' }, { v: 'events', show: mod('events') ? 'desk' : 'none' },
      { v: 'inventory', show: mod('inventory') ? 'desk' : 'none' }, { v: 'clients', show: mod('clients') ? 'desk' : 'none' },
      { v: 'finance', show: mod('finance') ? 'both' : 'none' }, { v: 'events', show: !mod('finance') && mod('events') ? 'mobile' : 'none' },
      { v: 'more', show: 'mobile' }, { v: 'help', show: 'desk' }, { v: 'settings', show: 'desk' }
    ].filter(x => x.show !== 'none');
  }
  const VIEWS = ['home', 'calendar', 'projects', 'recurring', 'events', 'inventory', 'clients', 'finance', 'more', 'help', 'settings', 'privacy'];
  const moreViews = ['recurring', 'events', 'inventory', 'clients', 'help', 'settings'];
  const inBottomNav = (v) => navItems().some(x => x.v === v && (x.show === 'both' || x.show === 'mobile'));

  function renderShell() {
    document.documentElement.lang = lang();
    const cur = ui.view === 'privacy' ? 'settings' : ui.view;
    const active = moreViews.includes(cur) && !inBottomNav(cur) ? ['more', cur] : [cur];
    $('#nav').innerHTML = navItems().map(({ v, show }) => `
      <a href="#${v}" class="nav-item ${show === 'desk' ? 'desk-only' : show === 'mobile' ? 'mobile-only' : ''} ${v === 'help' ? 'nav-help' : ''} ${active.includes(v) ? 'active' : ''}" data-nav="${v}" ${active.includes(v) ? 'aria-current="page"' : ''}>
        ${icon(v, 22)}<span>${esc(t('nav_' + v))}</span>
      </a>`).join('');
    const sp = Store.space();
    $('#space-btn').innerHTML = sp && Store.hasSpaces() ? `<span>${tpl().icon} ${esc(sp.name)}</span><span class="caret" aria-hidden="true">▾</span>` : `<span>${esc(t('appTagline'))}</span>`;
    $('#space-btn').setAttribute('aria-label', `${t('switchSpace')}: ${sp?.name || ''}`);
    $('#space-btn').disabled = !Store.hasSpaces();
    $('#fab').setAttribute('aria-label', t('quickAdd'));
    $('#fab').innerHTML = icon('plus', 26);
    $('#top-help').setAttribute('aria-label', t('nav_help'));
    $('#top-help').innerHTML = icon('help', 22);
    $('#settings-btn').setAttribute('aria-label', t('nav_settings'));
    $('#settings-btn').innerHTML = icon('settings', 22);
    const cs = $('#cloud-status');
    if (Cloud.user) {
      cs.hidden = false;
      cs.className = 'cloud-status ' + Cloud.status;
      cs.innerHTML = icon('cloud', 20);
      cs.title = cs.ariaLabel = t('cloud_' + Cloud.status);
    } else cs.hidden = true;
  }

  function render() {
    renderShell();
    const views = { home: viewHome, calendar: viewCalendar, projects: viewProjects, recurring: viewRecurring, events: viewEvents, inventory: viewInventory, clients: viewClients, finance: viewFinance, more: viewMore, help: viewHelp, settings: viewSettings, privacy: viewPrivacy };
    if (['recurring', 'events', 'inventory', 'clients', 'finance'].includes(ui.view) && !mod(ui.view)) ui.view = 'home';
    if (!Store.hasSpaces() && ui.view !== 'privacy') { main0(); return; }
    const main = $('#view');
    main.innerHTML = (S().settings.demo ? demoBanner() : '') + (views[ui.view] || viewHome)();
    main.dataset.view = ui.view;
    $('#fab').hidden = ['settings', 'help', 'more', 'privacy'].includes(ui.view) || !Store.hasSpaces();
    if (ui.view === 'projects') enableDragAndDrop();
  }

  const demoBanner = () => `
    <div class="demo-banner">${icon('alert', 16)}<span>${t('demoBanner')}</span>
      <button class="link small" data-action="leave-demo">${t('leaveDemo')}</button></div>`;

  const pageHead = (title, helpKey, actions = '', eyebrow = '') => `
    <div class="page-head">
      <div>${eyebrow ? `<p class="eyebrow">${esc(eyebrow)}</p>` : ''}<h1>${esc(title)} ${helpKey ? helpBtn(helpKey) : ''}</h1></div>
      ${actions ? `<div class="btn-row wrap">${actions}</div>` : ''}
    </div>`;

  const emptyState = (iconName, title, text, actionHtml = '') => `
    <div class="empty">
      <div class="empty-icon">${icon(iconName, 30)}</div>
      <h3>${esc(title)}</h3><p>${esc(text)}</p>${actionHtml}
    </div>`;

  // ================================================================ HOME
  function deliveryRow(d, kind) {
    const p = d.project;
    const delta = diffDays(today(), d.date);
    const when = kind === 'overdue' ? t('daysLate', -delta) : kind === 'today' ? t('today') : `${fmtDate(d.date)} · ${t('inDays', delta)}`;
    return `
      <li class="row ${kind}">
        <button class="tick" data-action="toggle-deliverable" data-project="${p.id}" data-id="${d.id}" aria-label="${t('markDone')}" title="${t('markDone')}">${icon('check', 16)}</button>
        <button class="row-main" data-action="edit-project" data-id="${p.id}">
          <span class="row-title">${esc(d.title)}</span>
          <span class="row-sub">${esc(delivSub(d, p))}</span>
        </button>
        <span class="row-meta ${kind}">${kind === 'overdue' ? icon('alert', 14) : icon('clock', 14)} ${when}</span>
        <button class="icon-btn" data-action="ics-one" data-project="${p.id}" data-id="${d.id}" aria-label="${t('addToCalendar')}" title="${t('addToCalendar')}">${icon('cal_add', 18)}</button>
      </li>`;
  }

  function eventRow(e, kind) {
    const delta = diffDays(today(), e.date);
    const when = kind === 'today' ? t('today') : `${fmtDate(e.date)} · ${t('inDays', delta)}`;
    return `
      <li class="row event ${kind}">
        <span class="tick event-dot" aria-hidden="true">${icon('events', 15)}</span>
        <button class="row-main" data-action="edit-event" data-id="${e.id}">
          <span class="row-title">${esc(e.title)}</span>
          <span class="row-sub">${esc(eventTypeLabel(e.type))}${e.place ? ' · ' + esc(e.place) : ''}${e.time ? ' · ' + esc(e.time) : ''}</span>
        </button>
        <span class="row-meta ${kind}">${icon('clock', 14)} ${when}</span>
        <button class="icon-btn" data-action="ics-event" data-id="${e.id}" aria-label="${t('addToCalendar')}" title="${t('addToCalendar')}">${icon('cal_add', 18)}</button>
      </li>`;
  }

  // Install invitation on Home (Android/Windows: one tap; iPhone: link to the guide)
  function installBanner() {
    if (isStandalone() || lsGet('cadence:installDismissed')) return '';
    if (!installPrompt && PLATFORM !== 'ios') return '';
    return `
      <section class="card install-banner">
        <img src="icons/icon.svg" alt="" width="40" height="40">
        <div class="ib-text"><strong>${t('installBannerTitle')}</strong><small>${t('installBannerText')}</small></div>
        <div class="btn-row">
          ${installPrompt ? `<button class="btn small" data-action="install-app">${t('installBtn')}</button>` : `<button class="btn small" data-action="open-guide" data-id="iphone">${t('installHowTo')}</button>`}
          <button class="link small" data-action="dismiss-install">${t('dismiss')}</button>
        </div>
      </section>`;
  }

  // Home header: date · greeting + current space · one-line summary of what needs attention
  function homeHead(name, nOverdue, nToday, hasUpcoming) {
    const h = new Date().getHours();
    const greet = t(h < 12 ? 'greetMorning' : h < 19 ? 'greetAfternoon' : 'greetEvening') + (name ? ', ' + name : '');
    const summary = Store.isEmpty() ? t('sumStart') : t('summary', nOverdue, nToday);
    const sp = Store.space();
    const actions = hasUpcoming ? `<button class="btn ghost small" data-action="ics-all">${icon('cal_add', 18)} <span class="hide-sm">${t('exportUpcomingIcs')}</span></button>` : '';
    return `
    <div class="page-head home-head">
      <div>
        <p class="eyebrow">${esc(cap(new Date().toLocaleDateString(t('locale'), { weekday: 'long', day: 'numeric', month: 'long' })))}</p>
        <p class="greet"><span>${esc(greet)}</span>
          <button class="space-chip" data-action="open-spaces" aria-label="${esc(t('mySpaces'))}: ${esc(sp ? sp.name : '')}">${tpl().icon} ${esc(sp ? sp.name : '')}</button></p>
        <h1 class="${nOverdue ? 'has-late' : ''}">${esc(summary)}</h1>
      </div>
      ${actions ? `<div class="btn-row wrap">${actions}</div>` : ''}
    </div>`;
  }

  function viewHome() {
    const now = today();
    const pending = allDeliverables({ pendingOnly: true });
    const evs = mod('events') ? S().events.filter(e => !e.done && e.date >= now).sort((a, b) => a.date.localeCompare(b.date)) : [];
    const overdue = pending.filter(d => d.date < now);
    const todays = [...pending.filter(d => d.date === now).map(d => ['d', d]), ...evs.filter(e => e.date === now).map(e => ['e', e])];
    const week = [...pending.filter(d => d.date > now && d.date <= addDays(now, 7)).map(d => ['d', d]), ...evs.filter(e => e.date > now && e.date <= addDays(now, 7)).map(e => ['e', e])]
      .sort((a, b) => a[1].date.localeCompare(b[1].date));
    const st = monthStats(monthKey(now));
    const goal = Number(S().settings.monthlyGoal || 0);
    const pct = goal ? Math.max(0, Math.min(100, Math.round((personalMoney() ? st.profit : st.received) / goal * 100))) : 0;
    const active = S().projects.filter(p => !isClosed(p));
    // greeting name: this space's "your name", or the first one set in another space
    const name = (S().settings.name || Store.spaces().map(sp => (Store.peek(sp.id).settings || {}).name).find(Boolean) || '').trim();
    const rowOf = ([k, x], kind) => k === 'd' ? deliveryRow(x, kind) : eventRow(x, kind);

    const block = (title, list, kind, emptyTxt) => `
      <section class="card alert-card ${kind} ${list.length ? '' : 'empty'}">
        <header class="card-head">
          <h2>${kind === 'overdue' ? icon('alert', 18) : icon('clock', 18)} ${title}</h2>
          <span class="count">${list.length}</span>
        </header>
        ${list.length ? `<ul class="rows">${list.map(x => Array.isArray(x) ? rowOf(x, kind) : deliveryRow(x, kind)).join('')}</ul>` : `<p class="muted">${emptyTxt}</p>`}
      </section>`;

    const stepList = [
      mod('clients') && ['new-client', t('step1'), t('step1Hint')],
      ['new-project', t('step2'), t('step2Hint')],
      mod('finance') ? ['new-income', t('step3'), t('step3Hint')] : (mod('events') && ['new-event', t('stepEvent'), t('stepEventHint')])
    ].filter(Boolean);
    const firstSteps = Store.isEmpty() ? `
      <section class="card first-steps">
        <header class="card-head"><h2>👋 ${t('firstStepsTitle')}</h2>${helpBtn('home')}</header>
        <p class="muted">${t('firstStepsText')}</p>
        <ol class="steps">${stepList.map(([a, title, hint], i) => `
          <li><button class="step" data-action="${a}"><span class="step-n">${i + 1}</span><span><strong>${esc(title)}</strong><small>${esc(hint)}</small></span></button></li>`).join('')}</ol>
        <button class="link small" data-nav-to="help">${t('seeGuides')} →</button>
      </section>` : '';

    const recCard = mod('recurring') && bizMoney() && S().recurring.length ? (() => {
      const mk = monthKey(now);
      const items = S().recurring.filter(a => a.active).map(a => ({ a, st: statusFor(a, mk) }));
      const due = sum(items, x => x.st.due), paid = sum(items, x => Math.min(x.st.paid, x.st.due || x.st.paid));
      const missing = items.filter(x => x.st.missing > 0);
      return `
      <section class="card">
        <header class="card-head"><h2>${icon('recurring', 18)} ${esc(t('nav_recurring'))} · ${esc(fmtMonth(mk))}</h2>${helpBtn('recurring')}</header>
        <div class="mini-kpis"><span>${t('expected')} <strong>${money(due)}</strong></span><span>${t('received')} <strong>${money(paid)}</strong></span><span class="${missing.length ? 'warn-text' : ''}">${t('missing')} <strong>${money(sum(missing, x => x.st.missing))}</strong></span></div>
        ${missing.length ? `<ul class="rows compact">${missing.slice(0, 5).map(({ a, st }) => `
          <li class="row"><span class="row-main static"><span class="row-title">${esc(a.payer)}</span><span class="row-sub">${esc(a.concept)}${a.group ? ' · ' + esc(a.group) : ''}</span></span>
          <button class="btn small ghost" data-action="pay-recurring" data-id="${a.id}">${icon('money', 15)} ${money(st.missing)}</button></li>`).join('')}</ul>
          ${missing.length > 5 ? `<button class="link small" data-nav-to="recurring">${t('seeAll')} (${missing.length}) →</button>` : ''}`
        : `<p class="muted">${t('allPaid')}</p>`}
      </section>`;
    })() : '';

    return `
      ${homeHead(name, overdue.length, todays.length, pending.length || evs.length)}
      ${installBanner()}
      ${firstSteps}
      <div class="grid-alerts">
        ${block(t('overdue'), overdue, 'overdue', t('nothingOverdue'))}
        ${block(t('today'), todays, 'today', t('nothingToday'))}
        ${block(t('thisWeek'), week, 'week', t('nothingWeek'))}
      </div>
      ${recCard}
      ${mod('finance') ? `<section class="card">
        <header class="card-head"><h2>${t('monthAtGlance')} · ${esc(fmtMonth(monthKey(now)))}</h2>${helpBtn('kpis')}</header>
        ${kpis(st)}
        <div class="goal">
          ${goal ? `
            <div class="goal-top"><span>${t('monthlyGoal')}: <strong>${money(goal)}</strong></span><span><strong>${pct}%</strong> ${t('ofGoal')}</span></div>
            <div class="bar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${pct}"><span style="width:${pct}%"></span></div>`
          : `<button class="link" data-nav-to="settings">${t('noGoal')} →</button>`}
        </div>
      </section>` : ''}
      <section class="card">
        <header class="card-head"><h2>${esc(t('activeProjects'))}</h2><span class="count">${active.length}</span></header>
        ${active.length ? `<ul class="rows compact">${active.map(projectLine).join('')}</ul>` : `<p class="muted">${t('noActive')}</p>`}
      </section>`;
  }

  function kpis(st) {
    if (personalMoney()) return `
      <div class="kpis three">
        <div class="kpi"><span class="kpi-label">${t('received')}</span><span class="kpi-value">${money(st.received)}</span></div>
        <div class="kpi"><span class="kpi-label">${t('expenses')}</span><span class="kpi-value">${money(st.spent)}</span></div>
        <div class="kpi accent"><span class="kpi-label">${t('profit')}</span><span class="kpi-value ${st.profit < 0 ? 'neg' : ''}">${money(st.profit)}</span></div>
      </div>`;
    return `
      <div class="kpis">
        <div class="kpi"><span class="kpi-label">${t('received')}</span><span class="kpi-value">${money(st.received)}</span></div>
        <div class="kpi"><span class="kpi-label">${t('pendingToCollect')}</span><span class="kpi-value">${money(st.pending)}</span></div>
        <div class="kpi"><span class="kpi-label">${t('expenses')}</span><span class="kpi-value">${money(st.spent)}</span></div>
        <div class="kpi accent"><span class="kpi-label">${t('profit')}</span><span class="kpi-value ${st.profit < 0 ? 'neg' : ''}">${money(st.profit)}</span></div>
      </div>`;
  }

  function projectLine(p) {
    const next = nextDeliverable(p);
    return `
      <li class="row">
        <button class="row-main" data-action="edit-project" data-id="${p.id}">
          <span class="row-title">${esc(p.title)}</span>
          <span class="row-sub">${mod('clients') && p.clientId ? esc(clientName(p.clientId)) + ' · ' : ''}<span class="pill gold">${esc(label(stageOf(p)))}</span></span>
        </button>
        <span class="row-meta">${next ? fmtDate(next.date, { day: 'numeric', month: 'short' }) : ''}</span>
      </li>`;
  }

  // ================================================================ CALENDAR
  function calendarItems() {
    const items = allDeliverables().map(d => ({ kind: 'deliv', date: d.date, title: d.title, done: d.done, ref: d }));
    if (mod('events')) S().events.forEach(e => items.push({ kind: 'event', date: e.date, title: e.title, done: e.done, ref: e }));
    if (mod('recurring')) S().sessions.forEach(s => items.push({ kind: 'session', date: s.date, title: `${t('session')}${s.group ? ' · ' + s.group : ''}`, done: true, ref: s }));
    return items;
  }

  function viewCalendar() {
    const key = ui.calMonth;
    const [y, m] = key.split('-').map(Number);
    const startOffset = (new Date(y, m - 1, 1).getDay() + 6) % 7; // Monday first
    const daysInMonth = new Date(y, m, 0).getDate();
    const byDay = {};
    calendarItems().forEach(it => { (byDay[it.date] = byDay[it.date] || []).push(it); });
    const now = today();
    const cls = (it) => it.kind === 'event' ? 'ev' : it.kind === 'session' ? 'ses' : it.done ? 'done' : it.date < now ? 'late' : '';

    let cells = '';
    for (let i = 0; i < startOffset; i++) cells += '<div class="cal-cell blank" aria-hidden="true"></div>';
    for (let day = 1; day <= daysInMonth; day++) {
      const ds = `${key}-${String(day).padStart(2, '0')}`;
      const list = byDay[ds] || [];
      cells += `
        <button class="cal-cell ${ds === now ? 'is-today' : ''} ${ds === ui.calDay ? 'is-selected' : ''}" data-action="cal-day" data-date="${ds}" aria-label="${fmtDate(ds)}: ${list.length}">
          <span class="cal-num">${day}</span>
          <span class="cal-chips">${list.slice(0, 3).map(it => `<span class="chip ${cls(it)}">${esc(it.title)}</span>`).join('')}${list.length > 3 ? `<span class="chip more">+${list.length - 3}</span>` : ''}</span>
          <span class="cal-dots">${list.slice(0, 4).map(it => `<i class="${cls(it)}"></i>`).join('')}</span>
        </button>`;
    }
    const dayList = byDay[ui.calDay] || [];
    const dayRow = (it) => {
      if (it.kind === 'event') return eventRow(it.ref, it.date < now ? 'past' : it.date === now ? 'today' : 'week');
      if (it.kind === 'session') return `<li class="row"><span class="tick on ses">${icon('brush', 14)}</span><span class="row-main static"><span class="row-title">${esc(it.title)}</span><span class="row-sub">${t('sessionLogged')}</span></span></li>`;
      if (it.done) return `<li class="row done"><span class="tick on">${icon('check', 16)}</span><button class="row-main" data-action="edit-project" data-id="${it.ref.project.id}"><span class="row-title">${esc(it.title)}</span><span class="row-sub">${esc(delivSub(it.ref, it.ref.project))}</span></button><span class="row-meta">${t('done')}</span></li>`;
      return deliveryRow(it.ref, it.date < now ? 'overdue' : it.date === now ? 'today' : 'week');
    };

    return `
      ${pageHead(t('nav_calendar'), 'calendar', `<button class="btn ghost small" data-action="ics-all">${icon('cal_add', 18)} <span class="hide-sm">${t('exportUpcomingIcs')}</span></button>`)}
      <section class="card">
        <div class="month-nav">
          <button class="icon-btn" data-action="cal-prev" aria-label="${t('prevMonth')}">${icon('chevL')}</button>
          <h2>${esc(fmtMonth(key))}</h2>
          <button class="icon-btn" data-action="cal-next" aria-label="${t('nextMonth')}">${icon('chevR')}</button>
        </div>
        <div class="cal-grid">${t('weekdaysShort').map(w => `<div class="cal-wd">${w}</div>`).join('')}${cells}</div>
        <div class="cal-legend">
          <span><i></i>${t('deliverables')}</span><span><i class="late"></i>${t('overdue')}</span>
          ${mod('events') ? `<span><i class="ev"></i>${t('nav_events')}</span>` : ''}
          ${mod('recurring') && S().sessions.length ? `<span><i class="ses"></i>${esc(t('session'))}</span>` : ''}
        </div>
      </section>
      <section class="card">
        <header class="card-head"><h2>${esc(cap(fmtDate(ui.calDay, { weekday: 'long', day: 'numeric', month: 'long' })))}</h2>
          <button class="btn small" data-action="new-project" data-date="${ui.calDay}">${icon('plus', 16)} ${t('deliverable')}</button></header>
        ${dayList.length ? `<ul class="rows">${dayList.map(dayRow).join('')}</ul>` : `<p class="muted">${t('nothingThisDay')}</p>`}
      </section>`;
  }

  // ================================================================ PROJECTS (kanban)
  function viewProjects() {
    const q = ui.projSearch.toLowerCase();
    const list = S().projects.filter(p => (!ui.projClient || p.clientId === ui.projClient) && (!q || (p.title + ' ' + clientName(p.clientId)).toLowerCase().includes(q)));
    const st = stages();
    const clients = [...S().clients].sort((a, b) => a.name.localeCompare(b.name));
    const card = (p) => {
      const next = nextDeliverable(p);
      const bal = balance(p);
      const idx = st.findIndex(s => s.id === stageOf(p).id);
      const late = next && next.date < today();
      return `
        <article class="kcard" draggable="true" data-id="${p.id}">
          <button class="kcard-main" data-action="edit-project" data-id="${p.id}">
            ${mod('clients') && p.clientId ? `<span class="kcard-client">${esc(clientName(p.clientId))}</span>` : ''}
            <span class="kcard-title">${esc(p.title)}</span>
            <span class="kcard-meta ${late ? 'late' : ''}">${next ? `${late ? icon('alert', 13) : icon('clock', 13)} ${esc(next.title)} · ${fmtDate(next.date, { day: 'numeric', month: 'short' })}` : (isClosed(p) ? `${icon('check', 13)} ${t('done')}` : t('noPendingDeliveries'))}</span>
            ${p.total && bizMoney() ? `<span class="kcard-money">${bal > 0 ? `${t('balance')} <strong>${money(bal)}</strong>` : `${icon('check', 13)} ${t('paid')}`}</span>` : ''}
          </button>
          <div class="kcard-move">
            <button class="icon-btn tiny" data-action="stage-step" data-id="${p.id}" data-dir="-1" ${idx <= 0 ? 'disabled' : ''} aria-label="${t('moveTo')} ${esc(label(st[idx - 1]))}">${icon('chevL', 16)}</button>
            <button class="icon-btn tiny" data-action="stage-step" data-id="${p.id}" data-dir="1" ${idx >= st.length - 1 ? 'disabled' : ''} aria-label="${t('moveTo')} ${esc(label(st[idx + 1]))}">${icon('chevR', 16)}</button>
          </div>
        </article>`;
    };
    if (!S().projects.length) {
      return pageHead(t('nav_projects'), 'projects') + emptyState('projects', t('emptyProjectsTitle'), t('emptyProjectsText'),
        `<button class="btn" data-action="new-project">${icon('plus', 16)} ${esc(t('newProject'))}</button>`);
    }
    return `
      ${pageHead(t('nav_projects'), 'projects', `<button class="btn small" data-action="new-project">${icon('plus', 16)} ${esc(t('newProject'))}</button>`)}
      <div class="filters">
        <input type="search" id="proj-search" placeholder="${t('search')}" value="${esc(ui.projSearch)}" aria-label="${t('search')}">
        ${mod('clients') ? `<select id="proj-client" aria-label="${t('client')}">
          <option value="">${t('client')}: ${t('all')}</option>
          ${clients.map(c => `<option value="${c.id}" ${c.id === ui.projClient ? 'selected' : ''}>${esc(c.name)}</option>`).join('')}
        </select>` : ''}
      </div>
      <p class="hint only-touch">${t('kanbanHintTouch')}</p>
      <div class="kanban">
        ${st.map(s => {
          const items = list.filter(p => stageOf(p).id === s.id).sort((a, b) => (nextDeliverable(a)?.date || '9').localeCompare(nextDeliverable(b)?.date || '9'));
          return `<section class="kcol" data-stage="${s.id}"><header><h2>${esc(label(s))}</h2><span class="count">${items.length}</span></header>
            <div class="kcol-body">${items.map(card).join('')}</div></section>`;
        }).join('')}
      </div>`;
  }

  function enableDragAndDrop() {
    document.querySelectorAll('.kcard').forEach(el => {
      el.addEventListener('dragstart', e => { e.dataTransfer.setData('text/plain', el.dataset.id); el.classList.add('dragging'); });
      el.addEventListener('dragend', () => el.classList.remove('dragging'));
    });
    document.querySelectorAll('.kcol').forEach(col => {
      col.addEventListener('dragover', e => { e.preventDefault(); col.classList.add('over'); });
      col.addEventListener('dragleave', () => col.classList.remove('over'));
      col.addEventListener('drop', e => {
        e.preventDefault(); col.classList.remove('over');
        const p = Store.project(e.dataTransfer.getData('text/plain'));
        if (p && p.stage !== col.dataset.stage) { p.stage = col.dataset.stage; Store.save(); }
      });
    });
  }

  // ================================================================ RECURRING
  const freqLabel = (a) => a.frequency === 'per_session' ? `${money(a.amount)} ${t('perSession', t('session').toLowerCase())}` : `${money(a.amount)} ${t('perMonth')}`;
  const statusPill = (st) => ({
    paid: `<span class="pill ok">${icon('check', 12)} ${t('st_paid')}</span>`,
    partial: `<span class="pill warn">${icon('clock', 12)} ${t('st_partial')}</span>`,
    pending: `<span class="pill bad">${icon('alert', 12)} ${t('st_pending')}</span>`,
    none: `<span class="pill">${t('st_none')}</span>`
  }[st.key]);

  function viewRecurring() {
    const mk = ui.recMonth;
    const all = S().recurring;
    if (!all.length) {
      return pageHead(t('recurringTitle'), 'recurring') + emptyState('recurring', t('emptyRecurringTitle'), t('emptyRecurringText'),
        `<button class="btn" data-action="new-recurring">${icon('plus', 16)} ${esc(t('newRecurring'))}</button>`);
    }
    const active = all.filter(a => a.active);
    const items = active.map(a => ({ a, st: statusFor(a, mk) }));
    const due = sum(items, x => x.st.due), paid = sum(items, x => x.st.paid), missing = sum(items, x => x.st.missing);
    const groups = {};
    items.forEach(x => { const g = x.a.group || ''; (groups[g] = groups[g] || []).push(x); });
    const groupNames = Object.keys(groups).sort((a, b) => (a === '') - (b === '') || a.localeCompare(b));

    return `
      ${pageHead(t('recurringTitle'), 'recurring', `
        ${active.some(a => a.frequency === 'per_session') ? `<button class="btn small ghost" data-action="new-session">${icon('brush', 16)} ${esc(t('logSession'))}</button>` : ''}
        <button class="btn small" data-action="new-recurring">${icon('plus', 16)} ${esc(t('newRecurring'))}</button>`)}
      <section class="card">
        <div class="month-nav">
          <button class="icon-btn" data-action="rec-prev" aria-label="${t('prevMonth')}">${icon('chevL')}</button>
          <h2>${esc(fmtMonth(mk))}</h2>
          <button class="icon-btn" data-action="rec-next" aria-label="${t('nextMonth')}">${icon('chevR')}</button>
        </div>
        <div class="kpis three">
          <div class="kpi"><span class="kpi-label">${t('expected')}</span><span class="kpi-value">${money(due)}</span></div>
          <div class="kpi"><span class="kpi-label">${t('received')}</span><span class="kpi-value">${money(paid)}</span></div>
          <div class="kpi ${missing ? 'accent' : ''}"><span class="kpi-label">${t('missing')}</span><span class="kpi-value">${money(missing)}</span></div>
        </div>
      </section>
      ${groupNames.map(g => {
        const list = groups[g];
        const hasSessions = list.some(x => x.a.frequency === 'per_session');
        const ses = sessionsIn(g, mk).sort((a, b) => a.date.localeCompare(b.date));
        return `
        <section class="card">
          <header class="card-head"><h2>${g ? `${icon('pin', 17)} ${esc(g)}` : esc(t('noGroup'))}</h2><span class="count">${list.length}</span></header>
          ${hasSessions ? `
            <div class="sessions">
              <span class="muted small">${esc(t('sessionsThisMonth'))}: <strong>${ses.length}</strong></span>
              <span class="ses-chips">${ses.map(s => `<button class="chip-btn" data-action="delete-session" data-id="${s.id}" title="${t('delete')}">${fmtDate(s.date, { day: 'numeric', month: 'short' })} ✕</button>`).join('')}</span>
              <button class="btn small ghost" data-action="new-session" data-group="${esc(g)}">${icon('plus', 14)} ${esc(t('session'))}</button>
            </div>` : ''}
          <ul class="rows">${list.map(({ a, st }) => `
            <li class="row rec-row">
              <button class="row-main" data-action="edit-recurring" data-id="${a.id}">
                <span class="row-title">${esc(a.payer)}</span>
                <span class="row-sub">${esc(a.concept)} · ${esc(freqLabel(a))}</span>
              </button>
              <span class="rec-status">${statusPill(st)}${st.due ? `<span class="small muted">${money(st.paid)} / ${money(st.due)}</span>` : ''}</span>
              ${st.missing > 0 ? `<button class="btn small" data-action="pay-recurring" data-id="${a.id}" data-month="${mk}">${t('registerPayment')}</button>` : ''}
            </li>`).join('')}</ul>
        </section>`;
      }).join('')}
      ${all.some(a => !a.active) ? `
        <details class="card"><summary>${t('inactive')} (${all.filter(a => !a.active).length})</summary>
          <ul class="rows compact">${all.filter(a => !a.active).map(a => `<li class="row"><button class="row-main" data-action="edit-recurring" data-id="${a.id}"><span class="row-title">${esc(a.payer)}</span><span class="row-sub">${esc(a.concept)}</span></button></li>`).join('')}</ul>
        </details>` : ''}`;
  }

  // ================================================================ EVENTS
  const eventTypeLabel = (id) => label(S().settings.eventTypes.find(x => x.id === id)) || t('otherType');

  function eventCard(e) {
    const bal = eventBalance(e);
    const d = parse(e.date);
    return `
      <button class="card event-card ${e.done ? 'is-done' : ''}" data-action="edit-event" data-id="${e.id}">
        <span class="date-block"><strong>${d.getDate()}</strong><small>${esc(d.toLocaleDateString(t('locale'), { month: 'short' }).replace('.', ''))}</small></span>
        <span class="ev-info">
          <span class="row-title">${esc(e.title)}</span>
          <span class="row-sub">${esc(eventTypeLabel(e.type))}${e.time ? ' · ' + esc(e.time) : ''}${e.place ? ' · ' + esc(e.place) : ''}</span>
          ${e.total && bizMoney() ? `<span class="small">${bal > 0 ? `${t('balance')} <strong class="warn-text">${money(bal)}</strong>` : `<span class="ok-text">${icon('check', 12)} ${t('paid')}</span>`} · ${money(e.total)}</span>` : ''}
        </span>
      </button>`;
  }

  function viewEvents() {
    const now = today();
    const evs = [...S().events];
    if (!evs.length) {
      return pageHead(t('nav_events'), 'events') + emptyState('events', t('emptyEventsTitle'), t('emptyEventsText'),
        `<button class="btn" data-action="new-event">${icon('plus', 16)} ${t('newEvent')}</button>`);
    }
    const upcoming = evs.filter(e => e.date >= now && !e.done).sort((a, b) => a.date.localeCompare(b.date));
    const past = evs.filter(e => e.date < now || e.done).sort((a, b) => b.date.localeCompare(a.date));
    return `
      ${pageHead(t('nav_events'), 'events', `<button class="btn small" data-action="new-event">${icon('plus', 16)} ${t('newEvent')}</button>`)}
      <h3 class="section-title">${t('upcoming')}</h3>
      ${upcoming.length ? `<div class="event-grid">${upcoming.map(eventCard).join('')}</div>` : `<p class="muted">${t('noUpcoming')}</p>`}
      ${past.length ? `<h3 class="section-title">${t('pastEvents')}</h3><div class="event-grid">${past.map(eventCard).join('')}</div>` : ''}`;
  }

  // ================================================================ INVENTORY
  const invStatusPill = (s) => ({ available: `<span class="pill ok">${t('inv_available')}</span>`, reserved: `<span class="pill warn">${t('inv_reserved')}</span>`, sold: `<span class="pill">${t('inv_sold')}</span>` }[s] || '');

  function viewInventory() {
    const all = S().inventory;
    if (!all.length) {
      return pageHead(t('nav_inventory'), 'inventory') + emptyState('inventory', t('emptyInventoryTitle'), t('emptyInventoryText'),
        `<button class="btn" data-action="new-inventory">${icon('plus', 16)} ${esc(t('newInventory'))}</button>`);
    }
    const f = ui.invFilter;
    const list = all.filter(x => f === 'all' || x.status === f).sort((a, b) => a.status.localeCompare(b.status) || a.title.localeCompare(b.title));
    const avail = all.filter(x => x.status === 'available');
    const soldMonth = S().incomes.filter(x => x.type === 'sale' && monthKey(x.date) === monthKey(today()));
    return `
      ${pageHead(t('nav_inventory'), 'inventory', `<button class="btn small" data-action="new-inventory">${icon('plus', 16)} ${esc(t('newInventory'))}</button>`)}
      <div class="kpis three card">
        <div class="kpi"><span class="kpi-label">${t('inv_available')}</span><span class="kpi-value">${avail.length}</span></div>
        <div class="kpi"><span class="kpi-label">${t('inStockValue')}</span><span class="kpi-value">${money(sum(avail, x => x.price))}</span></div>
        <div class="kpi"><span class="kpi-label">${t('soldThisMonth')}</span><span class="kpi-value">${money(sum(soldMonth, x => x.amount))}</span></div>
      </div>
      <div class="seg" role="tablist">
        ${['all', 'available', 'reserved', 'sold'].map(k => `<button role="tab" class="${f === k ? 'on' : ''}" aria-selected="${f === k}" data-action="inv-filter" data-f="${k}">${k === 'all' ? t('all') : t('inv_' + k)}</button>`).join('')}
      </div>
      <div class="inv-grid">${list.map(x => `
        <article class="card inv-card">
          <button class="inv-main" data-action="edit-inventory" data-id="${x.id}">
            <span class="inv-art" aria-hidden="true">${icon('inventory', 26)}</span>
            <span class="row-title">${esc(x.title)}</span>
            <span class="row-sub">${esc([x.technique, x.size].filter(Boolean).join(' · '))}</span>
            <span class="inv-bottom"><strong>${money(x.price)}</strong>${invStatusPill(x.status)}</span>
          </button>
          ${x.status !== 'sold' ? `<button class="btn small ghost full" data-action="sell-inventory" data-id="${x.id}">${icon('tag', 15)} ${t('markSold')}</button>` : ''}
        </article>`).join('')}</div>`;
  }

  // ================================================================ CLIENTS
  function clientTotals(c) {
    const ps = S().projects.filter(p => p.clientId === c.id);
    const es = S().events.filter(e => e.clientId === c.id);
    const billed = sum(ps, p => p.total) + sum(es, e => e.total);
    const received = sum(ps, p => paidOf(p.id)) + sum(es, e => paidOf(e.id));
    return { ps, es, billed, received };
  }

  function viewClients() {
    const list = [...S().clients].sort((a, b) => a.name.localeCompare(b.name));
    if (!list.length) {
      return pageHead(t('nav_clients'), 'clients') + emptyState('clients', t('emptyClientsTitle'), t('emptyClientsText'),
        `<button class="btn" data-action="new-client">${icon('plus', 16)} ${t('newClient')}</button>`);
    }
    return `
      ${pageHead(t('nav_clients'), 'clients', `<button class="btn small" data-action="new-client">${icon('plus', 16)} ${t('newClient')}</button>`)}
      <div class="client-grid">${list.map(c => {
        const { ps, billed, received } = clientTotals(c);
        const initials = c.name.split(/\s+/).slice(0, 2).map(w => w[0]).join('').toUpperCase();
        return `
          <button class="card client-card" data-action="open-client" data-id="${c.id}">
            <span class="avatar" aria-hidden="true">${esc(initials)}</span>
            <span class="client-info"><span class="row-title">${esc(c.name)}</span>
              <span class="row-sub">${t('projectsCount', ps.length)}${c.contact ? ' · ' + esc(c.contact) : ''}</span></span>
            <span class="client-money"><span class="muted small">${t('totalBilled')}</span><strong>${money(billed)}</strong>
              ${billed - received > 0 ? `<span class="small warn-text">${t('balance')} ${money(billed - received)}</span>` : ''}</span>
          </button>`;
      }).join('')}</div>`;
  }

  // ================================================================ FINANCE
  const COLOR_INCOME = '#33946B';
  const COLOR_EXPENSE = '#B07A1A';

  function viewFinance() {
    const mk = ui.finMonth;
    const st = monthStats(mk);
    const series = Array.from({ length: 6 }, (_, i) => shiftMonth(mk, i - 5)).map(k => ({ key: k, ...monthStats(k) }));
    const cats = S().settings.categories;
    const monthExpenses = S().expenses.filter(e => monthKey(e.date) === mk).sort((a, b) => b.date.localeCompare(a.date));
    const byCat = cats.map(c => ({ c, total: sum(monthExpenses.filter(e => e.category === c.id), e => e.amount) })).filter(x => x.total > 0).sort((a, b) => b.total - a.total);
    const maxCat = Math.max(1, ...byCat.map(x => x.total));
    const types = INCOME_TYPES.filter(k => typeEnabled(k) || st.byType[k]).map(k => ({ k, v: st.byType[k] }));
    const maxType = Math.max(1, ...types.map(x => x.v));
    const monthIncomes = S().incomes.filter(x => monthKey(x.date) === mk).sort((a, b) => b.date.localeCompare(a.date));
    const personal = personalMoney();
    const pendingList = personal ? [] : [
      ...S().projects.filter(p => balance(p) > 0).map(p => ({ title: p.title, sub: `${clientName(p.clientId)} · ${t('paid')} ${money(paidOf(p.id))} / ${money(p.total)}`, amount: balance(p), action: 'new-payment', id: p.id, open: 'edit-project' })),
      ...(mod('events') ? S().events.filter(e => eventBalance(e) > 0).map(e => ({ title: e.title, sub: `${t('type_event')} · ${fmtDate(e.date)}`, amount: eventBalance(e), action: 'pay-event', id: e.id, open: 'edit-event' })) : [])
    ].sort((a, b) => b.amount - a.amount);

    const incomeTitle = (x) => {
      const ref = x.type === 'project' ? Store.project(x.refId)?.title : x.type === 'event' ? Store.find('events', x.refId)?.title
        : x.type === 'sale' ? Store.find('inventory', x.refId)?.title : x.type === 'recurring' ? Store.find('recurring', x.refId)?.payer : '';
      return ref || x.note || typeLabel(x.type);
    };

    return `
      ${pageHead(t('nav_finance'), 'finance', `
        <button class="btn small" data-action="new-income">${icon('money', 16)} ${t('qa_income')}</button>
        <button class="btn small ghost" data-action="new-expense">${icon('receipt', 16)} ${t('qa_expense')}</button>`)}
      <section class="card">
        <div class="month-nav">
          <button class="icon-btn" data-action="fin-prev" aria-label="${t('prevMonth')}">${icon('chevL')}</button>
          <h2>${esc(fmtMonth(mk))}</h2>
          <button class="icon-btn" data-action="fin-next" aria-label="${t('nextMonth')}">${icon('chevR')}</button>
        </div>
        ${kpis(st)}
      </section>

      <div class="grid-2">
        ${personal ? '' : `<section class="card">
          <header class="card-head"><h2>${t('incomeByType')}</h2>${helpBtn('incomeTypes')}</header>
          ${st.received ? `<ul class="hbars inc">${types.map(x => `
            <li><span class="hbar-label">${esc(typeLabel(x.k))}</span>
              <span class="hbar-track"><span class="hbar-fill" style="width:${x.v ? Math.max(2, x.v / maxType * 100) : 0}%"></span></span>
              <span class="hbar-value">${money(x.v)}</span></li>`).join('')}</ul>` : `<p class="muted">${t('noData')}</p>`}
        </section>`}
        <section class="card">
          <header class="card-head"><h2>${t('expensesByCategory')}</h2></header>
          ${byCat.length ? `<ul class="hbars">${byCat.map(x => `
            <li><span class="hbar-label">${esc(label(x.c))}</span>
              <span class="hbar-track"><span class="hbar-fill" style="width:${Math.max(2, x.total / maxCat * 100)}%"></span></span>
              <span class="hbar-value">${money(x.total)}</span></li>`).join('')}</ul>` : `<p class="muted">${t('noData')}</p>`}
        </section>
      </div>

      <section class="card">
        <header class="card-head"><h2>${t('last6Months')}</h2>
          <button class="link small" data-action="toggle-table">${ui.showTable ? t('hideTable') : t('showTable')}</button></header>
        <div class="legend" aria-hidden="true"><span><i style="background:${COLOR_INCOME}"></i>${t('income')}</span><span><i style="background:${COLOR_EXPENSE}"></i>${t('expenses')}</span></div>
        ${barChart(series)}
        ${ui.showTable ? `<div class="table-wrap"><table class="data-table">
          <thead><tr><th>${t('month')}</th><th>${t('income')}</th><th>${t('expenses')}</th><th>${t('profit')}</th></tr></thead>
          <tbody>${series.map(s => `<tr><td>${esc(fmtMonth(s.key))}</td><td>${money(s.received)}</td><td>${money(s.spent)}</td><td>${money(s.profit)}</td></tr>`).join('')}</tbody></table></div>` : ''}
      </section>

      ${personal ? '' : `      <section class="card">
        <header class="card-head"><h2>${t('pendingCollections')}</h2>${helpBtn('pending')}</header>
        ${pendingList.length ? `<ul class="rows">${pendingList.map(x => `
          <li class="row"><button class="row-main" data-action="${x.open}" data-id="${x.id}"><span class="row-title">${esc(x.title)}</span><span class="row-sub">${esc(x.sub)}</span></button>
          <button class="btn small ghost" data-action="${x.action}" data-${x.action === 'new-payment' ? 'project' : 'id'}="${x.id}">${money(x.amount)}</button></li>`).join('')}</ul>` : `<p class="muted">${t('nothingPending')}</p>`}
        ${mod('recurring') && recurringPending(monthKey(today())).length ? `<button class="link small" data-nav-to="recurring">${esc(t('nav_recurring'))}: ${money(sum(recurringPending(monthKey(today())), x => x.st.missing))} ${t('missingThisMonth')} →</button>` : ''}
      </section>`}

      <div class="grid-2">
        <section class="card">
          <header class="card-head"><h2>${t('incomeList')}</h2></header>
          ${monthIncomes.length ? `<ul class="rows compact">${monthIncomes.map(x => `
            <li class="row"><button class="row-main" data-action="edit-income" data-id="${x.id}">
              <span class="row-title">${esc(incomeTitle(x))}</span>
              <span class="row-sub">${fmtDate(x.date)} · <span class="pill">${esc(typeLabel(x.type))}</span></span></button>
              <span class="row-meta strong">${money(x.amount)}</span></li>`).join('')}</ul>` : `<p class="muted">${t('noData')}</p>`}
        </section>
        <section class="card">
          <header class="card-head"><h2>${t('expenseList')}</h2></header>
          ${monthExpenses.length ? `<ul class="rows compact">${monthExpenses.map(e => `
            <li class="row"><button class="row-main" data-action="edit-expense" data-id="${e.id}">
              <span class="row-title">${esc(e.description || label(cats.find(c => c.id === e.category)))}</span>
              <span class="row-sub">${fmtDate(e.date)} · ${esc(label(cats.find(c => c.id === e.category)))}</span></button>
              <span class="row-meta strong">${money(e.amount)}</span></li>`).join('')}</ul>` : `<p class="muted">${t('noData')}</p>`}
        </section>
      </div>

      <section class="card">
        <header class="card-head"><h2>${icon('download', 18)} ${t('exportCsv')}</h2>${helpBtn('excel')}</header>
        <div class="btn-row wrap">
          ${(personal ? ['projects', 'incomes', 'expenses'] : ['projects', 'deliverables', 'incomes', 'expenses', 'clients']).concat(mod('events') ? ['events'] : [], mod('inventory') ? ['inventory'] : [], mod('recurring') && !personal ? ['recurring'] : [])
            .map(w => `<button class="btn small ghost" data-action="csv" data-what="${w}">${esc(t('csv_' + w))}</button>`).join('')}
        </div>
      </section>`;
  }

  /** Grouped bar chart, hand-built SVG: one y-axis, zero baseline, tooltips, table view. */
  function barChart(series) {
    const narrow = window.innerWidth < 560;
    const W = narrow ? 360 : 900, H = narrow ? 220 : 280, padL = 8, padR = 8, padT = 22, padB = 28;
    const max = Math.max(1, ...series.flatMap(s => [s.received, s.spent]));
    const step = niceStep(max / 3);
    const top = Math.ceil(max / step) * step;
    const y = v => padT + (H - padT - padB) * (1 - v / top);
    const groupW = (W - padL - padR) / series.length;
    const barW = Math.min(36, groupW * 0.28), gap = 2;
    const grid = [];
    for (let v = step; v <= top + 0.5; v += step) grid.push(`<line x1="${padL}" x2="${W - padR}" y1="${y(v)}" y2="${y(v)}" class="grid"/><text x="${padL}" y="${y(v) - 4}" class="axis">${esc(money(v, true))}</text>`);
    const bar = (x, v, color) => {
      const h = Math.max(0, y(0) - y(v)); if (h <= 0) return '';
      const r = Math.min(4, h, barW / 2);
      return `<path d="M${x},${y(0)} V${y(v) + r} Q${x},${y(v)} ${x + r},${y(v)} H${x + barW - r} Q${x + barW},${y(v)} ${x + barW},${y(v) + r} V${y(0)} Z" fill="${color}"/>`;
    };
    const groups = series.map((s, i) => {
      const cx = padL + groupW * i + groupW / 2, x1 = cx - barW - gap / 2, x2 = cx + gap / 2;
      const isLast = i === series.length - 1;
      const short = parse(s.key + '-01').toLocaleDateString(t('locale'), { month: 'short' });
      const tip = `${fmtMonth(s.key)}\n${t('income')}: ${money(s.received)}\n${t('expenses')}: ${money(s.spent)}\n${t('profit')}: ${money(s.profit)}`;
      return `<g class="bar-group" tabindex="0" data-tip="${esc(tip)}">
          <rect x="${padL + groupW * i}" y="${padT}" width="${groupW}" height="${H - padT - padB}" class="hit"/>
          ${bar(x1, s.received, COLOR_INCOME)}${bar(x2, s.spent, COLOR_EXPENSE)}
          ${isLast && s.received ? `<text x="${x1 + barW / 2}" y="${y(s.received) - 6}" class="val" text-anchor="middle">${esc(money(s.received, true))}</text>` : ''}
          ${isLast && s.spent && !narrow ? `<text x="${x2 + barW / 2}" y="${y(s.spent) - 6}" class="val" text-anchor="middle">${esc(money(s.spent, true))}</text>` : ''}
          <text x="${cx}" y="${H - 8}" class="axis ${isLast ? 'strong' : ''}" text-anchor="middle">${esc(short.replace('.', ''))}</text></g>`;
    }).join('');
    return `<div class="chart" data-chart><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(t('last6Months'))}">${grid.join('')}
      <line x1="${padL}" x2="${W - padR}" y1="${y(0)}" y2="${y(0)}" class="baseline"/>${groups}</svg><div class="tooltip" hidden></div></div>`;
  }
  function niceStep(raw) { const p = Math.pow(10, Math.floor(Math.log10(raw || 1))); const n = raw / p; return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * p; }

  // ================================================================ MORE / HELP
  function viewMore() {
    const tiles = [
      mod('recurring') && ['recurring', 'recurring'], mod('events') && !inBottomNav('events') && ['events', 'events'], mod('inventory') && ['inventory', 'inventory'],
      mod('clients') && ['clients', 'clients'], !mod('finance') ? null : null, ['help', 'help'], ['settings', 'settings']
    ].filter(Boolean);
    return `${pageHead(t('nav_more'), '')}
      <div class="more-grid">${tiles.map(([v, ic]) => `<a class="more-tile" href="#${v}">${icon(ic, 26)}<span>${esc(t('nav_' + v))}</span><small>${esc(t('more_' + v))}</small></a>`).join('')}</div>`;
  }

  function viewHelp() {
    let guides = I18N[lang()].guides.filter(g => (!g.module || mod(g.module)) && (!g.cloud || Cloud.configured()));
    const mine = guides.find(g => g.id === PLATFORM_GUIDE);
    if (mine) guides = [guides[0], mine, ...guides.slice(1).filter(g => g !== mine)];
    return `${pageHead(t('nav_help'), '')}
      <p class="muted">${t('helpIntro')}</p>
      <div class="guides">${guides.map((g, i) => `
        <details class="card guide" ${i === 0 ? 'open' : ''} id="guide-${g.id}">
          <summary><span class="guide-ico">${g.emoji}</span><span>${esc(g.title)}</span></summary>
          <ol>${g.steps.map(s => `<li>${s}</li>`).join('')}</ol>
          ${g.note ? `<p class="note">💡 ${g.note}</p>` : ''}
        </details>`).join('')}</div>
      <p class="muted small help-foot">🔒 <button class="link small" data-nav-to="privacy">${t('privacyTitle')}</button></p>`;
  }

  // ================================================================ SETTINGS
  function accountCard() {
    let body;
    if (!Cloud.configured()) {
      body = `<p>${t('accountOff')}</p>`;
    } else if (Cloud.status === 'loading') {
      body = `<p class="muted">${t('loading')}</p>`;
    } else if (!Cloud.user) {
      body = `
        <p class="hint">${t('accountWhy')}</p>
        <label class="check consent"><input type="checkbox" id="privacy-ok"> <span>${t('privacyAccept')} <button type="button" class="link small inline" data-nav-to="privacy">${esc(t('privacyTitle').toLowerCase())}</button></span></label>
        <button class="btn google full" data-action="google-signin"><span class="g-logo" aria-hidden="true">G</span> ${t('signInGoogle')}</button>
        <div class="or"><span>${t('or')}</span></div>
        <form id="email-form" class="form">
          <label>${t('email')}<input name="email" type="email" autocomplete="email" autocapitalize="off" required placeholder="nombre@correo.com"></label>
          <label>${t('password')}<input name="password" type="password" autocomplete="current-password" minlength="6" required></label>
          <div class="btn-row wrap"><button class="btn" type="submit" name="mode" value="in">${t('signIn')}</button>
            <button class="btn ghost" type="submit" name="mode" value="up">${t('createAccount')}</button></div>
          <button type="button" class="link small" data-action="reset-password">${t('forgotPassword')}</button>
        </form>
        ${PLATFORM === 'ios' ? `<p class="hint">📱 ${t('iphoneLoginTip')}</p>` : ''}`;
    } else {
      body = `
        <p class="account-line">${icon('user', 18)} <strong>${esc(Cloud.user.email || Cloud.user.displayName || '')}</strong></p>
        <p class="cloud-line ${Cloud.status}">${icon('cloud', 18)} ${t('cloud_' + Cloud.status)}${Cloud.status === 'error' ? `: <small>${esc(Cloud.error)}</small>` : ''}</p>
        <button class="btn ghost small" data-action="sign-out">${t('signOut')}</button>`;
    }
    return `<section class="card form"><header class="card-head"><h2>${icon('cloud', 18)} ${t('account')}</h2>${helpBtn('account')}</header>${body}</section>`;
  }

  const templateOptions = (selected) => ['personal', 'business'].map(kind => `
    <optgroup label="${esc(t(kind === 'personal' ? 'forMe' : 'forBusiness'))}">
      ${Object.entries(TEMPLATES).filter(([, v]) => v.kind === kind).map(([k, v]) => `<option value="${k}" ${k === selected ? 'selected' : ''}>${v.icon} ${esc(label(v.label))}</option>`).join('')}
    </optgroup>`).join('');

  function viewSettings() {
    const s = S().settings;
    const sp = Store.space();
    const listEditor = (kind, items, min = 2) => `
      <ul class="list-editor">${items.map((it, i) => `
        <li><input value="${esc(label(it))}" data-edit-list="${kind}" data-index="${i}" aria-label="${esc(label(it)) || t('name')}">
        <button class="icon-btn" data-action="list-remove" data-kind="${kind}" data-index="${i}" aria-label="${t('remove')}" ${items.length <= min ? 'disabled' : ''}>${icon('close', 16)}</button></li>`).join('')}</ul>
      <button class="link small" data-action="list-add" data-kind="${kind}">${t('addItem')}</button>`;
    const business = tpl().kind === 'business';
    const switches = [
      ['events', mod('events')],
      ['finance', mod('finance')],
      business && ['recurring', mod('recurring')],
      business && ['inventory', mod('inventory')]
    ].filter(Boolean);

    return `
      ${pageHead(t('nav_settings'), '')}
      <div class="grid-2">
        <section class="card form space-card">
          <header class="card-head"><h2>${tpl().icon} ${t('thisSpace')}</h2>${helpBtn('spaces')}</header>
          <label>${t('spaceName')}<input data-space-name value="${esc(sp?.name || '')}" autocomplete="off"></label>
          <label><span class="label-row">${t('template')} ${helpBtn('template')}</span><select data-action-change="template">${templateOptions(s.template)}</select></label>
          <div class="btn-row wrap">
            <button class="btn small ghost" data-action="open-spaces">${icon('more', 16)} ${t('mySpaces')} (${Store.spaces().length})</button>
            <button class="btn small ghost" data-action="new-space">${icon('plus', 16)} ${t('newSpace')}</button>
          </div>
        </section>
        ${accountCard()}
        <section class="card form">
          <header class="card-head"><h2>${icon('calendar', 18)} ${t('calendarTitle')}</h2></header>
          <div class="cal-opts">${calChoices('cal-settings')}</div>
          <p class="hint">${t('calThisDevice')}</p>
        </section>
        <section class="card form">
          <header class="card-head"><h2>${t('modules')}</h2>${helpBtn('modules')}</header>
          ${switches.map(([m, on]) => `<label class="switch"><input type="checkbox" data-module="${m}" ${on ? 'checked' : ''}><span class="switch-ui" aria-hidden="true"></span>
            <span><strong>${esc(t('mod_' + m))}</strong><small>${esc(t('modHint_' + m))}</small></span></label>`).join('')}
        </section>
        <section class="card form">
          <header class="card-head"><h2>${t('profile')}</h2></header>
          <label>${t('yourName')}<input data-setting="name" value="${esc(s.name)}" autocomplete="name" placeholder="${t('yourNameHint')}"></label>
          <div class="two">
            <label>${t('language')}<select data-setting="lang"><option value="es" ${lang() === 'es' ? 'selected' : ''}>Español</option><option value="en" ${lang() === 'en' ? 'selected' : ''}>English</option></select></label>
            ${mod('finance') ? `<label>${t('currency')}<select data-setting="currency">${CURRENCIES.map(c => `<option ${c === s.currency ? 'selected' : ''}>${c}</option>`).join('')}</select></label>` : ''}
          </div>
          ${mod('finance') ? `<label><span class="label-row">${t('monthlyGoal')} ${helpBtn('monthlyGoal')}</span><input data-setting="monthlyGoal" inputmode="decimal" value="${s.monthlyGoal || ''}" placeholder="${t('exampleAmount')}"></label>` : ''}
        </section>

        <section class="card form"><header class="card-head"><h2>${t('stages')}</h2>${helpBtn('stage')}</header>${listEditor('stages', s.stages)}</section>
        ${mod('finance') ? `<section class="card form"><header class="card-head"><h2>${t('expenseCategories')}</h2></header>${listEditor('categories', s.categories)}</section>` : ''}
        ${mod('events') ? `<section class="card form"><header class="card-head"><h2>${t('eventTypes')}</h2></header>${listEditor('eventTypes', s.eventTypes, 0)}</section>` : ''}

        <section class="card form">
          <header class="card-head"><h2>${t('data')}</h2>${helpBtn('backup')}</header>
          <div class="btn-col">
            <button class="btn ghost" data-action="export-json">${icon('download', 16)} ${t('exportJson')}</button>
            <label class="btn ghost file-btn">${t('importJson')}<input type="file" accept="application/json,.json" id="import-file" hidden></label>
            ${Cloud.user ? '' : `<button class="btn ghost" data-action="load-demo">${t('loadDemo')}</button>`}
            <button class="btn ghost" data-action="clear-all">${t('emptySpace')}</button>
            <button class="btn danger ghost" data-action="delete-space">${t('deleteSpace')}</button>
          </div>
        </section>
        <section class="card">
          <header class="card-head"><h2>📲 ${t('installTitle')}</h2></header>
          ${isStandalone() ? `<p>${t('installed')}</p>` : `<p>${t('installShort')}</p>
          ${installPrompt ? `<button class="btn" data-action="install-app">${icon('download', 16)} ${t('installBtn')}</button>` : `<button class="link small" data-action="open-guide" data-id="${PLATFORM_GUIDE}">${t('seeSteps')} →</button>`}`}
        </section>
        <section class="card">
          <header class="card-head"><h2>${t('about')}</h2></header>
          <button class="link" data-nav-to="privacy">🔒 ${t('privacyTitle')} →</button>
          <p class="muted small">${t('privacyShort')}</p>
          <p class="muted small">Cadence v3.0 · <a href="https://github.com/melimape/cadence" target="_blank" rel="noopener">GitHub</a></p>
        </section>
      </div>`;
  }

  const calChoices = (name) => ['google', 'device'].map(k => `
    <label class="cal-opt"><input type="radio" name="${name}" value="${k}" data-cal-pref ${calPref() === k ? 'checked' : ''}>
      <span><strong>${t(k === 'google' ? 'calGoogle' : 'calDevice')}</strong><small>${t(k === 'google' ? 'calGoogleHint' : 'calDeviceHint')}</small></span></label>`).join('');

  function viewPrivacy() {
    const info = window.APP_INFO || {};
    const email = String(info.contactEmail || '').trim();
    const contact = email ? `<a href="mailto:${esc(email)}">${esc(email)}</a>` : esc(t('privacyFallbackContact'));
    return `${pageHead(t('privacyTitle'), '', '', t('privacyUpdated'))}
      <article class="card prose">${t('privacyBody', { owner: esc(info.owner || 'Cadence'), contact })}</article>
      <button class="link small" data-nav-to="${Store.hasSpaces() ? 'settings' : 'home'}">← ${t('back')}</button>`;
  }

  /** Screen shown when there is no space yet (signed in on a new account, or signing in from onboarding). */
  function main0() {
    const main = $('#view');
    main.innerHTML = `${pageHead(t('account'), '')}<div class="narrow">${Cloud.user && Cloud.ready
      ? `<section class="card"><p>${t('noSpacesYet')}</p><button class="btn" data-action="new-space">${icon('plus', 16)} ${t('newSpace')}</button></section>`
      : accountCard()}<button class="link small" data-action="back-onboarding">← ${t('back')}</button></div>`;
    $('#fab').hidden = true;
  }

  // ---------------------------------------------------------------- spaces
  function spacesSheet() {
    const list = Store.spaces();
    openSheet(`
      ${sheetHead(t('mySpaces'), 'spaces')}
      <ul class="space-list">${list.map(sp => `
        <li><button class="space-item ${sp.id === Store.currentId ? 'on' : ''}" data-action="switch-space" data-id="${sp.id}">
          <span class="space-ico">${(TEMPLATES[sp.template] || TEMPLATES.generic).icon}</span>
          <span><strong>${esc(sp.name)}</strong><small>${esc(label((TEMPLATES[sp.template] || TEMPLATES.generic).label))}</small></span>
          ${sp.id === Store.currentId ? `<span class="pill ok">${icon('check', 12)} ${t('current')}</span>` : ''}
        </button></li>`).join('')}</ul>
      <button class="btn ghost full" data-action="new-space">${icon('plus', 16)} ${t('newSpace')}</button>
      <p class="hint">${t('spacesHint')}</p>`);
  }

  function templateGrid(selected) {
    return ['personal', 'business'].map(kind => `
      <p class="ob-label">${esc(t(kind === 'personal' ? 'forMe' : 'forBusiness'))}</p>
      <div class="tpl-grid">${Object.entries(TEMPLATES).filter(([, v]) => v.kind === kind).map(([k, v]) => `
        <label class="tpl"><input type="radio" name="tpl" value="${k}" ${k === selected ? 'checked' : ''}>
          <span class="tpl-icon">${v.icon}</span><span>${esc(label(v.label))}</span></label>`).join('')}</div>`).join('');
  }

  function newSpaceForm() {
    openSheet(`
      ${sheetHead(t('newSpace'), 'spaces')}
      <form id="space-form" class="form">
        <p class="muted">${t('newSpaceText')}</p>
        ${templateGrid('personal')}
        <label>${t('spaceName')}<input name="name" autocomplete="off" placeholder="${esc(t('spaceNameHint'))}"></label>
        ${Cloud.user ? '' : `<label class="check"><input type="checkbox" name="demo"> ${t('withSample')}</label>`}
        ${actionsRow('', '')}
      </form>`, { wide: true });
  }

  // ================================================================ sheets (modals)
  function openSheet(html, { wide = false } = {}) {
    const dlg = $('#sheet');
    dlg.classList.toggle('wide', wide);
    $('#sheet-body').innerHTML = html;
    if (!dlg.open) {
      dlg.showModal();
      if (!sheetEntry) { history.pushState({ sheet: true }, ''); sheetEntry = true; }
    }
    $('#sheet-body').scrollTop = 0;
    const first = dlg.querySelector('input:not([type=hidden]):not([type=checkbox]), select, textarea');
    if (first && window.matchMedia('(min-width: 760px)').matches) first.focus();
  }
  function closeSheet() { const d = $('#sheet'); if (d.open) { d.close(); sheetClosed(); } }
  // the sheet's history step is removed right away, so a navigation that follows lands in the right place
  function sheetClosed() { if (sheetEntry) { sheetEntry = false; popGuard = true; history.back(); } }
  const sheetHead = (title, helpKey) => `
    <header class="sheet-head"><h2>${esc(title)} ${helpKey ? helpBtn(helpKey) : ''}</h2>
      <button type="button" class="icon-btn" data-action="close-sheet" aria-label="${t('close')}">${icon('close')}</button></header>`;
  const actionsRow = (deleteAction, id, extra = '') => `
    <div class="sheet-actions">
      ${deleteAction ? `<button type="button" class="btn danger ghost" data-action="${deleteAction}" data-id="${id}">${t('delete')}</button>` : ''}${extra}
      <span class="spacer"></span>
      <button type="button" class="btn ghost" data-action="close-sheet">${t('cancel')}</button>
      <button class="btn" type="submit">${t('save')}</button>
    </div>`;
  const field = (lbl, inner, helpKey, hint) => `<label><span class="label-row">${lbl} ${helpKey ? helpBtn(helpKey) : ''}</span>${inner}${hint ? `<small class="field-hint">${hint}</small>` : ''}</label>`;

  function showHelp(key) {
    let h = I18N[lang()].help[key] || I18N.es.help[key];
    if (!h) return;
    if (typeof h === 'function') h = h(t);
    const dlg = $('#helpdlg');
    $('#help-title').textContent = typeof h.title === 'function' ? h.title(t) : h.title;
    $('#help-body').innerHTML = (typeof h.body === 'function' ? h.body(t) : h.body) + (h.example ? `<p class="example"><strong>${t('example')}:</strong> ${typeof h.example === 'function' ? h.example(t) : h.example}</p>` : '');
    $('#help-ok').textContent = t('gotIt');
    dlg.showModal();
  }

  function quickAddMenu() {
    const opts = [
      ['new-project', 'projects', t('qa_delivery')], mod('finance') && ['new-income', 'money', t('qa_income')], mod('finance') && ['new-expense', 'receipt', t('qa_expense')],
      mod('recurring') && S().recurring.some(a => a.frequency === 'per_session') && ['new-session', 'brush', t('logSession')],
      mod('events') && ['new-event', 'events', t('newEvent')], mod('inventory') && ['new-inventory', 'inventory', t('newInventory')],
      mod('recurring') && ['new-recurring', 'recurring', t('newRecurring')], mod('clients') && ['new-client', 'user', t('qa_client')]
    ].filter(Boolean);
    openSheet(`${sheetHead(t('quickAdd'))}<div class="qa-grid">${opts.map(([a, ic, txt]) => `<button class="qa" data-action="${a}">${icon(ic, 26)}<span>${esc(txt)}</span></button>`).join('')}</div>`);
  }

  const clientOptions = (selected) => `<option value="">${t('none')}</option>` +
    [...S().clients].sort((a, b) => a.name.localeCompare(b.name)).map(c => `<option value="${c.id}" ${c.id === selected ? 'selected' : ''}>${esc(c.name)}</option>`).join('') +
    `<option value="__new">${t('newClientInline')}</option>`;

  function deliverableRow(d = {}, i = 0) {
    return `
      <div class="deliv-row" data-deliv>
        <input type="hidden" name="d_id" value="${esc(d.id || '')}">
        <label class="check mini" title="${t('done')}"><input type="checkbox" name="d_done" ${d.done ? 'checked' : ''} aria-label="${t('done')}"></label>
        <input name="d_title" placeholder="${t('deliverableName')}" value="${esc(d.title || '')}" aria-label="${t('deliverableName')}">
        <input type="date" name="d_date" value="${esc(d.date || '')}" aria-label="${t('dueDate')}" ${i === 0 ? 'required' : ''}>
        <button type="button" class="icon-btn" data-action="remove-deliv" aria-label="${t('remove')}">${icon('close', 16)}</button>
      </div>`;
  }

  const paymentsBlock = (refId, addAction, attr) => {
    const list = incomesOf(refId).sort((a, b) => a.date.localeCompare(b.date));
    return `<fieldset><legend>${t('payments')} · ${t('paid')} ${money(paidOf(refId))}</legend>
      ${list.length ? `<ul class="rows compact">${list.map(x => `<li class="row"><span class="row-main static"><span class="row-title">${money(x.amount)}</span><span class="row-sub">${fmtDate(x.date)}${x.note ? ' · ' + esc(x.note) : ''}</span></span>
        <button type="button" class="icon-btn" data-action="delete-income" data-id="${x.id}" aria-label="${t('delete')}">${icon('close', 16)}</button></li>`).join('')}</ul>` : ''}
      <button type="button" class="link small" data-action="${addAction}" ${attr}="${refId}">${t('addPayment')}</button></fieldset>`;
  };

  function projectForm(id, presetDate, presetClient) {
    const p = id ? Store.project(id) : null;
    const dels = p?.deliverables?.length ? p.deliverables : [{ title: '', date: presetDate || addDays(today(), 7) }];
    openSheet(`
      ${sheetHead(p ? t('editProject') : t('newProject'), 'projects')}
      <form id="project-form" class="form" data-id="${p?.id || ''}">
        ${field(t('projectTitle'), `<input name="title" required value="${esc(p?.title || '')}" autocomplete="off" placeholder="${esc(t('projectTitleHint'))}">`)}
        <div class="two">
          ${mod('clients') ? field(t('client'), `<select name="clientId" data-client-select>${clientOptions(p?.clientId || presetClient || '')}</select>`) : ''}
          ${field(t('stage'), `<select name="stage">${stages().map(s => `<option value="${s.id}" ${s.id === (p ? stageOf(p).id : stages()[0].id) ? 'selected' : ''}>${esc(label(s))}</option>`).join('')}</select>`, 'stage')}
        </div>
        ${mod('clients') ? `<label class="new-client-field" hidden>${t('newClient')}<input name="newClient" autocomplete="off"></label>` : ''}
        ${bizMoney() ? `<div class="two">
          ${field(t('totalValue'), `<input name="total" inputmode="decimal" value="${p?.total || ''}" placeholder="${t('exampleAmount')}">`, 'totalValue')}
          ${p ? `<div class="balance-box"><span class="muted small">${t('balance')}</span><strong>${money(balance(p))}</strong></div>`
            : field(t('deposit'), `<input name="deposit" inputmode="decimal" placeholder="0">`, 'deposit')}
        </div>` : ''}
        <fieldset><legend>${t('deliverables')} ${helpBtn('deliverables')}</legend>
          <div id="deliv-list">${dels.map((d, i) => deliverableRow(d, i)).join('')}</div>
          <button type="button" class="link small" data-action="add-deliv">${t('addDeliverable')}</button></fieldset>
        ${p && bizMoney() ? paymentsBlock(p.id, 'new-payment', 'data-project') : ''}
        ${field(t('notes'), `<textarea name="notes" rows="2">${esc(p?.notes || '')}</textarea>`)}
        ${actionsRow(p ? 'delete-project' : '', p?.id, p ? `<button type="button" class="btn ghost" data-action="ics-project" data-id="${p.id}" aria-label="${t('addToCalendar')}">${icon('cal_add', 16)}</button>` : '')}
      </form>`, { wide: true });
  }

  /** One form for every income. `type` and `refId` say what it pays for. */
  function incomeForm({ id, type, refId, amount, month } = {}) {
    const x = id ? Store.find('incomes', id) : null;
    const ty = x?.type || type || 'project';
    const ref = x?.refId ?? refId ?? '';
    const date = x?.date || (month && month !== monthKey(today()) ? monthEnd(month) : today());
    const refOptions = (kind) => {
      if (kind === 'project') return S().projects.filter(p => balance(p) > 0 || p.id === ref).map(p => [p.id, `${p.title} · ${clientName(p.clientId)}`, Math.max(0, balance(p))]);
      if (kind === 'event') return S().events.filter(e => eventBalance(e) > 0 || e.id === ref).map(e => [e.id, `${e.title} · ${fmtDate(e.date)}`, eventBalance(e)]);
      if (kind === 'recurring') return S().recurring.filter(a => a.active || a.id === ref).map(a => [a.id, `${a.payer} · ${a.concept}`, statusFor(a, monthKey(today())).missing]);
      if (kind === 'sale') return S().inventory.filter(i => i.status !== 'sold' || i.id === ref).map(i => [i.id, i.title, i.price]);
      return [];
    };
    const opts = refOptions(ty);
    const pre = amount ?? x?.amount ?? (opts.find(o => o[0] === ref)?.[2] || (opts.length && !ref && opts[0]?.[2]) || '');
    openSheet(`
      ${sheetHead(x ? t('editIncome') : t('newIncome'), 'incomeTypes')}
      <form id="income-form" class="form" data-id="${x?.id || ''}">
        ${field(t('incomeType'), `<select name="type" data-income-type>${INCOME_TYPES.filter(k => typeEnabled(k) || k === ty).map(k => `<option value="${k}" ${k === ty ? 'selected' : ''}>${esc(typeLabel(k))}</option>`).join('')}</select>`)}
        ${!['other', 'salary'].includes(ty) ? field(t('whatFor'), opts.length ? `<select name="refId" data-income-ref>${opts.map(o => `<option value="${o[0]}" data-amount="${o[2]}" ${o[0] === ref ? 'selected' : ''}>${esc(o[1])}</option>`).join('')}</select>`
          : `<p class="muted small">${t('nothingToPay')}</p><input type="hidden" name="refId" value="">`) : '<input type="hidden" name="refId" value="">'}
        <div class="two">
          ${field(t('amount'), `<input name="amount" inputmode="decimal" required value="${pre || ''}" placeholder="${t('exampleAmount')}">`)}
          ${field(t('date'), `<input type="date" name="date" required value="${date}">`)}
        </div>
        ${field(t('noteOptional'), `<input name="note" value="${esc(x?.note || '')}" autocomplete="off" placeholder="${t('noteHint')}">`)}
        ${actionsRow(x ? 'delete-income' : '', x?.id)}
      </form>`);
  }

  function expenseForm(id) {
    const e = id ? Store.find('expenses', id) : null;
    openSheet(`
      ${sheetHead(e ? t('editExpense') : t('newExpense'))}
      <form id="expense-form" class="form" data-id="${e?.id || ''}">
        <div class="two">
          ${field(t('amount'), `<input name="amount" inputmode="decimal" required value="${e?.amount || ''}" placeholder="${t('exampleAmount')}">`)}
          ${field(t('date'), `<input type="date" name="date" required value="${e?.date || today()}">`)}
        </div>
        ${field(t('category'), `<select name="category">${S().settings.categories.map(c => `<option value="${c.id}" ${c.id === e?.category ? 'selected' : ''}>${esc(label(c))}</option>`).join('')}</select>`)}
        ${field(t('description'), `<input name="description" value="${esc(e?.description || '')}" autocomplete="off" placeholder="${t('expenseHint')}">`)}
        ${!bizMoney() ? '<input type="hidden" name="projectId" value="">' : field(t('linkedProject'), `<select name="projectId"><option value="">${t('none')}</option>${S().projects.filter(p => !isClosed(p) || p.id === e?.projectId).map(p => `<option value="${p.id}" ${p.id === e?.projectId ? 'selected' : ''}>${esc(p.title)}</option>`).join('')}</select>`)}
        ${actionsRow(e ? 'delete-expense' : '', e?.id)}
      </form>`);
  }

  function clientForm(id) {
    const c = id ? Store.client(id) : null;
    openSheet(`
      ${sheetHead(c ? t('editClient') : t('newClient'), 'clients')}
      <form id="client-form" class="form" data-id="${c?.id || ''}">
        ${field(t('name'), `<input name="name" required value="${esc(c?.name || '')}" autocomplete="off" placeholder="${t('clientNameHint')}">`)}
        ${field(t('contactPerson'), `<input name="contact" value="${esc(c?.contact || '')}" autocomplete="off">`)}
        <div class="two">
          ${field(t('phone'), `<input name="phone" type="tel" value="${esc(c?.phone || '')}" placeholder="+57 300 000 0000">`)}
          ${field(t('email'), `<input name="email" type="email" value="${esc(c?.email || '')}" autocapitalize="off">`)}
        </div>
        ${field(t('notes'), `<textarea name="notes" rows="2">${esc(c?.notes || '')}</textarea>`)}
        ${actionsRow(c ? 'delete-client' : '', c?.id)}
      </form>`);
  }

  function clientDetail(id) {
    const c = Store.client(id);
    if (!c) return;
    const { ps, es, billed, received } = clientTotals(c);
    const phoneDigits = (c.phone || '').replace(/\D/g, '');
    openSheet(`
      ${sheetHead(c.name)}
      <div class="client-detail">
        ${c.contact ? `<p>${icon('user', 16)} ${esc(c.contact)}</p>` : ''}
        <div class="btn-row wrap">
          ${phoneDigits ? `<a class="btn small ghost" href="https://wa.me/${phoneDigits}" target="_blank" rel="noopener">${icon('whatsapp', 16)} WhatsApp · ${esc(c.phone)}</a>` : ''}
          ${c.email ? `<a class="btn small ghost" href="mailto:${esc(c.email)}">${icon('mail', 16)} ${esc(c.email)}</a>` : ''}
        </div>
        ${c.notes ? `<p class="muted">${esc(c.notes)}</p>` : ''}
        <div class="kpis three">
          <div class="kpi"><span class="kpi-label">${t('totalBilled')}</span><span class="kpi-value">${money(billed)}</span></div>
          <div class="kpi"><span class="kpi-label">${t('totalReceived')}</span><span class="kpi-value">${money(received)}</span></div>
          <div class="kpi"><span class="kpi-label">${t('balance')}</span><span class="kpi-value">${money(billed - received)}</span></div>
        </div>
        <h3>${t('history')}</h3>
        ${ps.length || es.length ? `<ul class="rows compact">${ps.map(projectLine).join('')}${es.map(e => `<li class="row"><button class="row-main" data-action="edit-event" data-id="${e.id}"><span class="row-title">${esc(e.title)}</span><span class="row-sub">${esc(eventTypeLabel(e.type))} · ${fmtDate(e.date)}</span></button></li>`).join('')}</ul>` : `<p class="muted">${t('noHistory')}</p>`}
        <div class="sheet-actions">
          <button class="btn ghost" data-action="edit-client" data-id="${c.id}">${t('editClient')}</button>
          <span class="spacer"></span>
          <button class="btn" data-action="new-project" data-client="${c.id}">${icon('plus', 16)} ${esc(t('newProject'))}</button>
        </div>
      </div>`, { wide: true });
  }

  const groupsList = () => [...new Set(S().recurring.map(a => a.group).filter(Boolean).concat(S().sessions.map(s => s.group).filter(Boolean)))].sort();

  function recurringForm(id) {
    const a = id ? Store.find('recurring', id) : null;
    openSheet(`
      ${sheetHead(a ? `${t('edit')} · ${a.payer}` : t('newRecurring'), 'recurring')}
      <form id="recurring-form" class="form" data-id="${a?.id || ''}">
        ${field(t('payer'), `<input name="payer" required value="${esc(a?.payer || '')}" autocomplete="off" placeholder="${t('payerHint')}">`)}
        ${field(t('concept'), `<input name="concept" required value="${esc(a?.concept || '')}" autocomplete="off" placeholder="${esc(t('conceptHint'))}">`, 'concept')}
        <p class="privacy">🔒 ${t('privacyNote')}</p>
        ${field(t('group'), `<input name="group" list="groups-dl" value="${esc(a?.group || '')}" autocomplete="off" placeholder="${t('groupHint')}"><datalist id="groups-dl">${groupsList().map(g => `<option value="${esc(g)}">`).join('')}</datalist>`, 'group')}
        <div class="two">
          ${field(t('amount'), `<input name="amount" inputmode="decimal" required value="${a?.amount || ''}" placeholder="${t('exampleAmount')}">`)}
          ${field(t('frequency'), `<select name="frequency"><option value="monthly" ${a?.frequency !== 'per_session' ? 'selected' : ''}>${t('freq_monthly')}</option><option value="per_session" ${a?.frequency === 'per_session' ? 'selected' : ''}>${esc(t('freq_per_session', t('session').toLowerCase()))}</option></select>`, 'frequency')}
        </div>
        <div class="two">
          ${field(t('startDate'), `<input type="date" name="startDate" value="${a?.startDate || today()}">`)}
          <label class="check inline"><input type="checkbox" name="active" ${a ? (a.active ? 'checked' : '') : 'checked'}> ${t('activeLabel')}</label>
        </div>
        ${field(t('notes'), `<textarea name="notes" rows="2">${esc(a?.notes || '')}</textarea>`)}
        ${actionsRow(a ? 'delete-recurring' : '', a?.id)}
      </form>`);
  }

  function sessionForm(group) {
    const groups = groupsList();
    openSheet(`
      ${sheetHead(t('logSession'), 'session')}
      <form id="session-form" class="form">
        ${field(t('group'), groups.length ? `<select name="group">${groups.map(g => `<option ${g === group ? 'selected' : ''}>${esc(g)}</option>`).join('')}</select>` : `<input name="group" required placeholder="${t('groupHint')}">`)}
        ${field(t('date'), `<input type="date" name="date" required value="${today()}">`)}
        ${field(t('noteOptional'), `<input name="note" autocomplete="off" placeholder="${t('sessionNoteHint')}">`)}
        <p class="hint">${t('sessionExplain')}</p>
        ${actionsRow('', '')}
      </form>`);
  }

  function eventForm(id) {
    const e = id ? Store.find('events', id) : null;
    const types = S().settings.eventTypes;
    openSheet(`
      ${sheetHead(e ? t('editEvent') : t('newEvent'), 'events')}
      <form id="event-form" class="form" data-id="${e?.id || ''}">
        ${field(t('eventTitle'), `<input name="title" required value="${esc(e?.title || '')}" autocomplete="off" placeholder="${t('eventTitleHint')}">`)}
        <div class="two">
          ${field(t('eventType'), `<select name="type">${types.map(x => `<option value="${x.id}" ${x.id === e?.type ? 'selected' : ''}>${esc(label(x))}</option>`).join('')}<option value="other" ${e?.type === 'other' ? 'selected' : ''}>${t('otherType')}</option></select>`)}
          ${mod('clients') ? field(t('client'), `<select name="clientId">${clientOptions(e?.clientId || '').replace(`<option value="__new">${t('newClientInline')}</option>`, '')}</select>`) : ''}
        </div>
        <div class="two">
          ${field(t('date'), `<input type="date" name="date" required value="${e?.date || addDays(today(), 7)}">`)}
          ${field(t('time'), `<input type="time" name="time" value="${esc(e?.time || '')}">`)}
        </div>
        ${field(t('place'), `<input name="place" value="${esc(e?.place || '')}" autocomplete="off">`)}
        ${bizMoney() ? field(t('eventValue'), `<input name="total" inputmode="decimal" value="${e?.total || ''}" placeholder="0">`, 'eventValue') : ''}
        ${e && bizMoney() ? paymentsBlock(e.id, 'pay-event', 'data-id') : ''}
        <label class="check"><input type="checkbox" name="done" ${e?.done ? 'checked' : ''}> ${t('eventDone')}</label>
        ${field(t('notes'), `<textarea name="notes" rows="2">${esc(e?.notes || '')}</textarea>`)}
        ${actionsRow(e ? 'delete-event' : '', e?.id, e ? `<button type="button" class="btn ghost" data-action="ics-event" data-id="${e.id}" aria-label="${t('addToCalendar')}">${icon('cal_add', 16)}</button>` : '')}
      </form>`, { wide: true });
  }

  function inventoryForm(id) {
    const x = id ? Store.find('inventory', id) : null;
    const sale = x ? S().incomes.find(i => i.type === 'sale' && i.refId === x.id) : null;
    openSheet(`
      ${sheetHead(x ? `${t('edit')} · ${x.title}` : t('newInventory'), 'inventory')}
      <form id="inventory-form" class="form" data-id="${x?.id || ''}">
        ${field(t('invTitle'), `<input name="title" required value="${esc(x?.title || '')}" autocomplete="off">`)}
        <div class="two">
          ${field(t('technique'), `<input name="technique" value="${esc(x?.technique || '')}" placeholder="${t('techniqueHint')}">`)}
          ${field(t('size'), `<input name="size" value="${esc(x?.size || '')}" placeholder="50 × 70 cm">`)}
        </div>
        <div class="two">
          ${field(t('price'), `<input name="price" inputmode="decimal" value="${x?.price || ''}" placeholder="${t('exampleAmount')}">`)}
          ${field(t('status'), `<select name="status">${['available', 'reserved', 'sold'].map(s => `<option value="${s}" ${s === (x?.status || 'available') ? 'selected' : ''}>${t('inv_' + s)}</option>`).join('')}</select>`)}
        </div>
        ${sale ? `<p class="hint">${icon('check', 14)} ${t('soldOn')} ${fmtDate(sale.date)} · ${money(sale.amount)}</p>` : ''}
        ${field(t('notes'), `<textarea name="notes" rows="2">${esc(x?.notes || '')}</textarea>`)}
        ${actionsRow(x ? 'delete-inventory' : '', x?.id)}
      </form>`);
  }

  function sellForm(id) {
    const x = Store.find('inventory', id);
    openSheet(`
      ${sheetHead(`${t('markSold')} · ${x.title}`, 'sell')}
      <form id="sell-form" class="form" data-id="${x.id}">
        <div class="two">
          ${field(t('salePrice'), `<input name="amount" inputmode="decimal" required value="${x.price || ''}">`)}
          ${field(t('date'), `<input type="date" name="date" required value="${today()}">`)}
        </div>
        ${field(t('buyer'), `<input name="note" autocomplete="off" placeholder="${t('buyerHint')}">`)}
        ${actionsRow('', '')}
      </form>`);
  }

  // ================================================================ form handlers
  function resolveClient(form) {
    let clientId = form.clientId.value;
    if (clientId === '__new') {
      const name = form.newClient.value.trim();
      if (!name) return '';
      const c = { id: Store.uid(), name, contact: '', phone: '', email: '', notes: '' };
      S().clients.push(c);
      clientId = c.id;
    }
    return clientId;
  }
  const done = () => { closeSheet(); toast(t('saved')); };

  const submitters = {
    'project-form': (f) => {
      const existing = f.dataset.id ? Store.project(f.dataset.id) : null;
      const deliverables = [...f.querySelectorAll('[data-deliv]')].map(row => ({
        id: row.querySelector('[name=d_id]').value || Store.uid(),
        title: row.querySelector('[name=d_title]').value.trim(),
        date: row.querySelector('[name=d_date]').value,
        done: row.querySelector('[name=d_done]').checked
      })).filter(d => d.title || d.date).map(d => ({ ...d, title: d.title || f.title.value.trim() }));
      const p = {
        ...(existing || { id: Store.uid(), createdAt: new Date().toISOString(), clientId: '', total: 0 }),
        title: f.title.value.trim(), stage: f.stage.value, deliverables, notes: f.notes.value.trim()
      };
      if (f.clientId) p.clientId = resolveClient(f);
      if (f.total) p.total = num(f.total.value);
      if (deliverables.length && deliverables.every(d => d.done)) p.stage = finalStageId();
      if (!existing && f.deposit && num(f.deposit.value) > 0) {
        S().incomes.push({ id: Store.uid(), date: today(), amount: num(f.deposit.value), type: 'project', refId: p.id, note: t('deposit') });
      }
      Store.upsert('projects', p); done();
    },
    'income-form': (f) => {
      const existing = f.dataset.id ? Store.find('incomes', f.dataset.id) : null;
      const item = { ...(existing || { id: Store.uid() }), type: f.type.value, refId: f.refId?.value || '', amount: num(f.amount.value), date: f.date.value, note: f.note.value.trim() };
      if (item.type === 'sale' && item.refId) { const inv = Store.find('inventory', item.refId); if (inv) inv.status = 'sold'; }
      Store.upsert('incomes', item); done();
    },
    'expense-form': (f) => {
      Store.upsert('expenses', { id: f.dataset.id || Store.uid(), amount: num(f.amount.value), date: f.date.value, category: f.category.value, description: f.description.value.trim(), projectId: f.projectId.value });
      done();
    },
    'client-form': (f) => {
      const existing = f.dataset.id ? Store.client(f.dataset.id) : null;
      Store.upsert('clients', { ...(existing || { id: Store.uid() }), name: f.name.value.trim(), contact: f.contact.value.trim(), phone: f.phone.value.trim(), email: f.email.value.trim(), notes: f.notes.value.trim() });
      done();
    },
    'recurring-form': (f) => {
      const existing = f.dataset.id ? Store.find('recurring', f.dataset.id) : null;
      Store.upsert('recurring', { ...(existing || { id: Store.uid() }), payer: f.payer.value.trim(), concept: f.concept.value.trim(), group: f.group.value.trim(), amount: num(f.amount.value), frequency: f.frequency.value, startDate: f.startDate.value, active: f.active.checked, notes: f.notes.value.trim() });
      done();
    },
    'session-form': (f) => {
      Store.upsert('sessions', { id: Store.uid(), date: f.date.value, group: f.group.value.trim(), note: f.note.value.trim() });
      closeSheet(); toast(`✓ ${t('session')} · ${f.group.value}`);
    },
    'event-form': (f) => {
      const existing = f.dataset.id ? Store.find('events', f.dataset.id) : null;
      Store.upsert('events', { ...(existing || { id: Store.uid(), clientId: '', total: 0 }), title: f.title.value.trim(), type: f.type.value, ...(f.clientId ? { clientId: f.clientId.value } : {}), date: f.date.value, time: f.time.value, place: f.place.value.trim(), ...(f.total ? { total: num(f.total.value) } : {}), done: f.done.checked, notes: f.notes.value.trim() });
      done();
    },
    'inventory-form': (f) => {
      const existing = f.dataset.id ? Store.find('inventory', f.dataset.id) : null;
      Store.upsert('inventory', { ...(existing || { id: Store.uid() }), title: f.title.value.trim(), technique: f.technique.value.trim(), size: f.size.value.trim(), price: num(f.price.value), status: f.status.value, notes: f.notes.value.trim() });
      done();
    },
    'sell-form': (f) => {
      const x = Store.find('inventory', f.dataset.id);
      x.status = 'sold';
      S().incomes.push({ id: Store.uid(), type: 'sale', refId: x.id, amount: num(f.amount.value), date: f.date.value, note: f.note.value.trim() });
      Store.save(); closeSheet(); toast(`✓ ${t('inv_sold')}: ${x.title}`);
    },
    'space-form': (f) => {
      const k = f.querySelector('input[name=tpl]:checked')?.value || 'personal';
      closeSheet();
      Store.createSpace({ template: k, name: f.name.value.trim(), demo: !!f.demo?.checked });
      go('home'); toast(`${tpl().icon} ${Store.space().name}`);
    },
    'email-form': async (f, submitter) => {
      const email = f.email.value.trim(), pass = f.password.value;
      try {
        if (submitter?.value === 'up') {
          if (!f.ownerDocument.getElementById('privacy-ok')?.checked) { toast(t('privacyNeeded'), true); return; }
          const cred = await Cloud.signUpEmail(email, pass);
          Cloud.recordConsent(cred?.user?.uid, PRIVACY_VERSION);
        } else await Cloud.signInEmail(email, pass);
        toast(t('welcomeBack')); go('home');
      } catch (e) { toast(authError(e), true); }
    }
  };

  function authError(e) {
    const code = (e && e.code) || '';
    const key = {
      'auth/invalid-credential': 'err_wrongPass', 'auth/wrong-password': 'err_wrongPass', 'auth/user-not-found': 'err_wrongPass',
      'auth/email-already-in-use': 'err_emailUsed', 'auth/weak-password': 'err_weakPass', 'auth/invalid-email': 'err_badEmail',
      'auth/popup-blocked': 'err_popup', 'auth/popup-closed-by-user': 'err_popupClosed', 'auth/cancelled-popup-request': 'err_popupClosed',
      'auth/network-request-failed': 'err_network', 'auth/unauthorized-domain': 'err_domain', 'auth/operation-not-allowed': 'err_provider',
      'auth/too-many-requests': 'err_tooMany'
    }[code];
    return key ? t(key) : `${t('err_generic')} (${code || e.message})`;
  }

  // ================================================================ exports (CSV + calendar)
  function download(filename, content, type) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
  }
  function toCsv(header, rows) {
    const sep = lang() === 'es' ? ';' : ','; // ";" opens correctly in Spanish-language Excel
    const cell = v => { const s = String(v ?? ''); return /[";,\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };
    return '﻿' + [header, ...rows].map(r => r.map(cell).join(sep)).join('\r\n');
  }
  function exportCsv(what) {
    const cats = S().settings.categories, P = S().projects;
    const refName = (x) => ({ project: Store.project(x.refId)?.title, event: Store.find('events', x.refId)?.title, sale: Store.find('inventory', x.refId)?.title, recurring: Store.find('recurring', x.refId)?.payer }[x.type] || '');
    const tables = {
      projects: [['project', 'client', 'stage', 'total', 'paid', 'balance', 'next_delivery', 'notes'], P.map(p => [p.title, clientName(p.clientId), label(stageOf(p)), p.total, paidOf(p.id), balance(p), nextDeliverable(p)?.date || '', p.notes])],
      deliverables: [['project', 'client', 'deliverable', 'date', 'done'], P.flatMap(p => (p.deliverables || []).map(d => [p.title, clientName(p.clientId), d.title, d.date, d.done || isClosed(p) ? 'yes' : 'no']))],
      incomes: [['date', 'type', 'for', 'amount', 'note'], S().incomes.map(x => [x.date, typeLabel(x.type), refName(x), x.amount, x.note])],
      expenses: [['date', 'category', 'description', 'amount', 'project'], S().expenses.map(e => [e.date, label(cats.find(c => c.id === e.category)), e.description, e.amount, Store.project(e.projectId)?.title || ''])],
      clients: [['name', 'contact', 'phone', 'email', 'projects', 'total_billed', 'total_received', 'notes'], S().clients.map(c => { const x = clientTotals(c); return [c.name, c.contact, c.phone, c.email, x.ps.length, x.billed, x.received, c.notes]; })],
      events: [['date', 'time', 'event', 'type', 'place', 'client', 'value', 'paid', 'done'], S().events.map(e => [e.date, e.time, e.title, eventTypeLabel(e.type), e.place, clientName(e.clientId), e.total, paidOf(e.id), e.done ? 'yes' : 'no'])],
      inventory: [['title', 'technique', 'size', 'price', 'status'], S().inventory.map(x => [x.title, x.technique, x.size, x.price, t('inv_' + x.status)])],
      recurring: [['payer', 'concept', 'group', 'amount', 'frequency', 'active', 'start'], S().recurring.map(a => [a.payer, a.concept, a.group, a.amount, a.frequency, a.active ? 'yes' : 'no', a.startDate])]
    };
    const [h, rows] = tables[what];
    download(`cadence-${what}-${today()}.csv`, toCsv(h, rows), 'text/csv;charset=utf-8');
  }

  /** .ics file: iPhone/Mac Calendar adds the events with reminders. */
  function buildIcs(items) {
    const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+/, '');
    const e = s => String(s || '').replace(/[\\;,]/g, m => '\\' + m).replace(/\n/g, '\\n');
    const emoji = tpl().icon;
    const events = items.map(it => {
      const lines = ['BEGIN:VEVENT', `UID:${it.id}@cadence`, `DTSTAMP:${stamp}`];
      if (it.time) {
        const [hh, mm] = it.time.split(':').map(Number);
        const start = `${it.date.replace(/-/g, '')}T${String(hh).padStart(2, '0')}${String(mm).padStart(2, '0')}00`;
        const endH = Math.min(23, hh + 2);
        lines.push(`DTSTART:${start}`, `DTEND:${it.date.replace(/-/g, '')}T${String(endH).padStart(2, '0')}${String(mm).padStart(2, '0')}00`);
        lines.push('BEGIN:VALARM', 'ACTION:DISPLAY', 'TRIGGER:-P1D', `DESCRIPTION:${e(it.summary)}`, 'END:VALARM',
          'BEGIN:VALARM', 'ACTION:DISPLAY', 'TRIGGER:-PT2H', `DESCRIPTION:${e(it.summary)}`, 'END:VALARM');
      } else {
        lines.push(`DTSTART;VALUE=DATE:${it.date.replace(/-/g, '')}`, `DTEND;VALUE=DATE:${addDays(it.date, 1).replace(/-/g, '')}`);
        // all-day: the day before at 9:00 and the same day at 8:00
        lines.push('BEGIN:VALARM', 'ACTION:DISPLAY', 'TRIGGER:-PT15H', `DESCRIPTION:${e(it.summary)}`, 'END:VALARM',
          'BEGIN:VALARM', 'ACTION:DISPLAY', 'TRIGGER:PT8H', `DESCRIPTION:${e(it.summary)}`, 'END:VALARM');
      }
      if (it.place) lines.push(`LOCATION:${e(it.place)}`);
      lines.push(`SUMMARY:${e(`${emoji} ${it.summary}`)}`, `DESCRIPTION:${e(it.description || '')}`, 'END:VEVENT');
      return lines.join('\r\n');
    });
    return ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Cadence//Dashboard//EN', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH', ...events, 'END:VCALENDAR'].join('\r\n');
  }
  const icsDeliverable = (d, p) => ({ id: d.id, date: d.date, summary: mod('clients') && p.clientId ? `${d.title} · ${clientName(p.clientId)}` : d.title, description: p.title + (p.notes ? '\n' + p.notes : '') });
  const icsEvent = (ev) => ({ id: ev.id, date: ev.date, time: ev.time, place: ev.place, summary: ev.title, description: eventTypeLabel(ev.type) + (ev.notes ? '\n' + ev.notes : '') });
  /** Google Calendar "new event" link with everything filled in (works on Android, Windows, any browser). */
  function googleCalUrl(it) {
    const d = it.date.replace(/-/g, '');
    let dates;
    if (it.time) {
      const [hh, mm] = it.time.split(':').map(Number);
      const f = (h) => `${d}T${String(h).padStart(2, '0')}${String(mm).padStart(2, '0')}00`;
      dates = `${f(hh)}/${f(Math.min(23, hh + 2))}`;
    } else dates = `${d}/${addDays(it.date, 1).replace(/-/g, '')}`;
    const q = new URLSearchParams({ action: 'TEMPLATE', text: `${tpl().icon} ${it.summary}`, dates, details: it.description || '' });
    if (it.place) q.set('location', it.place);
    if (it.time) { try { q.set('ctz', Intl.DateTimeFormat().resolvedOptions().timeZone); } catch (e) { /* ignore */ } }
    return 'https://calendar.google.com/calendar/render?' + q.toString();
  }
  function openExternal(url) {
    const a = document.createElement('a');
    a.href = url; a.target = '_blank'; a.rel = 'noopener';
    document.body.appendChild(a); a.click(); a.remove();
  }
  let pendingCal = null;
  function calChooser(then) {
    pendingCal = then;
    openSheet(`${sheetHead(t('calChooseTitle'), '')}<p class="muted">${t('calChooseText')}</p><div class="cal-opts">${calChoices('cal-first')}</div>`);
  }
  /** Sends dates to the calendar this person chose: Google Calendar links, or an .ics file (iPhone, Mac, Outlook). */
  function exportIcs(items, name, fromChooser = false) {
    if (!items.length) { toast(t('noPendingDeliveries')); return; }
    const pref = calPref();
    if (!pref) { calChooser(() => exportIcs(items, name, true)); return; }
    if (pref === 'google') {
      if (items.length === 1) { if (fromChooser) closeSheet(); openExternal(googleCalUrl(items[0])); return; }
      openSheet(`${sheetHead(t('calListTitle'), '')}<p class="muted">${t('calListText')}</p>
        <ul class="rows cal-list">${[...items].sort((x, y) => (x.date + (x.time || '')).localeCompare(y.date + (y.time || ''))).map(it => `
          <li class="row"><span class="row-main static"><span class="row-title">${esc(it.summary)}</span><span class="row-sub">${esc(fmtDate(it.date))}${it.time ? ' · ' + esc(it.time) : ''}</span></span>
          <a class="btn small ghost" href="${esc(googleCalUrl(it))}" target="_blank" rel="noopener" data-cal-link>${icon('cal_add', 15)} ${t('calAdd')}</a></li>`).join('')}</ul>`);
      return;
    }
    if (fromChooser) closeSheet();
    download(`${name}.ics`, buildIcs(items), 'text/calendar;charset=utf-8');
    toast(t('icsHint'));
  }

  // ================================================================ dialogs
  let toastTimer;
  function toast(msg, isError = false) {
    const el = $('#toast');
    el.textContent = msg; el.classList.toggle('error', isError); el.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { el.hidden = true; }, isError ? 5000 : 2400);
  }
  function ask(message) {
    const dlg = $('#confirm');
    $('#confirm-msg').textContent = message;
    $('#confirm-ok').textContent = t('accept');
    $('#confirm-cancel').textContent = t('cancel');
    dlg.showModal();
    return new Promise(resolve => dlg.addEventListener('close', () => resolve(dlg.returnValue === 'ok'), { once: true }));
  }

  // ================================================================ onboarding
  function onboarding() {
    openSheet(`
      <div class="onboard">
        <div class="logo-big" aria-hidden="true"><img src="icons/icon.svg" alt="" width="64" height="64"></div>
        <h2>${t('welcome')}</h2>
        <p class="muted">${t('welcomeText')}</p>
        <div class="lang-toggle">
          <button class="link small ${lang() === 'es' ? 'strong' : ''}" data-action="ob-lang" data-lang="es">Español</button> ·
          <button class="link small ${lang() === 'en' ? 'strong' : ''}" data-action="ob-lang" data-lang="en">English</button>
        </div>
        <h3 class="ob-q">${t('chooseWork')}</h3>
        ${templateGrid(S().settings.template in TEMPLATES ? S().settings.template : 'personal')}
        <p class="hint">${t('oneSpaceFirst')}</p>
        <div class="btn-col">
          <button class="btn" data-action="ob-empty">${t('startEmpty')}</button>
          <button class="btn ghost" data-action="ob-demo">${t('startDemo')}</button>
          ${Cloud.configured() ? `<button class="btn ghost" data-action="ob-account">${icon('cloud', 16)} ${t('haveAccount')}</button>` : ''}
        </div>
      </div>`, { wide: true });
    $('#sheet').classList.add('locked');
  }
  const chosenTemplate = () => document.querySelector('input[name=tpl]:checked')?.value || 'personal';
  const unlockSheet = () => { $('#sheet').classList.remove('locked'); closeSheet(); };

  // ================================================================ actions
  // History: every screen and every open sheet is one step back, so the phone's back button
  // (Android, browser back) first closes what is open and then returns to the previous screen.
  let sheetEntry = false, popGuard = false, pendingView = null;
  function go(view) {
    if (popGuard) { pendingView = view; return; } // a sheet is still removing its history step
    ui.view = view;
    if (location.hash !== '#' + view) history.pushState(null, '', '#' + view);
    render(); window.scrollTo({ top: 0 });
  }

  const actions = {
    'close-sheet': () => closeSheet(),
    'help': (el) => showHelp(el.dataset.key),
    'open-guide': (el) => { closeSheet(); go('help'); requestAnimationFrame(() => { const g = $('#guide-' + el.dataset.id); if (g) { g.open = true; g.scrollIntoView({ behavior: 'smooth' }); } }); },
    'leave-demo': async () => { if (await ask(t('confirmLeaveDemo'))) { Store.resetSpace(); toast(t('saved')); } },
    'open-spaces': () => spacesSheet(),
    'new-space': () => newSpaceForm(),
    'switch-space': (el) => { closeSheet(); if (el.dataset.id !== Store.currentId) { Store.switchSpace(el.dataset.id); toast(`${tpl().icon} ${Store.space().name}`); } },
    'delete-space': async () => {
      const sp = Store.space();
      if (!(await ask(t('confirmDeleteSpace', sp.name)))) return;
      const data = Store.deleteSpace(sp.id);
      Cloud.deleteSpaceRemote(sp.id, data);
      toast(t('deleted'));
      if (!Store.hasSpaces() || !Store.spaces().length) onboarding(); else go('home');
    },
    'back-onboarding': () => onboarding(),

    'new-project': (el) => projectForm(null, el.dataset.date, el.dataset.client),
    'edit-project': (el) => projectForm(el.dataset.id),
    'delete-project': async (el) => { if (await ask(t('confirmDelete'))) { Store.remove('projects', el.dataset.id); closeSheet(); toast(t('deleted')); } },
    'new-payment': (el) => incomeForm({ type: 'project', refId: el.dataset.project }),
    'new-income': () => incomeForm({ type: personalMoney() ? 'salary' : S().projects.some(p => balance(p) > 0) ? 'project' : 'other' }),
    'edit-income': (el) => incomeForm({ id: el.dataset.id }),
    'delete-income': async (el) => { if (await ask(t('confirmDelete'))) { Store.remove('incomes', el.dataset.id); closeSheet(); toast(t('deleted')); } },
    'new-expense': () => expenseForm(),
    'edit-expense': (el) => expenseForm(el.dataset.id),
    'delete-expense': async (el) => { if (await ask(t('confirmDelete'))) { Store.remove('expenses', el.dataset.id); closeSheet(); toast(t('deleted')); } },
    'new-client': () => clientForm(),
    'edit-client': (el) => clientForm(el.dataset.id),
    'open-client': (el) => clientDetail(el.dataset.id),
    'delete-client': async (el) => { if (await ask(t('confirmDelete'))) { Store.remove('clients', el.dataset.id); closeSheet(); toast(t('deleted')); } },
    'new-recurring': () => recurringForm(),
    'edit-recurring': (el) => recurringForm(el.dataset.id),
    'delete-recurring': async (el) => { if (await ask(t('confirmDeleteRecurring'))) { Store.remove('recurring', el.dataset.id); closeSheet(); toast(t('deleted')); } },
    'pay-recurring': (el) => { const a = Store.find('recurring', el.dataset.id); const mk = el.dataset.month || monthKey(today()); incomeForm({ type: 'recurring', refId: a.id, amount: statusFor(a, mk).missing || a.amount, month: mk }); },
    'new-session': (el) => sessionForm(el.dataset.group),
    'delete-session': async (el) => { if (await ask(t('confirmDeleteSession'))) { Store.remove('sessions', el.dataset.id); toast(t('deleted')); } },
    'new-event': () => eventForm(),
    'edit-event': (el) => eventForm(el.dataset.id),
    'delete-event': async (el) => { if (await ask(t('confirmDelete'))) { Store.remove('events', el.dataset.id); closeSheet(); toast(t('deleted')); } },
    'pay-event': (el) => incomeForm({ type: 'event', refId: el.dataset.id }),
    'new-inventory': () => inventoryForm(),
    'edit-inventory': (el) => inventoryForm(el.dataset.id),
    'delete-inventory': async (el) => { if (await ask(t('confirmDelete'))) { Store.remove('inventory', el.dataset.id); closeSheet(); toast(t('deleted')); } },
    'sell-inventory': (el) => sellForm(el.dataset.id),
    'inv-filter': (el) => { ui.invFilter = el.dataset.f; render(); },

    'add-deliv': () => { const list = $('#deliv-list'); list.insertAdjacentHTML('beforeend', deliverableRow({ date: addDays(today(), 7) }, list.children.length)); list.lastElementChild.querySelector('[name=d_title]').focus(); },
    'remove-deliv': (el) => { if ($('#deliv-list').children.length > 1) el.closest('[data-deliv]').remove(); },
    'toggle-deliverable': (el) => {
      const p = Store.project(el.dataset.project); const d = p?.deliverables.find(x => x.id === el.dataset.id);
      if (!d) return;
      d.done = !d.done;
      if (p.deliverables.every(x => x.done)) p.stage = finalStageId();
      Store.save(); toast(`✓ ${d.title}`);
    },
    'stage-step': (el) => { const p = Store.project(el.dataset.id); const st = stages(); const i = st.findIndex(s => s.id === stageOf(p).id) + Number(el.dataset.dir); if (st[i]) { p.stage = st[i].id; Store.save(); } },
    'cal-prev': () => { ui.calMonth = shiftMonth(ui.calMonth, -1); render(); },
    'cal-next': () => { ui.calMonth = shiftMonth(ui.calMonth, 1); render(); },
    'cal-day': (el) => { ui.calDay = el.dataset.date; render(); },
    'fin-prev': () => { ui.finMonth = shiftMonth(ui.finMonth, -1); render(); },
    'fin-next': () => { ui.finMonth = shiftMonth(ui.finMonth, 1); render(); },
    'rec-prev': () => { ui.recMonth = shiftMonth(ui.recMonth, -1); render(); },
    'rec-next': () => { ui.recMonth = shiftMonth(ui.recMonth, 1); render(); },
    'toggle-table': () => { ui.showTable = !ui.showTable; render(); },
    'csv': (el) => exportCsv(el.dataset.what),
    'ics-one': (el) => { const p = Store.project(el.dataset.project); const d = p?.deliverables.find(x => x.id === el.dataset.id); if (d) exportIcs([icsDeliverable(d, p)], 'cadence-' + d.date); },
    'ics-project': (el) => { const p = Store.project(el.dataset.id); exportIcs((p.deliverables || []).filter(d => !d.done && d.date).map(d => icsDeliverable(d, p)), 'cadence-' + p.title.replace(/\W+/g, '-')); },
    'ics-event': (el) => { const ev = Store.find('events', el.dataset.id); if (ev) exportIcs([icsEvent(ev)], 'cadence-' + ev.date); },
    'ics-all': () => exportIcs([
      ...allDeliverables({ pendingOnly: true }).map(d => icsDeliverable(d, d.project)),
      ...(mod('events') ? S().events.filter(e => !e.done && e.date >= today()).map(icsEvent) : [])
    ], 'cadence-agenda'),

    'list-add': (el) => {
      const kind = el.dataset.kind; const list = S().settings[kind];
      const item = { id: Store.uid(), es: '', en: '' };
      if (kind === 'stages') list.splice(list.length - 1, 0, item); else list.push(item);
      Store.save();
      setTimeout(() => { const inputs = document.querySelectorAll(`[data-edit-list="${kind}"]`); inputs[kind === 'stages' ? list.length - 2 : list.length - 1]?.focus(); }, 0);
    },
    'list-remove': (el) => {
      const kind = el.dataset.kind; const list = S().settings[kind]; const i = Number(el.dataset.index);
      const min = kind === 'eventTypes' ? 0 : 2;
      if (list.length <= min) return;
      const [removed] = list.splice(i, 1);
      if (kind === 'stages') { const fb = list[Math.max(0, Math.min(i, list.length - 1))].id; S().projects.forEach(p => { if (p.stage === removed.id) p.stage = fb; }); }
      if (kind === 'categories') { const fb = list[list.length - 1].id; S().expenses.forEach(e => { if (e.category === removed.id) e.category = fb; }); }
      Store.save();
    },
    'export-json': () => download(`cadence-backup-${today()}.json`, JSON.stringify(S(), null, 2), 'application/json'),
    'load-demo': async () => {
      if (Cloud.user) { toast(t('demoSignedIn'), true); return; }
      if (await ask(t('confirmDemo'))) {
        const demo = buildDemoData(S().settings.template);
        Object.assign(S(), demo); S().settings.demo = true;
        Store.save(); toast(t('saved')); go('home');
      }
    },
    'clear-all': async () => { if (await ask(Cloud.user ? t('confirmClearCloud') : t('confirmClear'))) { Store.resetSpace(); toast(t('deleted')); } },

    'google-signin': async () => {
      if (!$('#privacy-ok')?.checked) { toast(t('privacyNeeded'), true); $('#privacy-ok')?.focus(); return; }
      try { const cred = await Cloud.signInGoogle(); Cloud.recordConsent(cred?.user?.uid, PRIVACY_VERSION); toast(t('welcomeBack')); go('home'); } catch (e) { toast(authError(e), true); }
    },
    'install-app': async () => {
      if (!installPrompt) return;
      const p = installPrompt; installPrompt = null;
      try { await p.prompt(); await p.userChoice; } catch (e) { /* ignore */ }
      render();
    },
    'dismiss-install': () => { lsSet('cadence:installDismissed', '1'); render(); },
    'reset-password': async () => {
      const email = $('#email-form')?.email.value.trim();
      if (!email) { toast(t('err_typeEmail'), true); return; }
      try { await Cloud.resetPassword(email); toast(t('resetSent')); } catch (e) { toast(authError(e), true); }
    },
    'sign-out': async () => { if (await ask(t('confirmSignOut'))) { await Cloud.signOut(); render(); onboarding(); } },

    'ob-lang': (el) => { const k = chosenTemplate(); Store.setLang(el.dataset.lang); onboarding(); const r = document.querySelector(`input[name=tpl][value="${k}"]`); if (r) r.checked = true; },
    'ob-demo': () => { const k = chosenTemplate(); unlockSheet(); Store.createSpace({ template: k, demo: true }); go('home'); },
    'ob-empty': () => { const k = chosenTemplate(); unlockSheet(); Store.createSpace({ template: k }); go('home'); },
    'ob-account': () => { unlockSheet(); ui.view = 'settings'; render(); }
  };

  // ================================================================ events
  function bind() {
    document.addEventListener('click', (e) => {
      const navTo = e.target.closest('[data-nav-to]');
      if (navTo) { e.preventDefault(); closeSheet(); go(navTo.dataset.navTo); return; }
      const el = e.target.closest('[data-action]');
      if (!el || el.disabled) return;
      const fn = actions[el.dataset.action];
      if (fn) { e.preventDefault(); fn(el); }
    });
    window.addEventListener('hashchange', () => { const v = location.hash.slice(1) || 'home'; if (VIEWS.includes(v) && v !== ui.view) { ui.view = v; render(); window.scrollTo({ top: 0 }); } });
    $('#fab').addEventListener('click', quickAddMenu);
    $('#settings-btn').addEventListener('click', () => go('settings'));
    $('#space-btn').addEventListener('click', () => { if (Store.hasSpaces()) spacesSheet(); });
    $('#top-help').addEventListener('click', () => go('help'));
    $('#sheet').addEventListener('click', (e) => { if (e.target.id === 'sheet' && !e.currentTarget.classList.contains('locked')) closeSheet(); });
    $('#sheet').addEventListener('cancel', (e) => { if (e.currentTarget.classList.contains('locked')) e.preventDefault(); });
    $('#helpdlg').addEventListener('click', (e) => { if (e.target.id === 'helpdlg') e.currentTarget.close(); });

    // back button / history (see go())
    $('#sheet').addEventListener('close', sheetClosed); // closed with Esc or by the browser
    window.addEventListener('popstate', () => {
      if (popGuard) { popGuard = false; if (pendingView) { const v = pendingView; pendingView = null; go(v); } return; }
      const dlg = $('#sheet');
      if (dlg.open) {
        if (dlg.classList.contains('locked')) { sheetEntry = false; return; } // first-run screen stays
        sheetEntry = false; dlg.close();
      }
    });

    // install (Chrome / Edge on Android and Windows)
    window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); installPrompt = e; if (!$('#sheet').open) render(); });
    window.addEventListener('appinstalled', () => { installPrompt = null; toast(t('installed')); if (!$('#sheet').open) render(); });

    // Google Calendar list: mark each date once opened
    document.addEventListener('click', (e) => {
      const a = e.target.closest('[data-cal-link]');
      if (a) setTimeout(() => { a.classList.add('done'); a.textContent = t('calOpened'); }, 300);
    });

    document.addEventListener('submit', (e) => {
      const f = e.target;
      if (f.getAttribute('method') === 'dialog') return; // in-app dialogs close themselves
      e.preventDefault();
      submitters[f.id]?.(f, e.submitter);
    });

    document.addEventListener('change', (e) => {
      const el = e.target;
      if (el.matches('[data-client-select]')) {
        const fld = el.form.querySelector('.new-client-field');
        fld.hidden = el.value !== '__new';
        if (!fld.hidden) fld.querySelector('input').focus();
      }
      if (el.matches('[data-income-type]')) {
        const f = el.form;
        const keep = { date: f.date.value, note: f.note.value };
        incomeForm({ id: f.dataset.id || undefined, type: el.value });
        const nf = $('#income-form'); nf.date.value = keep.date; nf.note.value = keep.note;
      }
      if (el.matches('[data-income-ref]')) { const a = Number(el.selectedOptions[0].dataset.amount || 0); el.form.amount.value = a > 0 ? a : ''; }
      if (el.id === 'proj-client') { ui.projClient = el.value; render(); }
      if (el.matches('[data-action-change="template"]')) { Store.applyTemplate(el.value); toast(t('saved')); }
      if (el.matches('[data-module]')) {
        const m = el.dataset.module;
        S().settings.modules[m] = m === 'finance' ? (el.checked ? (tpl().kind === 'business' ? 'business' : 'personal') : false) : el.checked;
        Store.save();
      }
      if (el.matches('[data-cal-pref]')) {
        lsSet(CAL_KEY, el.value);
        if (el.name === 'cal-first') { const fn = pendingCal; pendingCal = null; if (fn) fn(); }
        else toast(t('saved'));
      }
      if (el.matches('[data-space-name]') && el.value.trim()) { Store.renameSpace(Store.currentId, el.value.trim()); toast(t('saved')); }
      if (el.matches('[data-setting]')) {
        const k = el.dataset.setting;
        if (k === 'lang') { Store.setLang(el.value); return; }
        S().settings[k] = k === 'monthlyGoal' ? num(el.value) : el.value.trim();
        Store.save();
      }
      if (el.matches('[data-edit-list]')) {
        const item = S().settings[el.dataset.editList][Number(el.dataset.index)];
        item[lang()] = el.value.trim();
        if (!item.es) item.es = item.en; if (!item.en) item.en = item.es;
        Store.save();
      }
      if (el.id === 'import-file' && el.files[0]) {
        el.files[0].text().then(async txt => {
          try {
            const data = JSON.parse(txt);
            if (!(await ask(t('confirmImport')))) return;
            data.settings = { ...(data.settings || {}), demo: false };
            Store.replace(data); toast(t('imported'));
          } catch (err) { toast(t('err_badFile'), true); }
        });
      }
    });

    document.addEventListener('input', (e) => {
      if (e.target.id === 'proj-search') {
        ui.projSearch = e.target.value;
        const pos = e.target.selectionStart;
        render();
        const s = $('#proj-search'); s.focus(); s.setSelectionRange(pos, pos);
      }
    });

    // chart tooltips (hover, keyboard focus, tap)
    const showTip = (g) => {
      const chart = g.closest('[data-chart]'); const tip = chart.querySelector('.tooltip');
      tip.textContent = g.dataset.tip; tip.hidden = false;
      const cr = chart.getBoundingClientRect(); const gr = g.getBoundingClientRect();
      tip.style.left = Math.max(0, Math.min(gr.left - cr.left + gr.width / 2 - tip.offsetWidth / 2, cr.width - tip.offsetWidth)) + 'px';
      chart.querySelectorAll('.bar-group').forEach(x => x.classList.toggle('dim', x !== g));
    };
    const hideTip = (chart) => { if (!chart) return; chart.querySelector('.tooltip').hidden = true; chart.querySelectorAll('.bar-group').forEach(x => x.classList.remove('dim')); };
    document.addEventListener('pointerover', (e) => { const g = e.target.closest?.('.bar-group'); if (g) showTip(g); });
    document.addEventListener('pointerout', (e) => { const g = e.target.closest?.('.bar-group'); if (g && !g.contains(e.relatedTarget)) hideTip(g.closest('[data-chart]')); });
    document.addEventListener('focusin', (e) => { if (e.target.matches?.('.bar-group')) showTip(e.target); });
    document.addEventListener('focusout', (e) => { if (e.target.matches?.('.bar-group')) hideTip(e.target.closest('[data-chart]')); });

    let resizeTimer;
    window.addEventListener('resize', () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(() => { if (ui.view === 'finance' && !$('#sheet').open) render(); }, 250); });

    window.addEventListener('cadence:cloud', () => {
      if (Cloud.user && $('#sheet').classList.contains('locked')) unlockSheet();
      if ($('#sheet').open) { renderShell(); return; }
      render();
    });
    document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible' && !$('#sheet').open) render(); });
  }

  // ================================================================ boot
  Store.load();
  Store.onChange(({ fromCloud, spaceChanged, listChanged }) => {
    // don't wipe a form the person is typing in when data arrives from the other device
    if (fromCloud && !spaceChanged && $('#sheet').open) renderShell(); else render();
    if (spaceChanged) Cloud.onSpaceChanged();
    else if (listChanged && !fromCloud) Cloud.onListChanged();
    if (!fromCloud) Cloud.schedulePush();
  });
  bind();
  const initial = location.hash.slice(1);
  ui.view = VIEWS.includes(initial) ? initial : 'home';
  if (location.hash !== '#' + ui.view) history.replaceState(null, '', '#' + ui.view);
  render();
  if (!Store.hasSpaces()) onboarding();
  Cloud.init().then(() => { if (Cloud.configured()) render(); });

  if ('serviceWorker' in navigator && location.protocol === 'https:') navigator.serviceWorker.register('sw.js').catch(() => {});
})();
