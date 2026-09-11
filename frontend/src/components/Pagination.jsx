const Pagination = ({ page, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  return (
    <div className="join mt-8 mb-4">
      <button
        type="button"
        className="join-item btn btn-xs"
        onClick={() => onPageChange(Math.max(page - 1, 1))}
        disabled={page === 1}
      >
        «
      </button>

      {Array.from({ length: totalPages }).map((_, i) => {
        const pageNum = i + 1;
        return (
          <input
            key={pageNum}
            className="join-item btn btn-xs btn-square"
            type="radio"
            name="marketplace-pagination"
            aria-label={pageNum}
            checked={page === pageNum}
            onChange={() => onPageChange(pageNum)}
          />
        );
      })}

      <button
        type="button"
        className="join-item btn btn-xs"
        onClick={() => onPageChange(Math.min(page + 1, totalPages))}
        disabled={page === totalPages}
      >
        »
      </button>
    </div>
  );
};

export default Pagination;
