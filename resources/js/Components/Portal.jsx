// resources/js/Components/Portal.jsx
import { createPortal } from 'react-dom';

export default function Portal({ children, targetId = 'modal-root' }) {
  const el = document.getElementById(targetId) || document.body;
  return createPortal(children, el);
}
