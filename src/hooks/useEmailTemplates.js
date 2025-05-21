// src/hooks/useEmailTemplates.js
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { toast } from "react-hot-toast";
import { supabase } from "@/lib/supabase";

export const useEmailTemplates = (initialTemplates) => {
  const [templates, setTemplates] = useState(initialTemplates || []);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const router = useRouter();
  

  const handleSelectTemplate = (template) => {
    setSelectedTemplate(template);
    setSubject(template.subject);
    setBody(template.body);
  };

  const handleSaveTemplate = async () => {
    if (!selectedTemplate) return;
    const loadingToast = toast.loading("Saving template...");
    try {
      const { error } = await supabase
        .from("email_templates")
        .update({ subject, body, updated_at: new Date().toISOString() })
        .eq("id", selectedTemplate.id);

      if (error) throw error;

      setTemplates(templates.map(t => 
        t.id === selectedTemplate.id ? { ...t, subject, body } : t
      ));
      toast.success("Template saved successfully!", { id: loadingToast });
    } catch (error) {
      toast.error("Failed to save template.", { id: loadingToast });
    }
  };

  return {
    templates,
    selectedTemplate,
    subject,
    setSubject,
    body,
    setBody,
    handleSelectTemplate,
    handleSaveTemplate
  };
};