import { jsxs, jsx } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { Popover, OverlayTrigger } from "react-bootstrap";
import axios from "axios";
function useInfo(code) {
  const [data, setData] = useState({ title: "", excerpt: "" });
  useEffect(() => {
    if (!code) return;
    axios.get(`/api/admin/content/${code}`).then((res) => setData(res.data)).catch(() => setData({ title: "", excerpt: "" }));
  }, [code]);
  return data;
}
function InfoPopover({ code, placement = "right", style = false }) {
  const { title, excerpt } = useInfo(code);
  if (!excerpt) return null;
  const popover = /* @__PURE__ */ jsxs(Popover, { id: `popover-${code}`, className: "shadow-sm", children: [
    title && /* @__PURE__ */ jsx(Popover.Header, { as: "h3", children: title }),
    /* @__PURE__ */ jsx(Popover.Body, { dangerouslySetInnerHTML: { __html: excerpt } })
  ] });
  return /* @__PURE__ */ jsx(OverlayTrigger, { trigger: ["hover", "focus"], placement, overlay: popover, children: /* @__PURE__ */ jsx(
    "span",
    {
      className: "pop-info text-warning",
      style: style !== false ? style : void 0,
      children: /* @__PURE__ */ jsx("i", { className: "la la-info-circle" })
    }
  ) });
}
export {
  InfoPopover as I
};
