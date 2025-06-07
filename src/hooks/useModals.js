import { useState } from "react";

export default function useModals({ handleEdit, handleSubmit, resetForm }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUsersModalOpen, setIsUsersModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [selectedOpportunityId, setSelectedOpportunityId] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null);

  const openModal = (editMode = false, item = null) => {
    if (editMode && item) {
      handleEdit(item);
      setIsEditing(true);
      setEditingId(item.id);
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

  const openUsersModal = (itemId) => {
    if (!itemId) {
      console.error("[useModals] No item ID provided");
      return;
    }
    setSelectedOpportunityId(itemId);
    setIsUsersModalOpen(true);
  };

  const closeUsersModal = () => {
    setIsUsersModalOpen(false);
    setSelectedOpportunityId(null);
  };

  const openDeleteModal = (item) => {
    setItemToDelete(item);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setItemToDelete(null);
  };

  const submitForm = (e) => {
    e.preventDefault();
    handleSubmit(e, editingId);
    closeModal();
  };

  return {
    isModalOpen,
    isUsersModalOpen,
    isDeleteModalOpen,
    selectedOpportunityId,
    isEditing,
    editingId,
    itemToDelete,
    modalActions: {
      openModal,
      closeModal,
      openUsersModal,
      closeUsersModal,
      openDeleteModal,
      closeDeleteModal,
      submitForm,
    },
  };
}
