import {
    useEffect,
    useLayoutEffect,
    useMemo,
    useState,
} from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import type { Book } from "./types/book";
import { useCart } from "./context/CartContext";

type PagedBooksResponse = {
    items: Book[];
    totalCount: number;
    page: number;
    pageSize: number;
};

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5204";

type CategorySummary = {
    category: string;
    count: number;
};

const BOOKLIST_STATE_KEY = "mission11-booklist-state";
const BOOKLIST_SCROLL_KEY = "mission11-booklist-scroll";

function parseCategorySummaries(data: unknown): CategorySummary[] {
    if (!Array.isArray(data) || data.length === 0) {
        return [];
    }
    const first = data[0];
    if (typeof first === "string") {
        return (data as string[]).map((c) => ({
            category: c,
            count: 0,
        }));
    }
    return data.map((row: Record<string, unknown>) => ({
        category: String(row.category ?? row.Category ?? ""),
        count: Number(row.count ?? row.Count ?? 0),
    }));
}

type BookListPersisted = {
    page: number;
    pageSize: number;
    query: string;
    sortBy: string;
    sortOrder: "asc" | "desc";
    selectedCategories: string[];
};

function readBookListPersisted(): Partial<BookListPersisted> | null {
    try {
        const raw = sessionStorage.getItem(BOOKLIST_STATE_KEY);
        if (!raw) {
            return null;
        }
        return JSON.parse(raw) as Partial<BookListPersisted>;
    } catch {
        return null;
    }
}

