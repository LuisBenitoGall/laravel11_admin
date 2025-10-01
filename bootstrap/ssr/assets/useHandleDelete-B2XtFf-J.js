import { router } from "@inertiajs/react";
import { u as useSweetAlert } from "./useSweetAlert-D4PAsWYN.js";
import { u as useTranslation } from "./useTranslation-Nsy_Cpi1.js";
function useHandleDelete(labelName = "", destroyRoute = "", routeParams = []) {
  const { showConfirm } = useSweetAlert();
  const __ = useTranslation();
  const handleDelete = (id) => {
    showConfirm({
      title: __(`${labelName}_eliminar`),
      text: __(`${labelName}_eliminar_confirm`),
      icon: "warning",
      onConfirm: () => {
        router.delete(route(destroyRoute, [...routeParams, id]));
      }
    });
  };
  return { handleDelete };
}
export {
  useHandleDelete as u
};
