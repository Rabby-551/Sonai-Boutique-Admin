import Link from "next/link";

export function Pagination({
  page,
  totalPages,
  searchParams,
}: {
  page: number;
  totalPages: number;
  searchParams: Record<string, string | undefined>;
}) {
  if (totalPages <= 1) return null;
  const href = (next: number) => {
    const params = new URLSearchParams(
      Object.entries(searchParams).filter((item): item is [string, string] =>
        Boolean(item[1]),
      ),
    );
    params.set("page", String(next));
    return `/products?${params}`;
  };
  return (
    <nav className="pagination" aria-label="Product pages">
      <Link
        aria-disabled={page === 1}
        className="button secondary"
        href={href(Math.max(1, page - 1))}
      >
        Previous
      </Link>
      <span>
        Page {page} of {totalPages}
      </span>
      <Link
        aria-disabled={page === totalPages}
        className="button secondary"
        href={href(Math.min(totalPages, page + 1))}
      >
        Next
      </Link>
    </nav>
  );
}
