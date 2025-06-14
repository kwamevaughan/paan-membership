// // src/components/ImageGallery.js
// import { Icon } from "@iconify/react";
// import { useState } from "react";
// import { supabase } from "@/lib/supabase";
// import { toast } from "react-hot-toast";

// const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message }) => {
//   if (!isOpen) return null;

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
//       <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
//         <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">{title}</h3>
//         <p className="text-gray-700 dark:text-gray-300 mb-6">{message}</p>
//         <div className="flex justify-end gap-3">
//           <button
//             onClick={onClose}
//             className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-md hover:bg-gray-300 dark:hover:bg-gray-600"
//           >
//             Cancel
//           </button>
//           <button
//             onClick={onConfirm}
//             className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
//           >
//             Delete
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// const ImageGallery = ({ isOpen, onClose, onSelectImage, images, isLoading, mode, fetchImages }) => {
//   const [selectedImages, setSelectedImages] = useState([]); // Track selected images for bulk delete
//   const [isConfirmOpen, setIsConfirmOpen] = useState(false); // Control confirmation modal
//   const [imagesToDelete, setImagesToDelete] = useState([]); // Images pending deletion

//   if (!isOpen) return null;

//   const toggleImageSelection = (image) => {
//     setSelectedImages((prev) =>
//       prev.some((img) => img.id === image.id)
//         ? prev.filter((img) => img.id !== image.id)
//         : [...prev, image]
//     );
//   };

//   const handleDeleteImages = async () => {
//     if (imagesToDelete.length === 0) return;

//     try {
//       toast.loading(`Deleting ${imagesToDelete.length} image${imagesToDelete.length > 1 ? "s" : ""}...`, { id: "deleteImages" });
//       const paths = imagesToDelete.map((image) => `email-templates/${image.name}`);
//       const { error } = await supabase.storage.from('media').remove(paths);

//       if (error) throw error;

//       toast.success(`Deleted ${imagesToDelete.length} image${imagesToDelete.length > 1 ? "s" : ""} successfully`, { id: "deleteImages" });
//       setSelectedImages([]);
//       fetchImages(); // Refresh gallery
//     } catch (error) {
//       console.error("Error deleting images:", error);
//       toast.error(`Failed to delete images: ${error.message || error}`, { id: "deleteImages" });
//     } finally {
//       setIsConfirmOpen(false);
//       setImagesToDelete([]);
//     }
//   };

//   const openDeleteConfirmation = (images) => {
//     setImagesToDelete(images);
//     setIsConfirmOpen(true);
//   };

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
//       <div
//         className={`rounded-xl shadow-xl w-full max-w-4xl max-h-[80vh] flex flex-col ${
//           mode === "dark" ? "bg-gray-800 text-white" : "bg-white text-gray-900"
//         }`}
//       >
//         <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center bg-gray-100 dark:bg-gray-800">
//           <h3 className="text-xl font-semibold">Image Gallery</h3>
//           <button
//             onClick={onClose}
//             className="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white"
//           >
//             <Icon icon="mdi:close" width={24} />
//           </button>
//         </div>
//         <div className="p-6 flex-1 overflow-y-auto">
//           {isLoading ? (
//             <div className="flex justify-center items-center h-40">
//               <Icon icon="mdi:loading" width={32} className="animate-spin text-[#f05d23]" />
//             </div>
//           ) : images.length === 0 ? (
//             <div className="text-center py-10 text-gray-500 dark:text-gray-400">
//               No images found in the gallery
//             </div>
//           ) : (
//             <>
//               <div className="mb-4 flex justify-end">
//                 <button
//                   onClick={() => openDeleteConfirmation(selectedImages)}
//                   disabled={selectedImages.length === 0}
//                   className={`px-4 py-2 rounded-md font-medium flex items-center gap-2 ${
//                     selectedImages.length === 0
//                       ? "bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
//                       : "bg-red-500 text-white hover:bg-red-600"
//                   }`}
//                 >
//                   <Icon icon="mdi:trash-can-outline" width={20} />
//                   Delete Selected ({selectedImages.length})
//                 </button>
//               </div>
//               <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
//                 {images.map((image) => (
//                   <div
//                     key={image.id}
//                     className="relative aspect-square border rounded-md overflow-hidden transition-all duration-200 hover:scale-105"
//                   >
//                     <img
//                       src={image.url}
//                       alt={image.name}
//                       className="w-full h-full object-cover cursor-pointer"
//                       onMouseDown={(e) => {
//                         e.preventDefault();
//                         e.stopPropagation();
//                         onSelectImage(image);
//                       }}
//                       onError={(e) => {
//                         e.target.onerror = null;
//                         e.target.src =
//                           "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect fill='%23f0f0f0' width='100' height='100'/%3E%3Cpath fill='%23cccccc' d='M40,40 L60,40 L60,60 L40,60 Z'/%3E%3C/svg%3E";
//                       }}
//                     />
//                     <div className="absolute top-2 left-2">
//                       <input
//                         type="checkbox"
//                         checked={selectedImages.some((img) => img.id === image.id)}
//                         onChange={() => toggleImageSelection(image)}
//                         onMouseDown={(e) => e.stopPropagation()} // Prevent image selection
//                         className="cursor-pointer"
//                       />
//                     </div>
//                     <button
//                       onMouseDown={(e) => {
//                         e.preventDefault();
//                         e.stopPropagation();
//                         openDeleteConfirmation([image]);
//                       }}
//                       className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
//                       title="Delete image"
//                     >
//                       <Icon icon="mdi:trash-can-outline" width={16} />
//                     </button>
//                   </div>
//                 ))}
//               </div>
//             </>
//           )}
//         </div>
//         <div className="p-4 border-t dark:border-gray-700 flex justify-end">
//           <button
//             onClick={onClose}
//             className={`px-4 py-2 rounded-md font-medium ${
//               mode === "dark"
//                 ? "bg-gray-700 text-white hover:bg-gray-600"
//                 : "bg-gray-200 text-gray-800 hover:bg-gray-300"
//             }`}
//           >
//             Cancel
//           </button>
//         </div>
//       </div>
//       <ConfirmationModal
//         isOpen={isConfirmOpen}
//         onClose={() => setIsConfirmOpen(false)}
//         onConfirm={handleDeleteImages}
//         title={`Delete ${imagesToDelete.length} Image${imagesToDelete.length > 1 ? "s" : ""}`}
//         message={`Are you sure you want to delete ${
//           imagesToDelete.length > 1 ? "these images" : `"${imagesToDelete[0]?.name}"`
//         }? This action cannot be undone.`}
//       />
//     </div>
//   );
// };

// export default ImageGallery;