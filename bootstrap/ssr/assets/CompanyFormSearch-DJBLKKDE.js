import { jsxs, jsx } from "react/jsx-runtime";
import "react";
import { useForm } from "@inertiajs/react";
import { P as PrimaryButton } from "./PrimaryButton-B91ets3U.js";
import { S as SelectSearch } from "./SelectSearch-C7ksrTDE.js";
import { u as useTranslation } from "./useTranslation-Nsy_Cpi1.js";
const CompanyFormSearch = ({ options, name, side = false }) => {
  const __ = useTranslation();
  const { data, setData, post, reset, errors, processing } = useForm({
    side,
    company_id: ""
  });
  const handleSelect = (e) => {
    e.preventDefault();
    post(route("customer-provider.store-by-list"), {
      onSuccess: () => reset()
    });
  };
  return /* @__PURE__ */ jsxs("form", { onSubmit: handleSelect, children: [
    /* @__PURE__ */ jsx("input", { type: "hidden", name: "$side", value: side }),
    /* @__PURE__ */ jsxs("div", { className: "row gy-3", children: [
      /* @__PURE__ */ jsx("div", { className: "col-lg-12", children: /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { htmlFor: name, className: "form-label", children: __("empresa_selec_lista") }),
        /* @__PURE__ */ jsx(
          SelectSearch,
          {
            name: "company_id",
            options,
            onChange: (selectedOption) => setData("company_id", selectedOption ? selectedOption.value : ""),
            placeholder: __("empresa_selec")
          }
        )
      ] }) }),
      /* @__PURE__ */ jsx("div", { className: "mt-4 text-end", children: /* @__PURE__ */ jsx(PrimaryButton, { disabled: processing, className: "btn btn-rdn", children: processing ? __("procesando") + "..." : __("guardar") }) })
    ] })
  ] });
};
export {
  CompanyFormSearch as C
};
