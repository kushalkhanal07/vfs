import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { FaHdd, FaRegClock, FaStar, FaTrashAlt, FaVideo, FaFileAlt, FaImage } from "react-icons/fa";
import DirectoryHeader from "./components/DirectoryHeader";
import CreateDirectoryModal from "./components/CreateDirectoryModal";
import RenameModal from "./components/RenameModal";
import ShareFileModal from "./components/ShareFileModal";
import DirectoryList from "./components/DirectoryList";
import FileSection from "./components/FileSection";
import StorageIndicator from "./components/StorageIndicator";
import UpgradeModal from "./components/UpgradeModal";
import {
  calculateFileImportance,
  sortFilesByImportance,
  sortFilesByRecency,
} from "./lib/fileImportance";
import "./DirectoryView.css";

const sidebarItems = [
  { key: "drive", label: "My Drive", icon: FaHdd },
  { key: "starred", label: "Starred", icon: FaStar },
  { key: "videos", label: "Videos", icon: FaVideo },
  { key: "pictures", label: "Pictures", icon: FaImage },
  { key: "docs", label: "Documents", icon: FaFileAlt },
  { key: "recent", label: "Recent", icon: FaRegClock },
  { key: "trash", label: "Trash", icon: FaTrashAlt },
];

const ACCESS_ERROR_MESSAGE = "Directory not found or you do not have access to it!";

