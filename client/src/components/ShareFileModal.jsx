import { useEffect, useRef } from "react";

function ShareFileModal({
  fileName,
  shareEmail,
  setShareEmail,
  onClose,
  onShareSubmit,
}) {
  const inputRef = useRef(null);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    if (inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>Share File</h2>
        <p className="modal-subtitle" title={fileName}>
          {fileName}
        </p>
        <form onSubmit={onShareSubmit}>
          <input
            ref={inputRef}
            type="email"
            className="modal-input"
            placeholder="Enter recipient email"
            value={shareEmail}
            onChange={(e) => setShareEmail(e.target.value)}
            required
          />
          <div className="modal-buttons">
            <button className="primary-button" type="submit">
              Share
            </button>
            <button className="secondary-button" type="button" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ShareFileModal;
