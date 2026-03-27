import type { Book } from "../types/book";

type CartBookDetailsModalProps = {
    book: Book | null;
    onClose: () => void;
};

/**
 * Single modal instance driven by `book`; renders nothing when `book` is null.
 */
export function CartBookDetailsModal({ book, onClose }: CartBookDetailsModalProps) {
    if (!book) {
        return null;
    }

    const rows: { label: string; value: string }[] = [
        { label: "Author", value: book.author },
        { label: "Publisher", value: book.publisher },
        { label: "ISBN", value: book.isbn },
        { label: "Classification", value: book.classification },
        { label: "Category", value: book.category },
    ];

    return (
        <>
            <div
                className="modal fade show stack-cart-modal"
                style={{ display: "block" }}
                tabIndex={-1}
                role="dialog"
                aria-modal="true"
                aria-labelledby="stack-cart-book-modal-title"
            >
                <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
                    <div className="modal-content stack-modal-content border-0 shadow">
                        <div className="modal-header stack-modal-header border-0 pb-3">
                            <h2
                                id="stack-cart-book-modal-title"
                                className="modal-title stack-modal-title h4 mb-0"
                            >
                                {book.title}
                            </h2>
                            <button
                                type="button"
                                className="btn-close"
                                onClick={onClose}
                                aria-label="Close"
                            />
                        </div>
                        <div className="modal-body pt-3">
                            <ul className="list-group list-group-flush stack-modal-list rounded-0">
                                {rows.map(({ label, value }) => (
                                    <li
                                        key={label}
                                        className="list-group-item stack-modal-list-item px-0"
                                    >
                                        <div className="stack-modal-row">
                                            <span className="stack-modal-label">
                                                {label}
                                            </span>
                                            <span className="stack-modal-value">
                                                {value}
                                            </span>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
            <div
                className="modal-backdrop fade show stack-modal-backdrop"
                onClick={onClose}
                aria-hidden="true"
            />
        </>
    );
}
