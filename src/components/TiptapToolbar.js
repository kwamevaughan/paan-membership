// src/components/TiptapToolbar.js
"use client";

import { Icon } from "@iconify/react";

export default function TiptapToolbar({ editor, mode }) {
    if (!editor) return null;

    return (
        <div
            className={`border-b p-2 flex flex-wrap gap-2 ${
                mode === "dark" ? "bg-gray-700 border-gray-600" : "bg-gray-200 border-gray-300"
            }`}
        >
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleBold().run()}
                className={`px-2 py-1 ${mode === "dark" ? "text-gray-200" : "text-[#231812]"}`}
                disabled={!editor.can().chain().focus().toggleBold().run()}
            >
                <Icon icon="mdi:format-bold" width={20} height={20} />
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleItalic().run()}
                className={`px-2 py-1 ${mode === "dark" ? "text-gray-200" : "text-[#231812]"}`}
                disabled={!editor.can().chain().focus().toggleItalic().run()}
            >
                <Icon icon="mdi:format-italic" width={20} height={20} />
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleUnderline().run()}
                className={`px-2 py-1 ${mode === "dark" ? "text-gray-200" : "text-[#231812]"}`}
                disabled={!editor.can().chain().focus().toggleUnderline().run()}
            >
                <Icon icon="mdi:format-underline" width={20} height={20} />
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleStrike().run()}
                className={`px-2 py-1 ${mode === "dark" ? "text-gray-200" : "text-[#231812]"}`}
                disabled={!editor.can().chain().focus().toggleStrike().run()}
            >
                <Icon icon="mdi:format-strikethrough" width={20} height={20} />
            </button>

            <button
                type="button"
                onClick={() => editor.chain().focus().setTextAlign("left").run()}
                className={`px-2 py-1 ${mode === "dark" ? "text-gray-200" : "text-[#231812]"}`}
            >
                <Icon icon="mdi:format-align-left" width={20} height={20} />
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().setTextAlign("center").run()}
                className={`px-2 py-1 ${mode === "dark" ? "text-gray-200" : "text-[#231812]"}`}
            >
                <Icon icon="mdi:format-align-center" width={20} height={20} />
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().setTextAlign("right").run()}
                className={`px-2 py-1 ${mode === "dark" ? "text-gray-200" : "text-[#231812]"}`}
            >
                <Icon icon="mdi:format-align-right" width={20} height={20} />
            </button>

        </div>
    );
}