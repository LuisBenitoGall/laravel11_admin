import { jsxs, jsx } from "react/jsx-runtime";
import { A as AdminAuthenticated } from "./AdminAuthenticatedLayout-CS968Wx3.js";
import { usePage, Head } from "@inertiajs/react";
import "react-tooltip";
import "react";
import { T as Tabs } from "./Tabs-Cd7Sj0t_.js";
import "react-draft-wysiwyg";
import "draft-js";
import "html-to-draftjs";
import "draftjs-to-html";
/* empty css                             */
import "./TextInput-CzxrbIpp.js";
import { u as useTranslation } from "./useTranslation-Nsy_Cpi1.js";
import ProductData from "./ProductData-D1FiiB9E.js";
import ProductImages from "./ProductImages-CfbDEuqR.js";
import ProductSales from "./ProductSales-BiaYp-Fs.js";
import ProductPurchases from "./ProductPurchases-DUz_wQD_.js";
import ProductUnits from "./ProductUnits-CkO8_a0Q.js";
import ProductCategories from "./ProductCategories-DxrUwiyp.js";
import ProductAttributes from "./ProductAttributes-DfhlX4PD.js";
import ProductPriceHistory from "./ProductPriceHistory-DJ1_FbtV.js";
import ProductSerialization from "./ProductSerialization-Bq3-l9RQ.js";
import "axios";
import "@inertiajs/inertia";
import "./Header-Px-6ZOXw.js";
import "react-bootstrap";
import "./useSweetAlert-D4PAsWYN.js";
import "sweetalert2";
import "./Sidebar-CypaLfnr.js";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "./NavLink-k73-0cwm.js";
import "./Dropdown-DLZR1XDp.js";
import "@headlessui/react";
import "./Checkbox-B7oBdKeZ.js";
import "./DatePickerToForm-HPj3On-3.js";
import "react-datepicker";
/* empty css                          */
import "date-fns/locale";
import "./FileInput-U7oe6ye3.js";
import "./InfoPopover-CwWEvwXq.js";
import "./InputError-DME5vguS.js";
import "./PrimaryButton-B91ets3U.js";
import "./SelectInput-DrqFt-OA.js";
function Edit({ auth, session, title, subtitle, availableLocales, product, production_status, patterns }) {
  var _a;
  const __ = useTranslation();
  const props = ((_a = usePage()) == null ? void 0 : _a.props) || {};
  props.locale || false;
  props.languages || [];
  const permissions = props.permissions || {};
  const actions = [];
  if (permissions == null ? void 0 : permissions["products.index"]) {
    actions.push({
      text: __("productos_volver"),
      icon: "la-angle-left",
      url: "products.index",
      modal: false
    });
  }
  if (permissions == null ? void 0 : permissions["products.create"]) {
    actions.push({
      text: __("producto_nuevo"),
      icon: "la-plus",
      url: "products.create",
      modal: false
    });
  }
  if (permissions == null ? void 0 : permissions["products.destroy"]) {
    actions.push({
      text: __("eliminar"),
      icon: "la-trash",
      method: "delete",
      url: "products.destroy",
      params: [product.id],
      title: __("producto_eliminar"),
      message: __("producto_eliminar_confirm"),
      modal: false
    });
  }
  const tabs = [
    { key: "product-data", label: __("producto") },
    { key: "product-images", label: __("imagenes") },
    { key: "product-sales", label: __("ventas") },
    { key: "product-purchases", label: __("compras") },
    { key: "product-units", label: __("unidades_venta_medicion") },
    { key: "product-categories", label: __("categorias") },
    { key: "product-attributes", label: __("atributos") },
    { key: "product-price-history", label: __("precios_historico") },
    { key: "product-serialization", label: __("serializacion") }
  ];
  return /* @__PURE__ */ jsxs(
    AdminAuthenticated,
    {
      user: auth.user,
      title,
      subtitle,
      actions,
      children: [
        /* @__PURE__ */ jsx(Head, { title }),
        /* @__PURE__ */ jsxs("div", { className: "contents pb-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "row", children: [
            /* @__PURE__ */ jsx("div", { className: "col-12", children: /* @__PURE__ */ jsxs("h2", { children: [
              __("producto"),
              " ",
              /* @__PURE__ */ jsx("u", { children: product.name })
            ] }) }),
            /* @__PURE__ */ jsxs("div", { className: "col-12 mt-2 mb-4", children: [
              /* @__PURE__ */ jsxs("span", { className: "text-muted me-5", children: [
                __("creado"),
                ": ",
                /* @__PURE__ */ jsx("strong", { children: product.formatted_created_at })
              ] }),
              product.created_by_name && /* @__PURE__ */ jsxs("span", { className: "text-muted me-5", children: [
                __("creado_por"),
                ": ",
                /* @__PURE__ */ jsx("strong", { children: product.created_by_name })
              ] }),
              /* @__PURE__ */ jsxs("span", { className: "text-muted me-5", children: [
                __("actualizado"),
                ": ",
                /* @__PURE__ */ jsx("strong", { children: product.formatted_updated_at })
              ] }),
              product.updated_by_name && /* @__PURE__ */ jsxs("span", { className: "text-muted me-5", children: [
                __("actualizado_por"),
                ": ",
                /* @__PURE__ */ jsx("strong", { children: product.updated_by_name })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsx(
            Tabs,
            {
              defaultActive: "product-data",
              items: tabs,
              children: (activeKey) => {
                switch (activeKey) {
                  case "product-data":
                    return /* @__PURE__ */ jsx(
                      ProductData,
                      {
                        product,
                        arr_production_status: production_status,
                        arr_patterns: patterns
                      }
                    );
                  case "product-images":
                    return /* @__PURE__ */ jsx(ProductImages, { product });
                  case "product-sales":
                    return /* @__PURE__ */ jsx(ProductSales, { product });
                  case "product-purchases":
                    return /* @__PURE__ */ jsx(ProductPurchases, { product });
                  case "product-units":
                    return /* @__PURE__ */ jsx(ProductUnits, { product });
                  case "product-categories":
                    return /* @__PURE__ */ jsx(ProductCategories, { product });
                  case "product-attributes":
                    return /* @__PURE__ */ jsx(ProductAttributes, { product });
                  case "product-price-history":
                    return /* @__PURE__ */ jsx(ProductPriceHistory, { product });
                  case "product-serialization":
                    return /* @__PURE__ */ jsx(ProductSerialization, { product });
                  default:
                    return null;
                }
              }
            }
          )
        ] })
      ]
    }
  );
}
export {
  Edit as default
};
