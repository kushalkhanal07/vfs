/* eslint-disable react/prop-types */
import {
  FaFolder,
  FaFilePdf,
  FaFileImage,
  FaFileVideo,
  FaFileArchive,
  FaFileCode,
  FaFileAlt,
} from "react-icons/fa";
import { BsThreeDotsVertical } from "react-icons/bs";
import ContextMenu from "../components/ContextMenu";

function DirectoryItem({
  item,
  handleRowClick,
  activeContextMenu,
  contextMenuPos,
  handleContextMenu,
  closeContextMenu,
  getFileIcon,
  isUploading,
  uploadProgress,
  handleCancelUpload,
  handleDeleteFile,
  handleDeleteDirectory,
  openRenameModal,
  BASE_URL,
  showTrash,
  handleRestoreFile,
  handleRestoreDirectory,
  handlePermanentDeleteFile,
  handlePermanentDeleteDirectory,
  handleToggleStarFile,
  handleToggleStarDirectory,
  openShareModal,
}) {
  // Convert the file icon string to the actual Icon component
  function renderFileIcon(iconString) {
    switch (iconString) {
      case "pdf":
        return <FaFilePdf />;
      case "image":
        return <FaFileImage />;
      case "video":
        return <FaFileVideo />;
      case "archive":
        return <FaFileArchive />;
      case "code":
        return <FaFileCode />;
      case "alt":
      default:
        return <FaFileAlt />;
    }
  }

  const isUploadingItem = item.id.startsWith("temp-");

  return (
    <div
      className={`list-item hoverable-row ${
        !item.isDirectory && item.importanceCategory === "HIGH"
          ? "is-important"
          : ""
      }`}
      onClick={() =>
        !(activeContextMenu || isUploading)
          ? handleRowClick(item.isDirectory ? "directory" : "file", item.id)
          : null
      }
      onContextMenu={(e) => handleContextMenu(e, item)}
    >
      <div className="item-left-container">
        <div className="item-left">
          {item.isDirectory ? (
            <FaFolder className="folder-icon" />
          ) : (
            renderFileIcon(getFileIcon(item.name))
          )}
          <div className="item-name-group">
            <span className="item-name">{item.name}</span>
            {!item.isDirectory && item.importanceCategory && (
              <span
                className={`importance-badge importance-${item.importanceCategory.toLowerCase()}`}
              >
                {item.importanceCategory}
              </span>
            )}
          </div>
        </div>

        {/* Three dots for context menu */}
        <div
          className="context-menu-trigger"
          onClick={(e) => handleContextMenu(e, item)}
        >
          <BsThreeDotsVertical />
        </div>
      </div>

      {/* PROGRESS BAR: shown if an item is in queue or actively uploading */}
      {isUploadingItem && (
        <div className="progress-container">
          <span className="progress-value">{Math.floor(uploadProgress)}%</span>
          <div
            className="progress-bar"
            style={{
              width: `${uploadProgress}%`,
              backgroundColor: uploadProgress === 100 ? "#039203" : "#007bff",
            }}
          ></div>
        </div>
      )}

      {/* Context menu, if active */}
      {activeContextMenu === item.id && (
        <ContextMenu
          item={item}
          contextMenuPos={contextMenuPos}
          isUploadingItem={isUploadingItem}
          onClose={closeContextMenu}
          handleCancelUpload={handleCancelUpload}
          handleDeleteFile={handleDeleteFile}
          handleDeleteDirectory={handleDeleteDirectory}
          openRenameModal={openRenameModal}
          BASE_URL={BASE_URL}
          showTrash={showTrash}
          handleRestoreFile={handleRestoreFile}
          handleRestoreDirectory={handleRestoreDirectory}
          handlePermanentDeleteFile={handlePermanentDeleteFile}
          handlePermanentDeleteDirectory={handlePermanentDeleteDirectory}
          handleToggleStarFile={handleToggleStarFile}
          handleToggleStarDirectory={handleToggleStarDirectory}
          openShareModal={openShareModal}
        />
      )}
    </div>
  );
}

export default DirectoryItem;
