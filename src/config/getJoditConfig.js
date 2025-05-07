// src/config/getJoditConfig.js
export const getJoditConfig = (mode, handleImageUpload, setCurrentEditorAndOpenGallery, setCurrentEditor) => ({
  readonly: false,
  toolbar: true,
  theme: mode === "dark" ? "dark" : "default",
  buttons: [
    "bold", "italic", "underline", "strikethrough", "eraser", "|",
    "ul", "ol", "|", "font", "fontsize", "brush", "paragraph", "|",
    "link", "table", "|", "align", "undo", "redo", "|",
    "hr", "copyformat", "fullsize"
  ],
  events: {
    afterInit: (editor) => {
      setCurrentEditor(editor);
    }
  },
  extraButtons: [
    {
      name: 'uploadImage',
      icon: 'image',
      tooltip: 'Upload Image',
      exec: handleImageUpload
    },
    {
      name: 'imageGallery',
      icon: 'folder-image',
      tooltip: 'Image Gallery',
      exec: function(editor) {
        setCurrentEditorAndOpenGallery(editor);
      }
    }
  ]
});