function BookList() {
    const location = useLocation();
    const navigate = useNavigate();
    const { addToCart } = useCart();

    const [books, setBooks] = useState<Book[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [categorySummaries, setCategorySummaries] = useState<CategorySummary[]>(
        []
    );
    /** Empty = "All categories" (no filter). Otherwise OR filter. */
    const [selectedCategories, setSelectedCategories] = useState<string[]>(
        () => readBookListPersisted()?.selectedCategories ?? []
    );
    const [pageSize, setPageSize] = useState<number>(
        () => readBookListPersisted()?.pageSize ?? 5
    );
    const [page, setPage] = useState<number>(
        () => readBookListPersisted()?.page ?? 1
    );
    const [query, setQuery] = useState<string>(
        () => readBookListPersisted()?.query ?? ""
    );
    const [sortBy, setSortBy] = useState<string>(
        () => readBookListPersisted()?.sortBy ?? "title"
    );
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">(
        () => readBookListPersisted()?.sortOrder ?? "asc"
    );
    const [totalCount, setTotalCount] = useState<number>(0);
    /** Avoid clamping page while totalCount is still initial 0 (before first API response). */
    const [catalogDataLoaded, setCatalogDataLoaded] = useState(false);
    const [isSmallScreen, setIsSmallScreen] = useState<boolean>(
        () => window.innerWidth <= 700
    );
    /** Bootstrap `md` and below: compact category strip at top, expandable list. */
    const [isNarrowLayout, setIsNarrowLayout] = useState<boolean>(() =>
        typeof window !== "undefined"
            ? window.matchMedia("(max-width: 767.98px)").matches
            : false
    );
    const [mobileCategoriesExpanded, setMobileCategoriesExpanded] =
        useState<boolean>(false);

    const selectAllCategories = () => {
        setPage(1);
        setSelectedCategories([]);
    };

    const handleAddToCart = (book: Book) => {
        addToCart(book);
        // Flush immediately so returning from cart reads latest filters / page (useEffect may not have run yet)
        const payload: BookListPersisted = {
            page,
            pageSize,
            query,
            sortBy,
            sortOrder,
            selectedCategories,
        };
        sessionStorage.setItem(BOOKLIST_STATE_KEY, JSON.stringify(payload));
        const returnTo = `${location.pathname}${location.search}`;
        navigate("/cart", { state: { returnTo } });
    };

    const toggleCategory = (cat: string) => {
        setPage(1);
        setSelectedCategories((prev) => {
            if (prev.length === 0) {
                return [cat];
            }
            if (prev.includes(cat)) {
                return prev.filter((c) => c !== cat);
            }
            return [...prev, cat];
        });
    };

    useEffect(() => {
        const onResize = () => setIsSmallScreen(window.innerWidth <= 700);
        window.addEventListener("resize", onResize);
        return () => window.removeEventListener("resize", onResize);
    }, []);

    useEffect(() => {
        const mq = window.matchMedia("(max-width: 767.98px)");
        const onChange = () => setIsNarrowLayout(mq.matches);
        mq.addEventListener("change", onChange);
        setIsNarrowLayout(mq.matches);
        return () => mq.removeEventListener("change", onChange);
    }, []);

    useEffect(() => {
        const payload: BookListPersisted = {
            page,
            pageSize,
            query,
            sortBy,
            sortOrder,
            selectedCategories,
        };
        sessionStorage.setItem(BOOKLIST_STATE_KEY, JSON.stringify(payload));
    }, [page, pageSize, query, sortBy, sortOrder, selectedCategories]);

    useEffect(() => {
        const onScroll = () => {
            sessionStorage.setItem(BOOKLIST_SCROLL_KEY, String(window.scrollY));
        };
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    useLayoutEffect(() => {
        const state = location.state as { restoreScroll?: boolean } | null;
        if (state?.restoreScroll) {
            const y = sessionStorage.getItem(BOOKLIST_SCROLL_KEY);
            if (y != null) {
                const top = Number(y);
                requestAnimationFrame(() => window.scrollTo(0, top));
            }
            navigate("/", { replace: true, state: {} });
        }
    }, [location.state, location.key, navigate]);

    useEffect(() => {
        const load = async () => {
            try {
                setError(null);
                const params = new URLSearchParams({
                    page: String(page),
                    pageSize: String(pageSize),
                    search: query,
                    sortBy,
                    sortOrder,
                });
                selectedCategories.forEach((c) => params.append("categories", c));

                const [booksRes, catsRes] = await Promise.all([
                    fetch(`${API_BASE}/api/book?${params.toString()}`),
                    fetch(`${API_BASE}/api/book/categories`),
                ]);

                if (!booksRes.ok) {
                    throw new Error(
                        `Request failed: ${booksRes.status} ${booksRes.statusText}`
                    );
                }

                if (catsRes.ok) {
                    const raw = await catsRes.json();
                    setCategorySummaries(parseCategorySummaries(raw));
                } else {
                    setCategorySummaries([]);
                }

                const data = (await booksRes.json()) as PagedBooksResponse;
                setBooks(data.items ?? []);
                setTotalCount(data.totalCount ?? 0);
            } catch (e) {
                setError(e instanceof Error ? e.message : "Failed to load books");
            } finally {
                setCatalogDataLoaded(true);
            }
        };

        void load();
    }, [page, pageSize, query, sortBy, sortOrder, selectedCategories]);

    const totalPages = useMemo(
        () => (totalCount === 0 ? 1 : Math.ceil(totalCount / pageSize)),
        [totalCount, pageSize]
    );

    useEffect(() => {
        if (!catalogDataLoaded) {
            return;
        }
        const maxPage =
            totalCount === 0 ? 1 : Math.ceil(totalCount / pageSize);
        if (page > maxPage) {
            setPage(Math.max(1, maxPage));
        }
    }, [catalogDataLoaded, totalCount, pageSize, page]);

    const totalArchiveBooks = useMemo(
        () => categorySummaries.reduce((sum, c) => sum + c.count, 0),
        [categorySummaries]
    );

    const breadcrumbCategoryLabel = useMemo(() => {
        if (selectedCategories.length === 0) {
            return "All categories";
        }
        return [...selectedCategories]
            .sort((a, b) => a.localeCompare(b))
            .join(" · ");
    }, [selectedCategories]);

    const pageSizeControl = (
        <label className="stack-toolbar" style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
            Show
            <select
                value={pageSize}
                onChange={(e) => {
                    const next = Number(e.target.value);
                    setPageSize(next);
                    setPage(1);
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
            className="stack-toolbar"
            type="search"
            placeholder="Search by title..."
            value={query}
            onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
            }}
        />
    );

    const sortControl = (
        <label className="stack-toolbar" style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
            Sort
            <select
                value={sortBy}
                onChange={(e) => {
                    setSortBy(e.target.value);
                    setPage(1);
                }}
            >
                <option value="title">Title</option>
                <option value="author">Author</option>
                <option value="publisher">Publisher</option>
                <option value="price">Price</option>
                <option value="pageCount">Pages</option>
            </select>
            <select
                value={sortOrder}
                onChange={(e) => {
                    setSortOrder(e.target.value as "asc" | "desc");
                    setPage(1);
                }}
            >
                <option value="asc">Asc</option>
                <option value="desc">Desc</option>
            </select>
        </label>
    );

    const paginationControls = (
        <div className="stack-pagination" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.75rem" }}>
            <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
                Previous
            </button>
            <span>
                Page {page} of {totalPages}
            </span>
            <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
                Next
            </button>
        </div>
    );
    
    const showFullCategoryPanel =
        !isNarrowLayout || mobileCategoriesExpanded;

    const categoryPanel = (
        <aside
            className={`stack-sidebar${
                isNarrowLayout
                    ? " stack-sidebar--in-flow stack-sidebar--narrow"
                    : " sticky-md-top stack-sticky-sidebar"
            }`}
        >
            {isNarrowLayout ? (
                <button
                    type="button"
                    className="stack-sidebar-collapse-toggle"
                    onClick={() =>
                        setMobileCategoriesExpanded((open) => !open)
                    }
                    aria-expanded={mobileCategoriesExpanded}
                    aria-controls="stack-category-expandable"
                >
                    <span className="stack-sidebar-title stack-sidebar-title--toggle">
                        Data — Categories
                    </span>
                    <span className="stack-sidebar-chevron" aria-hidden>
                        {mobileCategoriesExpanded ? "▼" : "▶"}
                    </span>
                </button>
            ) : (
                <h2 className="stack-sidebar-title">Data — Categories</h2>
            )}
            <div className="stack-sidebar-row">
                <label>
                    <input
                        type="checkbox"
                        checked={selectedCategories.length === 0}
                        onChange={() => selectAllCategories()}
                    />
                    <span className="stack-category-name">All Categories</span>
                </label>
                <span
                    className={`stack-pill${
                        selectedCategories.length === 0
                            ? " stack-pill-active"
                            : ""
                    }`}
                >
                    {totalArchiveBooks}
                </span>
            </div>
            {showFullCategoryPanel && (
                <div id="stack-category-expandable">
                    <ul
                        style={{
                            listStyle: "none",
                            margin: 0,
                            padding: 0,
                        }}
                    >
                        {categorySummaries.map(({ category: cat, count }) => (
                            <li key={cat}>
                                <div className="stack-sidebar-row">
                                    <label>
                                        <input
                                            type="checkbox"
                                            checked={selectedCategories.includes(
                                                cat
                                            )}
                                            onChange={() =>
                                                toggleCategory(cat)
                                            }
                                        />
                                        <span className="stack-category-name">
                                            {cat}
                                        </span>
                                    </label>
                                    <span
                                        className={`stack-pill${
                                            selectedCategories.includes(cat)
                                                ? " stack-pill-active"
                                                : ""
                                        }`}
                                    >
                                        {count}
                                    </span>
                                </div>
                            </li>
                        ))}
                    </ul>
                    <div className="stack-sidebar-perpage">
                        {pageSizeControl}
                    </div>
                </div>
            )}
        </aside>
    );

    const brandHeader = (
        <div className="text-center px-2 mb-3">
            <h1 className="stack-brand-heading">The Stack</h1>
            <p className="stack-brand-sub mb-0">
                Digital archive — browse the catalog
            </p>
        </div>
    );

    const searchSortToolbar = (
        <div className="d-flex flex-column align-items-center gap-3 mb-4">
            <div
                className={`d-flex gap-2 gap-md-3 align-items-center justify-content-center flex-wrap ${
                    isSmallScreen ? "flex-column" : "flex-md-row"
                }`}
            >
                {isSmallScreen ? (
                    <>
                        {searchControl}
                        {sortControl}
                    </>
                ) : (
                    <>
                        {sortControl}
                        {searchControl}
                    </>
                )}
            </div>
        </div>
    );

    const bookGrid = (
        <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-3 g-4">
            {books.map((b) => (
                <div key={b.bookID} className="col">
                    <article className="stack-book-card h-100 d-flex flex-column">
                        <header style={{ marginBottom: "0.35rem" }}>
                            <h2 className="stack-book-title">{b.title}</h2>
                            <p className="stack-book-author">by {b.author}</p>
                        </header>
                        <dl className="stack-meta stack-meta-grid flex-grow-1">
                            <dt>Publisher</dt>
                            <dd>{b.publisher}</dd>

                            <dt>ISBN</dt>
                            <dd>{b.isbn}</dd>

                            <dt>Classification</dt>
                            <dd>{b.classification}</dd>

                            <dt>Category</dt>
                            <dd>{b.category}</dd>

                            <dt>Pages</dt>
                            <dd>{b.pageCount}</dd>

                            <dt>Price</dt>
                            <dd>${b.price.toFixed(2)}</dd>
                        </dl>
                        <button
                            type="button"
                            className="stack-btn-primary mt-3"
                            onClick={() => handleAddToCart(b)}
                        >
                            Add to Cart
                        </button>
                    </article>
                </div>
            ))}
        </div>
    );

    const paginationTop = (
        <div className="d-flex flex-column align-items-center gap-3 mb-4">
            {paginationControls}
        </div>
    );

    const paginationBottom = (
        <div className="d-flex flex-column align-items-center gap-3 mt-4">
            {paginationControls}
            <span className="stack-toolbar" style={{ fontSize: "0.8rem" }}>
                {books.length} of {totalCount} shown
            </span>
        </div>
    );

    const catalogBreadcrumbs = (
        <nav className="stack-breadcrumb-nav" aria-label="Breadcrumb">
            <ol className="breadcrumb stack-breadcrumb mb-3 mb-lg-4 justify-content-center justify-content-md-start">
                <li className="breadcrumb-item">
                    <NavLink to="/" end className="stack-breadcrumb-link">
                        The Stack
                    </NavLink>
                </li>
                <li className="breadcrumb-item">Catalog</li>
                <li
                    className="breadcrumb-item active stack-breadcrumb-current"
                    aria-current="page"
                >
                    {breadcrumbCategoryLabel}
                </li>
            </ol>
        </nav>
    );

    return (
        <>
            <div className="container-fluid px-3 px-lg-4 pb-5 pt-4 mt-3">
                {isNarrowLayout ? (
                    <div className="row justify-content-center">
                        <div className="col-12 col-lg-10 col-xl-9">
                            {brandHeader}
                            {error && (
                                <p className="text-center text-danger mb-3">
                                    {error}
                                </p>
                            )}
                            {searchSortToolbar}
                            <div className="mb-4">{categoryPanel}</div>
                            {paginationTop}
                            {catalogBreadcrumbs}
                            {bookGrid}
                            {paginationBottom}
                        </div>
                    </div>
                ) : (
                    <div className="row g-4">
                        <div className="col-12 col-md-3 col-lg-2">
                            {categoryPanel}
                        </div>
                        <div className="col-12 col-md-9 col-lg-10">
                            {brandHeader}
                            {error && (
                                <p className="text-center text-danger mb-3">
                                    {error}
                                </p>
                            )}
                            {searchSortToolbar}
                            {paginationTop}
                            {catalogBreadcrumbs}
                            {bookGrid}
                            {paginationBottom}
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

export default BookList;