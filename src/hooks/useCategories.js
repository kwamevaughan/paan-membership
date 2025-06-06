import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";

export function useCategories(initialCategories = []) {
  const [categories, setCategories] = useState(
    Array.isArray(initialCategories) ? initialCategories : []
  );
  const [isLoading, setIsLoading] = useState(
    !initialCategories || initialCategories.length === 0
  );
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    if (
      (!initialCategories || initialCategories.length === 0) &&
      !hasFetchedRef.current
    ) {
      hasFetchedRef.current = true;
      const fetchCategories = async () => {
        try {
          setIsLoading(true);
          const { data, error } = await supabase
            .from("question_categories")
            .select("*")
            .order("created_at", { ascending: false });

          if (error) {
            console.error("Supabase error fetching categories:", error);
            setCategories([]);
          } else {
            setCategories(data || []);
          }
        } catch (err) {
          console.error("Unexpected error fetching categories:", err);
          setCategories([]);
        } finally {
          setIsLoading(false);
        }
      };

      fetchCategories();
    } else {
      setIsLoading(false);
    }
  }, [initialCategories]);

  const addCategory = async (category) => {
    try {
      // Ensure only valid columns are included
      const { id, ...categoryData } = category; // Omit 'id' as it's auto-generated
      const payload = {
        name: categoryData.name,
        job_type: categoryData.job_type || "none", // Default to "none" if not provided
        is_mandatory: categoryData.is_mandatory || false,
        description: categoryData.description || null,
      };

      const { data, error } = await supabase
        .from("question_categories")
        .insert([payload])
        .select()
        .single();

      if (error) {
        console.error("Error adding category:", error);
        return false;
      } else {
        setCategories((prev) => [data, ...prev]);
        return true;
      }
    } catch (err) {
      console.error("Unexpected error adding category:", err);
      return false;
    }
  };

  const editCategory = async (updated) => {
    try {
      // Ensure only valid columns are updated
      const { id, created_at, ...updateData } = updated; // Omit 'id' and 'created_at'
      const payload = {
        name: updateData.name,
        job_type: updateData.job_type || "none", // Default to "none" if not provided
        is_mandatory: updateData.is_mandatory || false,
        description: updateData.description || null,
      };

      const { data, error } = await supabase
        .from("question_categories")
        .update(payload)
        .eq("id", updated.id)
        .select()
        .single();

      if (error) {
        console.error("Error updating category:", error);
        return false;
      } else {
        setCategories((prev) =>
          prev.map((cat) => (cat.id === updated.id ? data : cat))
        );
        return true;
      }
    } catch (err) {
      console.error("Unexpected error updating category:", err);
      return false;
    }
  };

  const deleteCategory = async (id) => {
    try {
      const { error } = await supabase
        .from("question_categories")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("Error deleting category:", error);
        return false;
      } else {
        setCategories((prev) => prev.filter((cat) => cat.id !== id));
        return true;
      }
    } catch (err) {
      console.error("Unexpected error deleting category:", err);
      return false;
    }
  };

  return {
    categories,
    isLoading,
    addCategory,
    editCategory,
    deleteCategory,
  };
}
