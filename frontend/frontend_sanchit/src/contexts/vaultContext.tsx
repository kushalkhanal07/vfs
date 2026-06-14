import React, { createContext, useContext, useState, useCallback } from "react";
import * as api from "@/api/directory";

const VaultContext = createContext(null);

export function VaultProvider({ children }) {
  const [currentDir, setCurrentDir] = useState(null);
  const [folders, setFolders] = useState([]);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadDirectory = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getDirectory(id);
      // server expected shape: { directories: [...], files: [...] }
      setCurrentDir(data.directory || null);
      setFolders(data.directories || data.folders || []);
      setFiles(data.files || []);
      setLoading(false);
      return data;
    } catch (e) {
      setError(e.message || "Failed to load");
      setLoading(false);
      return null;
    }
  }, []);

  const upload = useCallback(
    async (parentDirId, file) => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.uploadFile(parentDirId, file);
        // Refresh directory after upload
        await loadDirectory(parentDirId);
        // notify analytics to refresh
        try { window.dispatchEvent(new CustomEvent("analytics:refresh")); } catch (e) {}
        setLoading(false);
        return res;
      } catch (e) {
        setError(e.message || "Upload failed");
        setLoading(false);
        throw e;
      }
    },
    [loadDirectory],
  );

  return (
    <VaultContext.Provider
      value={{ currentDir, folders, files, loading, error, loadDirectory, upload }}
    >
      {children}
    </VaultContext.Provider>
  );
}

export function useVault() {
  const ctx = useContext(VaultContext);
  if (!ctx) throw new Error("useVault must be used within VaultProvider");
  return ctx;
}
