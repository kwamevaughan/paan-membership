import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { supabase } from "@/lib/supabase";

export function useOffers(initialOffers = [], initialFeedback = {}) {
  const [offers, setOffers] = useState([]);
  const [formData, setFormData] = useState({
    id: null,
    title: "",
    description: "",
    tier_restriction: "All",
    url: "",
    icon_url: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const enrichedOffers = initialOffers.map((offer) => {
      const feedback = initialFeedback[offer.id] || [];
      const averageRating =
        feedback.length > 0
          ? feedback.reduce((sum, fb) => sum + fb.rating, 0) / feedback.length
          : 0;
      return {
        ...offer,
        averageRating,
        feedbackCount: feedback.length,
      };
    });
    setOffers(enrichedOffers);
  }, [initialOffers, initialFeedback]);

  const fetchOffers = async () => {
    try {
      setLoading(true);
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError || !user) throw new Error("User not authenticated");

      const { data: hrUser, error: hrError } = await supabase
        .from("hr_users")
        .select("id")
        .eq("id", user.id)
        .single();
      if (hrError || !hrUser) throw new Error("User not authorized");

      const { data: offers, error: offersError } = await supabase
        .from("offers")
        .select(
          "id, title, description, tier_restriction, url, icon_url, created_at, updated_at"
        )
        .order("created_at", { ascending: false });

      if (offersError) throw offersError;

      const enrichedOffers = offers.map((offer) => {
        const feedback = initialFeedback[offer.id] || [];
        const averageRating =
          feedback.length > 0
            ? feedback.reduce((sum, fb) => sum + fb.rating, 0) / feedback.length
            : 0;
        return {
          ...offer,
          averageRating,
          feedbackCount: feedback.length,
        };
      });

      console.log("[useOffers] Fetched offers:", enrichedOffers);
      setOffers(enrichedOffers);
    } catch (error) {
      console.error("[useOffers] Error fetching offers:", error);
      toast.error("Failed to load offers");
      setOffers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError || !user) throw new Error("User not authenticated");

      const offerData = {
        title: formData.title,
        description: formData.description,
        tier_restriction: formData.tier_restriction,
        url: formData.url || null,
        icon_url: formData.icon_url || null,
      };

      if (formData.id) {
        const { error: updateError } = await supabase
          .from("offers")
          .update(offerData)
          .eq("id", formData.id);
        if (updateError) throw updateError;

        setOffers((prev) =>
          prev.map((offer) =>
            offer.id === formData.id
              ? {
                  ...offer,
                  ...offerData,
                  averageRating: offer.averageRating,
                  feedbackCount: offer.feedbackCount,
                }
              : offer
          )
        );
      } else {
        const { data: newOffer, error: insertError } = await supabase
          .from("offers")
          .insert([offerData])
          .select()
          .single();
        if (insertError) throw insertError;

        setOffers((prev) => [
          { ...newOffer, averageRating: 0, feedbackCount: 0 },
          ...prev,
        ]);
      }

      setFormData({
        id: null,
        title: "",
        description: "",
        tier_restriction: "All",
        url: "",
        icon_url: "",
      });
      toast.success(formData.id ? "Offer updated!" : "Offer created!");
    } catch (error) {
      console.error("[useOffers] Error saving offer:", error);
      toast.error("Failed to save offer");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (offer) => {
    setFormData({
      id: offer.id,
      title: offer.title,
      description: offer.description || "",
      tier_restriction: offer.tier_restriction,
      url: offer.url || "",
      icon_url: offer.icon_url || "",
    });
  };

  const handleDelete = async (offerId) => {
    try {
      setLoading(true);
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError || !user) throw new Error("User not authenticated");

      const { error: deleteError } = await supabase
        .from("offers")
        .delete()
        .eq("id", offerId);
      if (deleteError) throw deleteError;

      setOffers((prev) => prev.filter((offer) => offer.id !== offerId));
      toast.success("Offer deleted!");
    } catch (error) {
      console.error("[useOffers] Error deleting offer:", error);
      toast.error("Failed to delete offer");
    } finally {
      setLoading(false);
    }
  };

  return {
    offers,
    formData,
    loading,
    handleInputChange,
    handleSubmit,
    handleEdit,
    handleDelete,
  };
}
