import DirectoryList from "./DirectoryList";

function FileSection({
  title,
  description,
  items,
  emptyText,
  ...listProps
}) {
  return (
    <section className="file-section">
      <div className="file-section-header">
        <div>
          <h2>{title}</h2>
          {description ? <p>{description}</p> : null}
        </div>
        <span className="file-section-count">{items.length}</span>
      </div>

      {items.length > 0 ? (
        <DirectoryList items={items} {...listProps} />
      ) : (
        <div className="file-section-empty">{emptyText}</div>
      )}
    </section>
  );
}

export default FileSection;