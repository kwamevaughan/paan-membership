// src/components/RichTextEditor.js
"use client";

import { useEffect, useRef } from "react";
import EditorJS from '@editorjs/editorjs';
import Header from '@editorjs/header';
import List from '@editorjs/list';
import Paragraph from '@editorjs/paragraph';
import toast from "react-hot-toast";

export default function RichTextEditor({ jobData, setJobData, onReady }) {
    const editorRef = useRef(null);
    const isMounted = useRef(false);

    useEffect(() => {
        if (!isMounted.current) {
            initializeEditor();
            isMounted.current = true;
        }

        return () => {
            cleanupEditor();
        };
    }, []); // Run only once on mount

    const initializeEditor = () => {
        console.log("Initializing RichTextEditor with description:", jobData.description);

        const holderElement = document.getElementById("rich-text-editor");
        if (!holderElement) {
            console.error("Element with ID 'rich-text-editor' is missing.");
            toast.error("Editor container not found.");
            return;
        }

        cleanupEditor();

        let editorData;
        if (jobData.description) {
            try {
                editorData = JSON.parse(jobData.description); // Attempt to parse as JSON (EditorJS format)
            } catch (error) {
                console.warn("Description is not valid JSON, converting to EditorJS format:", error);
                const textContent = stripHtml(jobData.description);
                editorData = {
                    blocks: [
                        {
                            type: "paragraph",
                            data: { text: textContent },
                        },
                    ],
                };
            }
        } else {
            editorData = {
                blocks: [],
            };
        }

        try {
            const editorInstance = new EditorJS({
                holder: "rich-text-editor",
                tools: {
                    header: { class: Header, inlineToolbar: true },
                    list: { class: List, inlineToolbar: true },
                    paragraph: {
                        class: Paragraph,
                        inlineToolbar: true,
                        config: { preserveBlank: true },
                    },
                },
                data: editorData,
                onChange: async () => {
                    await handleEditorChange();
                },
                onReady: () => {
                    if (onReady) onReady(editorInstance); // Pass editor instance to parent
                },
            });
            editorRef.current = editorInstance;
            console.log("RichTextEditor initialized successfully.");
        } catch (error) {
            console.error("Error initializing RichTextEditor:", error);
            toast.error("Failed to load editor. Please try again.");
        }
    };

    const stripHtml = (html) => {
        const tmp = document.createElement("DIV");
        tmp.innerHTML = html || "";
        return tmp.textContent || tmp.innerText || "";
    };

    const cleanupEditor = () => {
        if (editorRef.current && typeof editorRef.current.destroy === "function") {
            try {
                editorRef.current.destroy();
                editorRef.current = null;
                console.log("RichTextEditor instance destroyed.");
            } catch (error) {
                console.error("Error destroying RichTextEditor instance:", error);
            }
        }
    };

    const handleEditorChange = async () => {
        if (!editorRef.current) return;

        try {
            const content = await editorRef.current.save();
            console.log("Editor content saved:", content);

            const html = content.blocks
                .map((block) => {
                    switch (block.type) {
                        case "header":
                            return `<h${block.data.level}>${block.data.text}</h${block.data.level}>`;
                        case "list":
                            const items = block.data.items.map((item) => `<li>${item}</li>`).join("");
                            return block.data.style === "ordered" ? `<ol>${items}</ol>` : `<ul>${items}</ul>`;
                        case "paragraph":
                            return `<p>${block.data.text || ""}</p>`;
                        default:
                            return "";
                    }
                })
                .join("\n");

            setJobData(prev => ({
                ...prev,
                description: JSON.stringify(content),
                descriptionHtml: html,
            }));
        } catch (error) {
            console.error("Error saving content from RichTextEditor:", error);
            toast.error("Error saving content.");
        }
    };

    return (
        <div
            id="rich-text-editor"
            className={`border rounded-lg p-3 min-h-[150px] ${
                jobData.mode === "dark"
                    ? "bg-gray-700 text-gray-200 border-gray-600"
                    : "bg-white text-[#231812] border-gray-300"
            }`}
        />
    );
}