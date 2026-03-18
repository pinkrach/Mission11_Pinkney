import { useEffect, useMemo, useState } from "react";
import type { Book } from "./types/book";

function BookList() {

    const [books, setBooks] = useState<Book[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [pageSize, setPageSize] = useState<number>(5);
    const [page, setPage] = useState<number>(1);
    const [query, setQuery] = useState<string>("");

    useEffect(() => {
        const load = async () => {
            try {
                setError(null);
                const res = await fetch("http://localhost:5204/api/book");
                if (!res.ok) {
                    throw new Error(`Request failed: ${res.status} ${res.statusText}`);
                }
                const data = (await res.json()) as Book[];
                setBooks(data);
                setPage(1);
            } catch (e) {
                setError(e instanceof Error ? e.message : "Failed to load books");
            }
        };

        void load();
    }, []);

    const filtered = useMemo(
        () =>
            books.filter((b) =>
                b.title.toLowerCase().includes(query.trim().toLowerCase())
            ),
        [books, query]
    );

    const totalPages = useMemo(
        () => (filtered.length === 0 ? 1 : Math.ceil(filtered.length / pageSize)),
        [filtered.length, pageSize]
    );

    const currentPage = Math.min(page, totalPages);

    const pagedBooks = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return filtered.slice(start, start + pageSize);
    }, [filtered, currentPage, pageSize]);

    const pageSizeControl = (
        <label
            style={{
                fontSize: "0.9rem",
                color: "#475569",
                display: "flex",
                alignItems: "center",
                gap: "0.4rem",
            }}
        >
            Show
            <select
                value={pageSize}
                onChange={(e) => {
                    const next = Number(e.target.value);
                    setPageSize(next);
                    setPage(1);
                }}
                style={{
                    padding: "0.15rem 0.4rem",
                    borderRadius: "0.375rem",
                    border: "1px solid #cbd5f5",
                    fontSize: "0.9rem",
                }}
            >
                {[5, 10, 15, 20].map((size) => (
                    <option key={size} value={size}>
                        {size}
                    </option>
                ))}
            </select>
            books per page
        </label>
    );

    const searchControl = (
        <input
            type="search"
            placeholder="Search by title..."
            value={query}
            onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
            }}
            style={{
                padding: "0.35rem 0.6rem",
                borderRadius: "999px",
                border: "1px solid rgba(148, 163, 184, 0.7)",
                fontSize: "0.9rem",
                minWidth: "220px",
            }}
        />
    );

    const paginationControls = (
        <div
            style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.75rem",
                fontSize: "0.9rem",
            }}
        >
            <button
                type="button"
                disabled={currentPage <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                style={{
                    padding: "0.3rem 0.7rem",
                    borderRadius: "0.375rem",
                    border: "1px solid #cbd5f5",
                    background: currentPage <= 1 ? "#e5e7eb" : "white",
                    cursor: currentPage <= 1 ? "default" : "pointer",
                }}
            >
                Previous
            </button>
            <span style={{ color: "#64748b" }}>
                Page {currentPage} of {totalPages}
            </span>
            <button
                type="button"
                disabled={currentPage >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                style={{
                    padding: "0.3rem 0.7rem",
                    borderRadius: "0.375rem",
                    border: "1px solid #cbd5f5",
                    background: currentPage >= totalPages ? "#e5e7eb" : "white",
                    cursor: currentPage >= totalPages ? "default" : "pointer",
                }}
            >
                Next
            </button>
        </div>
    );
    
    return (
        <>
            <h1>Book List</h1>
            {error && <p style={{ color: "crimson" }}>{error}</p>}
            <div
                style={{
                    marginTop: "0.75rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.75rem",
                    flexDirection: "column",
                }}
            >
                <span style={{ fontSize: "0.8rem", color: "#64748b" }}>
                    {filtered.length} of {books.length} shown
                </span>
                <div
                    style={{
                        display: "flex",
                        gap: "0.75rem",
                        alignItems: "center",
                        flexWrap: "wrap",
                        justifyContent: "center",
                    }}
                >
                    {pageSizeControl}
                    {searchControl}
                </div>
                {paginationControls}
            </div>
            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "1.5rem",
                    marginTop: "1.5rem",
                    alignItems: "center",
                }}
            >
                {pagedBooks.map((b) => (
                    <article
                        key={b.bookID}
                        style={{
                            borderRadius: "0.75rem",
                            padding: "1.25rem 1.5rem",
                            boxShadow:
                                "0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1)",
                            background: "white",
                            border: "1px solid rgba(148, 163, 184, 0.4)",
                            width: "35%",
                            minWidth: "320px",
                            maxWidth: "520px",
                        }}
                    >
                        <header style={{ marginBottom: "0.25rem" }}>
                            <h2
                                style={{
                                    fontSize: "1.1rem",
                                    margin: 0,
                                    fontWeight: 600,
                                }}
                            >
                                {b.title}
                            </h2>
                            <p
                                style={{
                                    margin: "0.15rem 0 0",
                                    color: "#64748b",
                                    fontSize: "0.9rem",
                                }}
                            >
                                by {b.author}
                            </p>
                        </header>
                        <dl
                            style={{
                                display: "grid",
                                gridTemplateColumns: "auto 1fr",
                                rowGap: "0.25rem",
                                columnGap: "0.5rem",
                                margin: 0,
                                fontSize: "0.9rem",
                            }}
                        >
                            <dt style={{ fontWeight: 600 }}>Publisher</dt>
                            <dd style={{ margin: 0 }}>{b.publisher}</dd>

                            <dt style={{ fontWeight: 600 }}>ISBN</dt>
                            <dd style={{ margin: 0 }}>{b.isbn}</dd>

                            <dt style={{ fontWeight: 600 }}>Classification</dt>
                            <dd style={{ margin: 0 }}>{b.classification}</dd>

                            <dt style={{ fontWeight: 600 }}>Category</dt>
                            <dd style={{ margin: 0 }}>{b.category}</dd>

                            <dt style={{ fontWeight: 600 }}>Pages</dt>
                            <dd style={{ margin: 0 }}>{b.pageCount}</dd>

                            <dt style={{ fontWeight: 600 }}>Price</dt>
                            <dd style={{ margin: 0 }}>${b.price.toFixed(2)}</dd>
                        </dl>
                    </article>
                ))}
            </div>
            <div
                style={{
                    marginTop: "1.5rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexDirection: "column",
                    gap: "0.75rem",
                }}
            >
                {paginationControls}
                {pageSizeControl}
            </div>
        </>
    );
}

export default BookList;