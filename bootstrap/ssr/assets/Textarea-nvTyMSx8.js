import { jsx } from "react/jsx-runtime";
import { useState } from "react";
import { Editor } from "react-draft-wysiwyg";
import { EditorState, ContentState, convertToRaw } from "draft-js";
import htmlToDraft from "html-to-draftjs";
import draftToHtml from "draftjs-to-html";
/* empty css                             */
function Textarea({
  name,
  value = "",
  wysiwyg = false,
  onChange,
  className = ""
}) {
  const [editorState, setEditorState] = useState(
    () => {
      if (!wysiwyg) return EditorState.createEmpty();
      const blocks = htmlToDraft(value || "");
      const content = ContentState.createFromBlockArray(blocks.contentBlocks, blocks.entityMap);
      return EditorState.createWithContent(content);
    }
  );
  const handleEditorChange = (st) => {
    setEditorState(st);
    const html = draftToHtml(convertToRaw(st.getCurrentContent()));
    onChange({ target: { name, value: html } });
  };
  if (wysiwyg) {
    return /* @__PURE__ */ jsx("div", { className: `wysiwyg-container ${className}`, children: /* @__PURE__ */ jsx(
      Editor,
      {
        editorState,
        onEditorStateChange: handleEditorChange,
        toolbar: {
          options: ["inline", "list", "link", "history"],
          inline: { inDropdown: false },
          list: { inDropdown: false },
          link: { inDropdown: true },
          history: { inDropdown: false }
        },
        editorClassName: "wysiwyg-editor",
        toolbarClassName: "wysiwyg-toolbar",
        wrapperClassName: "wysiwyg-wrapper"
      }
    ) });
  } else {
    return /* @__PURE__ */ jsx(
      "textarea",
      {
        name,
        className: `form-control ${className}`,
        value,
        onChange
      }
    );
  }
}
export {
  Textarea as T
};
