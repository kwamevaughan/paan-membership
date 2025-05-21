import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import toast, { Toaster } from "react-hot-toast";
import { Icon } from "@iconify/react";
import { motion, AnimatePresence } from "framer-motion";
import HRSidebar from "@/layouts/hrSidebar";
import HRHeader from "@/layouts/hrHeader";
import useSidebar from "@/hooks/useSidebar";
import useLogout from "@/hooks/useLogout";
import useAuthSession from "@/hooks/useAuthSession";
import { useOffers } from "@/hooks/useOffers";
import ModernOffersForm from "@/components/ModernOffersForm";
import ModernOffersFilters from "@/components/ModernOffersFilters";
import OfferCard from "@/components/OfferCard";
import SimpleFooter from "@/layouts/simpleFooter";
import FeedbackModal from "@/components/FeedbackModal";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { supabase } from "@/lib/supabase";
import { fetchHRData } from "../../../utils/hrData";


export default function AdminOffers({
  mode = "light",
  toggleMode,
  initialOffers,
  initialFeedback,
  initialCandidates,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("list");
  const [filterTerm, setFilterTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [sortOrder, setSortOrder] = useState("created_at");
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [selectedOfferId, setSelectedOfferId] = useState(null);

  useAuthSession();

  const { isSidebarOpen, toggleSidebar, sidebarState, updateDragOffset } =
    useSidebar();
  const handleLogout = useLogout();
  const {
    offers,
    formData,
    loading,
    handleInputChange,
    handleSubmit,
    handleEdit,
    handleDelete,
  } = useOffers(initialOffers, initialFeedback);

  const router = useRouter();

  useEffect(() => {
    console.log("[AdminOffers] Initial Offers:", initialOffers);
    console.log("[AdminOffers] Initial Feedback:", initialFeedback);
    console.log("[AdminOffers] Initial Candidates:", initialCandidates);
  }, [initialOffers, initialFeedback, initialCandidates]);

  useEffect(() => {
    if (isEditing) {
      setActiveTab("form");
    }
  }, [isEditing]);

  const submitForm = (e) => {
    e.preventDefault();
    handleSubmit(e);
    setIsEditing(false);
    setActiveTab("list");
  };

  const startEditing = (offer) => {
    handleEdit(offer);
    setIsEditing(true);
    setActiveTab("form");
  };

  const cancelForm = () => {
    setIsEditing(false);
    setActiveTab("list");
  };

  const filteredOffers = offers.filter((offer) => {
    const matchesTerm =
      offer.title.toLowerCase().includes(filterTerm.toLowerCase()) ||
      offer.description?.toLowerCase().includes(filterTerm.toLowerCase());
    if (filterType === "all") return matchesTerm;
    return matchesTerm && offer.tier_restriction === filterType;
  });

  const sortedOffers = [...filteredOffers].sort((a, b) => {
    if (sortOrder === "created_at") {
      return new Date(b.created_at) - new Date(a.created_at);
    } else if (sortOrder === "title") {
      return a.title.localeCompare(b.title);
    } else if (sortOrder === "tier_restriction") {
      return a.tier_restriction.localeCompare(b.tier_restriction);
    }
    return 0;
  });

  return (
    <div
      className={`min-h-screen flex flex-col bg-gradient-to-br ${
        mode === "dark"
          ? "from-gray-900 via-indigo-950 to-purple-950"
          : "from-indigo-100 via-purple-100 to-pink-100"
      } overflow-hidden`}
    >
      <HRHeader
        toggleSidebar={toggleSidebar}
        isSidebarOpen={isSidebarOpen}
        sidebarState={sidebarState}
        mode={mode}
        toggleMode={toggleMode}
        onLogout={handleLogout}
        pageName="Offers"
        pageDescription="Unlock exclusive opportunities for your members."
        breadcrumbs={[
          { label: "Dashboard", href: "/admin" },
          { label: "Offers" },
        ]}
      />
      <div className="flex flex-1 relative">
        <HRSidebar
          isOpen={isSidebarOpen}
          isSidebarOpen={isSidebarOpen}
          mode={mode}
          toggleMode={toggleMode}
          onLogout={handleLogout}
          toggleSidebar={toggleSidebar}
          setDragOffset={updateDragOffset}
        />
        <div
          className={`flex-1 transition-all duration-300 overflow-auto`}
          style={{
            marginLeft: sidebarState.hidden
              ? "0px"
              : `${84 + (isSidebarOpen ? 120 : 0) + sidebarState.offset}px`,
          }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-12"
            >
              <h1
                className={`text-5xl font-extrabold ${
                  mode === "dark" ? "text-white" : "text-gray-900"
                } bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent`}
              >
                Exclusive Offers
              </h1>
              <p
                className={`mt-4 text-lg ${
                  mode === "dark" ? "text-gray-300" : "text-gray-600"
                } max-w-2xl mx-auto`}
              >
                Curate premium opportunities, discounts, and partnerships for
                your members.
              </p>
            </motion.div>

            {activeTab === "list" ? (
              <div className="relative">
                <ModernOffersFilters
                  filterTerm={filterTerm}
                  setFilterTerm={setFilterTerm}
                  filterType={filterType}
                  setFilterType={setFilterType}
                  showFilters={showFilters}
                  setShowFilters={setShowFilters}
                  sortOrder={sortOrder}
                  setSortOrder={setSortOrder}
                  mode={mode}
                />
                {sortedOffers.length > 0 ? (
                  <motion.div
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ staggerChildren: 0.2 }}
                  >
                    {sortedOffers.map((offer) => (
                      <OfferCard
                        key={offer.id}
                        offer={offer}
                        onEdit={startEditing}
                        onDelete={(id) => {
                          if (
                            window.confirm(
                              "Are you sure you want to delete this offer?"
                            )
                          ) {
                            handleDelete(id);
                          }
                        }}
                        onViewFeedback={(id) => {
                          setSelectedOfferId(id);
                          setIsFeedbackModalOpen(true);
                        }}
                        mode={mode}
                      />
                    ))}
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-16"
                  >
                    <Icon
                      icon="heroicons:tag"
                      className={`mx-auto h-24 w-24 ${
                        mode === "dark" ? "text-indigo-400" : "text-indigo-500"
                      }`}
                    />
                    <h3
                      className={`mt-4 text-2xl font-semibold ${
                        mode === "dark" ? "text-white" : "text-gray-900"
                      }`}
                    >
                      No Offers Found
                    </h3>
                    <p
                      className={`mt-2 text-sm ${
                        mode === "dark" ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      {filterTerm || filterType !== "all"
                        ? "Try adjusting your filters."
                        : "Create a new offer to get started!"}
                    </p>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      onClick={() => {
                        setIsEditing(false);
                        setActiveTab("form");
                      }}
                      className="mt-6 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl"
                    >
                      Add New Offer
                    </motion.button>
                  </motion.div>
                )}
                <motion.button
                  whileHover={{ scale: 1.2, rotate: 360 }}
                  className={`fixed bottom-8 right-8 p-4 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-2xl z-20`}
                  onClick={() => {
                    setIsEditing(false);
                    setActiveTab("form");
                  }}
                >
                  <Icon icon="heroicons:plus" className="w-6 h-6" />
                </motion.button>
              </div>
            ) : (
              <ModernOffersForm
                formData={formData}
                handleInputChange={handleInputChange}
                submitForm={submitForm}
                cancelForm={cancelForm}
                isEditing={isEditing}
                mode={mode}
              />
            )}
            <FeedbackModal
              isOpen={isFeedbackModalOpen}
              onClose={() => setIsFeedbackModalOpen(false)}
              feedback={initialFeedback[selectedOfferId] || []}
              mode={mode}
            />
          </div>
          <SimpleFooter mode={mode} isSidebarOpen={isSidebarOpen} />
        </div>
      </div>
      <Toaster />
    </div>
  );
}

export async function getServerSideProps({ req, res }) {
  try {
    const supabaseServer = createSupabaseServerClient(req, res);

    const {
      data: { session },
      error: sessionError,
    } = await supabaseServer.auth.getSession();

    if (sessionError || !session) {
      return {
        redirect: {
          destination: "/hr/login",
          permanent: false,
        },
      };
    }

    const { data: hrUser, error: hrUserError } = await supabaseServer
      .from("hr_users")
      .select("id")
      .eq("id", session.user.id)
      .single();

    if (hrUserError || !hrUser) {
      console.error(
        "[AdminOffers] HR User Error:",
        hrUserError?.message || "User not in hr_users"
      );
      await supabaseServer.auth.signOut();
      return {
        redirect: {
          destination: "/hr/login",
          permanent: false,
        },
      };
    }

    console.time("fetchHRData");
    const data = await fetchHRData({
      supabaseClient: supabaseServer,
      fetchOffers: true,
      fetchCandidates: true,
    });
    console.timeEnd("fetchHRData");

    const { data: feedback, error: feedbackError } = await supabaseServer
      .from("offer_feedback")
      .select("id, offer_id, user_id, rating, comment, created_at");

    if (feedbackError) {
      console.error("[AdminOffers] Feedback Error:", feedbackError.message);
      throw new Error(`Failed to fetch feedback: ${feedbackError.message}`);
    }

    const feedbackByOffer = feedback.reduce((acc, fb) => {
      acc[fb.offer_id] = acc[fb.offer_id] || [];
      acc[fb.offer_id].push(fb);
      return acc;
    }, {});

    const candidatesMap = data.initialCandidates.reduce((acc, candidate) => {
      if (candidate.auth_user_id) {
        acc[candidate.auth_user_id] = candidate.primaryContactName || "Unknown";
      }
      return acc;
    }, {});

    Object.keys(feedbackByOffer).forEach((offerId) => {
      feedbackByOffer[offerId] = feedbackByOffer[offerId].map((fb) => ({
        ...fb,
        primaryContactName: candidatesMap[fb.user_id] || "Unknown",
      }));
    });

    console.log("[AdminOffers] Initial Feedback:", feedbackByOffer);
    console.log("[AdminOffers] Initial Candidates Map:", candidatesMap);

    return {
      props: {
        initialOffers: data.offers || [],
        initialFeedback: feedbackByOffer || {},
        initialCandidates: candidatesMap || {},
      },
    };
  } catch (error) {
    console.error("[AdminOffers] Error:", error.message);
    return {
      redirect: {
        destination: "/hr/login",
        permanent: false,
      },
    };
  }
}
