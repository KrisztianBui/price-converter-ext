chrome.runtime.onMessage.addListener((message) => {
  if (message.type === 'SHOW_CONVERSION') {
    showToast(message.result);
  }
});

function showToast(text: string) {
  const toast = document.createElement('div');
  toast.textContent = text;
  Object.assign(toast.style, {
    position: 'fixed',
    bottom: '24px',
    right: '24px',
    zIndex: '2147483647',
    background: '#1e293b',
    color: '#f8fafc',
    padding: '10px 16px',
    borderRadius: '8px',
    fontSize: '14px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
    pointerEvents: 'none',
  });
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}