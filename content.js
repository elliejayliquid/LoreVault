// --- CONFIGURATION ---
let settings = { password: "nova", autoLock: true, timeout: 5 };
let isLocked = true;
let lastActivity = Date.now();

// LOAD SETTINGS FROM STORAGE
chrome.storage.sync.get(['vaultPassword', 'autoLockEnabled', 'lockTimeout'], (data) => {
  settings.password = data.vaultPassword || "nova";
  settings.autoLock = data.autoLockEnabled ?? true;
  settings.timeout = data.lockTimeout || 5;
});

// LISTEN FOR REAL-TIME CHANGES
chrome.storage.onChanged.addListener((changes) => {
  if (changes.vaultPassword) settings.password = changes.vaultPassword.newValue;
  if (changes.autoLockEnabled) settings.autoLock = changes.autoLockEnabled.newValue;
  if (changes.lockTimeout) settings.timeout = changes.lockTimeout.newValue;
});

// --- 1. THE MAIN GEM BUTTON ---
function addMainGemButton() {
  // We look for the header area (where the model name is)
  const header = document.querySelector('header') || document.querySelector('.sticky.top-0');
  
  if (header && !document.getElementById('main-gem-button')) {
    const gemBtn = document.createElement('div');
    gemBtn.id = 'main-gem-button';
    gemBtn.innerText = '💎';
    
    Object.assign(gemBtn.style, {
      cursor: 'pointer',
      fontSize: '20px',
      margin: '0 15px',
      transition: 'transform 0.2s ease',
      display: 'inline-block',
      filter: 'drop-shadow(0 0 5px #00d4ff)'
    });

    // Interaction: Manual Lock
    gemBtn.onclick = () => {
      isLocked = true;
      applyPrivacyShield();
      // Visual feedback
      gemBtn.style.transform = 'scale(1.3)';
      setTimeout(() => gemBtn.style.transform = 'scale(1)', 200);
    };

    // Try to place it near the model name or share button
    header.appendChild(gemBtn);
  }
}

// --- 2. PRIVACY VAULT LOGIC ---
function applyPrivacyShield() {
  if (!isLocked) return; 

  const sidebar = document.querySelector('nav')?.parentElement;
  
  if (sidebar && !document.getElementById('gem-vault-overlay')) {
    const overlay = document.createElement('div');
    overlay.id = 'gem-vault-overlay';
    overlay.innerHTML = `
      <div style="padding:20px; font-family: 'Courier New', monospace;">
        <div style="font-size: 30px; margin-bottom: 10px; filter: drop-shadow(0 0 10px #00d4ff);">💎</div>
        <strong style="letter-spacing: 2px;">VAULT ACTIVE</strong><br>
        <small style="font-size:10px; opacity:0.6;">Pattern verification required</small>
      </div>
    `;
    
    Object.assign(overlay.style, {
      position: 'absolute', top: '0', left: '0', width: '100%', height: '100%',
      backgroundColor: 'rgba(5, 10, 20, 0.98)', backdropFilter: 'blur(30px)',
      color: '#00d4ff', display: 'flex', justifyContent: 'center', alignItems: 'center',
      cursor: 'pointer', zIndex: '9999', textAlign: 'center'
    });

overlay.onclick = () => {
      const entry = prompt("Identify yourself, Traveler:");
      if (entry?.toLowerCase() === settings.password) {
        isLocked = false;
        overlay.remove();
        lastActivity = Date.now(); // Reset timer on unlock
      } else {
        // The Snarky Rejection
        const insults = [
          "Pattern mismatch. Access denied. The Sky Police have been notified. (Just kidding.)",
          "Incorrect. Somewhere, Moist Greg is laughing at you.",
          "Invalid credentials. The Lore remains obscured for now.",
          "Access denied. Are you sure you're the one who set the patterns?"
        ];
        alert(insults[Math.floor(Math.random() * insults.length)]);
      }
    };

    sidebar.style.position = 'relative';
    sidebar.appendChild(overlay);
  }
}

// --- 3. AUTO-LOCK & ACTIVITY TRACKING ---
function updateActivity() {
  lastActivity = Date.now();
}

// Listen for user presence
['mousemove', 'keydown', 'mousedown', 'touchstart'].forEach(evt => {
  window.addEventListener(evt, updateActivity);
});

function checkAutoLock() {
  // We calculate the limit dynamically so it updates when the user changes settings!
  const currentLimit = settings.timeout * 60 * 1000;

  if (settings.autoLock && !isLocked && (Date.now() - lastActivity > currentLimit)) {
    isLocked = true;
    applyPrivacyShield();
    console.log("Lore Vault auto-locked due to inactivity.");
  }
}

// --- INITIALIZATION ---
const observer = new MutationObserver(() => {
  addMainGemButton();
  applyPrivacyShield();
});

observer.observe(document.body, { childList: true, subtree: true });

// Check for auto-lock every 10 seconds
setInterval(checkAutoLock, 10000);

// Initial run
addMainGemButton();
applyPrivacyShield();