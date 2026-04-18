function ContextMenu({
  item,
  isUploadingItem,
  onClose,
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
  const isUploadingNow = isUploadingItem && item.isUploading;

  // Determine action buttons based on whether we're in trash view or not
  const actionButtons = isUploadingNow
    ? [
        {
          key: "cancel",
          label: "Cancel Upload",
          variant: "danger",
          action: () => handleCancelUpload(item.id),
        },
      ]
    : showTrash
      ? // Trash view actions
        item.isDirectory
        ? [
            {
              key: "restore",
              label: "Restore Folder",
              action: () => handleRestoreDirectory(item.id),
            },
            {
              key: "delete",
              label: "Permanently Delete",
              variant: "danger",
              action: () => handlePermanentDeleteDirectory(item.id),
            },
          ]
        : [
            {
              key: "restore",
              label: "Restore File",
              action: () => handleRestoreFile(item.id),
            },
            {
              key: "delete",
              label: "Permanently Delete",
              variant: "danger",
              action: () => handlePermanentDeleteFile(item.id),
            },
          ]
      : // Normal view actions
        item.isDirectory
        ? [
            {
              key: "star",
              label: item.starred ? "Unstar Folder" : "Star Folder",
              action: () => handleToggleStarDirectory(item.id),
            },
            {
              key: "rename",
              label: "Rename Folder",
              action: () => openRenameModal("directory", item.id, item.name),
            },
            {
              key: "delete",
              label: "Delete Folder",
              variant: "danger",
              action: () => handleDeleteDirectory(item.id),
            },
          ]
        : [
            {
              key: "download",
              label: "Download",
              action: () => {
                window.location.href = `${BASE_URL}/file/${item.id}?action=download`;
              },
            },
            {
              key: "star",
              label: item.starred ? "Unstar File" : "Star File",
              action: () => handleToggleStarFile(item.id),
            },
            {
              key: "share",
              label: "Share File",
              action: () => openShareModal(item.id, item.name),
            },
            {
              key: "rename",
              label: "Rename File",
              action: () => openRenameModal("file", item.id, item.name),
            },
            {
              key: "delete",
              label: "Delete File",
              variant: "danger",
              action: () => handleDeleteFile(item.id),
            },
          ];

  const handleAction = (action) => {
    action();
    onClose();
  };

  return (
    <div className="context-menu-overlay" onClick={onClose}>
      <div className="context-menu context-menu-modal" onClick={(e) => e.stopPropagation()}>
        <h3 className="context-menu-title">Actions</h3>
        <p className="context-menu-subtitle" title={item.name}>{item.name}</p>

        <div className="context-menu-actions">
          {actionButtons.map((btn) => (
            <button
              key={btn.key}
              type="button"
              className={`context-menu-item context-menu-btn ${btn.variant === "danger" ? "danger" : ""}`}
              onClick={() => handleAction(btn.action)}
            >
              {btn.label}
            </button>
          ))}
        </div>

        <button type="button" className="context-menu-close" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}

export default ContextMenu;
  