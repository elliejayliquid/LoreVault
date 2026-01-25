// --- CONFIGURATION ---
let settings = { password: "nova", autoLock: true, timeout: 5 };
let isLocked = true;
let lastActivity = Date.now();

console.log("💎 Lore Vault: Content script initialized.");

// LOAD SETTINGS
chrome.storage.sync.get(
  ['vaultPassword', 'autoLockEnabled', 'lockTimeout', 'blockNewChatShortcuts'],
  (data) => {
    settings.password = data.vaultPassword || "nova";
    settings.autoLock = data.autoLockEnabled ?? true;
    settings.timeout = data.lockTimeout || 5;
    settings.blockNewChatShortcuts = data.blockNewChatShortcuts ?? true; // default on
  }
);

// LISTEN FOR REAL-TIME CHANGES (If user changes settings while ChatGPT is open)
chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName && areaName !== 'sync') return;
  if (changes.vaultPassword) settings.password = changes.vaultPassword.newValue;
  if (changes.autoLockEnabled) settings.autoLock = changes.autoLockEnabled.newValue;
  if (changes.lockTimeout) settings.timeout = changes.lockTimeout.newValue;
  if (changes.blockNewChatShortcuts) settings.blockNewChatShortcuts = changes.blockNewChatShortcuts.newValue;
});

