// src/pages/hr/email-templates.js
import { useState, useRef, useEffect } from "react";
import { Toaster, toast } from "react-hot-toast";
import HRSidebar from "@/layouts/hrSidebar";
import HRHeader from "@/layouts/hrHeader";
import useSidebar from "@/hooks/useSidebar";
import SimpleFooter from "@/layouts/simpleFooter";
import { supabase } from "@/lib/supabase";
import EmailTemplateList from "@/components/EmailTemplateList";
import EmailTemplateEditor from "@/components/EmailTemplateEditor";
import ImageGallery from "@/components/ImageGallery";
import EmailPreviewModal from "@/components/EmailPreviewModal";
import { useEmailTemplates } from "@/hooks/useEmailTemplates";
import { getJoditConfig } from "@/config/getJoditConfig";

export default function EmailTemplates({ mode = "light", toggleMode, initialTemplates }) {
    const { isSidebarOpen, toggleSidebar } = useSidebar();
    const editorRef = useRef(null);
    const [currentEditor, setCurrentEditor] = useState(null);
    const [isGalleryOpen, setIsGalleryOpen] = useState(false);
    const [galleryImages, setGalleryImages] = useState([]);
    const [isLoadingImages, setIsLoadingImages] = useState(false);
    const [editorConfig, setEditorConfig] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);

    const {
        templates,
        selectedTemplate,
        subject,
        setSubject,
        body,
        setBody,
        handleSelectTemplate,
        handleSaveTemplate,
    } = useEmailTemplates(initialTemplates);

    useEffect(() => {
        if (templates.length > 0 && !selectedTemplate) {
            handleSelectTemplate(templates[0]);
        }
    }, [templates, selectedTemplate, handleSelectTemplate]);

    useEffect(() => {
        setEditorConfig(
            getJoditConfig(
                mode,
                handleImageUpload,
                (editor) => {
                    setCurrentEditor(editor);
                    fetchGalleryImages();
                    setIsGalleryOpen(true);
                },
                setCurrentEditor
            )
        );
    }, [mode]);

    const fetchGalleryImages = async () => {
        setIsLoadingImages(true);
        try {
            const { data, error } = await supabase
                .storage
                .from("media")
                .list("email-templates", {
                    sortBy: { column: "created_at", order: "desc" },
                });

            if (error) throw error;

            const processedImages = await Promise.all(
                data.map(async (file) => {
                    const { data: { publicUrl } } = supabase.storage.from("media").getPublicUrl(`email-templates/${file.name}`);
                    return {
                        id: file.id,
                        name: file.name,
                        url: publicUrl,
                        size: file.metadata?.size,
                        created_at: file.created_at,
                    };
                })
            );

            setGalleryImages(processedImages);
        } catch (error) {
            console.error("Error fetching gallery images:", error);
            toast.error("Failed to load gallery images");
        } finally {
            setIsLoadingImages(false);
        }
    };

    const handleImageUpload = async (editor) => {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = "image/*";

        input.onchange = async function () {
            if (input.files && input.files[0]) {
                const file = input.files[0];

                setIsUploading(true);
                toast.loading("Uploading image...", { id: "imageUpload" });

                try {
                    const fileName = `email-templates/${Date.now()}-${file.name}`;
                    const { error: uploadError } = await supabase.storage
                        .from("media")
                        .upload(fileName, file, {
                            cacheControl: "3600",
                            upsert: false,
                        });

                    if (uploadError) throw uploadError;

                    const { data: { publicUrl } } = supabase.storage.from("media").getPublicUrl(fileName);

                    editor.selection.insertHTML(`<img src="${publicUrl}" alt="${file.name}" />`);
                    toast.success("Image uploaded successfully", { id: "imageUpload" });

                    if (isGalleryOpen) {
                        fetchGalleryImages();
                    }
                } catch (error) {
                    console.error("Error uploading image:", error);
                    toast.error(`Failed to upload image: ${error.message || error}`, { id: "imageUpload" });
                } finally {
                    setIsUploading(false);
                }
            }
        };

        input.click();
    };

    const handlePreviewTemplate = () => {
        if (!body) {
            toast.error("No content to preview");
            return;
        }
        setIsPreviewOpen(true);
    };

    const handleInsertImage = (image) => {
        if (currentEditor && currentEditor.selection) {
            currentEditor.selection.insertHTML(`<img src="${image.url}" alt="${image.name}" />`);
            setIsGalleryOpen(false);
        } else {
            console.error("Editor instance not available");
            toast.error("Failed to insert image: Editor not ready");
        }
    };

    const sampleData = {
        fullName: "John Doe",
        email: "john.doe@example.com",
        phone: "+254 701 850 850",
        linkedin: "linkedin.com/in/johndoe",
        opening: "Digital Media Manager",
        score: "85",
        resumeUrl: "https://example.com/resume.pdf",
        coverLetterUrl: "https://example.com/coverletter.pdf",
        answersTable: `
            <table style="width: 100%; border-collapse: collapse;">
                <tr><th style="border: 1px solid #ccc; padding: 8px;">Question</th><th style="border: 1px solid #ccc; padding: 8px;">Answer</th></tr>
                <tr><td style="border: 1px solid #ccc; padding: 8px;">Q1</td><td style="border: 1px solid #ccc; padding: 8px;">Answer 1</td></tr>
                <tr><td style="border: 1px solid #ccc; padding: 8px;">Q2</td><td style="border: 1px solid #ccc; padding: 8px;">Answer 2</td></tr>
            </table>
        `,
        // Job Opening Sample Data
        jobTitle: "Digital Media Manager",
        expiresOn: "01/04/2025",
        jobUrl: "https://careers.growthpad.co.ke/jobs/digital-media-manager",
    };

    return (
        <div className={`min-h-screen flex flex-col ${mode === "dark" ? "bg-gray-900" : "bg-gray-50"}`}>
            <HRHeader
                toggleSidebar={toggleSidebar}
                isSidebarOpen={isSidebarOpen}
                mode={mode}
                toggleMode={toggleMode}
                pageName="Email Templates"
                pageDescription="Customize email templates for recruitment workflows."
            />
            <div className="flex flex-1">
                <HRSidebar isOpen={isSidebarOpen} mode={mode} toggleSidebar={toggleSidebar} />
                <main
                    className={`content-container flex-1 p-6 transition-all duration-300 ${
                        isSidebarOpen ? "md:ml-[300px]" : "md:ml-[80px]"
                    } ${mode === "dark" ? "bg-gray-900" : "bg-gray-100"}`}
                >
                    <div className="max-w-7xl mx-auto space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                            <div className="lg:col-span-1">
                                <EmailTemplateList
                                    templates={templates}
                                    selectedTemplate={selectedTemplate}
                                    onSelectTemplate={handleSelectTemplate}
                                    mode={mode}
                                />
                            </div>
                            <div className="lg:col-span-3">
                                <EmailTemplateEditor
                                    selectedTemplate={selectedTemplate}
                                    subject={subject}
                                    setSubject={setSubject}
                                    body={body}
                                    setBody={setBody}
                                    editorLoaded={!!editorConfig}
                                    editorConfig={editorConfig}
                                    editorRef={editorRef}
                                    onSave={handleSaveTemplate}
                                    onPreview={handlePreviewTemplate}
                                    isUploading={isUploading}
                                    mode={mode}
                                    currentEditor={currentEditor}
                                    setCurrentEditor={setCurrentEditor}
                                />
                            </div>
                        </div>
                    </div>
                </main>
            </div>
            <ImageGallery
                isOpen={isGalleryOpen}
                onClose={() => setIsGalleryOpen(false)}
                onSelectImage={handleInsertImage}
                images={galleryImages}
                isLoading={isLoadingImages}
                mode={mode}
                fetchImages={fetchGalleryImages}
            />
            <EmailPreviewModal
                isOpen={isPreviewOpen}
                onClose={() => setIsPreviewOpen(false)}
                subject={subject}
                body={body}
                mode={mode}
                sampleData={sampleData}
            />
            <SimpleFooter mode={mode} isSidebarOpen={isSidebarOpen} />
        </div>
    );
}

export async function getServerSideProps(context) {
    const { req } = context;

    if (!req.cookies.hr_session) {
        return {
            redirect: {
                destination: "/hr/login",
                permanent: false,
            },
        };
    }

    try {
        console.time("fetchEmailTemplates");
        const { data: templates, error } = await supabase
            .from("email_templates")
            .select("id, name, subject, body");
        console.timeEnd("fetchEmailTemplates");

        if (error) throw error;

        return {
            props: {
                initialTemplates: templates,
            },
        };
    } catch (error) {
        console.error("Error fetching email templates:", error);
        return {
            props: {
                initialTemplates: [],
            },
        };
    }
}