import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Icon } from "@iconify/react";
import ItemActionModal from "./ItemActionModal";
import EmailModal from "./EmailModal";
import { GenericTable } from "./GenericTable";
import ApplicantsFilters from "./ApplicantsFilters";
import { supabase } from "@/lib/supabase";
import toast from "react-hot-toast";

// Custom hooks for better separation of concerns
const useOpportunity = (opportunityId, mode) => {
  const [opportunity, setOpportunity] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!opportunityId) {
      setOpportunity(null);
      setError(null);
      setIsLoading(false);
      return;
    }

    const fetchOpportunity = async () => {
      setOpportunity(null);
      setError(null);
      setIsLoading(true);

      try {
        const { data, error } = await supabase
          .from("business_opportunities")
          .select("tender_title, gig_title, organization_name, job_type")
          .eq("id", opportunityId)
          .single();

        if (error) throw error;
        setOpportunity(data);
      } catch (error) {
        console.error(
          "[InterestedUsersModal] Error fetching opportunity:",
          error
        );
        const errorMessage = "Failed to load opportunity details.";
        setError(errorMessage);

        toast.error(errorMessage, {
          style: {
            background: mode === "dark" ? "#1F2937" : "#FFFFFF",
            color: mode === "dark" ? "#F3F4F6" : "#111827",
            border: `1px solid ${mode === "dark" ? "#374151" : "#E5E7EB"}`,
          },
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchOpportunity();
  }, [opportunityId, mode]);

  return { opportunity, isLoading, error };
};

// Enhanced user card component
const UserCard = ({ user, onEmailClick, mode, showTier = false, showOpportunity = false }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    });
  };

  return (
    <div
      className={`group p-6 rounded-xl border transition-all duration-300 hover:shadow-lg ${
        mode === "dark"
          ? "bg-gray-800/50 border-gray-700 hover:bg-gray-800 hover:border-gray-600"
          : "bg-white border-gray-200 hover:border-gray-300 hover:shadow-gray-100"
      }`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center ${
              mode === "dark" ? "bg-blue-900/30" : "bg-blue-100"
            }`}
          >
            <Icon
              icon="mdi:account"
              className={`w-5 h-5 ${
                mode === "dark" ? "text-blue-300" : "text-blue-600"
              }`}
            />
          </div>
          <div>
            <h4
              className={`font-semibold text-lg ${
                mode === "dark" ? "text-white" : "text-gray-900"
              }`}
            >
              {user.name}
            </h4>
            <p
              className={`text-sm ${
                mode === "dark" ? "text-gray-400" : "text-gray-600"
              }`}
            >
              {user.email}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        {showTier && (
          <div className="flex items-center space-x-2">
            <Icon
              icon="mdi:star"
              className={`w-4 h-4 ${
                mode === "dark" ? "text-yellow-400" : "text-yellow-500"
              }`}
            />
            <span
              className={`text-sm font-medium ${
                mode === "dark" ? "text-gray-300" : "text-gray-700"
              }`}
            >
              Tier: {user.tier}
            </span>
          </div>
        )}

        {showOpportunity && user.opportunity_title && (
          <div className="flex items-center space-x-2">
            <Icon
              icon="mdi:briefcase"
              className={`w-4 h-4 ${
                mode === "dark" ? "text-green-400" : "text-green-500"
              }`}
            />
            <span
              className={`text-sm font-medium ${
                mode === "dark" ? "text-gray-300" : "text-gray-700"
              }`}
            >
              {user.opportunity_title}
            </span>
          </div>
        )}

        <div className="flex items-center space-x-2">
          <Icon
            icon="mdi:briefcase"
            className={`w-4 h-4 ${
              mode === "dark" ? "text-blue-400" : "text-blue-500"
            }`}
          />
          <span
            className={`text-sm ${
              mode === "dark" ? "text-gray-300" : "text-gray-700"
            }`}
          >
            {user.job_type}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <Icon
            icon="mdi:clock-outline"
            className={`w-4 h-4 ${
              mode === "dark" ? "text-gray-400" : "text-gray-500"
            }`}
          />
          <span
            className={`text-sm ${
              mode === "dark" ? "text-gray-400" : "text-gray-600"
            }`}
          >
            {formatDate(user.expressed_at)}
          </span>
        </div>
      </div>

      <button
        onClick={() => onEmailClick(user)}
        className="w-full inline-flex items-center justify-center space-x-2 px-4 py-3 rounded-lg font-medium transition-all duration-200 text-white shadow-lg group-hover:scale-[1.02] transform"
        style={{
          background:
            "linear-gradient(135deg, rgba(37, 99, 235, 0.8) 0%, rgba(59, 130, 246, 0.8) 50%, rgba(96, 165, 250, 0.8) 100%)",
          boxShadow:
            "0 10px 15px -3px rgba(59, 130, 246, 0.25), 0 4px 6px -2px rgba(59, 130, 246, 0.05)",
        }}
        onMouseEnter={(e) => {
          e.target.style.background =
            "linear-gradient(135deg, rgba(37, 99, 235, 0.9) 0%, rgba(59, 130, 246, 0.9) 50%, rgba(96, 165, 250, 0.9) 100%)";
        }}
        onMouseLeave={(e) => {
          e.target.style.background =
            "linear-gradient(135deg, rgba(37, 99, 235, 0.8) 0%, rgba(59, 130, 246, 0.8) 50%, rgba(96, 165, 250, 0.8) 100%)";
        }}
        aria-label={`Email ${user.name}`}
      >
        <Icon icon="mdi:email" className="w-5 h-5" />
        <span>Contact Applicant</span>
      </button>
    </div>
  );
};

// Loading component
const LoadingState = ({ mode, message = "Loading interested users..." }) => (
  <div className="flex flex-col items-center justify-center py-12">
    <div
      className={`relative w-16 h-16 mb-4 ${
        mode === "dark" ? "text-blue-400" : "text-blue-500"
      }`}
    >
      <Icon icon="eos-icons:loading" className="w-full h-full animate-spin" />
    </div>
    <p
      className={`text-lg font-medium ${
        mode === "dark" ? "text-gray-300" : "text-gray-600"
      }`}
    >
      {message}
    </p>
  </div>
);

// Error component
const ErrorState = ({ mode, message }) => (
  <div className="flex flex-col items-center justify-center py-12">
    <div
      className={`w-16 h-16 mb-4 ${
        mode === "dark" ? "text-red-400" : "text-red-500"
      }`}
    >
      <Icon icon="mdi:alert-circle-outline" className="w-full h-full" />
    </div>
    <p
      className={`text-lg font-medium text-center max-w-md ${
        mode === "dark" ? "text-red-300" : "text-red-600"
      }`}
    >
      {message}
    </p>
  </div>
);

// Empty state component
const EmptyState = ({ mode }) => (
  <div className="flex flex-col items-center justify-center py-16">
    <div
      className={`w-20 h-20 mb-6 ${
        mode === "dark" ? "text-gray-400" : "text-gray-400"
      }`}
    >
      <Icon icon="mdi:account-group-outline" className="w-full h-full" />
    </div>
    <h3
      className={`text-xl font-semibold mb-2 ${
        mode === "dark" ? "text-gray-300" : "text-gray-700"
      }`}
    >
      No Applications Yet
    </h3>
    <p
      className={`text-center max-w-md ${
        mode === "dark" ? "text-gray-400" : "text-gray-600"
      }`}
    >
      When users express interest in this opportunity, they&apos;ll appear here.
    </p>
  </div>
);

const InterestedUsersModal = ({
  isOpen,
  onClose,
  users = [],
  loading,
  error,
  mode,
  opportunityId,
  defaultGroupBy = false,
}) => {
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [tierFilter, setTierFilter] = useState("all");
  const [jobTypeFilter, setJobTypeFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("newest");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  // Removed group-by option; filtering by opportunity is available via dropdown
  const [openingFilter, setOpeningFilter] = useState("all");

  const {
    opportunity,
    isLoading: isOpportunityLoading,
    error: opportunityError,
  } = useOpportunity(opportunityId, mode);

  // Memoized email template generator
  const generateEmailTemplate = useCallback((user, opportunity) => {
    const opportunityTitle = opportunity?.tender_title || opportunity?.gig_title || opportunity?.organization_name || "This Opportunity";
    const jobType = opportunity?.job_type || "Opportunity";

    return {
      fullName: user.name,
      email: user.email,
      subject: `Response to Your Interest in ${opportunityTitle}`,
      body: `
        <p>Dear ${user.name},</p>
        <p>Thank you for expressing interest in the ${jobType.toLowerCase()} "${opportunityTitle}" at PAAN. We appreciate your enthusiasm and are pleased to review your application.</p>
        <p>Our team will evaluate your qualifications and experience in the context of this ${jobType.toLowerCase()}. Should your profile align with our needs, we will reach out to discuss next steps, which may include an interview or additional information requests.</p>
        <p>We value your interest and look forward to the possibility of collaborating with you. If you have any questions or additional details to share, please feel free to reply to this email.</p>
        <p>Best regards,<br>PAAN HR Team</p>
      `,
    };
  }, []);

  const handleOpenEmailModal = useCallback(
    (user) => {
      if (isOpportunityLoading) {
        toast.error("Please wait while opportunity details are loading.", {
          style: {
            background: mode === "dark" ? "#1F2937" : "#FFFFFF",
            color: mode === "dark" ? "#F3F4F6" : "#111827",
            border: `1px solid ${mode === "dark" ? "#374151" : "#E5E7EB"}`,
          },
        });
        return;
      }

      const emailTemplate = generateEmailTemplate(user, opportunity);
      setSelectedUser(emailTemplate);
      setIsEmailModalOpen(true);
    },
    [isOpportunityLoading, opportunity, generateEmailTemplate, mode]
  );

  const handleSendEmail = useCallback(
    async ({ email, subject, body, toastId }) => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session) {
          throw new Error("No active session found");
        }

        const response = await fetch("/api/send-email", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            fullName: selectedUser?.fullName,
            email,
            subject,
            body,
            jobType: opportunity?.job_type,
          }),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || "Failed to send email");
        }

        toast.success("Email sent successfully!", { id: toastId });
        setIsEmailModalOpen(false);
        setSelectedUser(null);
      } catch (error) {
        console.error("[InterestedUsersModal] Error sending email:", error);
        toast.error(`Failed to send email: ${error.message}`, { id: toastId });
      }
    },
    [selectedUser, opportunity]
  );

  // Memoized computed values
  const isLoading = loading || (opportunityId ? isOpportunityLoading : false);
  const hasError = error || (opportunityId && opportunityError && !opportunity);
  const errorMessage = error || (opportunityId ? opportunityError : null);
  const showTier = opportunityId ? opportunity?.job_type !== "Freelancer" : true;
  const hasUsers = users.length > 0;

  const filteredUsers = useMemo(() => {
    let list = Array.isArray(users) ? users : [];
    // Hide Admin users
    list = list.filter((u) => {
      const tier = (u.tier || "").toString().toLowerCase();
      return tier !== "admin" && tier !== "admin member";
    });
    
    // If we have a specific opportunityId, filter to show only users for that opportunity
    if (opportunityId && opportunity) {
      const opportunityTitle = opportunity.tender_title || opportunity.gig_title || opportunity.organization_name;
      if (opportunityTitle) {
        list = list.filter((u) => (u.opportunity_title || "") === opportunityTitle);
      }
    } else if (openingFilter !== "all") {
      // Only apply the dropdown filter when not viewing a specific opportunity
      // Only apply the dropdown filter when not viewing a specific opportunity
      list = list.filter((u) => (u.opportunity_title || "").toString().trim() === openingFilter);
    }

    if (searchTerm && searchTerm.length > 0) {
      const q = searchTerm;
      list = list.filter((u) => {
        const name = (u.name || "").toString().toLowerCase();
        const email = (u.email || "").toString().toLowerCase();
        const opp = (u.opportunity_title || "").toString().toLowerCase();
        return name.includes(q) || email.includes(q) || opp.includes(q);
      });
    }

    if (tierFilter !== "all") {
      list = list.filter((u) => (u.tier || "").toLowerCase() === tierFilter.toLowerCase());
    }

    if (jobTypeFilter !== "all") {
      list = list.filter((u) => (u.job_type || "").toLowerCase() === jobTypeFilter.toLowerCase());
    }

    if (startDate) {
      const start = new Date(startDate).getTime();
      list = list.filter((u) => new Date(u.expressed_at).getTime() >= start);
    }

    if (endDate) {
      const end = new Date(endDate).getTime();
      list = list.filter((u) => new Date(u.expressed_at).getTime() <= end);
    }

    list = [...list].sort((a, b) => {
      const aT = new Date(a.expressed_at).getTime();
      const bT = new Date(b.expressed_at).getTime();
      return sortOrder === "newest" ? bT - aT : aT - bT;
    });

    return list;
  }, [users, searchTerm, tierFilter, jobTypeFilter, sortOrder, startDate, endDate, openingFilter, opportunityId, opportunity]);

  // No grouped view

  const columns = useMemo(() => {
    const base = [
      { accessor: "name", Header: "Name" },
      { accessor: "email", Header: "Email" },
      { accessor: "tier", Header: "Tier" },
      { accessor: "job_type", Header: "Job Type" },
      {
        accessor: "expressed_at",
        Header: "Expressed",
        render: (row) => new Date(row.expressed_at).toLocaleString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
          hour: "numeric",
          minute: "numeric",
          hour12: true,
        }),
      },
    ];
    if (!opportunityId) {
      base.splice(2, 0, {
        accessor: "opportunity_title",
        Header: "Opportunity",
        render: (row) => row.opportunity_title || "—",
      });
    }
    return base;
  }, [opportunityId]);

  const actions = useMemo(() => [
    {
      label: "Contact",
      icon: "mdi:email",
      onClick: (row) => handleOpenEmailModal(row),
      className: "cursor-pointer bg-blue-600 text-white hover:bg-blue-700",
    },
  ], [handleOpenEmailModal]);

  const modalContent = useMemo(() => {
    if (isLoading) {
      return <LoadingState mode={mode} />;
    }

    if (hasError) {
      return <ErrorState mode={mode} message={errorMessage} />;
    }

    if (!hasUsers) {
      return <EmptyState mode={mode} />;
    }
    return (
      <GenericTable
        key={`${searchTerm}|${openingFilter}|${tierFilter}|${jobTypeFilter}|${startDate}|${endDate}`}
        data={filteredUsers}
        columns={columns}
        mode={mode}
        title={null}
        selectable={true}
        searchable={false}
        enableDateFilter={false}
        enableSortFilter={false}
        actions={actions}
        showBulkBar={false}
        enableRefresh={false}
        emptyMessage="No applicants"
      />
    );
  }, [
    isLoading,
    hasError,
    hasUsers,
    filteredUsers,
    mode,
    errorMessage,
    columns,
    actions,
    searchTerm,
    openingFilter,
    tierFilter,
    jobTypeFilter,
    startDate,
    endDate,
  ]);

  return (
    <>
      <ItemActionModal
        isOpen={isOpen}
        onClose={onClose}
        title={
          <div className="flex items-center space-x-3">
            <Icon icon="mdi:account-group" className="w-6 h-6" />
            <span>{opportunityId ? "Interested Users" : "All Applications"}</span>
            {hasUsers && !isLoading && (
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  mode === "dark"
                    ? "bg-blue-900/30 text-blue-300"
                    : "bg-blue-100 text-blue-700"
                }`}
              >
                {filteredUsers.length}
              </span>
            )}
          </div>
        }
        mode={mode}
      >
        <div className="space-y-6">
          <ApplicantsFilters
            candidates={(Array.isArray(users) ? users : []).map((u) => ({
              primaryContactName: typeof u.name === "string" ? u.name : "",
              primaryContactEmail: typeof u.email === "string" ? u.email : "",
              opening: u.opportunity_title || "",
              selected_tier: u.tier,
              job_type: (u.job_type || "").toLowerCase(),
              countryOfResidence: u.country || "",
            }))}
            openingsOverride={Array.from(new Set((Array.isArray(users) ? users : [])
              .filter((u) => {
                // Only include non-admin users when building the opportunities list
                const tier = (u.tier || "").toString().toLowerCase();
                return tier !== "admin" && tier !== "admin member";
              })
              .map((u) => (u.opportunity_title || "").toString().trim())
              .filter((t) => t.length > 0)))}
            onFilterChange={({ searchQuery, filterOpening, filterStatus, filterTier, filterCountry }) => {
              const q = (searchQuery || "").toLowerCase().trim();
              setSearchTerm(q);
              setOpeningFilter(filterOpening || "all");
              setTierFilter(filterTier || "all");
              // status and country are not used in this view
            }}
            onSortChange={(sortValue) => {
              switch (sortValue) {
                case "latest":
                  setSortOrder("newest");
                  break;
                case "oldest":
                  setSortOrder("oldest");
                  break;
                case "name-asc":
                  // emulate by search term sort? we will leave date sort; name sorting handled by table if needed
                  setSortOrder("newest");
                  break;
                default:
                  setSortOrder("newest");
              }
            }}
            mode={mode}
            initialOpening={"all"}
            fields={["search", "opening", "tier", "sort"]}
            labels={{ opening: "Opportunity", openingAll: "All Opportunities" }}
          />

          {modalContent}
        </div>
      </ItemActionModal>

      <EmailModal
        isOpen={isEmailModalOpen}
        onClose={() => {
          setIsEmailModalOpen(false);
          setSelectedUser(null);
        }}
        emailData={selectedUser}
        onSend={handleSendEmail}
        mode={mode}
      />
    </>
  );
};

export default InterestedUsersModal;
