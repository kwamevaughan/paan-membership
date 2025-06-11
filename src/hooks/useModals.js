import { useState, useCallback, useRef, useEffect } from "react";

export default function useModals({ handleEdit, handleSubmit, resetForm }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUsersModalOpen, setIsUsersModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [selectedOpportunityId, setSelectedOpportunityId] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null);
  const timeoutRef = useRef(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const openModal = useCallback((editMode = false, item = null) => {
    if (!isMountedRef.current) return;

    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Reset all state first
    setIsEditing(false);
    setEditingId(null);
    if (resetForm) {
      resetForm();
    }

    // Small delay to ensure state is reset before setting new data
    timeoutRef.current = setTimeout(() => {
      if (!isMountedRef.current) return;
      
      if (editMode && item) {
        handleEdit(item);
        setIsEditing(true);
        setEditingId(item.id);
      }
      setIsModalOpen(true);
    }, 50);
  }, [handleEdit, resetForm]);

  const closeModal = useCallback(() => {
    if (!isMountedRef.current) return;

    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Close modal immediately
    setIsModalOpen(false);
    
    // Reset state after modal is closed
    timeoutRef.current = setTimeout(() => {
      if (!isMountedRef.current) return;
      setIsEditing(false);
      setEditingId(null);
      setSelectedOpportunityId(null);
      if (resetForm) {
        resetForm();
      }
    }, 50); // Reduced timeout to ensure faster state reset
  }, [resetForm]);

  const openUsersModal = useCallback((itemId) => {
    if (!isMountedRef.current) return;
    
    if (!itemId) {
      console.error("[useModals] No item ID provided");
      return;
    }
    setSelectedOpportunityId(itemId);
    setIsUsersModalOpen(true);
  }, []);

  const closeUsersModal = useCallback(() => {
    if (!isMountedRef.current) return;
    
    setIsUsersModalOpen(false);
    setSelectedOpportunityId(null);
  }, []);

  const openDeleteModal = useCallback((item) => {
    if (!isMountedRef.current) return;
    
    setItemToDelete(item);
    setIsDeleteModalOpen(true);
  }, []);

  const closeDeleteModal = useCallback(() => {
    if (!isMountedRef.current) return;
    
    setIsDeleteModalOpen(false);
    setItemToDelete(null);
  }, []);

  const submitForm = useCallback(async (e) => {
    if (!isMountedRef.current) return;
    
    e.preventDefault();
    try {
      const success = await handleSubmit(e, editingId);
      if (success) {
        closeModal();
      }
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  }, [handleSubmit, editingId, closeModal]);

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
      setSelectedItemId: setEditingId,
    },
  };
}
