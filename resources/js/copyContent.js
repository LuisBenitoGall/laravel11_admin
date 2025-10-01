// resources/js/copyContent.js
function copyToClipboard(text) {
  if (navigator.clipboard?.writeText) {
    return navigator.clipboard.writeText(text);
  }
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'absolute';
  textarea.style.left = '-9999px';
  document.body.appendChild(textarea);

  const selection = document.getSelection().rangeCount > 0
    ? document.getSelection().getRangeAt(0)
    : null;

  textarea.select();
  document.execCommand('copy');
  document.body.removeChild(textarea);

  if (selection) {
    document.getSelection().removeAllRanges();
    document.getSelection().addRange(selection);
  }
  return Promise.resolve();
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.wrap-copy').forEach(el => {
    el.addEventListener('click', () => {
      const text = el.textContent.trim();
      if (!text) return;

      copyToClipboard(text)
        .then(() => {
          // crear tooltip
          const tip = document.createElement('span');
          tip.className = 'copy-tooltip';
          tip.textContent = window.copyMessages?.success || 'Texto copiado';
          el.appendChild(tip);
          // quitar tras 1.5s
          setTimeout(() => {
            el.removeChild(tip);
          }, 1500);
        })
        .catch(() => {
          const tip = document.createElement('span');
          tip.className = 'copy-tooltip';
          tip.textContent = window.copyMessages?.error || 'Error al copiar';
          el.appendChild(tip);
          setTimeout(() => {
            el.removeChild(tip);
          }, 1500);
        });
    });
  });
});
