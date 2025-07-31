import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { supabase } from "@/lib/supabase";

export function useOffers(candidatesMap = {}) {
  const [offers, setOffers] = useState([]);
  const [formData, setFormData] = useState({
    id: null,
    title: "",
    description: "",
    tier_restriction: "All",
    url: "",
    icon_url: "",
    offer_type: "Workshop",
  });
  const [loading, setLoading] = useState(false);
  const [filterTerm, setFilterTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [sortOrder, setSortOrder] = useState("created_at");
  const [sortDirection, setSortDirection] = useState("desc");

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

      let query = supabase
        .from("offers")
        .select(
          "id, title, description, tier_restriction, url, icon_url, created_at, updated_at, offer_type"
        );

      // Apply filters
      if (filterType !== "all")
        query = query.eq("tier_restriction", filterType);
      if (filterTerm) {
        query = query.or(
          `title.ilike.%${filterTerm}%,description.ilike.%${filterTerm}%`
        );
      }

      // Apply sorting
      query = query.order(sortOrder, {
        ascending: sortDirection === "asc",
      });

      const { data: offersData, error: offersError } = await query;
      if (offersError)
        throw new Error(`Failed to fetch offers: ${offersError.message}`);

      const { data: feedbackData, error: feedbackError } = await supabase
        .from("offer_feedback")
        .select("id, offer_id, user_id, rating, comment, created_at");
      if (feedbackError)
        throw new Error(`Failed to fetch feedback: ${feedbackError.message}`);

      const feedbackByOffer = feedbackData.reduce((acc, fb) => {
        acc[fb.offer_id] = acc[fb.offer_id] || [];
        acc[fb.offer_id].push({
          ...fb,
          primaryContactName: candidatesMap[fb.user_id] || "Unknown",
        });
        return acc;
      }, {});

      const enrichedOffers = offersData.map((offer) => {
        const feedback = feedbackByOffer[offer.id] || [];
        const averageRating =
          feedback.length > 0
            ? feedback.reduce((sum, fb) => sum + (fb.rating || 0), 0) /
              feedback.length
            : 0;
        return {
          ...offer,
          averageRating: Number(averageRating) || 0,
          feedbackCount: feedback.length,
          feedback,
        };
      });

      console.log("[useOffers] Fetched offers:", enrichedOffers);
      setOffers(enrichedOffers);
    } catch (error) {
      console.error("[useOffers] Error fetching offers:", error.message);
      toast.error("Failed to load offers");
      setOffers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOffers();

    // Real-time subscriptions
    const offersSubscription = supabase
      .channel("offers")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "offers" },
        () => fetchOffers()
      )
      .subscribe();

    const feedbackSubscription = supabase
      .channel("offer_feedback")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "offer_feedback" },
        () => fetchOffers()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(offersSubscription);
      supabase.removeChannel(feedbackSubscription);
    };
  }, [filterTerm, filterType, sortOrder, sortDirection]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title) {
      toast.error("Title is required");
      return;
    }
    setLoading(true);

    try {
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

      const offerData = {
        title: formData.title,
        description: formData.description,
        tier_restriction: formData.tier_restriction,
        url: formData.url || null,
        icon_url: formData.icon_url || null,
        offer_type: formData.offer_type,
      };

      if (formData.id) {
        const { error: updateError } = await supabase
          .from("offers")
          .update(offerData)
          .eq("id", formData.id);
        if (updateError)
          throw new Error(`Update failed: ${updateError.message}`);
        setOffers((prev) =>
          prev.map((offer) =>
            offer.id === formData.id ? { ...offer, ...offerData } : offer
          )
        );
        toast.success("Offer updated!");
      } else {
        const { data: newOffer, error: insertError } = await supabase
          .from("offers")
          .insert([offerData])
          .select()
          .single();
        if (insertError)
          throw new Error(`Insert failed: ${insertError.message}`);
        setOffers((prev) => [
          { ...newOffer, averageRating: 0, feedbackCount: 0, feedback: [] },
          ...prev,
        ]);
        toast.success("Offer created!");
      }

      setFormData({
        id: null,
        title: "",
        description: "",
        tier_restriction: "All",
        url: "",
        icon_url: "",
        offer_type: "Workshop",
      });
    } catch (error) {
      console.error("[useOffers] Submit error:", error.message);
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
      offer_type: offer.offer_type,
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

      const { data: hrUser, error: hrError } = await supabase
        .from("hr_users")
        .select("id")
        .eq("id", user.id)
        .single();
      if (hrError || !hrUser) throw new Error("User not authorized");

      const { error: deleteError } = await supabase
        .from("offers")
        .delete()
        .eq("id", offerId);
      if (deleteError) throw new Error(`Delete failed: ${deleteError.message}`);

      setOffers((prev) => prev.filter((offer) => offer.id !== offerId));
      toast.success("Offer deleted!");
    } catch (error) {
      console.error("[useOffers] Delete error:", error.message);
      toast.error("Failed to delete offer");
    } finally {
      setLoading(false);
    }
  };

  const updateSort = (field) => {
    setSortOrder(field);
    setSortDirection((prev) =>
      sortOrder === field && prev === "asc" ? "desc" : "asc"
    );
  };

  return {
    offers,
    formData,
    loading,
    filterTerm,
    setFilterTerm,
    filterType,
    setFilterType,
    sortOrder,
    sortDirection,
    setSortOrder: updateSort,
    handleInputChange,
    handleSubmit,
    handleEdit,
    handleDelete,
    fetchOffers,
  };
}
