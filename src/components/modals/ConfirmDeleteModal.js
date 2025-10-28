import React, { useState, useEffect } from 'react';
import SimpleModal from '../SimpleModal';
import { Icon } from '@iconify/react';
import FormActions from '../forms/FormActions';

const ConfirmDeleteModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  itemName, 
  mode, 
  productCount: initialProductCount = 0,
  itemType = "item",
  isDeleting = false,
  itemId 
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [productCount, setProductCount] = useState(initialProductCount);
  const [hasDependencies, setHasDependencies] = useState(false);

  // When modal opens, check for dependencies
  useEffect(() => {
    if (isOpen && itemId) {
      checkDependencies();
    } else {
      // Reset state when modal closes
      setProductCount(0);
      setHasDependencies(false);
    }
  }, [isOpen, itemId]);

  const checkDependencies = async () => {
    if (!itemId) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`/api/products/v2/${itemId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });
      
      const result = await response.json();
      
      if (!response.ok && result.forceDeleteAvailable) {
        setHasDependencies(true);
        setProductCount(result.dependencies?.length || 0);
      } else {
        setHasDependencies(false);
        setProductCount(0);
      }
    } catch (error) {
      console.error('Error checking dependencies:', error);
      // On error, assume no dependencies to allow deletion
      setHasDependencies(false);
      setProductCount(0);
    } finally {
      setIsLoading(false);
    }
  };

  const isArchiving = itemType === 'product';

  return (
    <SimpleModal
      isOpen={isOpen}
      onClose={onClose}
      title={isArchiving ? "Move to Archive" : "Confirm Delete"}
      mode={mode}
      width="max-w-lg"
    >
      <div className="py-6">
        <div className="text-center mb-6">
          <Icon
            icon={isArchiving ? "mdi:archive" : "mdi:alert-circle"}
            className={`w-16 h-16 mx-auto mb-4 ${isArchiving ? 'text-amber-500' : 'text-red-500'}`}
          />
          <div className="text-xl font-semibold mb-2 text-gray-900">
            {isArchiving ? 'Move to Archive' : `Delete ${itemType.charAt(0).toUpperCase() + itemType.slice(1)}`}
          </div>
          <div className="text-lg font-medium mb-4 text-gray-700">
            {isArchiving 
              ? `Are you sure you want to move "${itemName}" to archive?`
              : `Are you sure you want to delete "${itemName}"?`
            }
          </div>
        </div>

        {/* Warning Details */}
        <div className={`${isArchiving ? 'bg-amber-50 border-amber-200' : 'bg-red-50 border-red-200'} border rounded-lg p-4 mb-6`}>
          <div className="flex items-start gap-3">
            <Icon
              icon={isArchiving ? "mdi:information" : "mdi:alert-circle"}
              className={`w-5 h-5 mt-0.5 flex-shrink-0 ${isArchiving ? 'text-amber-600' : 'text-red-600'}`}
            />
            <div className={`text-sm ${isArchiving ? 'text-amber-800' : 'text-red-800'}`}>
              {isArchiving ? (
                <>
                  <div className="font-semibold mb-2">This item will be moved to archive</div>
                  <ul className="space-y-1 list-disc list-inside">
                    <li>You can restore it later from the archive</li>
                    <li>It will remain in the archive until you restore or permanently delete it</li>
                    <li>You can find it in the archive section anytime</li>
                  </ul>
                </>
              ) : (
                <>
                  <div className="font-semibold mb-2">Warning: This action cannot be undone!</div>
                  <ul className="space-y-1 list-disc list-inside">
                    {productCount > 0 && (
                      <li>
                        This {itemType} has{" "}
                        <span className="font-semibold">
                          {productCount} {itemType === 'product' ? 'variant' : 'product'}{productCount !== 1 ? 's' : ''}
                        </span>{" "}
                        linked to it
                      </li>
                    )}
                    {productCount > 0 && (
                      <>
                        <li>All linked {itemType === 'product' ? 'variants' : 'products'} will be affected</li>
                        <li>This may cause data integrity issues</li>
                        <li>Consider transferring {itemType === 'product' ? 'variants' : 'products'} to another {itemType} first</li>
                      </>
                    )}
                    <li>All related data and history will be permanently lost</li>
                  </ul>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <FormActions
          onCancel={onClose}
          onSave={() => onConfirm(hasDependencies)}
          loading={isDeleting || isLoading}
          mode={mode}
          variant={isArchiving ? "default" : "danger"}
          saveText={
            isLoading ? (
              "Checking..."
            ) : isDeleting ? (
              isArchiving ? 'Moving to Archive...' : 'Deleting...'
            ) : productCount > 0 && !isMovingToTrash ? (
              `Delete Anyway (${productCount} ${itemType === 'product' ? 'variant' : 'product'}${productCount !== 1 ? 's' : ''} affected)`
            ) : (
              isArchiving ? 'Move to Archive' : 'Delete Permanently'
            )
          }
          saveIcon={
            isLoading ? "mdi:loading" : 
            isArchiving ? "mdi:archive" : "mdi:delete"
          }
          cancelText="Cancel"
        />
      </div>
    </SimpleModal>
  );
};

export default ConfirmDeleteModal;
