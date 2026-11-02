/* Cadence · data store with spaces
 *
 * A "space" is one separate set of data with its own template, for example
 * "Personal" and "My business". One person (one account) can have several.
 *
 * Local storage layout:
 *   cadence:spaces        → { current, lang, cloudUid, list: [{ id, name, template }] }
 *   cadence:space:<id>    → the full data of that space (settings + collections)
 *
 * The UI always works on Store.state (the current space). js/cloud.js copies
 * changes to Firebase when the person is signed in. */
(function () {
  const INDEX_KEY = 'cadence:spaces';
  const SPACE_PREFIX = 'cadence:space:';
  const LEGACY_KEYS = ['cadence:v2', 'cadence:v1'];
  const COLLECTIONS = ['clients', 'projects', 'incomes', 'expenses', 'events', 'inventory', 'recurring', 'sessions'];

  const read = (k) => { try { return localStorage.getItem(k); } catch (e) { return null; } };
  const write = (k, v) => { try { localStorage.setItem(k, v); return true; } catch (e) { return false; } };
  const drop = (k) => { try { localStorage.removeItem(k); } catch (e) { /* ignore */ } };
  const browserLang = () => ((navigator.language || 'es').toLowerCase().startsWith('en') ? 'en' : 'es');

  function settingsFromTemplate(key) {
    const tpl = TEMPLATES[key] || TEMPLATES.generic;
    return {
      template: key,
      stages: structuredClone(tpl.stages),
      categories: structuredClone(tpl.categories),
      eventTypes: structuredClone(tpl.eventTypes),
      modules: { ...tpl.modules }
    };
  }

  function emptySpace(templateKey, lang) {
    const state = {
      version: 3,
      settings: { name: '', lang: lang || browserLang(), currency: 'COP', monthlyGoal: 0, demo: false, ...settingsFromTemplate(templateKey) },
      meta: { updatedAt: new Date().toISOString() }
    };
    COLLECTIONS.forEach(c => { state[c] = []; });
    return state;
  }

  // v1 kept payments inside each project; v2+ keeps every income in one list.
  function migrate(s) {
    if (!s || s.version >= 2) return s;
    const out = { ...s, version: 2, incomes: [] };
    (s.projects || []).forEach(p => {
      (p.payments || []).forEach(x => out.incomes.push({ id: x.id, date: x.date, amount: x.amount, type: 'project', refId: p.id, note: x.note || '' }));
      delete p.payments;
    });
    ['sheetsUrl', 'sheetsToken', 'autoSync', 'lastSync'].forEach(k => delete out.settings?.[k]);
    return out;
  }

  function normalize(raw, lang) {
    const s = migrate(raw) || {};
    const key = TEMPLATES[s.settings?.template] ? s.settings.template : 'generic';
    const base = emptySpace(key, lang);
    const out = { ...base, ...s, version: 3, settings: { ...base.settings, ...(s.settings || {}) }, meta: { ...base.meta, ...(s.meta || {}) } };
    // modules added in v3 (clients, finance) come from the template when missing
    out.settings.modules = { ...TEMPLATES[key].modules, ...(s.settings?.modules || {}) };
    if (lang) out.settings.lang = lang;
    COLLECTIONS.forEach(c => { out[c] = Array.isArray(out[c]) ? out[c] : []; });
    out.projects = out.projects.map(p => ({ deliverables: [], notes: '', total: 0, ...p }));
    ['stages', 'categories'].forEach(k => { if (!out.settings[k]?.length) out.settings[k] = base.settings[k]; });
    if (!Array.isArray(out.settings.eventTypes)) out.settings.eventTypes = base.settings.eventTypes;
    delete out.settings.onboarded; delete out.settings.cloudUid;
    return out;
  }

  const defaultSpaceName = (templateKey, lang) => {
    const tpl = TEMPLATES[templateKey];
    if (tpl?.kind === 'personal') return templateKey === 'work' ? (lang === 'en' ? 'Work' : 'Trabajo') : 'Personal';
    return lang === 'en' ? 'My business' : 'Mi negocio';
  };

  const listeners = [];

  window.Store = {
    COLLECTIONS,
    state: null,
    index: null,

    // ---------------------------------------------------------------- loading
    load() {
      let idx = null;
      try { idx = JSON.parse(read(INDEX_KEY) || 'null'); } catch (e) { idx = null; }
      if (!idx || !Array.isArray(idx.list)) {
        idx = { current: null, lang: browserLang(), cloudUid: null, list: [] };
        // bring data from v1 / v2 into a first space
        const legacy = LEGACY_KEYS.map(read).find(Boolean);
        if (legacy) {
          try {
            const st = normalize(JSON.parse(legacy));
            idx.lang = st.settings.lang;
            idx.list.push({ id: 'main', name: defaultSpaceName(st.settings.template, idx.lang), template: st.settings.template });
            idx.current = 'main';
            write(SPACE_PREFIX + 'main', JSON.stringify(st));
          } catch (e) { /* ignore broken legacy data */ }
        }
      }
      this.index = idx;
      this._writeIndex();
      const alive = idx.list.filter(s => !s.deleted);
      if (idx.current && alive.some(s => s.id === idx.current)) this.state = this.peek(idx.current);
      else if (alive.length) { idx.current = alive[0].id; this.state = this.peek(idx.current); }
      else this.state = emptySpace('personal', idx.lang); // shown behind onboarding only
      return this.state;
    },

    hasSpaces() { return this.spaces().length > 0; },
    get currentId() { return this.index.current; },
    lang() { return this.index.lang; },

    /** Read a space's data without switching to it. */
    peek(id) {
      try { const raw = read(SPACE_PREFIX + id); if (raw) return normalize(JSON.parse(raw), this.index.lang); } catch (e) { /* fall through */ }
      const entry = this.index.list.find(s => s.id === id);
      return emptySpace(entry?.template || 'generic', this.index.lang);
    },
    writeSpace(id, state) { write(SPACE_PREFIX + id, JSON.stringify(state)); },
    _writeIndex() { write(INDEX_KEY, JSON.stringify(this.index)); },

    // ---------------------------------------------------------------- saving
    /** Persist the current space and notify listeners. `fromCloud` = change came from Firebase. */
    save({ fromCloud = false } = {}) {
      if (!this.index.current) return;
      if (!fromCloud) this.state.meta.updatedAt = new Date().toISOString();
      this.writeSpace(this.index.current, this.state);
      const entry = this.index.list.find(s => s.id === this.index.current);
      if (entry && entry.template !== this.state.settings.template) { entry.template = this.state.settings.template; entry.updatedAt = new Date().toISOString(); }
      this._writeIndex();
      listeners.forEach(fn => fn({ fromCloud }));
    },
    onChange(fn) { listeners.push(fn); },
    notify(opts = {}) { listeners.forEach(fn => fn({ fromCloud: true, ...opts })); },

    setLang(lang) {
      this.index.lang = lang;
      this.state.settings.lang = lang;
      this._writeIndex();
      this.save();
    },

    // ---------------------------------------------------------------- spaces
    spaces() { return this.index.list.filter(s => !s.deleted); },
    space(id) { return this.index.list.find(s => s.id === (id || this.index.current)); },

    createSpace({ name, template, demo = false, id }) {
      const sid = id || (this.index.list.some(s => s.id === 'main') ? this.uid() : 'main');
      if (!this.spaces().length) this.index.current = null; // nothing to save from the placeholder
      const state = emptySpace(template, this.index.lang);
      if (demo) {
        Object.assign(state, buildDemoData(template));
        state.settings.demo = true;
        state.settings.monthlyGoal = { art: 3000000, personal: 1000000, work: 0 }[TEMPLATES[template].demo] ?? 8000000;
      }
      this.index.list.push({ id: sid, name: name || defaultSpaceName(template, this.index.lang), template, updatedAt: new Date().toISOString() });
      this.writeSpace(sid, state);
      this.switchSpace(sid);
      return sid;
    },

    switchSpace(id) {
      if (this.index.current && this.state) this.writeSpace(this.index.current, this.state);
      this.index.current = id;
      this.state = this.peek(id);
      this._writeIndex();
      listeners.forEach(fn => fn({ fromCloud: true, spaceChanged: true }));
    },

    renameSpace(id, name) {
      const e = this.space(id); if (!e) return;
      e.name = name; e.updatedAt = new Date().toISOString();
      this._writeIndex();
      listeners.forEach(fn => fn({ fromCloud: false, listChanged: true }));
    },

    /** Removes a space. Returns its data so the cloud layer can delete it remotely. */
    deleteSpace(id) {
      const data = this.peek(id);
      const e = this.space(id);
      if (e) { e.deleted = true; e.updatedAt = new Date().toISOString(); }
      drop(SPACE_PREFIX + id);
      const rest = this.spaces();
      if (this.index.current === id) {
        this.index.current = null; this.state = null;
        if (rest.length) this.switchSpace(rest[0].id);
        else { this.state = emptySpace('personal', this.index.lang); this._writeIndex(); listeners.forEach(fn => fn({ fromCloud: true, spaceChanged: true })); }
      } else { this._writeIndex(); listeners.forEach(fn => fn({ fromCloud: false, listChanged: true })); }
      return data;
    },

    /** Merge the list of spaces stored in the account with the local one. */
    mergeSpaceList(remoteList) {
      let changed = false;
      (remoteList || []).forEach(r => {
        const l = this.index.list.find(s => s.id === r.id);
        if (!l) { this.index.list.push({ ...r }); changed = true; if (r.deleted) drop(SPACE_PREFIX + r.id); }
        else if (Date.parse(r.updatedAt || 0) > Date.parse(l.updatedAt || 0)) {
          Object.assign(l, r); changed = true;
          if (r.deleted) drop(SPACE_PREFIX + r.id);
        }
      });
      if (changed) {
        this._writeIndex();
        if (this.space()?.deleted) { const rest = this.spaces(); if (rest.length) this.switchSpace(rest[0].id); }
        else listeners.forEach(fn => fn({ fromCloud: true, listChanged: true }));
      }
      return changed;
    },

    /** Forget everything on this device (sign out, or data from someone else). */
    wipeAll() {
      this.index.list.forEach(s => drop(SPACE_PREFIX + s.id));
      LEGACY_KEYS.forEach(drop);
      this.index = { current: null, lang: this.index.lang, cloudUid: null, list: [] };
      this.state = emptySpace('personal', this.index.lang);
      this._writeIndex();
    },
    setCloudUid(uid) { this.index.cloudUid = uid; this._writeIndex(); },

    // ---------------------------------------------------------------- data helpers
    replace(newState) { this.state = normalize(newState, this.index.lang); this.save(); },
    resetSpace() {
      const keep = this.state.settings;
      this.state = emptySpace(keep.template, this.index.lang);
      ['currency', 'name'].forEach(k => { this.state.settings[k] = keep[k]; });
      this.save();
    },

    uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 7); },
    find(collection, id) { return this.state[collection].find(x => x.id === id); },
    client(id) { return this.find('clients', id); },
    project(id) { return this.find('projects', id); },

    upsert(collection, item) {
      const list = this.state[collection];
      const i = list.findIndex(x => x.id === item.id);
      if (i >= 0) list[i] = item; else list.push(item);
      this.save();
    },

    remove(collection, id) {
      const s = this.state;
      s[collection] = s[collection].filter(x => x.id !== id);
      if (['projects', 'events', 'inventory', 'recurring'].includes(collection)) s.incomes = s.incomes.filter(x => x.refId !== id);
      if (collection === 'clients') {
        s.projects.forEach(p => { if (p.clientId === id) p.clientId = ''; });
        s.events.forEach(e => { if (e.clientId === id) e.clientId = ''; });
      }
      if (collection === 'projects') s.expenses.forEach(e => { if (e.projectId === id) e.projectId = ''; });
      this.save();
    },

    applyTemplate(key) {
      if (!TEMPLATES[key]) return;
      const s = this.state.settings;
      const oldStages = s.stages;
      Object.assign(s, settingsFromTemplate(key));
      this.state.projects.forEach(p => {
        if (s.stages.some(st => st.id === p.stage)) return;
        const oldIdx = oldStages.findIndex(st => st.id === p.stage);
        p.stage = oldIdx === oldStages.length - 1 ? s.stages[s.stages.length - 1].id
          : s.stages[Math.max(0, Math.min(oldIdx, s.stages.length - 2))].id;
      });
      const catIds = s.categories.map(c => c.id);
      this.state.expenses.forEach(e => { if (!catIds.includes(e.category)) e.category = catIds[catIds.length - 1]; });
      this.save();
    },

    isEmpty() { return COLLECTIONS.every(c => !this.state[c].length); },
    isDemoAnywhere() { return this.spaces().some(s => this.peek(s.id).settings.demo); },
    defaultSpaceName
  };
})();
