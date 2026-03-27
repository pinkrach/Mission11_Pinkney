import type { CSSProperties } from "react";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { CartBookDetailsModal } from "../components/CartBookDetailsModal";
import { useCart } from "../context/CartContext";
import type { Book } from "../types/book";

function safeReturnPath(raw: unknown): string {
    if (typeof raw !== "string" || raw.length === 0) {
        return "/";
    }
    if (!raw.startsWith("/") || raw.startsWith("//")) {
        return "/";
    }
    return raw;
}

function CartPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { lines, grandTotal, adjustQuantity, removeLine } = useCart();
    const [selectedBook, setSelectedBook] = useState<Book | null>(null);

    useEffect(() => {
        if (!selectedBook) {
            return;
        }
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                setSelectedBook(null);
            }
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [selectedBook]);

    useEffect(() => {
        if (!selectedBook) {
            return;
        }
        const prev = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = prev;
        };
    }, [selectedBook]);

    const continueShopping = () => {
        const st = location.state as { returnTo?: string } | null;
        const to = safeReturnPath(st?.returnTo);
        navigate(to, { state: { restoreScroll: true } });
    };

    const checkout = () => {
        window.alert("This feature is coming soon!");
    };

    return (
        <>
            <div className="container py-4 mt-4">
                <div className="row justify-content-center">
                    <div className="col-12 col-lg-10 col-xl-9">
                        <div className="stack-cart-page">
                            <h1 className="stack-cart-title">The Stack — Cart</h1>
                            <p
                                className="stack-brand-sub"
                                style={{ marginBottom: "1.25rem" }}
                            >
                                Session archive · review selections
                            </p>

                            {lines.length === 0 ? (
                                <p
                                    style={{
                                        color: "var(--stack-ink-muted, #4a4f6a)",
                                    }}
                                >
                                    Your cart is empty.
                                </p>
                            ) : (
                                <div className="table-responsive">
                                <table className="stack-table">
                                    <thead>
                                        <tr>
                                            <th style={{ textAlign: "left" }}>
                                                Title
                                            </th>
                                            <th style={{ textAlign: "right" }}>
                                                Price
                                            </th>
                                            <th style={{ textAlign: "center" }}>
                                                Quantity
                                            </th>
                                            <th style={{ textAlign: "right" }}>
                                                Subtotal
                                            </th>
                                            <th
                                                style={{ textAlign: "center" }}
                                                scope="col"
                                            >
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {lines.map((line) => {
                                            const sub =
                                                line.book.price * line.quantity;
                                            return (
                                                <tr key={line.book.bookID}>
                                                    <td>
                                                        <span className="stack-table-title">
                                                            {line.book.title}
                                                        </span>
                                                    </td>
                                                    <td
                                                        className="stack-table-mono"
                                                        style={{
                                                            textAlign: "right",
                                                        }}
                                                    >
                                                        $
                                                        {line.book.price.toFixed(
                                                            2
                                                        )}
                                                    </td>
                                                    <td
                                                        style={{
                                                            textAlign: "center",
                                                        }}
                                                    >
                                                        <div
                                                            style={{
                                                                display:
                                                                    "inline-flex",
                                                                alignItems:
                                                                    "center",
                                                                gap: "0.5rem",
                                                            }}
                                                        >
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    adjustQuantity(
                                                                        line
                                                                            .book
                                                                            .bookID,
                                                                        -1
                                                                    )
                                                                }
                                                                style={
                                                                    qtyBtnStyle
                                                                }
                                                            >
                                                                −
                                                            </button>
                                                            <span
                                                                className="stack-table-mono"
                                                                style={{
                                                                    minWidth:
                                                                        "1.5rem",
                                                                    textAlign:
                                                                        "center",
                                                                }}
                                                            >
                                                                {line.quantity}
                                                            </span>
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    adjustQuantity(
                                                                        line
                                                                            .book
                                                                            .bookID,
                                                                        1
                                                                    )
                                                                }
                                                                style={
                                                                    qtyBtnStyle
                                                                }
                                                            >
                                                                +
                                                            </button>
                                                        </div>
                                                    </td>
                                                    <td
                                                        className="stack-table-mono"
                                                        style={{
                                                            textAlign: "right",
                                                            fontWeight: 600,
                                                        }}
                                                    >
                                                        ${sub.toFixed(2)}
                                                    </td>
                                                    <td
                                                        style={{
                                                            textAlign: "center",
                                                        }}
                                                    >
                                                        <div className="stack-cart-actions-cell">
                                                            <button
                                                                type="button"
                                                                className="stack-cart-details-btn"
                                                                onClick={() =>
                                                                    setSelectedBook(
                                                                        line.book
                                                                    )
                                                                }
                                                                aria-label={`Details for ${line.book.title}`}
                                                            >
                                                                <span
                                                                    className="stack-cart-details-icon"
                                                                    aria-hidden
                                                                >
                                                                    <svg
                                                                        width="16"
                                                                        height="16"
                                                                        viewBox="0 0 24 24"
                                                                        fill="none"
                                                                        xmlns="http://www.w3.org/2000/svg"
                                                                    >
                                                                        <circle
                                                                            cx="12"
                                                                            cy="12"
                                                                            r="9"
                                                                            stroke="currentColor"
                                                                            strokeWidth="2"
                                                                        />
                                                                        <path
                                                                            d="M12 10v3M12 8h.01"
                                                                            stroke="currentColor"
                                                                            strokeWidth="2"
                                                                            strokeLinecap="round"
                                                                        />
                                                                    </svg>
                                                                </span>
                                                                Details
                                                            </button>
                                                            <button
                                                                type="button"
                                                                className="stack-cart-remove"
                                                                onClick={() =>
                                                                    removeLine(
                                                                        line.book
                                                                            .bookID
                                                                    )
                                                                }
                                                                aria-label={`Remove ${line.book.title} from cart`}
                                                            >
                                                                Delete
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {lines.length > 0 && (
                            <div className="stack-grand-total">
                                <span className="stack-grand-total-label">
                                    Grand Total
                                </span>
                                <span className="stack-grand-total-value">
                                    ${grandTotal.toFixed(2)}
                                </span>
                            </div>
                        )}

                        <div className="row justify-content-center justify-content-md-start g-3 mt-4">
                            <div className="col-auto">
                                <button
                                    type="button"
                                    onClick={continueShopping}
                                    className="stack-btn-secondary"
                                >
                                    Continue Shopping
                                </button>
                            </div>
                            <div className="col-auto">
                                <button
                                    type="button"
                                    onClick={checkout}
                                    disabled={lines.length === 0}
                                    className="stack-btn-checkout"
                                    style={{
                                        opacity:
                                            lines.length === 0 ? 0.45 : 1,
                                        cursor:
                                            lines.length === 0
                                                ? "not-allowed"
                                                : "pointer",
                                    }}
                                >
                                    Checkout
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            </div>

            <CartBookDetailsModal
                book={selectedBook}
                onClose={() => setSelectedBook(null)}
            />
        </>
    );
}

const qtyBtnStyle: CSSProperties = {
    width: "2rem",
    height: "2rem",
    borderRadius: "0.375rem",
    border: "1px solid var(--stack-border, #e2e4ec)",
    background: "#fff",
    cursor: "pointer",
    fontSize: "1rem",
    lineHeight: 1,
    fontFamily: "var(--stack-mono, 'Roboto Mono', monospace)",
    color: "var(--stack-ink, #1a1c2c)",
};

export default CartPage;
