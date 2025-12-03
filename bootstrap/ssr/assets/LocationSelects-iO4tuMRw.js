import { jsxs, Fragment, jsx } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import axios from "axios";
import { u as useTranslation } from "./useTranslation-Nsy_Cpi1.js";
function LocationSelects({
  countries = [],
  formData = {},
  setData = () => {
  },
  countryField = "country_id",
  provinceField = "province_id",
  townField = "town_id",
  provincesUrl = "/api/provinces",
  townsUrl = "/api/towns",
  labels = { country: "Country", province: "Province", town: "Town" },
  layout = "row3",
  // <--- NUEVO
  extraRight = null
  // <--- NUEVO (para poner el CP al lado de población)
}) {
  const __ = useTranslation();
  const [provinces, setProvinces] = useState([]);
  const [towns, setTowns] = useState([]);
  const [loading, setLoading] = useState({ initial: false, provinces: false, towns: false });
  const [error, setError] = useState(null);
  const selectedCountry = formData[countryField] || "";
  const selectedProvince = formData[provinceField] || "";
  useEffect(() => {
    const initialTownId = formData[townField];
    if (initialTownId) {
      setLoading((l) => ({ ...l, initial: true }));
      setError(null);
      (async () => {
        try {
          const res = await axios.get(`/api/town/${initialTownId}`);
          const town = res.data;
          if (town) {
            if (town.country_id) {
              setData(countryField, String(town.country_id));
              await fetchProvinces(town.country_id);
            }
            if (town.province_id) {
              setData(provinceField, String(town.province_id));
              await fetchTowns(town.province_id);
            }
            setData(townField, String(town.id));
          }
        } catch (e) {
          console.error("Error fetching initial town:", e);
          setError(__("Error cargando la ubicación") || "Error loading location");
        } finally {
          setLoading((l) => ({ ...l, initial: false }));
        }
      })();
    }
  }, []);
  useEffect(() => {
    if (selectedCountry) {
      fetchProvinces(selectedCountry);
    } else {
      setProvinces([]);
      setTowns([]);
    }
  }, [selectedCountry]);
  useEffect(() => {
    if (selectedProvince) {
      fetchTowns(selectedProvince);
    } else {
      setTowns([]);
    }
  }, [selectedProvince]);
  const fetchProvinces = async (countryId) => {
    try {
      const res = await axios.get(provincesUrl, { params: { country_id: countryId } });
      setProvinces(Array.isArray(res.data) ? res.data : res.data.provinces || []);
    } catch (e) {
      console.error("Error fetching provinces:", e);
      setProvinces([]);
    }
  };
  const fetchTowns = async (provinceId) => {
    try {
      const res = await axios.get(townsUrl, { params: { province_id: provinceId } });
      setTowns(Array.isArray(res.data) ? res.data : res.data.towns || []);
    } catch (e) {
      console.error("Error fetching towns:", e);
      setTowns([]);
    }
  };
  const onCountryChange = (e) => {
    const val = e.target.value;
    setData(countryField, val);
    setData(provinceField, "");
    setData(townField, "");
    setProvinces([]);
    setTowns([]);
  };
  const onProvinceChange = (e) => {
    const val = e.target.value;
    setData(provinceField, val);
    setData(townField, "");
    setTowns([]);
  };
  const onTownChange = (e) => {
    setData(townField, e.target.value);
  };
  if (layout === "split2x2") {
    return /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsxs("div", { className: "row gy-3", children: [
        /* @__PURE__ */ jsxs("div", { className: "col-md-6", children: [
          /* @__PURE__ */ jsx("label", { className: "form-label", children: labels.country }),
          /* @__PURE__ */ jsxs(
            "select",
            {
              className: "form-select",
              name: countryField,
              value: selectedCountry,
              onChange: onCountryChange,
              children: [
                /* @__PURE__ */ jsx("option", { value: "", children: __("opcion_selec") || "Select" }),
                Array.isArray(countries) && countries.map((c) => /* @__PURE__ */ jsx("option", { value: c.id, children: c.name }, c.id))
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "col-md-6", children: [
          /* @__PURE__ */ jsx("label", { className: "form-label", children: labels.province }),
          /* @__PURE__ */ jsxs(
            "select",
            {
              className: "form-select",
              name: provinceField,
              value: selectedProvince,
              onChange: onProvinceChange,
              children: [
                /* @__PURE__ */ jsx("option", { value: "", children: loading.provinces ? __("cargando") || "Cargando..." : __("opcion_selec") || "Select" }),
                provinces.map((p) => /* @__PURE__ */ jsx("option", { value: p.id, children: p.name }, p.id))
              ]
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "row gy-3 mt-0", children: [
        /* @__PURE__ */ jsxs("div", { className: "col-md-6", children: [
          /* @__PURE__ */ jsx("label", { className: "form-label", children: labels.town }),
          /* @__PURE__ */ jsxs(
            "select",
            {
              className: "form-select",
              name: townField,
              value: formData[townField] || "",
              onChange: onTownChange,
              children: [
                /* @__PURE__ */ jsx("option", { value: "", children: loading.towns ? __("cargando") || "Cargando..." : __("opcion_selec") || "Select" }),
                towns.map((t) => /* @__PURE__ */ jsx("option", { value: t.id, children: t.name }, t.id))
              ]
            }
          ),
          error && /* @__PURE__ */ jsx("small", { className: "text-danger", children: error })
        ] }),
        extraRight && /* @__PURE__ */ jsx("div", { className: "col-md-6", children: extraRight })
      ] })
    ] });
  }
  return /* @__PURE__ */ jsxs("div", { className: "row gy-3", children: [
    /* @__PURE__ */ jsxs("div", { className: "col-md-4", children: [
      /* @__PURE__ */ jsx("label", { className: "form-label", children: labels.country }),
      /* @__PURE__ */ jsxs("select", { className: "form-select", name: countryField, value: selectedCountry, onChange: onCountryChange, children: [
        /* @__PURE__ */ jsx("option", { value: "", children: __("opcion_selec") || "Select" }),
        Array.isArray(countries) && countries.map((c) => /* @__PURE__ */ jsx("option", { value: c.id, children: c.name }, c.id))
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "col-md-4", children: [
      /* @__PURE__ */ jsx("label", { className: "form-label", children: labels.province }),
      /* @__PURE__ */ jsxs("select", { className: "form-select", name: provinceField, value: selectedProvince, onChange: onProvinceChange, children: [
        /* @__PURE__ */ jsx("option", { value: "", children: loading.provinces ? __("cargando") || "Cargando..." : __("opcion_selec") || "Select" }),
        provinces.map((p) => /* @__PURE__ */ jsx("option", { value: p.id, children: p.name }, p.id))
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "col-md-4", children: [
      /* @__PURE__ */ jsx("label", { className: "form-label", children: labels.town }),
      /* @__PURE__ */ jsxs("select", { className: "form-select", name: townField, value: formData[townField] || "", onChange: onTownChange, children: [
        /* @__PURE__ */ jsx("option", { value: "", children: loading.towns ? __("cargando") || "Cargando..." : __("opcion_selec") || "Select" }),
        towns.map((t) => /* @__PURE__ */ jsx("option", { value: t.id, children: t.name }, t.id))
      ] }),
      error && /* @__PURE__ */ jsx("small", { className: "text-danger", children: error })
    ] })
  ] });
}
export {
  LocationSelects as L
};