function DirectoryView() {
  const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";
  const { dirId } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Sidebar navigation
  const [selectedNav, setSelectedNav] = useState("drive");
  const [showTrash, setShowTrash] = useState(false);

  // Storage info
  const [storageInfo, setStorageInfo] = useState({
    storageUsed: 0,
    storageLimit: 5242880,
    storagePercent: 0,
    subscriptionActive: false,
  });
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // Displayed directory name
  const [directoryName, setDirectoryName] = useState("My Drive");

  // Lists of items
  const [directoriesList, setDirectoriesList] = useState([]);
  const [filesList, setFilesList] = useState([]);

  // Starred items
  const [starredFiles, setStarredFiles] = useState([]);
  const [starredDirectories, setStarredDirectories] = useState([]);

  // Filtered items by type
  const [filteredFiles, setFilteredFiles] = useState([]);

  // Trash items
  const [trashFiles, setTrashFiles] = useState([]);
  const [trashDirectories, setTrashDirectories] = useState([]);

  // Error state
  const [errorMessage, setErrorMessage] = useState("");

  // Modal states
  const [showCreateDirModal, setShowCreateDirModal] = useState(false);
  const [newDirname, setNewDirname] = useState("New Folder");

  const [showRenameModal, setShowRenameModal] = useState(false);
  const [renameType, setRenameType] = useState(null); // "directory" or "file"
  const [renameId, setRenameId] = useState(null);
  const [renameValue, setRenameValue] = useState("");
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareFileId, setShareFileId] = useState(null);
  const [shareFileName, setShareFileName] = useState("");
  const [shareEmail, setShareEmail] = useState("");

  // Uploading states
  const fileInputRef = useRef(null);
  const [uploadQueue, setUploadQueue] = useState([]); // queued items to upload
  const [uploadXhrMap, setUploadXhrMap] = useState({}); // track XHR per item
  const [progressMap, setProgressMap] = useState({}); // track progress per item
  const [isUploading, setIsUploading] = useState(false); // indicates if an upload is in progress

  // Context menu
  const [activeContextMenu, setActiveContextMenu] = useState(null);
  const [contextMenuPos, setContextMenuPos] = useState({ x: 0, y: 0 });

  /**
   * Utility: handle fetch errors
   */
  async function handleFetchErrors(response) {
    if (!response.ok) {
      let errMsg = `Request failed with status ${response.status}`;
      try {
        const data = await response.json();
        if (data.error) errMsg = data.error;
      } catch {
        // If JSON parsing fails, default errMsg stays
      }
      throw new Error(errMsg);
    }
    return response;
  }

  /**
   * Fetch directory contents
   */
  async function getDirectoryItems() {
    setErrorMessage(""); // clear any existing error
    try {
      const response = await fetch(`${BASE_URL}/directory/${dirId || ""}`, {
        credentials: "include",
      });

      if (response.status === 401) {
        navigate("/login");
        return;
      }

      await handleFetchErrors(response);
      const data = await response.json();

      // Set directory name
      setDirectoryName(
        selectedNav === "recent" ? "Recently Used" : dirId ? data.name : "My Drive"
      );

      // Reverse directories and files so new items show on top
      setDirectoriesList([...data.directories].reverse());
      setFilesList([...data.files].reverse());
    } catch (error) {
      setErrorMessage(error.message);
    }
  }

  /**
   * Fetch storage info
   */
  async function getStorageInfo() {
    try {
      const response = await fetch(`${BASE_URL}/user/storage`, {
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        setStorageInfo(data);
      }
    } catch (error) {
      console.error("Error fetching storage info:", error);
    }
  }

  async function confirmStorageUpgrade(sessionId) {
    try {
      const response = await fetch(`${BASE_URL}/user/stripe/confirm-upgrade`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ sessionId }),
      });

      if (response.status === 401) {
        navigate("/login");
        return;
      }

      await handleFetchErrors(response);
      await getStorageInfo();
      setShowUpgradeModal(false);
      setErrorMessage("Storage upgraded successfully.");
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setSearchParams({}, { replace: true });
    }
  }

  /**
   * Fetch starred items
   */
  async function getStarredItems() {
    setErrorMessage("");
    try {
      const response = await fetch(`${BASE_URL}/file/starred/all`, {
        credentials: "include",
      });

      if (response.status === 401) {
        navigate("/login");
        return;
      }

      await handleFetchErrors(response);
      const data = await response.json();
      setDirectoryName("Starred");
      setStarredDirectories([...data.directories].reverse());
      setStarredFiles([...data.files].reverse());
    } catch (error) {
      setErrorMessage(error.message);
    }
  }

  /**
   * Fetch files by type
   */
  async function getFilesByType(type) {
    setErrorMessage("");
    try {
      const response = await fetch(`${BASE_URL}/file/type/${type}`, {
        credentials: "include",
      });

      if (response.status === 401) {
        navigate("/login");
        return;
      }

      await handleFetchErrors(response);
      const data = await response.json();
      const typeLabel = type === "videos" ? "Videos" : type === "pictures" ? "Pictures" : "Documents";
      setDirectoryName(typeLabel);
      setFilteredFiles([...data.files].reverse());
    } catch (error) {
      setErrorMessage(error.message);
    }
  }

  useEffect(() => {
    getStorageInfo(); // Fetch storage Info on mount
    
    if (selectedNav === "trash") {
      setShowTrash(true);
      setDirectoryName("Trash");
      getTrashItems();
    } else if (selectedNav === "starred") {
      setShowTrash(false);
      getStarredItems();
    } else if (selectedNav === "recent") {
      setShowTrash(false);
      setDirectoryName("Recently Used");
      getDirectoryItems();
    } else if (["videos", "pictures", "docs"].includes(selectedNav)) {
      setShowTrash(false);
      getFilesByType(selectedNav);
    } else {
      setShowTrash(false);
      getDirectoryItems();
    }
    // Reset context menu
    setActiveContextMenu(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dirId, selectedNav]);

  useEffect(() => {
    const checkoutStatus = searchParams.get("stripe_checkout");
    const sessionId = searchParams.get("session_id");

    if (checkoutStatus === "success" && sessionId) {
      confirmStorageUpgrade(sessionId);
      return;
    }

    if (checkoutStatus === "cancelled") {
      setErrorMessage("Payment cancelled.");
      setSearchParams({}, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  useEffect(() => {
    if (!errorMessage || errorMessage === ACCESS_ERROR_MESSAGE) {
      return undefined;
    }

    const timeoutId = setTimeout(() => {
      setErrorMessage("");
    }, 4000);

    return () => clearTimeout(timeoutId);
  }, [errorMessage]);

  /**
   * Decide file icon
   */
  function getFileIcon(filename) {
    const ext = filename.split(".").pop().toLowerCase();
    switch (ext) {
      case "pdf":
        return "pdf";
      case "png":
      case "jpg":
      case "jpeg":
      case "gif":
        return "image";
      case "mp4":
      case "mov":
      case "avi":
        return "video";
      case "zip":
      case "rar":
      case "tar":
      case "gz":
        return "archive";
      case "js":
      case "jsx":
      case "ts":
      case "tsx":
      case "html":
      case "css":
      case "py":
      case "java":
        return "code";
      default:
        return "alt";
    }
  }

  /**
   * Click row to open directory or file
   */
  function handleRowClick(type, id) {
    if (type === "directory") {
      navigate(`/directory/${id}`);
    } else {
      window.location.href = `${BASE_URL}/file/${id}`;
    }
  }

  /**
   * Select multiple files
   */
  function handleFileSelect(e) {
    const selectedFiles = Array.from(e.target.files);
    if (selectedFiles.length === 0) return;

    // Build a list of "temp" items
    const newItems = selectedFiles.map((file) => {
      const tempId = `temp-${Date.now()}-${Math.random()}`;
      return {
        file,
        name: file.name,
        id: tempId,
        isUploading: false,
      };
    });

    // Put them at the top of the existing list
    setFilesList((prev) => [...newItems, ...prev]);

    // Initialize progress=0 for each
    newItems.forEach((item) => {
      setProgressMap((prev) => ({ ...prev, [item.id]: 0 }));
    });

    // Add them to the uploadQueue
    setUploadQueue((prev) => [...prev, ...newItems]);

    // Clear file input so the same file can be chosen again if needed
    e.target.value = "";

    // Start uploading queue if not already uploading
    if (!isUploading) {
      setIsUploading(true);
      // begin the queue process
      processUploadQueue([...uploadQueue, ...newItems.reverse()]);
    }
  }

  /**
   * Upload items in queue one by one
   */
  function processUploadQueue(queue) {
    if (queue.length === 0) {
      // No more items to upload
      setIsUploading(false);
      setUploadQueue([]);
      setTimeout(() => {
        getDirectoryItems();
      }, 1000);
      return;
    }

    // Take first item
    const [currentItem, ...restQueue] = queue;

    // Mark it as isUploading: true
    setFilesList((prev) =>
      prev.map((f) =>
        f.id === currentItem.id ? { ...f, isUploading: true } : f
      )
    );

    // Start upload
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${BASE_URL}/file/${dirId || ""}`, true);
    xhr.withCredentials = true;
    xhr.setRequestHeader("filename", currentItem.name);

    xhr.upload.addEventListener("progress", (evt) => {
      if (evt.lengthComputable) {
        const progress = (evt.loaded / evt.total) * 100;
        setProgressMap((prev) => ({ ...prev, [currentItem.id]: progress }));
      }
    });

    xhr.addEventListener("load", () => {
      if (xhr.status === 413) {
        // Storage limit exceeded
        setErrorMessage("Storage limit exceeded! Please upgrade your plan.");
        setShowUpgradeModal(true);
        setFilesList((prev) => prev.filter((f) => f.id !== currentItem.id));
        processUploadQueue(restQueue);
      } else if (xhr.status === 422) {
        let message = "Upload blocked: file appears unsafe.";
        try {
          const response = JSON.parse(xhr.responseText);
          if (response?.message) {
            message = response.message;
          }
        } catch {
          // Keep fallback message if backend response is not JSON.
        }
        setErrorMessage(message);
        setFilesList((prev) => prev.filter((f) => f.id !== currentItem.id));
        processUploadQueue(restQueue);
      } else if (xhr.status >= 200 && xhr.status < 300) {
        getStorageInfo(); // Refresh storage info
        processUploadQueue(restQueue);
      } else {
        setErrorMessage(`Upload failed: ${xhr.statusText}`);
        processUploadQueue(restQueue);
      }
    });

    xhr.addEventListener("error", () => {
      setErrorMessage("Upload error occurred");
      processUploadQueue(restQueue);
    });

    // If user cancels, remove from the queue
    setUploadXhrMap((prev) => ({ ...prev, [currentItem.id]: xhr }));
    xhr.send(currentItem.file);
  }

  /**
   * Cancel an in-progress upload
   */
  function handleCancelUpload(tempId) {
    const xhr = uploadXhrMap[tempId];
    if (xhr) {
      xhr.abort();
    }
    // Remove it from queue if still there
    setUploadQueue((prev) => prev.filter((item) => item.id !== tempId));

    // Remove from filesList
    setFilesList((prev) => prev.filter((f) => f.id !== tempId));

    // Remove from progressMap
    setProgressMap((prev) => {
      const copy = { ...prev };
      delete copy[tempId];
      return copy;
    });

    // Remove from Xhr map
    setUploadXhrMap((prev) => {
      const copy = { ...prev };
      delete copy[tempId];
      return copy;
    });
  }

  /**
   * Delete a file/directory
   */
  async function handleDeleteFile(id) {
    setErrorMessage("");
    try {
      const response = await fetch(`${BASE_URL}/file/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      await handleFetchErrors(response);
      await getDirectoryItems();
      await getStorageInfo();
    } catch (error) {
      setErrorMessage(error.message);
    }
  }

  async function handleDeleteDirectory(id) {
    setErrorMessage("");
    try {
      const response = await fetch(`${BASE_URL}/directory/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      await handleFetchErrors(response);
      await getDirectoryItems();
      await getStorageInfo();
    } catch (error) {
      setErrorMessage(error.message);
    }
  }

  /**
   * Fetch trash items
   */
  async function getTrashItems() {
    setErrorMessage("");
    try {
      const response = await fetch(`${BASE_URL}/directory/trash/all`, {
        credentials: "include",
      });

      if (response.status === 401) {
        navigate("/login");
        return;
      }

      await handleFetchErrors(response);
      const data = await response.json();

      setTrashDirectories([...data.directories].reverse());
      setTrashFiles([...data.files].reverse());
    } catch (error) {
      setErrorMessage(error.message);
    }
  }

  /**
   * Restore file from trash
   */
  async function handleRestoreFile(id) {
    setErrorMessage("");
    try {
      const response = await fetch(`${BASE_URL}/file/${id}/restore`, {
        method: "PUT",
        credentials: "include",
      });
      await handleFetchErrors(response);
      await getTrashItems();
      await getStorageInfo();
    } catch (error) {
      setErrorMessage(error.message);
    }
  }

  /**
   * Restore directory from trash
   */
  async function handleRestoreDirectory(id) {
    setErrorMessage("");
    try {
      const response = await fetch(`${BASE_URL}/directory/${id}/restore`, {
        method: "PUT",
        credentials: "include",
      });
      await handleFetchErrors(response);
      await getTrashItems();
      await getStorageInfo();
    } catch (error) {
      setErrorMessage(error.message);
    }
  }

  /**
   * Permanently delete file
   */
  async function handlePermanentDeleteFile(id) {
    setErrorMessage("");
    try {
      const response = await fetch(`${BASE_URL}/file/${id}/permanent`, {
        method: "DELETE",
        credentials: "include",
      });
      await handleFetchErrors(response);
      await getTrashItems();
      await getStorageInfo();
    } catch (error) {
      setErrorMessage(error.message);
    }
  }

  /**
   * Permanently delete directory
   */
  async function handlePermanentDeleteDirectory(id) {
    setErrorMessage("");
    try {
      const response = await fetch(`${BASE_URL}/directory/${id}/permanent`, {
        method: "DELETE",
        credentials: "include",
      });
      await handleFetchErrors(response);
      await getTrashItems();
      await getStorageInfo();
    } catch (error) {
      setErrorMessage(error.message);
    }
  }

  /**
   * Create a directory
   */
  async function handleCreateDirectory(e) {
    e.preventDefault();
    setErrorMessage("");
    try {
      const response = await fetch(`${BASE_URL}/directory/${dirId || ""}`, {
        method: "POST",
        headers: {
          dirname: newDirname,
        },
        credentials: "include",
      });
      await handleFetchErrors(response);
      setNewDirname("New Folder");
      setShowCreateDirModal(false);
      getDirectoryItems();
    } catch (error) {
      setErrorMessage(error.message);
    }
  }

  /**
   * Rename
   */
  function openRenameModal(type, id, currentName) {
    setRenameType(type);
    setRenameId(id);
    setRenameValue(currentName);
    setShowRenameModal(true);
  }

  async function handleRenameSubmit(e) {
    e.preventDefault();
    setErrorMessage("");
    try {
      const url =
        renameType === "file"
          ? `${BASE_URL}/file/${renameId}`
          : `${BASE_URL}/directory/${renameId}`;
      const response = await fetch(url, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(
          renameType === "file"
            ? { newFilename: renameValue }
            : { newDirName: renameValue }
        ),
        credentials: "include",
      });
      await handleFetchErrors(response);

      setShowRenameModal(false);
      setRenameValue("");
      setRenameType(null);
      setRenameId(null);
      getDirectoryItems();
    } catch (error) {
      setErrorMessage(error.message);
    }
  }

  function openShareModal(fileId, fileName) {
    setShareFileId(fileId);
    setShareFileName(fileName);
    setShareEmail("");
    setShowShareModal(true);
  }

  function closeShareModal() {
    setShowShareModal(false);
    setShareFileId(null);
    setShareFileName("");
    setShareEmail("");
  }

  async function handleShareSubmit(e) {
    e.preventDefault();

    if (!shareFileId) {
      setErrorMessage("No file selected to share.");
      return;
    }

    setErrorMessage("");

    try {
      const response = await fetch(`${BASE_URL}/file/${shareFileId}/share`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: shareEmail }),
      });

      await handleFetchErrors(response);
      closeShareModal();
      setErrorMessage("File shared successfully.");

      if (selectedNav === "trash") {
        await getTrashItems();
      } else if (selectedNav === "starred") {
        await getStarredItems();
      } else if (["videos", "pictures", "docs"].includes(selectedNav)) {
        await getFilesByType(selectedNav);
      } else {
        await getDirectoryItems();
      }
    } catch (error) {
      if (
        String(error.message || "").toLowerCase().includes("no user") ||
        String(error.message || "").toLowerCase().includes("not found")
      ) {
        setErrorMessage("No user found with this email.");
      } else {
        setErrorMessage(error.message);
      }
    }
  }

  /**
   * Context Menu
   */
  function handleContextMenu(e, item) {
    e.stopPropagation();
    e.preventDefault();
    const clickX = e.clientX;
    const clickY = e.clientY;

    const menuWidth = 170;
    let menuHeight = 132;

    if (item.isDirectory) {
      menuHeight = 92;
    } else if (item.id.startsWith("temp-") && item.isUploading) {
      menuHeight = 52;
    }

    const maxX = window.innerWidth - menuWidth - 10;
    const maxY = window.innerHeight - menuHeight - 10;

    const posX = Math.max(10, Math.min(clickX - 100, maxX));
    const posY = Math.max(10, Math.min(clickY, maxY));

    if (activeContextMenu === item.id) {
      setActiveContextMenu(null);
    } else {
      setActiveContextMenu(item.id);
      setContextMenuPos({ x: posX, y: posY });
    }
  }

  useEffect(() => {
    function handleDocumentClick() {
      setActiveContextMenu(null);
    }
    document.addEventListener("click", handleDocumentClick);
    return () => document.removeEventListener("click", handleDocumentClick);
  }, []);

  /**
   * Toggle star on file
   */
  async function handleToggleStarFile(id) {
    try {
      const response = await fetch(`${BASE_URL}/file/${id}/star`, {
        method: "PUT",
        credentials: "include",
      });
      if (response.ok) {
        // Refresh the current view
        if (selectedNav === "starred") {
          getStarredItems();
        } else if (["videos", "pictures", "docs"].includes(selectedNav)) {
          getFilesByType(selectedNav);
        } else {
          getDirectoryItems();
        }
      }
    } catch (error) {
      console.error("Error toggling star:", error);
    }
  }

  /**
   * Toggle star on directory
   */
  async function handleToggleStarDirectory(id) {
    try {
      const response = await fetch(`${BASE_URL}/directory/${id}/star`, {
        method: "PUT",
        credentials: "include",
      });
      if (response.ok) {
        // Refresh the current view
        if (selectedNav === "starred") {
          getStarredItems();
        } else {
          getDirectoryItems();
        }
      }
    } catch (error) {
      console.error("Error toggling star:", error);
    }
  }

  function decorateFile(file) {
    return {
      ...file,
      ...calculateFileImportance(file),
      isDirectory: false,
    };
  }

  const isRankingView = selectedNav === "drive" || selectedNav === "recent";
  const decoratedDirectories = directoriesList.map((directory) => ({
    ...directory,
    isDirectory: true,
  }));
  const decoratedFiles = filesList.map(decorateFile);
  const importantFiles = sortFilesByImportance(
    decoratedFiles.filter((file) => file.category === "HIGH")
  );
  const recentlyUsedFiles = sortFilesByRecency(decoratedFiles);
  const allFilesByImportance = sortFilesByImportance(decoratedFiles);

  const starredItems = [
    ...starredDirectories.map((directory) => ({
      ...directory,
      isDirectory: true,
    })),
    ...starredFiles.map(decorateFile),
  ];

  const filteredFileItems = sortFilesByImportance(
    filteredFiles.map(decorateFile)
  );

  const trashItems = [
    ...trashDirectories.map((directory) => ({
      ...directory,
      isDirectory: true,
    })),
    ...trashFiles.map(decorateFile),
  ];

  // Combine directories & files into one list for rendering
  const combinedItems = showTrash
    ? trashItems
    : selectedNav === "starred"
    ? starredItems
    : ["videos", "pictures", "docs"].includes(selectedNav)
    ? filteredFileItems
    : [...decoratedDirectories, ...decoratedFiles];

  return (
    <div className="directory-shell">
      <aside className="directory-sidebar">
        <div className="sidebar-brand">Virtual File System</div>
        <div className="sidebar-title">Quick Access</div>
        <nav className="sidebar-nav">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.key === selectedNav;
            return (
              <button
                key={item.key}
                type="button"
                className={`sidebar-item ${isActive ? "is-active" : ""}`}
                onClick={() => setSelectedNav(item.key)}
              >
                <Icon className="sidebar-icon" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
        <div className="sidebar-note">
          Keep your workspace organized with folders, uploads, and smart access.
        </div>
      </aside>

      <main className="directory-main">
        <div className="directory-view">
          {/* Top error message for general errors */}
          {errorMessage &&
            errorMessage !== ACCESS_ERROR_MESSAGE && (
              <div className="error-message">{errorMessage}</div>
            )}

          <DirectoryHeader
            directoryName={directoryName}
            onCreateFolderClick={() => setShowCreateDirModal(true)}
            onUploadFilesClick={() => fileInputRef.current.click()}
            fileInputRef={fileInputRef}
            handleFileSelect={handleFileSelect}
            // Disable if the user doesn't have access
            disabled={errorMessage === ACCESS_ERROR_MESSAGE}
            showTrash={showTrash}
          />

          {/* Storage Indicator */}
          <StorageIndicator 
            storageInfo={storageInfo} 
            onUpgradeClick={() => setShowUpgradeModal(true)}
          />

          {/* Create Directory Modal */}
          {showCreateDirModal && (
            <CreateDirectoryModal
              newDirname={newDirname}
              setNewDirname={setNewDirname}
              onClose={() => setShowCreateDirModal(false)}
              onCreateDirectory={handleCreateDirectory}
            />
          )}

          {/* Rename Modal */}
          {showRenameModal && (
            <RenameModal
              renameType={renameType}
              renameValue={renameValue}
              setRenameValue={setRenameValue}
              onClose={() => setShowRenameModal(false)}
              onRenameSubmit={handleRenameSubmit}
            />
          )}

          {showShareModal && (
            <ShareFileModal
              fileName={shareFileName}
              shareEmail={shareEmail}
              setShareEmail={setShareEmail}
              onClose={closeShareModal}
              onShareSubmit={handleShareSubmit}
            />
          )}

          {/* Upgrade Storage Modal */}
          {showUpgradeModal && (
            <UpgradeModal
              onClose={() => setShowUpgradeModal(false)}
            />
          )}

          {isRankingView ? (
            <div className="ranking-sections">
              {selectedNav === "drive" ? (
                <FileSection
                  title="Folders"
                  description="Folders in the current location."
                  items={decoratedDirectories}
                  emptyText="No folders in this location yet."
                  handleRowClick={handleRowClick}
                  activeContextMenu={activeContextMenu}
                  contextMenuPos={contextMenuPos}
                  handleContextMenu={handleContextMenu}
                  closeContextMenu={() => setActiveContextMenu(null)}
                  getFileIcon={getFileIcon}
                  isUploading={isUploading}
                  progressMap={progressMap}
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
              ) : null}

              <FileSection
                title="Important Files"
                description="Files marked HIGH by ranking signals (recency, usage, size, sharing, type), or files opened more than 3 times."
                items={importantFiles}
                emptyText="No high-importance files yet."
                handleRowClick={handleRowClick}
                activeContextMenu={activeContextMenu}
                contextMenuPos={contextMenuPos}
                handleContextMenu={handleContextMenu}
                closeContextMenu={() => setActiveContextMenu(null)}
                getFileIcon={getFileIcon}
                isUploading={isUploading}
                progressMap={progressMap}
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

              <FileSection
                title="Recently Used"
                description="Files sorted by the most recent access time."
                items={recentlyUsedFiles}
                emptyText="No recent files found."
                handleRowClick={handleRowClick}
                activeContextMenu={activeContextMenu}
                contextMenuPos={contextMenuPos}
                handleContextMenu={handleContextMenu}
                closeContextMenu={() => setActiveContextMenu(null)}
                getFileIcon={getFileIcon}
                isUploading={isUploading}
                progressMap={progressMap}
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

              <FileSection
                title="All Files"
                description="All files sorted by importance score from highest to lowest."
                items={allFilesByImportance}
                emptyText="No files available yet."
                handleRowClick={handleRowClick}
                activeContextMenu={activeContextMenu}
                contextMenuPos={contextMenuPos}
                handleContextMenu={handleContextMenu}
                closeContextMenu={() => setActiveContextMenu(null)}
                getFileIcon={getFileIcon}
                isUploading={isUploading}
                progressMap={progressMap}
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
            </div>
          ) : combinedItems.length === 0 ? (
            // Check if the error is specifically the "no access" error
            errorMessage === ACCESS_ERROR_MESSAGE ? (
              <p className="no-data-message">
                Directory not found or you do not have access to it!
              </p>
            ) : (
              <p className="no-data-message">
                This folder is empty. Upload files or create a folder to see some
                data.
              </p>
            )
          ) : (
            <DirectoryList
              items={combinedItems}
              handleRowClick={handleRowClick}
              activeContextMenu={activeContextMenu}
              contextMenuPos={contextMenuPos}
              handleContextMenu={handleContextMenu}
              closeContextMenu={() => setActiveContextMenu(null)}
              getFileIcon={getFileIcon}
              isUploading={isUploading}
              progressMap={progressMap}
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
      </main>
    </div>
  );
}

export default DirectoryView;
