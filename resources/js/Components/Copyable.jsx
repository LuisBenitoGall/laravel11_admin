import { useState, useRef } from 'react';
import { useTranslation } from '@/Hooks/useTranslation';

export default function Copyable({ code }) {
  const __ = useTranslation();
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef();

  const fallbackCopy = (text) => {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    // Evitar flash
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
    } catch (err) {
      console.error('Fallback: copia fallida', err);
    }
    document.body.removeChild(textarea);
  };

  const handleClick = () => {
    const doCopy = () => {
      setCopied(true);
      clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => setCopied(false), 1500);
    };

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(code)
        .then(doCopy)
        .catch(() => {
          fallbackCopy(code);
          doCopy();
        });
    } else {
      fallbackCopy(code);
      doCopy();
    }
  };

  return (
    <div className="wrap-copy" onClick={handleClick}>
      {code}
      {copied && (
        <div className="copy-tooltip">
          {__('texto_copiado')}
        </div>
      )}
    </div>
  );
}
