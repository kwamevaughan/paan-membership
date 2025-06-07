import { IKContext } from "imagekitio-react";
import dynamic from "next/dynamic";
import ItemActionModal from "../ItemActionModal";

const MediaLibrary = dynamic(
  () => import("imagekitio-react").then((mod) => mod.MediaLibrary),
  {
    ssr: false,
    loading: () => <p>Loading media library...</p>,
  }
);

export default function ImageLibrary({
  isOpen,
  onClose,
  onSelect,
  mode,
  authenticator,
}) {
  return (
    <ItemActionModal
      isOpen={isOpen}
      onClose={onClose}
      title="Image Library"
      mode={mode}
    >
      <div className="h-[600px]">
        <IKContext
          publicKey={process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY}
          urlEndpoint={process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT}
          authenticationEndpoint={
            process.env.NODE_ENV === "production"
              ? "https://membership.paan.africa/api/imagekit/auth"
              : "http://localhost:3000/api/imagekit/auth"
          }
          authenticator={authenticator}
        >
          <MediaLibrary
            onSelect={onSelect}
            onClose={onClose}
            path="/Blog"
            rootFolderPath="/"
            theme={mode === "dark" ? "dark" : "light"}
            style={{ height: "100%" }}
            showFolderSelection={true}
            showSearch={true}
            showSort={true}
            showFilter={true}
            showPreview={true}
            showUploadButton={true}
            showDeleteButton={true}
            showRenameButton={true}
            showMoveButton={true}
            showCopyButton={true}
            showDownloadButton={true}
            showShareButton={true}
            showInfoButton={true}
            showThumbnails={true}
            showListView={true}
            showGridView={true}
            showTreeView={true}
            showBreadcrumb={true}
            showPath={true}
            showFileSize={true}
            showFileType={true}
            showLastModified={true}
            showCreatedAt={true}
            showDimensions={true}
            showTags={true}
            showCustomMetadata={true}
            showCustomMetadataFields={true}
            showCustomMetadataValues={true}
            showCustomMetadataSearch={true}
            showCustomMetadataFilter={true}
            showCustomMetadataSort={true}
            showCustomMetadataGroup={true}
            showCustomMetadataExport={true}
            showCustomMetadataImport={true}
            showCustomMetadataDelete={true}
            showCustomMetadataEdit={true}
            showCustomMetadataAdd={true}
            showCustomMetadataRemove={true}
            showCustomMetadataMove={true}
            showCustomMetadataCopy={true}
            showCustomMetadataDownload={true}
            showCustomMetadataShare={true}
            showCustomMetadataInfo={true}
            showCustomMetadataThumbnails={true}
            showCustomMetadataListView={true}
            showCustomMetadataGridView={true}
            showCustomMetadataTreeView={true}
            showCustomMetadataBreadcrumb={true}
            showCustomMetadataPath={true}
            showCustomMetadataFileSize={true}
            showCustomMetadataFileType={true}
            showCustomMetadataLastModified={true}
            showCustomMetadataCreatedAt={true}
            showCustomMetadataDimensions={true}
            showCustomMetadataTags={true}
          />
        </IKContext>
      </div>
    </ItemActionModal>
  );
} 