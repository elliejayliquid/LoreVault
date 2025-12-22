// Save settings
document.getElementById('save').onclick = () => {
  const saveBtn = document.getElementById('save');
  const password = document.getElementById('password').value || "nova";
  const autoLock = document.getElementById('autoLockEnabled').checked;
  const timeout = document.getElementById('timeout').value || 5;

  chrome.storage.sync.set({
    vaultPassword: password,
    autoLockEnabled: autoLock,
    lockTimeout: timeout
  }, () => {
    // Elegant visual feedback instead of a clunky alert
    const originalText = saveBtn.innerText;
    saveBtn.innerText = "Saved!";
    
    // Switch colors for the "success" state
    saveBtn.style.backgroundColor = "#00d4ff";
    saveBtn.style.color = "#050a14";
    
    setTimeout(() => {
      saveBtn.innerText = originalText;
      
      // FIX: Resetting to the specific colors defined in your HTML 
      // instead of "" which was making it turn into a default gray button.
      saveBtn.style.backgroundColor = "#00d4ff";
      saveBtn.style.color = "#0b0e14";
    }, 2000);
  });
};

// Load current settings when page opens
chrome.storage.sync.get(['vaultPassword', 'autoLockEnabled', 'lockTimeout'], (data) => {
  document.getElementById('password').value = data.vaultPassword || "nova";
  document.getElementById('autoLockEnabled').checked = data.autoLockEnabled ?? true;
  document.getElementById('timeout').value = data.lockTimeout || 5;
});