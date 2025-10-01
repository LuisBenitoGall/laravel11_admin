import { usePage } from "@inertiajs/react";
function useTranslation() {
  const props = usePage().props || {};
  const translations = props.translations || {};
  return (key) => translations[key] ?? key;
}
export {
  useTranslation as u
};
