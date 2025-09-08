// SootheBirb – Accessory Editor Hotfix (v2 shim)
// This thin wrapper loads *after* your original editor script (or replaces it).
// It injects a tiny style to hide any lingering tip text and slightly improves spacing.
(function(){
  const style = document.createElement('style');
  style.textContent = `.acc-tip, .accfix-tip { display:none !important }`;
  document.head.appendChild(style);
})();