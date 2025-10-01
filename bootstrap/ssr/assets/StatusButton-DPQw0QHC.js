import { jsx } from "react/jsx-runtime";
import { forwardRef, useState } from "react";
const StatusButton = forwardRef(({ status, id, updateRoute }, ref) => {
  const [currentStatus, setCurrentStatus] = useState(Number(status));
  const [loading, setLoading] = useState(false);
  const handleClick = async () => {
    setLoading(true);
    try {
      const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute("content");
      const newStatus = currentStatus === 1 ? 0 : 1;
      const response = await fetch(route(updateRoute), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "X-CSRF-TOKEN": csrfToken
        },
        body: JSON.stringify({ id, status: newStatus })
      });
      if (response.ok) {
        setCurrentStatus(newStatus);
      }
    } catch (e) {
    } finally {
      setLoading(false);
    }
  };
  return /* @__PURE__ */ jsx(
    "button",
    {
      ref,
      className: `btn btn-sm ${currentStatus === 1 ? "btn-success" : "btn-light"}`,
      onClick: handleClick,
      disabled: loading,
      children: /* @__PURE__ */ jsx(
        "span",
        {
          style: { width: "1.2em", height: "1.2em", display: "flex", alignItems: "center", justifyContent: "center" },
          children: loading ? /* @__PURE__ */ jsx(
            "span",
            {
              className: "spinner-border",
              style: { width: ".9em", height: ".9em", minWidth: ".9em", minHeight: ".9em", verticalAlign: "middle", marginTop: "2px" },
              role: "status",
              "aria-hidden": "true"
            }
          ) : /* @__PURE__ */ jsx("i", { className: `la ${currentStatus === 1 ? "la-check" : "la-ban"}` })
        }
      )
    }
  );
});
export {
  StatusButton as S
};
