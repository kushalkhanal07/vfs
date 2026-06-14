import {
  Folder,
  FileText,
  Image as ImageIcon,
  Film,
  ChevronRight,
  Upload,
  Search,
  Grid3x3,
  List,
  MoreVertical,
  Star,
  Loader,
  AlertCircle,
  Trash2,
  Edit2,
  FolderPlus,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";

interface Directory {
  id: string;
  name: string;
  isDirectory?: boolean;
  deleted?: boolean;
}

interface File {
  id: string;
  name: string;
  extension?: string;
  size?: number;
  isDirectory?: boolean;
  deleted?: boolean;
}

type Item = Directory | File;

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000";

const getFileIcon = (filename: string) => {
  const ext = filename.split(".").pop()?.toLowerCase() || "";
  if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext)) return ImageIcon;
  if (["mp4", "avi", "mkv", "mov"].includes(ext)) return Film;
  if (ext === "pdf") return FileText;
  return FileText;
};

async function getDirectory(id?: string) {
  const url = id ? `${API_BASE}/directory/${id}` : `${API_BASE}/directory`;
  const res = await fetch(url, {
    method: "GET",
    credentials: "include",
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error || res.statusText || "Failed to fetch directory");
  }
  return res.json();
}

async function createDirectory(parentDirId?: string, dirName: string = "New Folder") {
  const url = parentDirId ? `${API_BASE}/directory/${parentDirId}` : `${API_BASE}/directory`;
  const res = await fetch(url, {
    method: "POST",
    credentials: "include",
    headers: {
      "dirname": dirName,
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error || res.statusText || "Failed to create directory");
  }
  return res.json();
}

async function renameDirectory(id: string, newName: string) {
  const url = `${API_BASE}/directory/${id}`;
  const res = await fetch(url, {
    method: "PATCH",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ newDirName: newName }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error || res.statusText || "Failed to rename directory");
  }
  return res.json();
}

async function deleteDirectory(id: string) {
  const url = `${API_BASE}/directory/${id}`;
  const res = await fetch(url, {
    method: "DELETE",
    credentials: "include",
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error || res.statusText || "Failed to delete directory");
  }
  return res.json();
}

async function uploadFile(
  file: File,
  parentDirId?: string,
  onProgress?: (progress: number) => void
): Promise<any> {
  const url = parentDirId ? `${API_BASE}/file/${parentDirId}` : `${API_BASE}/file`;
  
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);
    xhr.withCredentials = true;
    xhr.setRequestHeader("filename", file.name);

    if (onProgress) {
      xhr.upload.addEventListener("progress", (evt) => {
        if (evt.lengthComputable) {
          const progress = (evt.loaded / evt.total) * 100;
          onProgress(progress);
        }
      });
    }

    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const response = JSON.parse(xhr.responseText);
          resolve(response);
        } catch {
          resolve({ message: "File uploaded" });
        }
      } else {
        try {
          const err = JSON.parse(xhr.responseText);
          reject(new Error(err?.error || "Upload failed"));
        } catch {
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      }
    });

    xhr.addEventListener("error", () => {
      reject(new Error("Upload failed"));
    });

    xhr.addEventListener("abort", () => {
      reject(new Error("Upload cancelled"));
    });

    xhr.send(file);
  });
}

async function deleteFile(id: string) {
  const url = `${API_BASE}/file/${id}`;
  const res = await fetch(url, {
    method: "DELETE",
    credentials: "include",
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error || res.statusText || "Failed to delete file");
  }
  return res.json();
}

async function renameFile(id: string, newName: string) {
  const url = `${API_BASE}/file/${id}`;
  const res = await fetch(url, {
    method: "PATCH",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ newFilename: newName }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error || res.statusText || "Failed to rename file");
  }
  return res.json();
}

