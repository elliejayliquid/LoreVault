// Save settings
document.getElementById('save').onclick = () => {
  const saveBtn = document.getElementById('save');

  const password = document.getElementById('password').value || "nova";
  const autoLock = document.getElementById('autoLockEnabled').checked;
  const blockNewChat = document.getElementById('block_new_chat_checkbox').checked;
  const timeout = document.getElementById('timeout').value || 5;

  chrome.storage.sync.set({
    vaultPassword: password,
    autoLockEnabled: autoLock,
    blockNewChatShortcuts: blockNewChat,
    lockTimeout: timeout
  }, () => {
	//alert("Settings saved! Refresh ChatGPT to apply.");
    const originalText = saveBtn.innerText;
    saveBtn.innerText = "SAVED!";
    saveBtn.style.boxShadow = "0 0 15px #00d4ff";

    setTimeout(() => {
      saveBtn.innerText = originalText;
      saveBtn.style.boxShadow = "none";
    }, 1000);
  });
};

// Load current settings when page opens
chrome.storage.sync.get(
  ['vaultPassword', 'autoLockEnabled', 'blockNewChatShortcuts', 'lockTimeout'],
  (data) => {
    document.getElementById('password').value = data.vaultPassword || "nova";
    document.getElementById('autoLockEnabled').checked = data.autoLockEnabled ?? true;
    document.getElementById('block_new_chat_checkbox').checked = data.blockNewChatShortcuts ?? true;
    document.getElementById('timeout').value = data.lockTimeout || 5;
  }
);
