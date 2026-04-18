function StorageIndicator({ storageInfo, onUpgradeClick }) {
  const formatBytes = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  return (
    <div className="storage-indicator">
      <div className="storage-header">
        <span className="storage-label">Storage</span>
        <span className="storage-percent">{storageInfo.storagePercent}%</span>
      </div>
      <div className="storage-bar">
        <div
          className="storage-bar-fill"
          style={{ width: `${storageInfo.storagePercent}%` }}
        ></div>
      </div>
      <div className="storage-info">
        <span className="storage-used">{formatBytes(storageInfo.storageUsed)}</span>
        <span className="storage-divider">/</span>
        <span className="storage-limit">{formatBytes(storageInfo.storageLimit)}</span>
      </div>
      {storageInfo.storagePercent >= 80 && !storageInfo.subscriptionActive && (
        <button className="upgrade-btn" onClick={onUpgradeClick}>
          Upgrade Storage
        </button>
      )}
    </div>
  );
}

export default StorageIndicator;
