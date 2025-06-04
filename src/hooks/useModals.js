import { useState } from "react";

export default function useModals({ handleEdit, handleSubmit, resetForm }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUsersModalOpen, setIsUsersModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [selectedOpportunityId, setSelectedOpportunityId] = useState(null);

  const openModal = (editMode = false, opp = null) => {
    if (editMode && opp) {
      
      handleEdit(opp);
      setIsEditing(true);
      setEditingId(opp.id);
    } else {
      setIsEditing(false);
      setEditingId(null);
      resetForm();
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setIsEditing(false);
    setEditingId(null);
    resetForm();
  };

  const openUsersModal = (opportunityId) => {
    if (!opportunityId) {
      console.error("[useModals] No opportunity ID provided");
      return;
    }
    setSelectedOpportunityId(opportunityId);
    setIsUsersModalOpen(true);
  };

  const closeUsersModal = () => {
    setIsUsersModalOpen(false);
    setSelectedOpportunityId(null);
  };

  const submitForm = (e, id) => {
    e.preventDefault();
    handleSubmit(e, id);
    closeModal();
  };

  return {
    isModalOpen,
    isUsersModalOpen,
    selectedOpportunityId,
    isEditing,
    editingId,
    modalActions: {
      openModal,
      closeModal,
      openUsersModal,
      closeUsersModal,
      submitForm,
    },
  };
}
