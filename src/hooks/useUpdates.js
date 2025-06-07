import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { supabase } from "@/lib/supabase";
import debounce from "lodash/debounce";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export function useUpdates(initialUpdates = []) {
  const [updates, setUpdates] = useState(initialUpdates);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [formData, setFormData] = useState({
    id: null,
    title: "",
    description: "",
    category: "Governance",
    cta_text: "",
    cta_url: "",
    tier_restriction: "Associate Member",
    tags: "",
    notify_members: false,
  });

  const supabase = createClientComponentClient();

  const resetForm = () => {
    setFormData({
      id: null,
      title: "",
      description: "",
      category: "Governance",
      cta_text: "",
      cta_url: "",
      tier_restriction: "Associate Member",
      tags: "",
      notify_members: false,
    });
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e, onSuccess) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Get user data to check authentication
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        toast.error('You must be logged in to perform this action');
        return;
      }

      // Create update data object
      const updateData = {
        ...formData,
        notify_members: formData.notify_members || false
      };

      console.log('Saving update with data:', updateData);

      // Save the update first
      const response = await fetch('/api/updates', {
        method: formData.id ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save update');
      }

      const savedUpdate = await response.json();
      console.log('Update saved successfully:', savedUpdate);

      // Get member count for the tier if notifications are enabled
      let memberCount = 0;
      if (updateData.notify_members) {
        try {
          const countResponse = await fetch(`/api/members/count?tier=${encodeURIComponent(updateData.tier_restriction)}`);
          if (countResponse.ok) {
            const countData = await countResponse.json();
            memberCount = countData.count;
          }
        } catch (error) {
          console.error('Error fetching member count:', error);
        }
      }

      // Show success message with member count if notifications are enabled
      if (updateData.notify_members && memberCount > 0) {
        toast.success(`Update saved successfully! ${memberCount} member${memberCount !== 1 ? 's' : ''} will be notified.`);
      } else {
        toast.success('Update saved successfully!');
      }

      // If notifications are enabled, send them in the background
      if (updateData.notify_members) {
        // Don't await this - let it run in background
        fetch('/api/updates/notify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: updateData.title,
            description: updateData.description,
            tier_restriction: updateData.tier_restriction,
            cta_text: updateData.cta_text,
            cta_url: updateData.cta_url,
            category: updateData.category,
            tags: updateData.tags
          }),
        }).catch(error => {
          console.error('Error sending notifications:', error);
          toast.error('Update saved but notifications failed to send');
        });
      }

      // Close the form and reset
      if (onSuccess) {
        onSuccess();
      }
      resetForm();
      fetchUpdates();

    } catch (error) {
      console.error('Error in handleSubmit:', error);
      toast.error(error.message || 'Failed to save update');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (update) => {
    setFormData({
      id: update.id,
      title: update.title,
      description: update.description,
      category: update.category,
      cta_text: update.cta_text || "",
      cta_url: update.cta_url || "",
      tier_restriction: update.tier_restriction,
      tags: update.tags ? update.tags.join(", ") : "",
      notify_members: false,
    });
  };

  const handleDelete = async (id) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/updates?id=${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete update");
      }

      toast.success("Update deleted successfully");
      fetchUpdates();
    } catch (error) {
      console.error("Error deleting update:", error);
      toast.error(error.message || "Failed to delete update");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const handleCategoryFilter = (category) => {
    setSelectedCategory(category);
  };

  const fetchUpdates = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/updates");
      if (!response.ok) {
        throw new Error("Failed to fetch updates");
      }
      const data = await response.json();
      setUpdates(data);
    } catch (error) {
      console.error("Error fetching updates:", error);
      toast.error("Failed to fetch updates");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUpdates();
  }, []);

  return {
    updates,
    formData,
    loading,
    searchQuery,
    selectedCategory,
    handleInputChange,
    handleSubmit,
    handleEdit,
    handleDelete,
    handleSearch,
    handleCategoryFilter,
    resetForm,
  };
}