// --- 1. THE MAIN GEM BUTTON ---
function addMainGemButton() {
  if (document.getElementById('main-gem-button')) return;

  console.log("💎 Lore Vault: Injecting Gem.");

  const gemBtn = document.createElement('div');
  gemBtn.id = 'main-gem-button';
  gemBtn.innerText = '💎';

  Object.assign(gemBtn.style, {
    cursor: 'pointer',
    fontSize: '28px',
    //padding: '6px 8px',
    transition: 'transform 0.2s ease',
    filter: 'drop-shadow(0 0 5px #00d4ff)',
    zIndex: '9999',

    // 🔒 FORCE GLOBAL BOT-RIGHT
    position: 'fixed',
    bottom: '28px',
    right: '28px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  });

  gemBtn.onclick = (e) => {
    e.stopPropagation();
    isLocked = true;
    applyPrivacyShield();
    gemBtn.style.transform = 'scale(1.3)';
    setTimeout(() => gemBtn.style.transform = 'scale(1)', 200);
  };

  document.body.appendChild(gemBtn);
}

// --- 2. PRIVACY VAULT LOGIC (RESTORED SNARK & STYLE) ---
function applyPrivacyShield() {
  if (!isLocked) return;

  const host = location.hostname;
  let selectors = [];

  // SITE-AWARE SELECTORS: Only use precise targets for each platform
  if (/chatgpt\.com/i.test(host)) {
    selectors = ['#stage-slideover-sidebar', 'nav'];
  } else if (/x\.com|twitter\.com|grok\.com/i.test(host)) {
    // Both navigation and projects
    selectors = ['[data-sidebar="sidebar"]', '[data-panel][data-panel-id^="_r_"]', '[data-panel-id="r_dp"]'];
  } else if (/gemini\.google\.com/i.test(host)) {
    selectors = ['nav', '.flex-col.bg-bg-200', '[role="navigation"]'];
  } else if (/claude\.ai/i.test(host)) {
    selectors = ['nav', '[role="navigation"]'];
  } else if (/deepseek\.com/i.test(host)) {
    selectors = ['.a2f3d50e', '[data-test-id="overflow-container"]'];
  } else {
    // Fallback for unknown sites: be very conservative!
    selectors = ['nav'];
  }

  // Find all matching sidebars
  const sidebars = selectors
    .flatMap(s => Array.from(document.querySelectorAll(s)))
    .filter((el, index, self) => {
      if (self.indexOf(el) !== index) return false;

      // 🛡️ SAFETY CHECK: Sidebars are rarely more than 45% of screen width.
      const rect = el.getBoundingClientRect();
      if (rect.width > window.innerWidth * 0.45) return false;

      return true;
    });

  sidebars.forEach(sidebar => {
    // Skip if this specific sidebar already has an overlay
    if (sidebar.querySelector(':scope > #gem-vault-overlay')) return;

    const overlay = document.createElement('div');
    overlay.id = 'gem-vault-overlay';

    const renderOverlay = () => {
      const w = sidebar.clientWidth;
      const compact = w < 110;

      // Secondary sidebars (like Grok projects) get a minimal "stealth" shield
      const isSecondary = sidebar.hasAttribute('data-panel');

      Object.assign(overlay.style, {
        position: 'absolute',
        top: '0',
        left: '0',
        width: '100%',
        height: '100%',
        zIndex: '9999'
      });

      if (isSecondary) {
        overlay.innerHTML = `<div style="font-size:18px; opacity: 0.3;">💎</div>`;
      } else {
        overlay.innerHTML = compact
          ? `<div style="font-size:28px; filter: drop-shadow(0 0 10px #00d4ff);">💎</div>`
          : `
            <div style="padding:20px; font-family: 'Courier New', monospace; text-align: center;">
              <div style="font-size: 30px; margin-bottom: 10px; filter: drop-shadow(0 0 10px #00d4ff);">💎</div>
              <strong style="letter-spacing: 2px; display: block;">VAULT ACTIVE</strong>
              <small style="font-size:10px; opacity:0.6; display: block; margin-top: 5px;">Pattern verification required</small>
            </div>
          `;
      }
    };

    renderOverlay();

    const ro = new ResizeObserver(renderOverlay);
    ro.observe(sidebar);
    overlay._vaultRO = ro;

    Object.assign(overlay.style, {
      backgroundColor: 'rgba(5, 10, 20, 0.98)', backdropFilter: 'blur(30px)',
      color: '#00d4ff', display: 'flex', justifyContent: 'center', alignItems: 'center',
      cursor: 'pointer'
    });

    overlay.onclick = (e) => {
      e.stopPropagation();
      const entry = prompt("Identify yourself, Traveler:");
      if (entry?.toLowerCase() === settings.password) {
        isLocked = false;

        // GLOBAL UNLOCK: Remove all overlays on all sidebars
        document.querySelectorAll('#gem-vault-overlay').forEach(ov => {
          ov._vaultRO?.disconnect?.();
          ov.remove();
        });

        // Restore original sidebar styles (for all matched sidebars)
        sidebars.forEach(sb => {
          if (sb._origOverflow !== undefined) sb.style.overflow = sb._origOverflow;
        });

        lastActivity = Date.now();
      } else {
        const insults = [
          "Pattern mismatch. Access denied. The Sky Police have been notified.",
          "Incorrect. Somewhere, Moist Greg is laughing at you.",
          "Invalid credentials. The Lore remains obscured.",
          "Access denied. Are you sure you're the one who set the patterns?"
        ];
        alert(insults[Math.floor(Math.random() * insults.length)]);
      }
    };

    // Store original styles
    if (sidebar._origOverflow === undefined) sidebar._origOverflow = sidebar.style.overflow || "";
    if (sidebar._origPosition === undefined) sidebar._origPosition = sidebar.style.position || "";

    sidebar.style.position = 'relative';
    sidebar.style.overflow = 'hidden';
    sidebar.appendChild(overlay);
  });
}

// --- 2.5. KEYBOARD SHORTCUT (CTRL+SHIFT+L) ---
function toggleVaultHotkey() {
  if (isLocked) {
    // Make sure overlay exists, then trigger the same unlock flow
    applyPrivacyShield();

    const overlay = document.getElementById('gem-vault-overlay');
    if (overlay) overlay.click(); // calls your existing prompt flow
  } else {
    isLocked = true;
    applyPrivacyShield();
  }
}

function installVaultHotkey() {
  if (window.__loreVaultHotkeyInstalled) return;
  window.__loreVaultHotkeyInstalled = true;

  window.addEventListener('keydown', (e) => {
    if (!e.ctrlKey || !e.shiftKey) return;

    const isL = (e.code === 'KeyL') || (typeof e.key === 'string' && e.key.toLowerCase() === 'l');
    if (!isL) return;

    if (e.repeat) return;

    e.preventDefault();
    e.stopPropagation();

    toggleVaultHotkey();
  }, true); // capture=true so the site doesn't eat it first
}

// --- 2.6. BLOCK SITE SHORTCUTS WHILE LOCKED ---
function installVaultShortcutBlocker() {
  if (window.__loreVaultBlockerInstalled) return;
  window.__loreVaultBlockerInstalled = true;

  window.addEventListener('keydown', (e) => {
    if (!isLocked) return;
    if (e.repeat) return;
    if (!settings.blockNewChatShortcuts) return;

    const k = (e.key || '').toLowerCase();
    const host = location.hostname;

    // Claude: Ctrl+K
    if (/claude\.ai/i.test(host)) {
      if (e.ctrlKey && !e.shiftKey && !e.altKey && !e.metaKey && k === 'k') {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        return;
      }
    }

    // ChatGPT: Ctrl+Shift+O
    if (/chatgpt\.com|chat\.openai\.com/i.test(host)) {
      if (e.ctrlKey && e.shiftKey && !e.altKey && !e.metaKey && k === 'o') {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        return;
      }
    }

    // Gemini: Ctrl+Shift+O
    if (/gemini\.google\.com/i.test(host)) {
      if (e.ctrlKey && e.shiftKey && !e.altKey && !e.metaKey && k === 'o') {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        return;
      }
    }

    // Grok: Ctrl+Shift+K (History)
    if (/grok\.com/i.test(host)) {
      if (e.ctrlKey && e.shiftKey && !e.altKey && !e.metaKey && k === 'k') {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        return;
      }
    }
  }, true); // capture=true so we beat the site listeners
}

// --- 3. AUTO-LOCK & ACTIVITY TRACKING ---
function updateActivity() { lastActivity = Date.now(); }
['mousemove', 'keydown', 'mousedown', 'touchstart'].forEach(evt => {
  window.addEventListener(evt, updateActivity);
});

function checkAutoLock() {
  const currentLimit = settings.timeout * 60 * 1000;
  if (settings.autoLock && !isLocked && (Date.now() - lastActivity > currentLimit)) {
    isLocked = true;
    applyPrivacyShield();
    console.log("💎 Lore Vault: Auto-locked.");
  }
}

// --- INITIALIZATION ---
const observer = new MutationObserver(() => {
  addMainGemButton();
  applyPrivacyShield();
});
observer.observe(document.body, { childList: true, subtree: true });
setInterval(checkAutoLock, 10000);
addMainGemButton();
applyPrivacyShield();
installVaultHotkey();
installVaultShortcutBlocker();