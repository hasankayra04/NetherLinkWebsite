<?php
header('Content-Type: text/html; charset=UTF-8');
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
  <title>MCCompanion Account</title>
  <style>
    :root {
      color-scheme: dark;
      --bg: #0b1118;
      --surface: #121926;
      --surface-2: #172131;
      --border: #223048;
      --border-strong: #31435f;
      --text: #edf2f7;
      --muted: #9db0c6;
      --accent: #67e404;
      --accent-soft: rgba(103, 228, 4, 0.12);
      --danger: #f87171;
      --danger-soft: rgba(248, 113, 113, 0.12);
      --success: #2dd4bf;
      --warning: #fbbf24;
      --shadow: 0 20px 50px rgba(0, 0, 0, 0.35);
      --radius: 18px;
    }

    * { box-sizing: border-box; }

    html, body {
      margin: 0;
      min-height: 100%;
      background: linear-gradient(180deg, #091018 0%, #0b1118 100%);
      color: var(--text);
      font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }

    body {
      padding: max(16px, env(safe-area-inset-top)) max(14px, env(safe-area-inset-right)) max(18px, env(safe-area-inset-bottom)) max(14px, env(safe-area-inset-left));
    }

    a { color: var(--accent); }

    button, input, textarea, select {
      font: inherit;
    }

    button, .button {
      min-height: 52px;
      border-radius: 14px;
      border: 1px solid var(--border-strong);
      background: var(--surface-2);
      color: var(--text);
      padding: 12px 16px;
      cursor: pointer;
      transition: transform 0.12s ease, border-color 0.12s ease, background 0.12s ease, opacity 0.12s ease;
    }

    button:hover, .button:hover,
    button:focus-visible, .button:focus-visible {
      border-color: var(--accent);
      outline: none;
      transform: translateY(-1px);
    }

    button:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
    }

    input, textarea, select {
      width: 100%;
      min-height: 52px;
      border-radius: 14px;
      border: 1px solid var(--border-strong);
      background: #0f1724;
      color: var(--text);
      padding: 13px 15px;
    }

    textarea {
      min-height: 120px;
      resize: vertical;
    }

    input:focus-visible, textarea:focus-visible, select:focus-visible {
      border-color: var(--accent);
      outline: 3px solid rgba(103, 228, 4, 0.12);
    }

    .app {
      max-width: 1180px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      gap: 18px;
    }

    .hero, .panel, .notice, .submission, .skin-card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      box-shadow: var(--shadow);
    }

    .hero, .panel, .submission {
      padding: 20px;
    }

    .hero {
      display: grid;
      gap: 18px;
    }

    .hero-top {
      display: flex;
      gap: 16px;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
    }

    .hero-user {
      display: flex;
      gap: 16px;
      align-items: center;
      min-width: 0;
    }

    .avatar {
      width: 82px;
      height: 82px;
      border-radius: 22px;
      border: 2px solid var(--border-strong);
      background: linear-gradient(135deg, rgba(103, 228, 4, 0.15), rgba(103, 228, 4, 0.04));
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      font-size: 32px;
      font-weight: 800;
      color: var(--accent);
      flex-shrink: 0;
    }

    .avatar img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .title {
      margin: 0;
      font-size: clamp(28px, 5vw, 38px);
      line-height: 1.05;
      letter-spacing: -0.03em;
    }

    .subtitle {
      margin: 6px 0 0;
      color: var(--muted);
      font-size: 15px;
      line-height: 1.5;
    }

    .row, .button-row, .tab-row, .pill-row, .stats, .skin-grid, .actions {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
    }

    .button-row > *, .actions > * {
      flex: 1 1 180px;
    }

    .tab-row {
      overflow-x: auto;
      padding-bottom: 2px;
      scrollbar-width: none;
    }

    .tab-row::-webkit-scrollbar { display: none; }

    .tab {
      white-space: nowrap;
      min-height: 56px;
      padding-inline: 20px;
      background: var(--surface-2);
    }

    .tab.active {
      background: var(--accent-soft);
      border-color: rgba(103, 228, 4, 0.4);
      color: var(--accent);
      font-weight: 800;
    }

    .badge {
      display: inline-flex;
      align-items: center;
      min-height: 34px;
      padding: 6px 10px;
      border-radius: 999px;
      border: 1px solid var(--border-strong);
      background: #101928;
      color: var(--muted);
      font-size: 13px;
      font-weight: 700;
    }

    .badge.accent {
      color: var(--accent);
      border-color: rgba(103, 228, 4, 0.35);
      background: var(--accent-soft);
    }

    .badge.danger {
      color: var(--danger);
      border-color: rgba(248, 113, 113, 0.35);
      background: var(--danger-soft);
    }

    .layout {
      display: grid;
      grid-template-columns: minmax(0, 1fr) 340px;
      gap: 18px;
      align-items: start;
    }

    .stack {
      display: flex;
      flex-direction: column;
      gap: 18px;
      min-width: 0;
    }

    .panel h2, .panel h3, .submission h3 {
      margin: 0;
      font-size: 20px;
      letter-spacing: -0.02em;
    }

    .panel-head {
      display: flex;
      gap: 12px;
      justify-content: space-between;
      align-items: flex-start;
      flex-wrap: wrap;
      margin-bottom: 18px;
    }

    .panel-copy {
      margin: 6px 0 0;
      color: var(--muted);
      line-height: 1.6;
      font-size: 14px;
    }

    .fields {
      display: grid;
      gap: 14px;
    }

    .field-grid {
      display: grid;
      gap: 14px;
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .field label {
      display: block;
      margin-bottom: 8px;
      color: var(--muted);
      font-size: 13px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.06em;
    }

    .meta-list {
      display: grid;
      gap: 12px;
    }

    .meta-item {
      display: flex;
      justify-content: space-between;
      gap: 18px;
      padding: 14px 0;
      border-bottom: 1px solid var(--border);
      align-items: center;
    }

    .meta-item:last-child { border-bottom: 0; }

    .meta-label {
      color: var(--muted);
      font-size: 13px;
      flex-shrink: 0;
    }

    .meta-value {
      text-align: right;
      line-height: 1.5;
      word-break: break-word;
    }

    .mono {
      font-family: "JetBrains Mono", "SFMono-Regular", Consolas, monospace;
      font-size: 13px;
    }

    .notice {
      padding: 14px 16px;
      line-height: 1.6;
      font-size: 14px;
    }

    .notice.error {
      border-color: rgba(248, 113, 113, 0.35);
      background: var(--danger-soft);
      color: #ffd5d5;
    }

    .notice.success {
      border-color: rgba(45, 212, 191, 0.35);
      background: rgba(45, 212, 191, 0.12);
      color: #b3fff4;
    }

    .stats {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 12px;
    }

    .stat {
      padding: 16px;
      border-radius: 16px;
      background: #101827;
      border: 1px solid var(--border);
    }

    .stat strong {
      display: block;
      font-size: 28px;
      color: var(--accent);
      line-height: 1;
      margin-bottom: 6px;
    }

    .activity-list, .account-list, .skins-list, .submissions-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .activity-item, .account-card, .submission, .skin-card {
      padding: 16px;
      background: #101827;
      border: 1px solid var(--border);
      border-radius: 16px;
    }

    .account-card {
      display: flex;
      gap: 14px;
      align-items: center;
    }

    .account-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      border: 1px solid var(--border-strong);
      background: var(--surface-2);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      overflow: hidden;
    }

    .account-icon img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .skin-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 14px;
    }

    .skin-card {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .skin-preview {
      width: 100%;
      aspect-ratio: 1 / 1;
      border-radius: 14px;
      border: 1px solid var(--border);
      background: #0c1320;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }

    .skin-preview img {
      width: 100%;
      height: 100%;
      object-fit: contain;
      image-rendering: pixelated;
    }

    .submission-top {
      display: flex;
      gap: 14px;
      justify-content: space-between;
      align-items: flex-start;
      flex-wrap: wrap;
    }

    .submission-thumb {
      width: 72px;
      height: 72px;
      border-radius: 14px;
      border: 1px solid var(--border);
      background: #0c1320;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      flex-shrink: 0;
    }

    .submission-thumb img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      image-rendering: pixelated;
    }

    .submission-main {
      display: flex;
      gap: 14px;
      align-items: center;
      min-width: 0;
      flex: 1;
    }

    .submission-copy {
      min-width: 0;
      flex: 1;
    }

    .submission-copy p,
    .activity-item p,
    .skin-card p,
    .panel p,
    .notice p {
      margin: 0;
    }

    .submission-edit {
      margin-top: 16px;
      padding-top: 16px;
      border-top: 1px solid var(--border);
    }

    .toggle-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .toggle {
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 14px 16px;
      border-radius: 16px;
      border: 1px solid var(--border);
      background: #101827;
    }

    .toggle input {
      width: 24px;
      min-height: 24px;
      margin: 0;
      accent-color: var(--accent);
    }

    .auth-card {
      max-width: 540px;
      margin: 5vh auto 0;
      padding: 24px;
    }

    .muted { color: var(--muted); }
    .accent { color: var(--accent); }
    .danger { color: var(--danger); }
    .success { color: var(--success); }
    .warning { color: var(--warning); }
    .hidden { display: none !important; }

    @media (max-width: 980px) {
      .layout { grid-template-columns: 1fr; }
      .field-grid { grid-template-columns: 1fr; }
    }

    @media (max-width: 640px) {
      body { padding-inline: 10px; }
      .hero, .panel, .submission, .auth-card { padding: 16px; }
      .avatar { width: 72px; height: 72px; border-radius: 18px; }
      .stats { grid-template-columns: 1fr 1fr; }
      .meta-item { flex-direction: column; align-items: flex-start; }
      .meta-value { text-align: left; }
      .submission-main { align-items: flex-start; }
      .submission-top { flex-direction: column; }
      .button-row > *, .actions > * { flex-basis: 100%; }
    }
  </style>
</head>
<body>
  <div id="app" class="app"></div>

  <script type="module">
    import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.12.0/firebase-app.js';
    import {
      getAuth,
      setPersistence,
      browserLocalPersistence,
      onAuthStateChanged,
      signInWithEmailAndPassword,
      sendPasswordResetEmail,
      signOut
    } from 'https://www.gstatic.com/firebasejs/12.12.0/firebase-auth.js';

    const API_BASE = 'https://api.mccompanion.net';
    const FIREBASE_CONFIG = {
      apiKey: 'AIzaSyDagxbLCjjUSnEG-KpiPyrXVKSb9i6cxXQ',
      authDomain: 'mccompanionadmin.firebaseapp.com',
      projectId: 'mccompanionadmin',
      storageBucket: 'mccompanionadmin.firebasestorage.app',
      messagingSenderId: '670852401318',
      appId: '1:670852401318:web:2ad57d7d34847b03004c67'
    };
    const PACK_CATEGORIES = ['realism', 'faithful', 'pvp', 'cartoon', 'dark', 'medieval', 'nature', 'themed', 'other'];
    const NOTIF_PREFS_META = [
      { key: 'skin_liked', label: 'Skin liked', desc: 'When someone likes one of your skins' },
      { key: 'comment_received', label: 'Comment received', desc: 'When someone comments on your skin or pack' },
      { key: 'pack_approved', label: 'Pack approved', desc: 'When your submitted pack gets approved' },
      { key: 'pack_rejected', label: 'Pack rejected', desc: 'When your submitted pack is not approved' },
      { key: 'friend_request', label: 'Friend request', desc: 'When someone sends you a friend request' },
      { key: 'friend_accepted', label: 'Request accepted', desc: 'When someone accepts your friend request' },
      { key: 'message_received', label: 'New message', desc: 'When you receive a direct message' }
    ];
    const CONNECT_RELAYS = {
      EU: { name: 'EU Server', ip: '161.97.182.113' },
      US: { name: 'US Server', ip: '217.77.15.138' }
    };
    const CONNECT_DEFAULT_PORT = { bedrock: 19132, java: 25565 };
    const CONNECT_MODE_STRING = { dns: 'NINTENDO', friends: 'FRIENDS', java: 'JAVA' };
    const TAG_HELP_TEXT = 'Tags are lowercased automatically and only keep letters, numbers, and hyphens.';
    const ACTIVITY_LABELS = {
      skin_upload: { icon: '🎨', label: 'Uploaded skin', colorClass: 'accent' },
      pack_submitted: { icon: '📦', label: 'Submitted pack', colorClass: 'warning' },
      pack_approved: { icon: '✅', label: 'Pack approved', colorClass: 'success' },
      pack_rejected: { icon: '❌', label: 'Pack rejected', colorClass: 'danger' },
      skin_liked: { icon: '❤️', label: 'Skin got a like', colorClass: 'danger' }
    };

    const appRoot = document.getElementById('app');
    const firebaseApp = initializeApp(FIREBASE_CONFIG);
    const auth = getAuth(firebaseApp);
    setPersistence(auth, browserLocalPersistence).catch((error) => console.warn('Failed to set persistence:', error));

    const state = {
      booting: true,
      busy: false,
      user: null,
      roles: [],
      profile: null,
      stats: null,
      activity: [],
      skins: [],
      submissions: [],
      notifications: null,
      connectBots: null,
      connectResult: null,
      connectForm: {
        mode: 'dns',
        region: 'EU',
        address: '',
        port: String(CONNECT_DEFAULT_PORT.bedrock),
        gamertag: ''
      },
      submitPack: {
        file: null,
        fileName: '',
        thumbnailUrl: '',
        uploading: false,
        preview: '',
        thumbnailName: ''
      },
      submitPackDraft: {
        name: '',
        description: '',
        category: '',
        tags: '',
        longDescription: '',
        creatorWebsite: '',
        creatorDiscord: '',
        ownership: false
      },
      editingSubmissionId: null,
      editSubmissionDraft: null,
      editingSubmissionThumb: {
        url: '',
        preview: '',
        uploading: false,
        name: ''
      },
      flash: null,
      error: null,
      activeTab: 'profile',
      loading: {
        dashboard: false,
        notifications: false,
        submissions: false,
        skins: false,
        connect: false,
        profileSave: false,
        avatar: false,
        notifSave: false,
        packSubmit: false
      }
    };

    function setFlash(type, message) {
      state.flash = message ? { type, message } : null;
      render();
    }

    function setError(message) {
      state.error = message || null;
      render();
    }

    function escapeHtml(value) {
      return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    }

    function safeUrl(value) {
      if (!value) return '';
      try {
        const parsed = new URL(value, window.location.origin);
        if (['http:', 'https:', 'blob:', 'data:'].includes(parsed.protocol)) {
          if (parsed.protocol !== 'data:' || String(value).startsWith('data:image/')) return parsed.href;
        }
      } catch (_) {}
      return '';
    }

    function firstInitial(value) {
      return String(value || '?').trim().charAt(0).toUpperCase() || '?';
    }

    function roleBadges() {
      const badges = [`<span class="badge">user</span>`];
      state.roles.forEach((role) => {
        const extra = role === 'admin' ? ' danger' : ' accent';
        badges.push(`<span class="badge${extra}">${escapeHtml(role)}</span>`);
      });
      return badges.join('');
    }

    function timeAgo(dateValue) {
      const date = new Date(dateValue);
      if (Number.isNaN(date.getTime())) return 'Unknown';
      const diff = Date.now() - date.getTime();
      const minute = 60 * 1000;
      const hour = 60 * minute;
      const day = 24 * hour;
      const week = 7 * day;
      if (diff < minute) return 'just now';
      if (diff < hour) return `${Math.floor(diff / minute)}m ago`;
      if (diff < day) return `${Math.floor(diff / hour)}h ago`;
      if (diff < week) return `${Math.floor(diff / day)}d ago`;
      return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    }

    function formatDate(dateValue) {
      const date = new Date(dateValue);
      if (Number.isNaN(date.getTime())) return 'Unknown';
      return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
    }

    function notificationHtml(type, message) {
      if (!message) return '';
      return `<div class="notice ${type === 'error' ? 'error' : 'success'}">${escapeHtml(message)}</div>`;
    }

    async function getToken(forceRefresh = false) {
      if (!auth.currentUser) return null;
      return auth.currentUser.getIdToken(forceRefresh);
    }

    async function authedFetch(url, options = {}) {
      const token = await getToken();
      if (!token) throw new Error('Not authenticated');
      return fetch(url, {
        ...options,
        headers: {
          ...(options.headers || {}),
          Authorization: 'Bearer ' + token
        }
      });
    }

    async function ensureBackendSession(user) {
      const token = await user.getIdToken();
      const response = await fetch(`${API_BASE}/api/auth/me`, {
        headers: { Authorization: 'Bearer ' + token }
      });
      if (!response.ok) throw new Error('Your website account is not ready yet.');
      const data = await response.json();
      state.roles = Array.isArray(data.roles) ? data.roles : [];
    }

    async function loadDashboard() {
      state.loading.dashboard = true;
      render();
      try {
        const response = await authedFetch(`${API_BASE}/api/account/dashboard`);
        if (!response.ok) {
          if (response.status === 403 || response.status === 404) {
            state.profile = null;
            state.stats = null;
            state.activity = [];
            state.skins = [];
            return;
          }
          throw new Error(`Dashboard failed (${response.status})`);
        }
        const data = await response.json();
        state.profile = data.user || null;
        state.stats = data.stats || null;
        state.activity = Array.isArray(data.activity) ? data.activity : [];
        state.skins = Array.isArray(data.skins) ? data.skins : [];
        const firstGamertag = (state.profile?.bedrockAccounts || []).map((item) => item?.xboxGamertag).filter(Boolean)[0] || '';
        state.connectForm.gamertag = state.connectForm.gamertag || firstGamertag;
      } finally {
        state.loading.dashboard = false;
      }
    }

    async function loadNotifications() {
      state.loading.notifications = true;
      try {
        const response = await authedFetch(`${API_BASE}/api/notifications/prefs`);
        if (!response.ok) throw new Error(`Notifications failed (${response.status})`);
        const data = await response.json();
        state.notifications = data.prefs || {};
      } catch (error) {
        state.notifications = null;
        console.warn(error);
      } finally {
        state.loading.notifications = false;
      }
    }

    async function loadSubmissions() {
      state.loading.submissions = true;
      try {
        const response = await authedFetch(`${API_BASE}/api/featured-packs/my-submissions`);
        if (!response.ok) throw new Error(`Submissions failed (${response.status})`);
        const data = await response.json();
        state.submissions = Array.isArray(data.submissions) ? data.submissions : [];
      } catch (error) {
        state.submissions = [];
        console.warn(error);
      } finally {
        state.loading.submissions = false;
      }
    }

    async function loadSkins() {
      state.loading.skins = true;
      try {
        if (state.skins.length > 0) return;
        const response = await authedFetch(`${API_BASE}/api/skins/me`);
        if (!response.ok) throw new Error(`Skins failed (${response.status})`);
        const data = await response.json();
        state.skins = Array.isArray(data.skins) ? data.skins : [];
      } catch (error) {
        console.warn(error);
      } finally {
        state.loading.skins = false;
      }
    }

    async function loadAccountData() {
      state.error = null;
      state.flash = null;
      await Promise.all([loadDashboard(), loadNotifications(), loadSubmissions(), loadSkins()]);
      render();
    }

    async function handleLogin(event) {
      event.preventDefault();
      const email = document.getElementById('login-email')?.value.trim();
      const password = document.getElementById('login-password')?.value ?? '';
      if (!email || !password) {
        setError('Enter your email and password first.');
        return;
      }
      state.busy = true;
      state.error = null;
      render();
      try {
        const credential = await signInWithEmailAndPassword(auth, email, password);
        await ensureBackendSession(credential.user);
        setFlash('success', 'Signed in. Loading your account...');
      } catch (error) {
        const message = error?.code === 'auth/invalid-credential' || error?.code === 'auth/wrong-password'
          ? 'Invalid email or password.'
          : error?.message || 'Sign-in failed.';
        state.error = message;
      } finally {
        state.busy = false;
        render();
      }
    }

    async function handlePasswordReset(event) {
      event.preventDefault();
      const email = document.getElementById('reset-email')?.value.trim();
      if (!email) {
        setError('Enter your email address first.');
        return;
      }
      state.busy = true;
      state.error = null;
      render();
      try {
        await sendPasswordResetEmail(auth, email);
        setFlash('success', `Password reset email sent to ${email}.`);
      } catch (error) {
        state.error = error?.message || 'Could not send the reset email.';
      } finally {
        state.busy = false;
        render();
      }
    }

    async function handleLogout() {
      state.busy = true;
      render();
      try {
        await signOut(auth);
        state.user = null;
        state.roles = [];
        state.profile = null;
        state.stats = null;
        state.activity = [];
        state.skins = [];
        state.submissions = [];
        state.notifications = null;
        state.connectResult = null;
        state.flash = { type: 'success', message: 'Signed out.' };
      } catch (error) {
        state.error = error?.message || 'Could not sign out.';
      } finally {
        state.busy = false;
        render();
      }
    }

    async function saveProfile() {
      const displayName = document.getElementById('profile-display-name')?.value.trim() || null;
      const bio = document.getElementById('profile-bio')?.value.trim() || null;
      state.loading.profileSave = true;
      state.error = null;
      render();
      try {
        const response = await authedFetch(`${API_BASE}/api/users/me`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ displayName, bio })
        });
        if (!response.ok) throw new Error(`Save failed (${response.status})`);
        const data = await response.json();
        state.profile = data.user || state.profile;
        setFlash('success', 'Profile saved.');
      } catch (error) {
        state.error = error?.message || 'Could not save your profile.';
      } finally {
        state.loading.profileSave = false;
        render();
      }
    }

    async function uploadAvatar(file) {
      if (!file) return;
      state.loading.avatar = true;
      state.error = null;
      render();
      try {
        const presignResponse = await authedFetch(`${API_BASE}/api/users/me/avatar/presign`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mime: file.type })
        });
        const presignData = await presignResponse.json();
        if (!presignResponse.ok) throw new Error(presignData?.message || `Presign failed (${presignResponse.status})`);

        const uploadResponse = await fetch(presignData.uploadUrl, {
          method: 'PUT',
          headers: { 'Content-Type': file.type },
          body: file
        });
        if (!uploadResponse.ok) throw new Error(`Upload failed (${uploadResponse.status})`);

        const confirmResponse = await authedFetch(`${API_BASE}/api/users/me/avatar/confirm`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ r2Key: presignData.r2Key })
        });
        const confirmData = await confirmResponse.json();
        if (!confirmResponse.ok) throw new Error(confirmData?.message || `Confirm failed (${confirmResponse.status})`);

        state.profile = { ...(state.profile || {}), avatarUrl: confirmData.avatarUrl };
        setFlash('success', 'Avatar updated.');
      } catch (error) {
        state.error = error?.message || 'Avatar upload failed.';
      } finally {
        state.loading.avatar = false;
        render();
      }
    }

    async function removeAvatar() {
      if (!window.confirm('Remove your avatar?')) return;
      state.loading.avatar = true;
      state.error = null;
      render();
      try {
        const response = await authedFetch(`${API_BASE}/api/users/me/avatar`, { method: 'DELETE' });
        if (!response.ok) throw new Error(`Delete failed (${response.status})`);
        state.profile = { ...(state.profile || {}), avatarUrl: null };
        setFlash('success', 'Avatar removed.');
      } catch (error) {
        state.error = error?.message || 'Could not remove your avatar.';
      } finally {
        state.loading.avatar = false;
        render();
      }
    }

    async function deleteSkin(id) {
      if (!window.confirm('Delete this skin?')) return;
      state.loading.skins = true;
      render();
      try {
        const response = await authedFetch(`${API_BASE}/api/skins/me/${id}`, { method: 'DELETE' });
        if (!response.ok) throw new Error(`Delete failed (${response.status})`);
        state.skins = state.skins.filter((skin) => skin.id !== id);
        setFlash('success', 'Skin deleted.');
      } catch (error) {
        state.error = error?.message || 'Could not delete that skin.';
      } finally {
        state.loading.skins = false;
        render();
      }
    }

    async function saveNotifications() {
      if (!state.notifications) return;
      state.loading.notifSave = true;
      state.error = null;
      render();
      try {
        const next = {};
        NOTIF_PREFS_META.forEach(({ key }) => {
          next[key] = Boolean(document.querySelector(`[data-pref-key="${key}"]`)?.checked);
        });
        const response = await authedFetch(`${API_BASE}/api/notifications/prefs`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(next)
        });
        if (!response.ok) throw new Error(`Save failed (${response.status})`);
        state.notifications = next;
        setFlash('success', 'Notification settings saved.');
      } catch (error) {
        state.error = error?.message || 'Could not save notification settings.';
      } finally {
        state.loading.notifSave = false;
        render();
      }
    }

    async function loadBotsIfNeeded() {
      if (state.connectForm.mode !== 'friends' || state.connectBots !== null) return;
      try {
        const response = await fetch(`${API_BASE}/api/bots`);
        if (!response.ok) throw new Error(`Bots failed (${response.status})`);
        const data = await response.json();
        state.connectBots = Array.isArray(data.bots) ? data.bots : [];
      } catch (_) {
        state.connectBots = [];
      }
    }

    function pickFriendBot() {
      if (!Array.isArray(state.connectBots) || state.connectBots.length === 0) return null;
      return state.connectBots.find((bot) => hasFreeFriendSlot(bot)) || state.connectBots[0];
    }

    async function submitConnect(event) {
      event.preventDefault();
      const address = document.getElementById('connect-address')?.value.trim() || '';
      const port = document.getElementById('connect-port')?.value.trim() || '';
      const gamertag = document.getElementById('connect-gamertag')?.value || '';
      state.connectForm.address = address;
      state.connectForm.port = port;
      state.connectForm.gamertag = gamertag;
      state.error = null;
      state.connectResult = null;

      if (!address) {
        setError('Enter your server address first.');
        return;
      }
      const portNum = Number.parseInt(port, 10);
      if (!Number.isInteger(portNum) || portNum < 1 || portNum > 65535) {
        setError('Use a port between 1 and 65535.');
        return;
      }

      const bot = state.connectForm.mode === 'friends' ? pickFriendBot() : null;
      if (state.connectForm.mode === 'friends' && !bot) {
        setError('No friend bot is available right now. Try DNS mode instead.');
        return;
      }

      state.loading.connect = true;
      render();
      try {
        const body = {
          remoteIP: address,
          remotePort: portNum,
          mode: CONNECT_MODE_STRING[state.connectForm.mode]
        };
        if (gamertag) body.bedrockGamertag = gamertag;
        const response = await authedFetch(`${API_BASE}/api/route`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        });
        let payload = null;
        try { payload = await response.json(); } catch (_) {}
        if (response.ok) {
          state.connectResult = {
            mode: state.connectForm.mode,
            region: state.connectForm.region,
            gamertag,
            bot: bot?.gamertag || null
          };
          setFlash('success', 'Console session ready.');
          return;
        }
        if (response.status === 403) throw new Error(payload?.message || 'Your connection is blocked.');
        if (response.status === 429) throw new Error('You are doing that too fast. Wait a moment and try again.');
        throw new Error(payload?.message || `Connect failed (${response.status})`);
      } catch (error) {
        state.error = error?.message || 'Could not start the session.';
      } finally {
        state.loading.connect = false;
        render();
      }
    }

    async function uploadPackThumbnail(file, isEdit = false) {
      if (!file) return;
      const target = isEdit ? state.editingSubmissionThumb : state.submitPack;
      target.uploading = true;
      target.name = file.name;
      if (typeof URL !== 'undefined' && URL.createObjectURL) target.preview = URL.createObjectURL(file);
      render();
      try {
        const response = await authedFetch(`${API_BASE}/api/featured-packs/thumbnail-presign`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mime: file.type })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data?.message || 'Presign failed.');
        const uploadResponse = await fetch(data.uploadUrl, {
          method: 'PUT',
          headers: { 'Content-Type': file.type },
          body: file
        });
        if (!uploadResponse.ok) throw new Error(`Upload failed (${uploadResponse.status})`);
        target.url = data.publicUrl;
        if (!isEdit) state.submitPack.thumbnailUrl = data.publicUrl;
        setFlash('success', 'Thumbnail uploaded.');
      } catch (error) {
        target.preview = '';
        target.url = '';
        state.error = error?.message || 'Thumbnail upload failed.';
      } finally {
        target.uploading = false;
        render();
      }
    }

    function parseTags(raw) {
      return String(raw || '')
        .split(',')
        .map((tag) => tag.trim().toLowerCase().replace(/[^a-z0-9-]/g, ''))
        .filter(Boolean)
        .filter((tag, index, arr) => arr.indexOf(tag) === index)
        .slice(0, 8);
    }

    function syncPackDraftFromDom() {
      state.submitPackDraft = {
        name: document.getElementById('pack-name')?.value || state.submitPackDraft.name,
        description: document.getElementById('pack-description')?.value || state.submitPackDraft.description,
        category: document.getElementById('pack-category')?.value || state.submitPackDraft.category,
        tags: document.getElementById('pack-tags')?.value || state.submitPackDraft.tags,
        longDescription: document.getElementById('pack-long-description')?.value || state.submitPackDraft.longDescription,
        creatorWebsite: document.getElementById('pack-creator-website')?.value || state.submitPackDraft.creatorWebsite,
        creatorDiscord: document.getElementById('pack-creator-discord')?.value || state.submitPackDraft.creatorDiscord,
        ownership: Boolean(document.getElementById('pack-ownership')?.checked ?? state.submitPackDraft.ownership)
      };
    }

    function hasFreeFriendSlot(bot) {
      return bot.friendCount === null || bot.friendCount === undefined || bot.friendCount < bot.maxFriends;
    }

    function syncConnectFormFromDom() {
      state.connectForm.address = document.getElementById('connect-address')?.value || state.connectForm.address;
      state.connectForm.port = document.getElementById('connect-port')?.value || state.connectForm.port;
      const gamertag = document.getElementById('connect-gamertag')?.value;
      if (typeof gamertag === 'string') state.connectForm.gamertag = gamertag;
    }

    function createSubmissionDraft(submission) {
      return {
        name: submission.name || '',
        description: submission.description || '',
        tags: (submission.tags || []).join(', '),
        category: submission.category || '',
        longDescription: submission.longDescription || '',
        creatorWebsite: submission.creatorWebsite || '',
        creatorDiscord: submission.creatorDiscord || ''
      };
    }

    async function submitPack(event) {
      event.preventDefault();
      syncPackDraftFromDom();
      const file = state.submitPack.file;
      const name = state.submitPackDraft.name.trim();
      if (!file || !name) {
        setError('Pick a pack file and enter a pack name first.');
        return;
      }
      if (!state.submitPackDraft.ownership) {
        setError('Confirm that you own the rights to the pack before submitting.');
        return;
      }
      state.loading.packSubmit = true;
      state.error = null;
      render();
      try {
        const response = await authedFetch(`${API_BASE}/api/featured-packs/submit`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/octet-stream',
            'x-pack-name': name,
            'x-pack-description': state.submitPackDraft.description.trim(),
            'x-pack-thumbnail': state.submitPack.thumbnailUrl || '',
            'x-pack-tags': parseTags(state.submitPackDraft.tags).join(','),
            'x-pack-category': state.submitPackDraft.category || '',
            'x-pack-long-description': state.submitPackDraft.longDescription.trim(),
            'x-pack-creator-website': state.submitPackDraft.creatorWebsite.trim(),
            'x-pack-creator-discord': state.submitPackDraft.creatorDiscord.trim()
          },
          body: file
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data?.error || data?.message || `Submit failed (${response.status})`);
        state.submitPack = {
          file: null,
          fileName: '',
          thumbnailUrl: '',
          uploading: false,
          preview: '',
          thumbnailName: ''
        };
        state.submitPackDraft = {
          name: '',
          description: '',
          category: '',
          tags: '',
          longDescription: '',
          creatorWebsite: '',
          creatorDiscord: '',
          ownership: false
        };
        await loadSubmissions();
        setFlash('success', 'Pack submitted. It is now in the review queue.');
      } catch (error) {
        state.error = error?.message || 'Could not submit the pack.';
      } finally {
        state.loading.packSubmit = false;
        render();
      }
    }

    function beginSubmissionEdit(id) {
      const submission = state.submissions.find((item) => item.id === id);
      if (!submission) return;
      state.editingSubmissionId = id;
      state.editSubmissionDraft = createSubmissionDraft(submission);
      state.editingSubmissionThumb = {
        url: submission.thumbnailUrl || '',
        preview: submission.thumbnailUrl || '',
        uploading: false,
        name: ''
      };
      render();
    }

    function syncEditDraftFromDom(id) {
      const root = document.querySelector(`[data-edit-root="${id}"]`);
      if (!root) return;
      state.editSubmissionDraft = {
        name: root.querySelector('[data-edit="name"]')?.value || state.editSubmissionDraft?.name || '',
        description: root.querySelector('[data-edit="description"]')?.value || state.editSubmissionDraft?.description || '',
        tags: root.querySelector('[data-edit="tags"]')?.value || state.editSubmissionDraft?.tags || '',
        category: root.querySelector('[data-edit="category"]')?.value || state.editSubmissionDraft?.category || '',
        longDescription: root.querySelector('[data-edit="longDescription"]')?.value || state.editSubmissionDraft?.longDescription || '',
        creatorWebsite: root.querySelector('[data-edit="creatorWebsite"]')?.value || state.editSubmissionDraft?.creatorWebsite || '',
        creatorDiscord: root.querySelector('[data-edit="creatorDiscord"]')?.value || state.editSubmissionDraft?.creatorDiscord || ''
      };
    }

    async function saveSubmissionEdit(id, resubmit = false) {
      const root = document.querySelector(`[data-edit-root="${id}"]`);
      if (!root) return;
      syncEditDraftFromDom(id);
      state.busy = true;
      state.error = null;
      render();
      try {
        const body = {
          name: state.editSubmissionDraft.name.trim() || undefined,
          description: state.editSubmissionDraft.description.trim() || undefined,
          thumbnailUrl: state.editingSubmissionThumb.url || undefined,
          tags: parseTags(state.editSubmissionDraft.tags),
          category: state.editSubmissionDraft.category || undefined,
          longDescription: state.editSubmissionDraft.longDescription.trim() || undefined,
          creatorWebsite: state.editSubmissionDraft.creatorWebsite.trim() || undefined,
          creatorDiscord: state.editSubmissionDraft.creatorDiscord.trim() || undefined,
          ...(resubmit ? { resubmit: true } : {})
        };
        const response = await authedFetch(`${API_BASE}/api/featured-packs/my-submissions/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        });
        if (!response.ok) throw new Error(`Save failed (${response.status})`);
        state.editingSubmissionId = null;
        state.editSubmissionDraft = null;
        await loadSubmissions();
        setFlash('success', resubmit ? 'Submission updated and re-submitted.' : 'Submission updated.');
      } catch (error) {
        state.error = error?.message || 'Could not update that submission.';
      } finally {
        state.busy = false;
        render();
      }
    }

    async function replaceSubmissionFile(id, file) {
      if (!file) return;
      state.busy = true;
      state.error = null;
      render();
      try {
        const response = await authedFetch(`${API_BASE}/api/featured-packs/my-submissions/${id}/file`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/octet-stream' },
          body: file
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data?.message || data?.error || `Upload failed (${response.status})`);
        await loadSubmissions();
        setFlash('success', 'Pack file updated.');
      } catch (error) {
        state.error = error?.message || 'Could not replace the pack file.';
      } finally {
        state.busy = false;
        render();
      }
    }

    async function withdrawSubmission(id) {
      if (!window.confirm('Withdraw this submission?')) return;
      state.busy = true;
      state.error = null;
      render();
      try {
        const response = await authedFetch(`${API_BASE}/api/featured-packs/my-submissions/${id}`, { method: 'DELETE' });
        if (!response.ok) throw new Error(`Delete failed (${response.status})`);
        await loadSubmissions();
        setFlash('success', 'Submission withdrawn.');
      } catch (error) {
        state.error = error?.message || 'Could not withdraw that submission.';
      } finally {
        state.busy = false;
        render();
      }
    }

    function renderLogin() {
      appRoot.innerHTML = `
        <section class="panel auth-card">
          <div class="panel-head">
            <div>
              <p class="badge accent">Single-file PHP version</p>
              <h1 class="title" style="font-size: 34px; margin-top: 12px;">MCCompanion account</h1>
              <p class="panel-copy">Sign in with Firebase on the client, then this page talks to the MCCompanion API directly from your browser. The layout is simplified for TV and console browsers.</p>
            </div>
          </div>
          ${notificationHtml('success', state.flash?.type === 'success' ? state.flash.message : '')}
          ${notificationHtml('error', state.error)}
          <form id="login-form" class="fields">
            <div class="field">
              <label for="login-email">Email</label>
              <input id="login-email" type="email" autocomplete="email" placeholder="you@example.com" required>
            </div>
            <div class="field">
              <label for="login-password">Password</label>
              <input id="login-password" type="password" autocomplete="current-password" placeholder="Password" required>
            </div>
            <div class="button-row">
              <button type="submit">${state.busy ? 'Signing in…' : 'Sign in'}</button>
              <a class="button" href="/register" style="display:flex;align-items:center;justify-content:center;text-decoration:none;">Create account</a>
            </div>
          </form>
          <form id="reset-form" class="fields" style="margin-top: 18px;">
            <div class="field">
              <label for="reset-email">Forgot password?</label>
              <input id="reset-email" type="email" autocomplete="email" placeholder="Email for reset link">
            </div>
            <button type="submit">${state.busy ? 'Sending…' : 'Send reset link'}</button>
          </form>
        </section>
      `;

      document.getElementById('login-form')?.addEventListener('submit', handleLogin);
      document.getElementById('reset-form')?.addEventListener('submit', handlePasswordReset);
    }

    function renderProfilePanel() {
      if (!state.profile) {
        return `
          <section class="panel">
            <div class="panel-head">
              <div>
                <h2>No app profile yet</h2>
                <p class="panel-copy">Your Firebase login works, but there is no MCCompanion profile on the API yet. Create one from the website or mobile app first.</p>
              </div>
            </div>
            <div class="button-row">
              <a class="button" href="/register" style="display:flex;align-items:center;justify-content:center;text-decoration:none;">Open registration</a>
            </div>
          </section>
        `;
      }

      const avatarUrl = safeUrl(state.profile.avatarUrl);
      const activity = state.activity.length === 0
        ? `<div class="notice">No recent activity yet.</div>`
        : `<div class="activity-list">${state.activity.map((entry) => {
            const meta = ACTIVITY_LABELS[entry.type] || { icon: '•', label: entry.type, colorClass: 'muted' };
            return `
              <article class="activity-item">
                <div class="row" style="justify-content:space-between;align-items:flex-start;">
                  <div style="display:flex;gap:12px;min-width:0;">
                    <div style="font-size:24px;line-height:1;">${meta.icon}</div>
                    <div style="min-width:0;">
                      <p class="${meta.colorClass}" style="font-weight:800; margin-bottom:4px;">${escapeHtml(meta.label)}</p>
                      <p>${escapeHtml(entry.name || 'Unnamed activity')}</p>
                    </div>
                  </div>
                  <span class="muted" style="font-size:13px;">${escapeHtml(timeAgo(entry.createdAt))}</span>
                </div>
              </article>
            `;
          }).join('')}</div>`;

      const stats = state.stats ? `
        <section class="panel">
          <div class="panel-head">
            <div>
              <h2>Stats</h2>
              <p class="panel-copy">Quick account numbers from the dashboard API.</p>
            </div>
          </div>
          <div class="stats">
            ${[
              ['Skins', state.stats.skinCount],
              ['Skin likes', state.stats.skinLikes],
              ['Packs submitted', state.stats.packSubmissionCount],
              ['Packs approved', state.stats.packApprovedCount]
            ].map(([label, value]) => `<div class="stat"><strong>${escapeHtml(value ?? 0)}</strong><span class="muted">${escapeHtml(label)}</span></div>`).join('')}
          </div>
        </section>
      ` : '';

      return `
        <section class="panel">
          <div class="panel-head">
            <div>
              <h2>Edit profile</h2>
              <p class="panel-copy">This mirrors the React account page, but with larger controls and a simpler layout.</p>
            </div>
          </div>
          <div class="fields">
            <div class="field-grid">
              <div class="field">
                <label for="profile-display-name">Display name</label>
                <input id="profile-display-name" type="text" maxlength="32" value="${escapeHtml(state.profile.displayName || '')}" placeholder="Optional display name">
              </div>
              <div class="field">
                <label>Avatar</label>
                <div class="button-row">
                  <button type="button" id="profile-avatar-upload">${state.loading.avatar ? 'Uploading…' : 'Upload photo'}</button>
                  ${avatarUrl ? '<button type="button" id="profile-avatar-remove">Remove photo</button>' : ''}
                </div>
                <input id="profile-avatar-input" class="hidden" type="file" accept="image/jpeg,image/png,image/webp,image/gif">
              </div>
            </div>
            <div class="field">
              <label for="profile-bio">Bio</label>
              <textarea id="profile-bio" maxlength="200" placeholder="Tell people a little about yourself">${escapeHtml(state.profile.bio || '')}</textarea>
            </div>
            <div class="button-row">
              <button type="button" id="profile-save">${state.loading.profileSave ? 'Saving…' : 'Save changes'}</button>
              <button type="button" id="profile-share">Copy public profile link</button>
            </div>
          </div>
        </section>
        ${stats}
        <section class="panel">
          <div class="panel-head">
            <div>
              <h2>Recent activity</h2>
              <p class="panel-copy">Member since ${escapeHtml(formatDate(state.profile.createdAt))}.</p>
            </div>
          </div>
          ${activity}
        </section>
      `;
    }

    function renderAccounts(items, type) {
      if (!items || items.length === 0) {
        return `<div class="notice">No ${type} account linked.</div>`;
      }
      return `<div class="account-list">${items.map((item) => {
        const image = type === 'Java Edition' && item.javaUuid ? safeUrl(`https://crafatar.com/avatars/${item.javaUuid}?size=64&overlay`) : '';
        return `
          <article class="account-card">
            <div class="account-icon">${image ? `<img src="${image}" alt="">` : '🎮'}</div>
            <div style="min-width:0;">
              <p style="font-weight:800; margin-bottom:4px;">${escapeHtml(type === 'Java Edition' ? item.javaUsername : item.xboxGamertag)}</p>
              <p class="muted mono">${escapeHtml(type === 'Java Edition' ? item.javaUuid : `XUID: ${item.xboxXuid}`)}</p>
            </div>
          </article>
        `;
      }).join('')}</div>`;
    }

    function renderAccountPanel() {
      return `
        <section class="panel">
          <div class="panel-head">
            <div>
              <h2>Account details</h2>
              <p class="panel-copy">Firebase signs you in, then the API checks your bearer token with <span class="mono">/api/auth/me</span>.</p>
            </div>
          </div>
          <div class="meta-list">
            <div class="meta-item">
              <span class="meta-label">Email</span>
              <span class="meta-value">${escapeHtml(state.user?.email || 'Unknown')}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">UID</span>
              <span class="meta-value mono">${escapeHtml(state.user?.uid || 'Unknown')}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">Roles</span>
              <span class="meta-value pill-row">${roleBadges()}</span>
            </div>
          </div>
        </section>
        <section class="panel">
          <div class="panel-head">
            <div>
              <h2>Minecraft accounts</h2>
              <p class="panel-copy">These are linked through MCCompanion itself, not through the PHP file.</p>
            </div>
          </div>
          <div class="stack">
            <div>
              <h3 style="margin-bottom:12px;">Java Edition</h3>
              ${renderAccounts(state.profile?.javaAccounts || [], 'Java Edition')}
            </div>
            <div>
              <h3 style="margin-bottom:12px;">Bedrock Edition</h3>
              ${renderAccounts(state.profile?.bedrockAccounts || [], 'Bedrock Edition')}
            </div>
          </div>
        </section>
      `;
    }

    function renderConnectPanel() {
      const mode = state.connectForm.mode;
      const relay = CONNECT_RELAYS[state.connectResult?.region || state.connectForm.region];
      const gamertags = (state.profile?.bedrockAccounts || []).map((item) => item.xboxGamertag).filter(Boolean);
      const result = state.connectResult;
      const bot = result?.bot ? `<p><strong>Add friend:</strong> ${escapeHtml(result.bot)}</p>` : '';
      const instructions = result ? `
        <div class="notice success" style="margin-bottom: 16px;">
          ${result.mode === 'friends'
            ? `<p><strong>Session ready.</strong> Add <span class="mono">${escapeHtml(result.bot || '')}</span> on Xbox Live, open Minecraft, then join from the Friends tab.</p>`
            : `<p><strong>Session ready.</strong> Set your DNS to <span class="mono">${escapeHtml(relay.ip)}</span>, open Minecraft, and join any featured server.</p>`}
          ${bot}
          <p style="margin-top:10px;">${result.gamertag ? `Matched by gamertag ${escapeHtml(result.gamertag)} and your current IP.` : 'Matched by your current IP only.'}</p>
        </div>
      ` : '';

      return `
        <section class="panel">
          <div class="panel-head">
            <div>
              <h2>Connect from the web</h2>
              <p class="panel-copy">All route requests go straight from the browser to the API. Nothing is proxied through PHP.</p>
            </div>
          </div>
          ${instructions}
          <form id="connect-form" class="fields">
            <div class="field">
              <label>Connection mode</label>
              <div class="button-row">
                ${[
                  ['dns', 'DNS'],
                  ['friends', 'Friends'],
                  ['java', 'Java']
                ].map(([id, label]) => `<button type="button" class="connect-mode ${mode === id ? 'tab active' : 'tab'}" data-connect-mode="${id}">${label}</button>`).join('')}
              </div>
              <p class="panel-copy">
                ${mode === 'dns' ? 'Set your console DNS to a relay, then join a featured server.' : ''}
                ${mode === 'friends' ? 'A friend bot adds you and your server appears in the Friends tab.' : ''}
                ${mode === 'java' ? 'Bridge to a Java Edition server through the relay.' : ''}
              </p>
            </div>
            <div class="field-grid">
              <div class="field">
                <label for="connect-address">Server address</label>
                <input id="connect-address" type="text" value="${escapeHtml(state.connectForm.address)}" placeholder="play.myserver.net" autocapitalize="off" spellcheck="false">
              </div>
              <div class="field">
                <label for="connect-port">Port</label>
                <input id="connect-port" type="text" inputmode="numeric" value="${escapeHtml(state.connectForm.port)}" placeholder="${CONNECT_DEFAULT_PORT[mode === 'java' ? 'java' : 'bedrock']}">
                <p class="panel-copy">Use the Minecraft server port here. Most setups use 19132 for Bedrock or 25565 for Java.</p>
              </div>
            </div>
            ${gamertags.length > 0 ? `
              <div class="field">
                <label for="connect-gamertag">Bedrock gamertag</label>
                <select id="connect-gamertag">
                  ${gamertags.map((tag) => `<option value="${escapeHtml(tag)}" ${state.connectForm.gamertag === tag ? 'selected' : ''}>${escapeHtml(tag)}</option>`).join('')}
                </select>
              </div>
            ` : ''}
            <div class="field">
              <label>Relay region</label>
              <div class="button-row">
                ${Object.entries(CONNECT_RELAYS).map(([id, data]) => `<button type="button" class="connect-region ${state.connectForm.region === id ? 'tab active' : 'tab'}" data-connect-region="${id}">${escapeHtml(data.name)}</button>`).join('')}
              </div>
            </div>
            <button type="submit">${state.loading.connect ? 'Starting session…' : 'Start console session'}</button>
          </form>
        </section>
      `;
    }

    function renderSkinsPanel() {
      if (!state.profile) {
        return `<section class="panel"><div class="notice">Create an MCCompanion profile before using cloud skins.</div></section>`;
      }
      if (state.loading.skins && state.skins.length === 0) {
        return `<section class="panel"><div class="notice">Loading skins…</div></section>`;
      }
      if (state.skins.length === 0) {
        return `
          <section class="panel">
            <div class="panel-head">
              <div>
                <h2>Cloud skins</h2>
                <p class="panel-copy">No cloud skins yet.</p>
              </div>
            </div>
            <div class="button-row">
              <a class="button" href="/skins" style="display:flex;align-items:center;justify-content:center;text-decoration:none;">Open skin workshop</a>
            </div>
          </section>
        `;
      }
      return `
        <section class="panel">
          <div class="panel-head">
            <div>
              <h2>Cloud skins</h2>
              <p class="panel-copy">Simple image cards instead of the React 3D skin renderer.</p>
            </div>
          </div>
          <div class="skin-grid">
            ${state.skins.map((skin) => {
              const image = safeUrl(skin.public_url);
              return `
                <article class="skin-card">
                  <div class="skin-preview">${image ? `<img src="${image}" alt="${escapeHtml(skin.name)}">` : '🎨'}</div>
                  <div>
                    <p style="font-weight:800; margin-bottom:6px;">${escapeHtml(skin.name || 'Unnamed skin')}</p>
                    <p class="muted">${skin.like_count ? `♥ ${escapeHtml(skin.like_count)}` : 'No likes yet'}</p>
                  </div>
                  <button type="button" data-delete-skin="${escapeHtml(skin.id)}">Delete skin</button>
                </article>
              `;
            }).join('')}
          </div>
        </section>
      `;
    }

    function submissionStatusBadge(status) {
      const normalized = String(status || 'pending').toLowerCase();
      const extra = normalized === 'approved' ? ' accent' : normalized === 'rejected' ? ' danger' : '';
      return `<span class="badge${extra}">${escapeHtml(normalized)}</span>`;
    }

    function renderEditSubmissionForm(submission) {
      if (state.editingSubmissionId !== submission.id) return '';
      const draft = state.editSubmissionDraft || createSubmissionDraft(submission);
      return `
        <div class="submission-edit" data-edit-root="${escapeHtml(submission.id)}">
          <div class="fields">
            <div class="field-grid">
              <div class="field">
                <label>Pack name</label>
                <input data-edit="name" type="text" value="${escapeHtml(draft.name)}">
              </div>
              <div class="field">
                <label>Category</label>
                <select data-edit="category">
                  <option value="">Choose a category</option>
                  ${PACK_CATEGORIES.map((category) => `<option value="${category}" ${draft.category === category ? 'selected' : ''}>${category}</option>`).join('')}
                </select>
              </div>
            </div>
            <div class="field">
              <label>Short description</label>
              <input data-edit="description" type="text" value="${escapeHtml(draft.description)}">
            </div>
            <div class="field">
              <label>Tags</label>
              <input data-edit="tags" type="text" value="${escapeHtml(draft.tags)}" placeholder="faithful, pvp, dark">
              <p class="panel-copy">${escapeHtml(TAG_HELP_TEXT)}</p>
            </div>
            <div class="field">
              <label>Long description</label>
              <textarea data-edit="longDescription">${escapeHtml(draft.longDescription)}</textarea>
            </div>
            <div class="field-grid">
              <div class="field">
                <label>Creator website</label>
                <input data-edit="creatorWebsite" type="url" value="${escapeHtml(draft.creatorWebsite)}">
              </div>
              <div class="field">
                <label>Creator Discord</label>
                <input data-edit="creatorDiscord" type="text" value="${escapeHtml(draft.creatorDiscord)}">
              </div>
            </div>
            <div class="field">
              <label>Thumbnail</label>
              <div class="button-row">
                <button type="button" data-edit-thumb-button="${escapeHtml(submission.id)}">${state.editingSubmissionThumb.uploading ? 'Uploading…' : 'Upload thumbnail'}</button>
                <span class="notice">${escapeHtml(state.editingSubmissionThumb.name || 'Current thumbnail will be kept if you skip this.')}</span>
              </div>
              <input class="hidden" type="file" accept="image/png,image/jpeg,image/webp" data-edit-thumb-input="${escapeHtml(submission.id)}">
            </div>
            <div class="button-row">
              <button type="button" data-save-submission="${escapeHtml(submission.id)}">Save changes</button>
              ${submission.status === 'rejected' ? `<button type="button" data-resubmit-submission="${escapeHtml(submission.id)}">Save + resubmit</button>` : ''}
              <button type="button" data-cancel-edit="${escapeHtml(submission.id)}">Cancel</button>
            </div>
          </div>
        </div>
      `;
    }

    function renderPacksPanel() {
      if (!state.profile) {
        return `<section class="panel"><div class="notice">Create an MCCompanion profile before submitting resource packs.</div></section>`;
      }
      const draft = state.submitPackDraft;
      const submissions = state.loading.submissions && state.submissions.length === 0
        ? `<div class="notice">Loading your submissions…</div>`
        : state.submissions.length === 0
          ? `<div class="notice">No submissions yet.</div>`
          : `<div class="submissions-list">${state.submissions.map((submission) => {
              const thumb = safeUrl(submission.thumbnailUrl);
              const editAllowed = submission.status === 'pending' || submission.status === 'rejected';
              const approved = submission.status === 'approved';
              return `
                <article class="submission">
                  <div class="submission-top">
                    <div class="submission-main">
                      <div class="submission-thumb">${thumb ? `<img src="${thumb}" alt="">` : '📦'}</div>
                      <div class="submission-copy">
                        <p style="font-size:18px;font-weight:800; margin-bottom:6px;">${escapeHtml(submission.name || 'Unnamed pack')}</p>
                        <div class="pill-row" style="margin-bottom:8px;">${submissionStatusBadge(submission.status)}${submission.category ? `<span class="badge">${escapeHtml(submission.category)}</span>` : ''}</div>
                        <p class="muted">${escapeHtml(submission.description || 'No short description.')}</p>
                        ${(submission.tags || []).length ? `<p class="muted" style="margin-top:8px;">Tags: ${escapeHtml((submission.tags || []).join(', '))}</p>` : ''}
                        ${submission.reviewNote ? `<div class="notice" style="margin-top:12px;">Review note: ${escapeHtml(submission.reviewNote)}</div>` : ''}
                      </div>
                    </div>
                    <div class="actions">
                      ${editAllowed ? `<button type="button" data-edit-submission="${escapeHtml(submission.id)}">${state.editingSubmissionId === submission.id ? 'Editing…' : 'Edit'}</button>` : ''}
                      <button type="button" data-replace-file="${escapeHtml(submission.id)}">${approved ? 'Upload update' : 'Replace file'}</button>
                      ${editAllowed ? `<button type="button" data-withdraw-submission="${escapeHtml(submission.id)}">Withdraw</button>` : ''}
                    </div>
                  </div>
                  <input class="hidden" type="file" accept=".mcpack,.zip" data-replace-file-input="${escapeHtml(submission.id)}">
                  ${renderEditSubmissionForm(submission)}
                </article>
              `;
            }).join('')}</div>`;

      const thumbReady = state.submitPack.thumbnailUrl
        ? `<div class="notice success">Thumbnail uploaded and ready: ${escapeHtml(state.submitPack.thumbnailName || 'selected image')}</div>`
        : state.submitPack.preview
          ? `<div class="notice">Thumbnail selected: ${escapeHtml(state.submitPack.thumbnailName || 'selected image')}</div>`
          : '';

      return `
        <section class="panel">
          <div class="panel-head">
            <div>
              <h2>My submissions</h2>
              <p class="panel-copy">Manage pending, rejected, and approved packs from the same API endpoints used by the React page.</p>
            </div>
          </div>
          ${submissions}
        </section>
        <section class="panel">
          <div class="panel-head">
            <div>
              <h2>Submit a resource pack</h2>
              <p class="panel-copy">The file still uploads directly from your browser with the same request headers as the original page.</p>
            </div>
          </div>
          ${thumbReady}
          <form id="pack-form" class="fields">
            <div class="field-grid">
              <div class="field">
                <label for="pack-name">Pack name</label>
                <input id="pack-name" type="text" maxlength="64" placeholder="Faithful 32x" value="${escapeHtml(draft.name)}">
              </div>
              <div class="field">
                <label for="pack-category">Category</label>
                <select id="pack-category">
                  <option value="">Choose a category</option>
                  ${PACK_CATEGORIES.map((category) => `<option value="${category}" ${draft.category === category ? 'selected' : ''}>${category}</option>`).join('')}
                </select>
              </div>
            </div>
            <div class="field">
              <label for="pack-description">Short description</label>
              <input id="pack-description" type="text" maxlength="160" placeholder="One short line for the pack card" value="${escapeHtml(draft.description)}">
            </div>
            <div class="field">
              <label for="pack-tags">Tags</label>
              <input id="pack-tags" type="text" placeholder="faithful, pvp, dark" value="${escapeHtml(draft.tags)}">
              <p class="panel-copy">${escapeHtml(TAG_HELP_TEXT)}</p>
            </div>
            <div class="field">
              <label for="pack-long-description">Long description</label>
              <textarea id="pack-long-description" placeholder="Full description shown to reviewers">${escapeHtml(draft.longDescription)}</textarea>
            </div>
            <div class="field-grid">
              <div class="field">
                <label for="pack-creator-website">Creator website</label>
                <input id="pack-creator-website" type="url" placeholder="https://example.com" value="${escapeHtml(draft.creatorWebsite)}">
              </div>
              <div class="field">
                <label for="pack-creator-discord">Creator Discord</label>
                <input id="pack-creator-discord" type="text" placeholder="username#0000 or @username" value="${escapeHtml(draft.creatorDiscord)}">
              </div>
            </div>
            <div class="field-grid">
              <div class="field">
                <label>Pack file</label>
                <div class="button-row">
                  <button type="button" id="pack-file-button">Choose .mcpack or .zip</button>
                  <span class="notice">${escapeHtml(state.submitPack.fileName || 'No file chosen yet.')}</span>
                </div>
                <input id="pack-file-input" class="hidden" type="file" accept=".mcpack,.zip">
              </div>
              <div class="field">
                <label>Thumbnail</label>
                <div class="button-row">
                  <button type="button" id="pack-thumb-button">${state.submitPack.uploading ? 'Uploading…' : 'Upload thumbnail'}</button>
                  <span class="notice">${escapeHtml(state.submitPack.thumbnailName || 'Optional PNG/JPG/WebP image.')}</span>
                </div>
                <input id="pack-thumb-input" class="hidden" type="file" accept="image/png,image/jpeg,image/webp">
              </div>
            </div>
            <label class="toggle">
              <input id="pack-ownership" type="checkbox" ${draft.ownership ? 'checked' : ''}>
              <span>I confirm that I created this pack or I have permission to submit it.</span>
            </label>
            <button type="submit">${state.loading.packSubmit ? 'Submitting…' : 'Submit pack'}</button>
          </form>
        </section>
      `;
    }

    function renderNotificationsPanel() {
      if (state.loading.notifications && !state.notifications) {
        return `<section class="panel"><div class="notice">Loading notification preferences…</div></section>`;
      }
      if (!state.notifications) {
        return `<section class="panel"><div class="notice">Notification preferences are not available right now.</div></section>`;
      }
      return `
        <section class="panel">
          <div class="panel-head">
            <div>
              <h2>Notifications</h2>
              <p class="panel-copy">Choose which events should send in-app and push notifications.</p>
            </div>
          </div>
          <div class="toggle-list">
            ${NOTIF_PREFS_META.map((item) => `
              <label class="toggle">
                <input data-pref-key="${item.key}" type="checkbox" ${state.notifications[item.key] ? 'checked' : ''}>
                <span>
                  <strong style="display:block; margin-bottom:4px;">${escapeHtml(item.label)}</strong>
                  <span class="muted">${escapeHtml(item.desc)}</span>
                </span>
              </label>
            `).join('')}
          </div>
          <div style="margin-top:18px;">
            <button type="button" id="save-notifications">${state.loading.notifSave ? 'Saving…' : 'Save notification settings'}</button>
          </div>
        </section>
      `;
    }

    function renderQuickLinks() {
      const links = [];
      if (state.roles.includes('partner') || state.roles.includes('admin')) {
        links.push('<a class="button" href="/partner-portal" style="display:flex;align-items:center;justify-content:center;text-decoration:none;">Open partner portal</a>');
      }
      if (state.roles.includes('admin')) {
        links.push('<a class="button" href="/admin" style="display:flex;align-items:center;justify-content:center;text-decoration:none;">Open admin panel</a>');
      }
      if (!links.length) return '';
      return `
        <section class="panel">
          <div class="panel-head">
            <div>
              <h2>Quick links</h2>
              <p class="panel-copy">Partner and admin tools stay on the main site because they are larger than this single-file version.</p>
            </div>
          </div>
          <div class="button-row">${links.join('')}</div>
        </section>
      `;
    }

    function renderSummaryAside() {
      const avatarUrl = safeUrl(state.profile?.avatarUrl);
      const username = state.profile?.username || state.user?.email || 'Guest';
      return `
        <aside class="stack">
          <section class="panel">
            <div class="hero-user" style="align-items:flex-start;">
              <div class="avatar">${avatarUrl ? `<img src="${avatarUrl}" alt="Avatar">` : firstInitial(username)}</div>
              <div style="min-width:0;">
                <p class="title" style="font-size: 26px; margin-bottom: 8px;">${escapeHtml(username)}</p>
                ${state.profile?.displayName ? `<p class="subtitle" style="margin-top:0;">${escapeHtml(state.profile.displayName)}</p>` : ''}
                <div class="pill-row" style="margin-top:10px;">${roleBadges()}</div>
              </div>
            </div>
            ${state.profile?.bio ? `<p class="panel-copy" style="margin-top:16px;">${escapeHtml(state.profile.bio)}</p>` : ''}
            <div class="button-row" style="margin-top:16px;">
              <button type="button" id="summary-share">Copy profile link</button>
              <button type="button" id="summary-logout">Sign out</button>
            </div>
          </section>
          ${renderQuickLinks()}
          <section class="panel">
            <div class="panel-head">
              <div>
                <h2>How this page works</h2>
                <p class="panel-copy">Firebase handles sign-in on the client, then JavaScript sends bearer-token requests directly to the MCCompanion API.</p>
              </div>
            </div>
            <div class="meta-list">
              <div class="meta-item">
                <span class="meta-label">API base</span>
                <span class="meta-value mono">${escapeHtml(API_BASE)}</span>
              </div>
              <div class="meta-item">
                <span class="meta-label">Auth check</span>
                <span class="meta-value mono">/api/auth/me</span>
              </div>
              <div class="meta-item">
                <span class="meta-label">Dashboard</span>
                <span class="meta-value mono">/api/account/dashboard</span>
              </div>
            </div>
          </section>
        </aside>
      `;
    }

    function renderDashboard() {
      const tabs = [
        ['profile', 'Profile'],
        ['account', 'Account'],
        ['connect', 'Connect'],
        ['skins', 'Cloud Skins'],
        ['packs', 'Resource Packs'],
        ['notifications', 'Notifications']
      ];
      const tabMap = {
        profile: renderProfilePanel,
        account: renderAccountPanel,
        connect: renderConnectPanel,
        skins: renderSkinsPanel,
        packs: renderPacksPanel,
        notifications: renderNotificationsPanel
      };
      const currentPanel = (tabMap[state.activeTab] || renderProfilePanel)();
      const avatarUrl = safeUrl(state.profile?.avatarUrl);
      const username = state.profile?.username || state.user?.email || 'MCCompanion';
      const profileUrl = state.profile?.username ? `https://mccompanion.net/u?name=${encodeURIComponent(state.profile.username)}` : '';

      appRoot.innerHTML = `
        <section class="hero">
          <div class="hero-top">
            <div class="hero-user">
              <div class="avatar">${avatarUrl ? `<img src="${avatarUrl}" alt="Avatar">` : firstInitial(username)}</div>
              <div style="min-width:0;">
                <p class="badge accent">Console-friendly account</p>
                <h1 class="title">${escapeHtml(username)}</h1>
                <p class="subtitle">${escapeHtml(state.user?.email || '')}</p>
                <div class="pill-row" style="margin-top:10px;">${roleBadges()}</div>
              </div>
            </div>
            <div class="button-row" style="min-width:min(100%, 360px);">
              ${profileUrl ? '<button type="button" id="header-share">Copy profile link</button>' : ''}
              <button type="button" id="header-refresh">Refresh data</button>
            </div>
          </div>
          ${notificationHtml('success', state.flash?.type === 'success' ? state.flash.message : '')}
          ${notificationHtml('error', state.error)}
          <div class="tab-row">
            ${tabs.map(([id, label]) => `<button type="button" class="tab ${state.activeTab === id ? 'active' : ''}" data-tab="${id}">${label}</button>`).join('')}
          </div>
        </section>
        <div class="layout">
          <main class="stack">${currentPanel}</main>
          ${renderSummaryAside()}
        </div>
      `;

      document.querySelectorAll('[data-tab]').forEach((button) => {
        button.addEventListener('click', async () => {
          syncConnectFormFromDom();
          syncPackDraftFromDom();
          if (state.editingSubmissionId) syncEditDraftFromDom(state.editingSubmissionId);
          state.activeTab = button.getAttribute('data-tab') || 'profile';
          if (state.activeTab === 'connect') await loadBotsIfNeeded();
          render();
        });
      });

      document.getElementById('header-refresh')?.addEventListener('click', async () => {
        setFlash('success', 'Refreshing account data...');
        await loadAccountData();
      });

      const shareProfile = async () => {
        if (!state.profile?.username) return;
        const url = `https://mccompanion.net/u?name=${encodeURIComponent(state.profile.username)}`;
        try {
          await navigator.clipboard.writeText(url);
          setFlash('success', 'Profile link copied.');
        } catch (_) {
          setFlash('error', 'Could not copy the link on this browser.');
        }
      };

      document.getElementById('header-share')?.addEventListener('click', shareProfile);
      document.getElementById('summary-share')?.addEventListener('click', shareProfile);
      document.getElementById('summary-logout')?.addEventListener('click', handleLogout);

      document.getElementById('profile-save')?.addEventListener('click', saveProfile);
      document.getElementById('profile-share')?.addEventListener('click', shareProfile);
      document.getElementById('profile-avatar-upload')?.addEventListener('click', () => document.getElementById('profile-avatar-input')?.click());
      document.getElementById('profile-avatar-input')?.addEventListener('change', (event) => uploadAvatar(event.target.files?.[0]));
      document.getElementById('profile-avatar-remove')?.addEventListener('click', removeAvatar);

      document.getElementById('connect-form')?.addEventListener('submit', submitConnect);
      document.querySelectorAll('[data-connect-mode]').forEach((button) => {
        button.addEventListener('click', async () => {
          syncConnectFormFromDom();
          state.connectForm.mode = button.getAttribute('data-connect-mode') || 'dns';
          state.connectForm.port = String(state.connectForm.mode === 'java' ? CONNECT_DEFAULT_PORT.java : CONNECT_DEFAULT_PORT.bedrock);
          await loadBotsIfNeeded();
          render();
        });
      });
      document.querySelectorAll('[data-connect-region]').forEach((button) => {
        button.addEventListener('click', () => {
          syncConnectFormFromDom();
          state.connectForm.region = button.getAttribute('data-connect-region') || 'EU';
          render();
        });
      });

      document.querySelectorAll('[data-delete-skin]').forEach((button) => {
        button.addEventListener('click', () => deleteSkin(button.getAttribute('data-delete-skin')));
      });

      document.getElementById('save-notifications')?.addEventListener('click', saveNotifications);

      document.getElementById('pack-file-button')?.addEventListener('click', () => document.getElementById('pack-file-input')?.click());
      document.getElementById('pack-file-input')?.addEventListener('change', (event) => {
        syncPackDraftFromDom();
        const file = event.target.files?.[0];
        state.submitPack.file = file || null;
        state.submitPack.fileName = file?.name || '';
        render();
      });
      document.getElementById('pack-thumb-button')?.addEventListener('click', () => document.getElementById('pack-thumb-input')?.click());
      document.getElementById('pack-thumb-input')?.addEventListener('change', (event) => {
        syncPackDraftFromDom();
        const file = event.target.files?.[0];
        if (!file) return;
        state.submitPack.thumbnailName = file.name;
        uploadPackThumbnail(file, false);
      });
      document.getElementById('pack-form')?.addEventListener('submit', submitPack);
      ['pack-name', 'pack-description', 'pack-category', 'pack-tags', 'pack-long-description', 'pack-creator-website', 'pack-creator-discord', 'pack-ownership'].forEach((id) => {
        document.getElementById(id)?.addEventListener(id === 'pack-ownership' ? 'change' : 'input', syncPackDraftFromDom);
      });

      document.querySelectorAll('[data-edit-submission]').forEach((button) => {
        button.addEventListener('click', () => beginSubmissionEdit(button.getAttribute('data-edit-submission')));
      });
      document.querySelectorAll('[data-cancel-edit]').forEach((button) => {
        button.addEventListener('click', () => {
          state.editingSubmissionId = null;
          state.editSubmissionDraft = null;
          render();
        });
      });
      document.querySelectorAll('[data-save-submission]').forEach((button) => {
        button.addEventListener('click', () => saveSubmissionEdit(button.getAttribute('data-save-submission'), false));
      });
      document.querySelectorAll('[data-resubmit-submission]').forEach((button) => {
        button.addEventListener('click', () => saveSubmissionEdit(button.getAttribute('data-resubmit-submission'), true));
      });
      document.querySelectorAll('[data-edit-thumb-button]').forEach((button) => {
        button.addEventListener('click', () => {
          const id = button.getAttribute('data-edit-thumb-button');
          document.querySelector(`[data-edit-thumb-input="${id}"]`)?.click();
        });
      });
      document.querySelectorAll('[data-edit-thumb-input]').forEach((input) => {
        input.addEventListener('change', (event) => {
          if (state.editingSubmissionId) syncEditDraftFromDom(state.editingSubmissionId);
          const file = event.target.files?.[0];
          if (!file) return;
          state.editingSubmissionThumb.name = file.name;
          uploadPackThumbnail(file, true);
        });
      });
      document.querySelectorAll('[data-edit-root]').forEach((root) => {
        root.querySelectorAll('input, textarea, select').forEach((field) => {
          field.addEventListener(field.tagName === 'SELECT' ? 'change' : 'input', () => syncEditDraftFromDom(root.getAttribute('data-edit-root')));
        });
      });
      document.querySelectorAll('[data-replace-file]').forEach((button) => {
        button.addEventListener('click', () => {
          const id = button.getAttribute('data-replace-file');
          document.querySelector(`[data-replace-file-input="${id}"]`)?.click();
        });
      });
      document.querySelectorAll('[data-replace-file-input]').forEach((input) => {
        input.addEventListener('change', (event) => {
          const file = event.target.files?.[0];
          if (!file) return;
          replaceSubmissionFile(input.getAttribute('data-replace-file-input'), file);
        });
      });
      document.querySelectorAll('[data-withdraw-submission]').forEach((button) => {
        button.addEventListener('click', () => withdrawSubmission(button.getAttribute('data-withdraw-submission')));
      });
    }

    function renderBoot() {
      appRoot.innerHTML = '<section class="panel auth-card"><h1 class="title" style="font-size:30px;">Loading account…</h1><p class="panel-copy">Checking Firebase session and MCCompanion access.</p></section>';
    }

    function render() {
      if (state.booting) {
        renderBoot();
        return;
      }
      if (!state.user) {
        renderLogin();
        return;
      }
      renderDashboard();
    }

    render();

    onAuthStateChanged(auth, async (user) => {
      state.booting = true;
      render();
      if (!user) {
        state.user = null;
        state.roles = [];
        state.profile = null;
        state.stats = null;
        state.activity = [];
        state.skins = [];
        state.submissions = [];
        state.notifications = null;
        state.booting = false;
        render();
        return;
      }

      try {
        state.user = user;
        await ensureBackendSession(user);
        await loadAccountData();
      } catch (error) {
        state.error = error?.message || 'Could not verify your account.';
        await signOut(auth).catch(() => {});
        state.user = null;
        state.roles = [];
      } finally {
        state.booting = false;
        render();
      }
    });
  </script>
</body>
</html>