export function VaultPage() {
  const [view, setView] = useState<"grid" | "list">("grid");
  
  // Data states
  const [currentDirId, setCurrentDirId] = useState<string | null>(null);
  const [directories, setDirectories] = useState<Directory[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [breadcrumbs, setBreadcrumbs] = useState<Array<{ id: string | null; name: string }>>([{ id: null, name: "Vault" }]);
  
  // UI states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Upload states
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [isUploading, setIsUploading] = useState(false);
  
  // Modal states
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("New Folder");
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [renameItemId, setRenameItemId] = useState<string | null>(null);
  const [renameItemType, setRenameItemType] = useState<"file" | "directory" | null>(null);
  const [renameValue, setRenameValue] = useState("");
  
  // Context menu
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [menuPos, setMenuPos] = useState({ x: 0, y: 0 });

  // Load directory contents
  const loadDirectory = async (dirId?: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getDirectory(dirId);
      setCurrentDirId(dirId || null);
      
      // Update breadcrumbs
      if (dirId) {
        setBreadcrumbs((prev) => [
          ...prev,
          { id: dirId, name: data.name || "Folder" },
        ]);
      } else {
        setBreadcrumbs([{ id: null, name: "Vault" }]);
      }
      
      setDirectories(data.directories || []);
      setFiles(data.files || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load directory");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDirectory();
  }, []);

  // Handle file selection and upload
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length === 0) return;

    setIsUploading(true);
    let successCount = 0;

    for (const file of selectedFiles) {
      try {
        const fileId = `${file.name}-${Date.now()}`;
        await uploadFile(file, currentDirId || undefined, (progress) => {
          setUploadProgress((prev) => ({ ...prev, [fileId]: progress }));
        });
        successCount++;
        setUploadProgress((prev) => {
          const copy = { ...prev };
          delete copy[fileId];
          return copy;
        });
      } catch (err) {
        setError(
          err instanceof Error ? `Upload failed for ${file.name}: ${err.message}` : "Upload failed"
        );
      }
    }

    if (successCount === selectedFiles.length) {
      setError(null);
      setTimeout(() => loadDirectory(currentDirId || undefined), 500);
    }
    
    setIsUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Handle folder creation
  const handleCreateFolder = async () => {
    try {
      setError(null);
      await createDirectory(currentDirId || undefined, newFolderName);
      setShowCreateFolder(false);
      setNewFolderName("New Folder");
      loadDirectory(currentDirId || undefined);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create folder");
    }
  };

  // Handle delete
  const handleDelete = async (itemId: string, itemType: "file" | "directory") => {
    try {
      setError(null);
      if (itemType === "file") {
        await deleteFile(itemId);
      } else {
        await deleteDirectory(itemId);
      }
      setActiveMenu(null);
      loadDirectory(currentDirId || undefined);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete");
    }
  };

  // Handle rename
  const handleRename = async () => {
    if (!renameItemId || !renameItemType) return;
    try {
      setError(null);
      if (renameItemType === "file") {
        await renameFile(renameItemId, renameValue);
      } else {
        await renameDirectory(renameItemId, renameValue);
      }
      setShowRenameModal(false);
      setRenameItemId(null);
      setRenameItemType(null);
      setRenameValue("");
      loadDirectory(currentDirId || undefined);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to rename");
    }
  };

  // Handle folder navigation
  const handleFolderClick = (folderId: string) => {
    loadDirectory(folderId);
  };

  // Handle breadcrumb click
  const handleBreadcrumbClick = (breadId: string | null) => {
    if (breadId === null) {
      setBreadcrumbs([{ id: null, name: "Vault" }]);
      loadDirectory();
    } else {
      loadDirectory(breadId);
    }
  };

  // Handle context menu
  const handleContextMenu = (e: React.MouseEvent, itemId: string, itemType: "file" | "directory") => {
    e.preventDefault();
    setActiveMenu(itemId);
    setMenuPos({ x: e.clientX, y: e.clientY });
  };

  const allItems = [...directories, ...files];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Breadcrumbs */}
      <div className="flex items-center text-sm text-muted-foreground gap-1.5 flex-wrap">
        {breadcrumbs.map((crumb, idx) => (
          <div key={idx} className="flex items-center gap-1.5">
            {idx > 0 && <ChevronRight className="size-3.5" />}
            <button
              onClick={() => handleBreadcrumbClick(crumb.id)}
              className="hover:text-foreground cursor-pointer transition-colors"
            >
              {crumb.name}
            </button>
          </div>
        ))}
      </div>

      {/* Error message */}
      {error && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
          <AlertCircle className="size-4 shrink-0" />
          <span>{error}</span>
          <button onClick={() => setError(null)} className="ml-auto text-xs hover:underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-3 md:items-center">
        <div className="flex-1 flex items-center gap-2 glass rounded-xl px-3.5 py-2.5">
          <Search className="size-4 text-muted-foreground" />
          <input
            placeholder="Search files and folders…"
            className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground"
          />
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center glass rounded-xl p-1">
            <button
              onClick={() => setView("grid")}
              className={`p-1.5 rounded-lg transition-colors ${view === "grid" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
            >
              <Grid3x3 className="size-4" />
            </button>
            <button
              onClick={() => setView("list")}
              className={`p-1.5 rounded-lg transition-colors ${view === "list" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
            >
              <List className="size-4" />
            </button>
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="inline-flex items-center gap-1.5 rounded-xl gradient-primary text-primary-foreground px-3.5 py-2 text-sm font-medium shadow-soft hover:shadow-elegant transition-shadow disabled:opacity-50"
          >
            {isUploading ? <Loader className="size-4 animate-spin" /> : <Upload className="size-4" />}
            Upload
          </button>
          <button
            onClick={() => setShowCreateFolder(true)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-border text-foreground px-3.5 py-2 text-sm font-medium hover:bg-accent transition-colors"
          >
            <FolderPlus className="size-4" />
            New Folder
          </button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      </div>

      {/* Drag & drop area */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const files = e.dataTransfer.files;
          const event = new Event("change", { bubbles: true });
          Object.defineProperty(event, "target", { value: { files }, enumerable: true });
          handleFileSelect(event as any);
        }}
        className="rounded-2xl border-2 border-dashed border-border hover:border-primary/60 transition-colors p-8 text-center bg-accent/30"
      >
        <div className="size-12 mx-auto rounded-2xl gradient-soft grid place-items-center text-primary mb-3">
          <Upload className="size-5" />
        </div>
        <p className="text-sm font-medium">Drag & drop files here</p>
        <p className="text-xs text-muted-foreground mt-1">PDF, DOCX, MP4, images — up to 200 MB</p>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader className="size-8 animate-spin text-primary" />
        </div>
      )}

      {/* Empty state */}
      {!loading && allItems.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">This folder is empty</p>
          <p className="text-sm text-muted-foreground mt-1">Upload files or create a folder to get started</p>
        </div>
      )}

      {/* Folders section */}
      {!loading && directories.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold tracking-tight mb-3">Folders</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {directories.map((dir) => (
              <div
                key={dir.id}
                onClick={() => handleFolderClick(dir.id)}
                onContextMenu={(e) => handleContextMenu(e, dir.id, "directory")}
                className="glass rounded-2xl p-4 hover-lift cursor-pointer group relative"
              >
                <div className="size-10 rounded-xl bg-gradient-to-br from-indigo-400 to-purple-500 grid place-items-center text-white shadow-soft mb-3">
                  <Folder className="size-5" />
                </div>
                <p className="text-sm font-medium truncate">{dir.name}</p>
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    handleContextMenu(e, dir.id, "directory");
                  }}
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MoreVertical className="size-4 cursor-pointer" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Files section */}
      {!loading && files.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold tracking-tight mb-3">Files</h3>
          {view === "grid" ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {files.map((file) => {
                const Icon = getFileIcon(file.name);
                const progress = uploadProgress[file.id] || 0;
                return (
                  <div
                    key={file.id}
                    onContextMenu={(e) => handleContextMenu(e, file.id, "file")}
                    className="glass rounded-2xl p-4 hover-lift group relative"
                  >
                    {progress > 0 && progress < 100 && (
                      <div className="absolute inset-0 rounded-2xl bg-primary/10 flex items-center justify-center">
                        <div className="text-center">
                          <Loader className="size-6 animate-spin text-primary mx-auto mb-2" />
                          <p className="text-xs font-medium">{Math.floor(progress)}%</p>
                        </div>
                      </div>
                    )}
                    <div className="aspect-video rounded-xl gradient-soft grid place-items-center mb-3 text-primary">
                      <Icon className="size-8" />
                    </div>
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium truncate flex-1">{file.name}</p>
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          handleContextMenu(e, file.id, "file");
                        }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <MoreVertical className="size-4 cursor-pointer" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="glass rounded-2xl divide-y divide-border overflow-hidden">
              {files.map((file) => {
                const Icon = getFileIcon(file.name);
                const progress = uploadProgress[file.id] || 0;
                return (
                  <div
                    key={file.id}
                    onContextMenu={(e) => handleContextMenu(e, file.id, "file")}
                    className="flex items-center gap-3 p-3.5 hover:bg-accent/60 transition-colors relative"
                  >
                    {progress > 0 && progress < 100 && (
                      <div className="absolute inset-0 bg-primary/10 flex items-center justify-center">
                        <Loader className="size-4 animate-spin text-primary" />
                      </div>
                    )}
                    <div className="size-9 rounded-lg gradient-soft grid place-items-center text-primary">
                      <Icon className="size-4" />
                    </div>
                    <p className="flex-1 text-sm font-medium truncate">{file.name}</p>
                    <p className="text-xs text-muted-foreground w-20">{file.extension || "-"}</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Context Menu */}
      {activeMenu && (
        <div
          className="fixed inset-0"
          onClick={() => setActiveMenu(null)}
          onContextMenu={(e) => {
            e.preventDefault();
            setActiveMenu(null);
          }}
        >
          <div
            className="absolute bg-popover border border-border rounded-lg shadow-lg p-1 z-50 min-w-[160px]"
            style={{ top: `${menuPos.y}px`, left: `${menuPos.x}px` }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => {
                setRenameValue("");
                const item = [...directories, ...files].find((i) => i.id === activeMenu);
                if (item) {
                  setRenameValue(item.name);
                  setRenameItemId(activeMenu);
                  setRenameItemType(directories.find((d) => d.id === activeMenu) ? "directory" : "file");
                  setShowRenameModal(true);
                }
                setActiveMenu(null);
              }}
              className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-accent rounded transition-colors"
            >
              <Edit2 className="size-4" />
              Rename
            </button>
            <button
              onClick={() => {
                const isDir = directories.find((d) => d.id === activeMenu);
                handleDelete(activeMenu, isDir ? "directory" : "file");
              }}
              className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-destructive/10 text-destructive rounded transition-colors"
            >
              <Trash2 className="size-4" />
              Delete
            </button>
          </div>
        </div>
      )}

      {/* Create Folder Modal */}
      {showCreateFolder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowCreateFolder(false)}>
          <div className="bg-background border border-border rounded-lg p-6 w-96" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold mb-4">Create New Folder</h2>
            <input
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg mb-4 bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              autoFocus
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowCreateFolder(false)}
                className="px-4 py-2 rounded-lg border border-border hover:bg-accent transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateFolder}
                className="px-4 py-2 rounded-lg gradient-primary text-primary-foreground hover:shadow-elegant transition-shadow"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rename Modal */}
      {showRenameModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowRenameModal(false)}>
          <div className="bg-background border border-border rounded-lg p-6 w-96" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold mb-4">
              Rename {renameItemType === "file" ? "File" : "Folder"}
            </h2>
            <input
              type="text"
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg mb-4 bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              autoFocus
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowRenameModal(false)}
                className="px-4 py-2 rounded-lg border border-border hover:bg-accent transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleRename}
                className="px-4 py-2 rounded-lg gradient-primary text-primary-foreground hover:shadow-elegant transition-shadow"
              >
                Rename
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}