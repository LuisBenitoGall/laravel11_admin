import { jsx } from "react/jsx-runtime";
import { forwardRef, useState } from "react";
import { router } from "@inertiajs/react";
const StatusButton = forwardRef(({ status, id, updateRoute, reloadUrl, reloadResource, routeParams = {} }, ref) => {
  const [currentStatus, setCurrentStatus] = useState(Number(status));
  const [loading, setLoading] = useState(false);
  const handleClick = async () => {
    var _a, _b;
    setLoading(true);
    try {
      const newStatus = currentStatus === 1 ? 0 : 1;
      let csrfToken = (_a = document.querySelector('meta[name="csrf-token"]')) == null ? void 0 : _a.getAttribute("content");
      if (!csrfToken) {
        const pageProps = (_b = window == null ? void 0 : window.page) == null ? void 0 : _b.props;
        csrfToken = (pageProps == null ? void 0 : pageProps.csrf_token) || (pageProps == null ? void 0 : pageProps._token);
      }
      const response = await fetch(route(updateRoute, routeParams), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "X-CSRF-TOKEN": csrfToken,
          "X-Requested-With": "XMLHttpRequest"
        },
        body: JSON.stringify({ id, status: newStatus })
      });
      if (response.ok) {
        const data = await response.json();
        setCurrentStatus(newStatus);
        if (reloadUrl) {
          router.reload({ only: [reloadResource] });
        }
      } else {
        console.error("StatusButton error:", response.status, response.statusText);
      }
    } catch (e) {
      console.error("StatusButton error:", e);
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
