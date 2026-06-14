const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000";

export async function getDirectory(id?: string) {
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

export async function createDirectory(parentDirId?: string, dirName: string = "New Folder") {
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

export async function renameDirectory(id: string, newName: string) {
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

export async function deleteDirectory(id: string) {
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

export async function uploadFile(
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

export async function deleteFile(id: string) {
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

export async function renameFile(id: string, newName: string) {
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

export async function getStarredItems() {
  const url = `${API_BASE}/file/starred/all`;
  const res = await fetch(url, { credentials: "include" });
  if (!res.ok) throw new Error("Failed to fetch starred items");
  return res.json();
}

export async function getUser() {
  const url = `${API_BASE}/user`;
  const res = await fetch(url, {
    method: "GET",
    credentials: "include",
  });
  if (!res.ok) {
    throw new Error("Not authenticated");
  }
  return res.json();
}

export function getFileUrl(id: string, action?: "download") {
  return `${API_BASE}/file/${id}${action ? `?action=${action}` : ""}`;
}
