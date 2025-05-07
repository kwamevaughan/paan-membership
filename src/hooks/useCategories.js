import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import toast from "react-hot-toast";

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
            toast.error("Failed to fetch categories.");
            setCategories([]);
          } else {
            setCategories(data || []);
          }
        } catch (err) {
          console.error("Unexpected error fetching categories:", err);
          toast.error("Unexpected error fetching categories.");
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
      const { data, error } = await supabase
        .from("question_categories")
        .insert([category])
        .select()
        .single();

      if (error) {
        console.error("Error adding category:", error);
        toast.error("Failed to add category.");
      } else {
        setCategories((prev) => [data, ...prev]);
        toast.success("Category added.");
      }
    } catch (err) {
      console.error("Unexpected error adding category:", err);
      toast.error("Unexpected error adding category.");
    }
  };

  const editCategory = async (updated) => {
    try {
      const { data, error } = await supabase
        .from("question_categories")
        .update(updated)
        .eq("id", updated.id)
        .select()
        .single();

      if (error) {
        console.error("Error updating category:", error);
        toast.error("Failed to update category.");
      } else {
        setCategories((prev) =>
          prev.map((cat) => (cat.id === updated.id ? data : cat))
        );
        toast.success("Category updated.");
      }
    } catch (err) {
      console.error("Unexpected error updating category:", err);
      toast.error("Unexpected error updating category.");
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
        toast.error("Failed to delete category.");
      } else {
        setCategories((prev) => prev.filter((cat) => cat.id !== id));
        toast.success("Category deleted.");
      }
    } catch (err) {
      console.error("Unexpected error deleting category:", err);
      toast.error("Unexpected error deleting category.");
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
