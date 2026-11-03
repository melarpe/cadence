/* © 2026 Melarpe · Melissa Aristizabal. All rights reserved. Not open source: see LICENSE. */
/* Cadence · Firebase sync (optional)
 *
 * In plain words:
 *  - Each person signs in (Google or email). Their data lives in Firestore under
 *    users/{their id}/... and firestore.rules lets only them read or write it.
 *  - Layout:
 *      users/{uid}/meta/spaces                       → list of spaces { list: [...] }
 *      users/{uid}/spaces/{spaceId}/meta/settings    → settings of a space
 *      users/{uid}/spaces/{spaceId}/{collection}/{id} → one document per item
 *  - The app keeps working from localStorage. After each change we compare every item
 *    with the last version we sent (a "fingerprint") and upload only what changed.
 *  - Changes from the other device arrive in real time for the space on screen.
 *  - Conflicts: the most recent edit of an item wins (updatedAt). Deletes leave a
 *    small "deleted" marker so the other device removes the item too.
 *
 * The SDK is bundled in js/vendor and only loads when js/firebase-config.js has values. */
(function () {
  const SDK_URL = new URL('js/vendor/firebase-13.1.0.js', document.baseURI).href;
  const SETTINGS_KEYS = ['name', 'currency', 'monthlyGoal', 'template', 'stages', 'categories', 'eventTypes', 'modules'];

  let fb = null, auth = null, db = null;
  let listUnsub = null, spaceUnsubs = [];
  let pushTimer = null;
  let syncedKey = null;
  let synced = {};          // { spaces: json, [spaceId]: { __ready: {}, settings: json, [collection]: { id: fingerprint } } }
  let pending = 0;          // first snapshots still expected for the space on screen
  let listReady = false;

  const emit = () => window.dispatchEvent(new CustomEvent('cadence:cloud'));
  const fingerprint = (item) => { const { updatedAt, ...rest } = item; return JSON.stringify(rest); };
  const clean = (obj) => JSON.parse(JSON.stringify(obj)); // Firestore refuses `undefined`
  const settingsSubset = (s) => { const o = {}; SETTINGS_KEYS.forEach(k => { o[k] = s[k]; }); return o; };
  const space = (sid) => (synced[sid] = synced[sid] || { __ready: {} });

  function loadSynced(uid) {
    syncedKey = 'cadence:synced:' + uid;
    try { synced = JSON.parse(localStorage.getItem(syncedKey) || '{}'); } catch (e) { synced = {}; }
  }
  function saveSynced() { try { localStorage.setItem(syncedKey, JSON.stringify(synced)); } catch (e) { /* ignore */ } }
  const fail = (err) => { Cloud.status = 'error'; Cloud.error = err.message || String(err); emit(); };

  window.Cloud = {
    user: null,
    get ready() { return listReady; },
    status: 'off', // off | loading | signed-out | syncing | synced | offline | error
    error: '',

    configured() {
      const c = window.FIREBASE_CONFIG || {};
      return !!(c.apiKey && c.projectId && c.appId);
    },

    async init() {
      if (!this.configured()) { this.status = 'off'; return; }
      this.status = 'loading';
      try {
        fb = await import(SDK_URL);
        const app = fb.initializeApp(window.FIREBASE_CONFIG);
        auth = fb.initializeAuth(app, {
          persistence: [fb.indexedDBLocalPersistence, fb.browserLocalPersistence],
          popupRedirectResolver: fb.browserPopupRedirectResolver
        });
        try { db = fb.initializeFirestore(app, { localCache: fb.persistentLocalCache({ tabManager: fb.persistentMultipleTabManager() }) }); }
        catch (e) { db = fb.initializeFirestore(app, {}); }
        fb.onAuthStateChanged(auth, (user) => this._onUser(user));
      } catch (e) { fail(e); }
    },

    _onUser(user) {
      if (listUnsub) listUnsub(); listUnsub = null;
      spaceUnsubs.forEach(u => u()); spaceUnsubs = [];
      listReady = false;
      this.user = user;
      if (!user) { this.status = 'signed-out'; emit(); return; }

      // Data on this device is sample data or belongs to someone else: start clean.
      if (Store.isDemoAnywhere() || (Store.index.cloudUid && Store.index.cloudUid !== user.uid)) Store.wipeAll();
      Store.setCloudUid(user.uid);
      loadSynced(user.uid);
      this.status = 'syncing'; emit();

      listUnsub = fb.onSnapshot(fb.doc(db, 'users', user.uid, 'meta', 'spaces'), (snap) => {
        const remote = snap.exists() ? (snap.data().list || []) : [];
        synced.spaces = JSON.stringify(remote);
        Store.mergeSpaceList(remote);
        if (!listReady) {
          listReady = true;
          if (!Store.currentId && Store.spaces().length) Store.switchSpace(Store.spaces()[0].id);
          this._pushAll();                 // upload spaces that only exist on this device
          this._watch(Store.currentId);
        }
        emit();
      }, fail);
    },

    /** Real-time listeners for the space on screen. Called again when the person switches space. */
    _watch(sid) {
      spaceUnsubs.forEach(u => u()); spaceUnsubs = [];
      if (!this.user || !sid) { this.status = 'synced'; emit(); return; }
      const uid = this.user.uid;
      pending = Store.COLLECTIONS.length + 1;
      Store.COLLECTIONS.forEach(col => {
        spaceUnsubs.push(fb.onSnapshot(fb.collection(db, 'users', uid, 'spaces', sid, col),
          (snap) => this._applySnapshot(sid, col, snap), fail));
      });
      spaceUnsubs.push(fb.onSnapshot(fb.doc(db, 'users', uid, 'spaces', sid, 'meta', 'settings'),
        (snap) => this._applySettings(sid, snap), fail));
    },

    _firstDone() {
      pending -= 1;
      if (pending === 0) { Store.save({ fromCloud: true }); this.push(); }
    },

    _applySnapshot(sid, col, snap) {
      if (sid !== Store.currentId) return;
      const sp = space(sid);
      const first = !sp.__ready[col];
      sp[col] = sp[col] || {};
      let changed = false;
      snap.docChanges().forEach(ch => {
        const id = ch.doc.id;
        const remote = ch.doc.data();
        const list = Store.state[col];
        const i = list.findIndex(x => x.id === id);
        const local = i >= 0 ? list[i] : null;
        const remoteTime = Date.parse(remote.updatedAt || 0);
        const localTime = Date.parse(local?.updatedAt || 0);
        if (ch.type === 'removed' || remote.deleted) {
          if (local && localTime <= remoteTime) { list.splice(i, 1); changed = true; }
          sp[col][id] = '__deleted';
          return;
        }
        if (!local || remoteTime > localTime) {
          const item = { ...remote, id };
          if (i >= 0) list[i] = item; else list.push(item);
          changed = true;
        }
        sp[col][id] = fingerprint({ ...remote, id });
      });
      sp.__ready[col] = true;
      saveSynced();
      if (first) this._firstDone();
      else if (changed) Store.save({ fromCloud: true });
      this.status = navigator.onLine ? 'synced' : 'offline';
      emit();
    },

    _applySettings(sid, snap) {
      if (sid !== Store.currentId) return;
      const sp = space(sid);
      const first = !sp.__ready.meta;
      if (snap.exists()) {
        const remote = snap.data();
        const local = Store.state.settings;
        if (Date.parse(remote.updatedAt || 0) > Date.parse(local.settingsUpdatedAt || 0)) {
          SETTINGS_KEYS.forEach(k => { if (remote[k] !== undefined) local[k] = remote[k]; });
          local.settingsUpdatedAt = remote.updatedAt;
          if (!first) Store.save({ fromCloud: true });
        }
        sp.settings = JSON.stringify(settingsSubset(remote));
      }
      sp.__ready.meta = true;
      saveSynced();
      if (first) this._firstDone();
    },

    /** Work out the writes needed for one space. Marks items with updatedAt. */
    _opsFor(sid, state, now) {
      const uid = this.user.uid;
      const sp = space(sid);
      const ops = [];
      Store.COLLECTIONS.forEach(col => {
        const known = sp[col] || (sp[col] = {});
        const ids = new Set();
        state[col].forEach(item => {
          ids.add(item.id);
          if (known[item.id] !== fingerprint(item)) {
            item.updatedAt = now;
            ops.push([fb.doc(db, 'users', uid, 'spaces', sid, col, item.id), clean(item)]);
            known[item.id] = fingerprint(item);
          }
        });
        Object.keys(known).forEach(id => {
          if (!ids.has(id) && known[id] !== '__deleted') {
            ops.push([fb.doc(db, 'users', uid, 'spaces', sid, col, id), { deleted: true, updatedAt: now }]);
            known[id] = '__deleted';
          }
        });
      });
      const s = settingsSubset(state.settings);
      if (sp.settings !== JSON.stringify(s)) {
        state.settings.settingsUpdatedAt = now;
        ops.push([fb.doc(db, 'users', uid, 'spaces', sid, 'meta', 'settings'), clean({ ...s, updatedAt: now })]);
        sp.settings = JSON.stringify(s);
      }
      return ops;
    },

    _listOps() {
      const list = Store.index.list.map(({ id, name, template, deleted, updatedAt }) => ({ id, name, template, deleted: !!deleted, updatedAt: updatedAt || new Date(0).toISOString() }));
      if (synced.spaces === JSON.stringify(list)) return [];
      synced.spaces = JSON.stringify(list);
      return [[fb.doc(db, 'users', this.user.uid, 'meta', 'spaces'), clean({ list })]];
    },

    _commit(ops) {
      if (!ops.length) return;
      saveSynced();
      this.status = 'syncing'; emit();
      for (let i = 0; i < ops.length; i += 450) {
        const batch = fb.writeBatch(db);
        ops.slice(i, i + 450).forEach(([ref, data]) => batch.set(ref, data));
        // Offline: Firestore keeps the batch and sends it when the connection returns.
        batch.commit().then(() => { this.status = 'synced'; emit(); }).catch(fail);
      }
      if (!navigator.onLine) { this.status = 'offline'; emit(); }
    },

    /** First sign-in on a device: upload every local space that is not in the account yet. */
    _pushAll() {
      const now = new Date().toISOString();
      let ops = this._listOps();
      Store.spaces().forEach(s => {
        if (s.id === Store.currentId) return; // handled after its first snapshot
        const sp = space(s.id);
        if (sp.__uploaded) return;
        const st = Store.peek(s.id);
        ops = ops.concat(this._opsFor(s.id, st, now));
        Store.writeSpace(s.id, st);
        sp.__uploaded = true;
      });
      this._commit(ops);
    },

    schedulePush() {
      if (!this.user || !listReady || pending > 0) return;
      clearTimeout(pushTimer);
      pushTimer = setTimeout(() => this.push(), 600);
    },

    push() {
      if (!this.user || !db || !Store.currentId) return;
      const now = new Date().toISOString();
      const ops = this._listOps().concat(this._opsFor(Store.currentId, Store.state, now));
      space(Store.currentId).__uploaded = true;
      this._commit(ops);
    },

    /** Called by the app after Store.switchSpace / createSpace. */
    onSpaceChanged() {
      if (!this.user || !listReady) return;
      this._commit(this._listOps());
      this._watch(Store.currentId);
    },
    onListChanged() { if (this.user && listReady) this._commit(this._listOps()); },

    /** Delete a space in the account: list entry marked deleted + every item tombstoned. */
    deleteSpaceRemote(sid, data) {
      if (!this.user || !listReady) return;
      const now = new Date().toISOString();
      const uid = this.user.uid;
      const ops = this._listOps();
      Store.COLLECTIONS.forEach(col => {
        const ids = new Set([...(data?.[col] || []).map(x => x.id), ...Object.keys(synced[sid]?.[col] || {})]);
        ids.forEach(id => ops.push([fb.doc(db, 'users', uid, 'spaces', sid, col, id), { deleted: true, updatedAt: now }]));
      });
      ops.push([fb.doc(db, 'users', uid, 'spaces', sid, 'meta', 'settings'), { deleted: true, updatedAt: now }]);
      delete synced[sid];
      this._commit(ops);
      this._watch(Store.currentId);
    },

    async signInGoogle() {
      const provider = new fb.GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      return fb.signInWithPopup(auth, provider);
    },
    signInEmail(email, pass) { return fb.signInWithEmailAndPassword(auth, email, pass); },
    signUpEmail(email, pass) { return fb.createUserWithEmailAndPassword(auth, email, pass); },
    resetPassword(email) { return fb.sendPasswordResetEmail(auth, email); },

    /** Keeps proof that this person accepted the privacy policy (date + version), in their own folder. */
    recordConsent(uid, version) {
      if (!uid || !db) return;
      fb.setDoc(fb.doc(db, 'users', uid, 'meta', 'consent'), { privacy: version, acceptedAt: new Date().toISOString() }, { merge: true }).catch(() => {});
    },

    async signOut() {
      await fb.signOut(auth);
      try { localStorage.removeItem(syncedKey); } catch (e) { /* ignore */ }
      synced = {};
      Store.wipeAll(); // leave nothing personal on a shared device
    }
  };

  window.addEventListener('online', () => { if (Cloud.user) { Cloud.status = 'synced'; emit(); Cloud.schedulePush(); } });
  window.addEventListener('offline', () => { if (Cloud.user) { Cloud.status = 'offline'; emit(); } });
})();
