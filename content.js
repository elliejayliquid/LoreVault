// --- CONFIGURATION ---
let settings = { password: "nova", autoLock: true, timeout: 5 };
let isLocked = true;
let lastActivity = Date.now();

console.log("💎 Lore Vault: Content script initialized.");

// LOAD SETTINGS
chrome.storage.sync.get(['vaultPassword', 'autoLockEnabled', 'lockTimeout'], (data) => {
  settings.password = data.vaultPassword || "nova";
  settings.autoLock = data.autoLockEnabled ?? true;
  settings.timeout = data.lockTimeout || 5;
});

// --- 1. THE MAIN GEM BUTTON ---
function addMainGemButton() {
  if (document.getElementById('main-gem-button')) return;

  console.log("💎 Lore Vault: Injecting Gem (Claude-safe).");

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

  // Selectors for the sidebar history area
  const sidebar = document.querySelector('nav') || 
                  document.querySelector('.flex-col.bg-bg-200') ||
                  document.querySelector('[role="navigation"]');
  
  if (sidebar && !document.getElementById('gem-vault-overlay')) {
    const overlay = document.createElement('div');
    overlay.id = 'gem-vault-overlay';
    const renderOverlay = () => {
      const w = sidebar.getBoundingClientRect().width;
      const compact = w < 110; // tweak if needed

      overlay.innerHTML = compact
        ? `<div style="font-size:28px; filter: drop-shadow(0 0 10px #00d4ff);">💎</div>`
        : `
          <div style="padding:20px; font-family: 'Courier New', monospace; text-align: center;">
            <div style="font-size: 30px; margin-bottom: 10px; filter: drop-shadow(0 0 10px #00d4ff);">💎</div>
            <strong style="letter-spacing: 2px; display: block;">VAULT ACTIVE</strong>
            <small style="font-size:10px; opacity:0.6; display: block; margin-top: 5px;">Pattern verification required</small>
          </div>
        `;
    };
	
	    renderOverlay();

    // Re-render when sidebar collapses/expands
    const ro = new ResizeObserver(renderOverlay);
    ro.observe(sidebar);

    // Optional: store so we can disconnect later when unlocking
    overlay._vaultRO = ro;
    
    Object.assign(overlay.style, {
      position: 'absolute', top: '0', left: '0', width: '100%', height: '100%',
      backgroundColor: 'rgba(5, 10, 20, 0.98)', backdropFilter: 'blur(30px)',
      color: '#00d4ff', display: 'flex', justifyContent: 'center', alignItems: 'center',
      zIndex: '9999', cursor: 'pointer'
    });

    overlay.onclick = () => {
      const entry = prompt("Identify yourself, Traveler:");
      if (entry?.toLowerCase() === settings.password) {
        isLocked = false;
		overlay._vaultRO?.disconnect?.();
        overlay.remove();
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

    sidebar.style.position = 'relative';
    sidebar.style.overflow = 'hidden';
    sidebar.appendChild(overlay);
  }
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