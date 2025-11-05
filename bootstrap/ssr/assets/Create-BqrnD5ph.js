import { jsxs, jsx } from "react/jsx-runtime";
import { A as AdminAuthenticated } from "./AdminAuthenticatedLayout-Be6zbhrA.js";
import { useForm, usePage, Head } from "@inertiajs/react";
import "react-tooltip";
import "react";
import { C as CompanyFormCreate } from "./CompanyFormCreate-BPjcyLNZ.js";
import { P as PrimaryButton } from "./PrimaryButton-B91ets3U.js";
import { S as SelectSearch } from "./SelectSearch-C7ksrTDE.js";
import { u as useTranslation } from "./useTranslation-Nsy_Cpi1.js";
import "./FileInput-U7oe6ye3.js";
import "./TextInput-CzxrbIpp.js";
import "axios";
import "@inertiajs/inertia";
import "./Header-DmTv-HRw.js";
import "react-bootstrap";
import "./useSweetAlert-D4PAsWYN.js";
import "sweetalert2";
import "./Sidebar-j3CEPiJG.js";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "./NavLink-k73-0cwm.js";
import "./Dropdown-DLZR1XDp.js";
import "@headlessui/react";
import "./Checkbox-B7oBdKeZ.js";
import "./InfoPopover-CwWEvwXq.js";
import "./InputError-DME5vguS.js";
import "react-select";
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
function Index({ auth, session, title, subtitle, side, other_companies, availableLocales }) {
  var _a;
  const __ = useTranslation();
  const props = ((_a = usePage()) == null ? void 0 : _a.props) || {};
  props.locale || false;
  props.languages || [];
  const permissions = props.permissions || {};
  const { data, setData, post, reset, errors, processing } = useForm({
    name: "",
    tradename: "",
    nif: "",
    is_ute: false,
    auto_link: false
  });
  const actions = [];
  if (permissions == null ? void 0 : permissions["customers.index"]) {
    actions.push({
      text: __("clientes_volver"),
      icon: "la-angle-left",
      url: "customers.index",
      modal: false
    });
  }
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
          /* @__PURE__ */ jsx("p", { className: "text-warning", children: __("empresa_selec_texto") }),
          /* @__PURE__ */ jsx(
            CompanyFormSearch,
            {
              side,
              options: other_companies.map((company) => ({ value: company.id, label: company.name }))
            }
          ),
          /* @__PURE__ */ jsx("div", { className: "py-3", children: /* @__PURE__ */ jsx("hr", {}) }),
          /* @__PURE__ */ jsx("h5", { children: __("empresa_nueva") }),
          /* @__PURE__ */ jsx(CompanyFormCreate, { side })
        ] })
      ]
    }
  );
}
export {
  Index as default
};
