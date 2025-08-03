// src/components/Action/RichTextEditor.js
import React from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

const RichTextEditor = ({ value, onChange, disabled
}) => {
  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ color: [] }, { background: [] }],
      [{ list: "ordered" }, { list: "bullet" }],
      [{ indent: "-1" }, { indent: "+1" }],
      [{ align: [] }],
      ["blockquote", "code-block"],
      ["clean"],
    ],
  };

  return (
    <ReactQuill
      className="min-h-[300px]"
      value={value}
      onChange={onChange}
      modules={modules}
      readOnly={disabled}
    />
  );
};

export default RichTextEditor;
