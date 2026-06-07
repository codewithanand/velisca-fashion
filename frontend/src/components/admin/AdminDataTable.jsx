import { ChevronDown, Search } from 'lucide-react';
import AdminLoader from './AdminLoader';
import AdminEmptyState from './AdminEmptyState';
import AdminPagination from './AdminPagination';

export default function AdminDataTable({
  columns,
  data,
  loading,
  searchable,
  searchValue,
  onSearch,
  searchPlaceholder = 'Search...',
  currentPage,
  totalPages,
  onPageChange,
  emptyTitle = 'No data found',
  emptyDescription = 'There are no records to display.',
  emptyIcon,
  onEmptyAction,
  emptyActionLabel,
}) {
  if (loading) return <AdminLoader />;

  return (
    <div>
      {searchable && (
        <div className="relative mb-4">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary" />
          <input
            type="text"
            value={searchValue}
            onChange={(e) => onSearch(e.target.value)}
            placeholder={searchPlaceholder}
            className="admin-input pl-10"
          />
        </div>
      )}

      {data.length === 0 ? (
        <AdminEmptyState
          icon={emptyIcon}
          title={emptyTitle}
          description={emptyDescription}
          actionLabel={emptyActionLabel}
          onAction={onEmptyAction}
        />
      ) : (
        <>
          <div className="overflow-x-auto -mx-5">
            <table className="admin-table mobile-table-card">
              <thead>
                <tr>
                  {columns.map((col) => (
                    <th key={col.key} className={col.className}>{col.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((row, i) => (
                  <tr key={row.id || i} className="table-row-hover">
                    {columns.map((col) => (
                      <td key={col.key} data-label={col.label}>
                        {col.render ? col.render(row) : row[col.key]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {currentPage && totalPages && onPageChange && (
            <AdminPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={onPageChange}
            />
          )}
        </>
      )}
    </div>
  );
}
