import {
    createContext,
    useCallback,
    useContext,
    useMemo,
    useState,
    type ReactNode,
} from "react";
import type { Book } from "../types/book";

const STORAGE_KEY = "mission11-cart";

export type CartLine = {
    book: Book;
    quantity: number;
};

type CartContextValue = {
    lines: CartLine[];
    totalItemCount: number;
    grandTotal: number;
    addToCart: (book: Book) => void;
    adjustQuantity: (bookId: number, delta: number) => void;
    setQuantity: (bookId: number, quantity: number) => void;
    /** Removes the line entirely (all copies of that book). */
    removeLine: (bookId: number) => void;
};

const CartContext = createContext<CartContextValue | null>(null);

function loadFromStorage(): CartLine[] {
    try {
        const raw = sessionStorage.getItem(STORAGE_KEY);
        if (!raw) {
            return [];
        }
        const parsed = JSON.parse(raw) as unknown;
        if (!Array.isArray(parsed)) {
            return [];
        }
        return parsed.filter(
            (row): row is CartLine =>
                row &&
                typeof row === "object" &&
                "book" in row &&
                "quantity" in row &&
                typeof (row as CartLine).quantity === "number"
        );
    } catch {
        return [];
    }
}

function saveToStorage(lines: CartLine[]) {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
}

export function CartProvider({ children }: { children: ReactNode }) {
    const [lines, setLines] = useState<CartLine[]>(() => loadFromStorage());

    const addToCart = useCallback(
        (book: Book) => {
            setLines((prev) => {
                const idx = prev.findIndex((l) => l.book.bookID === book.bookID);
                let next: CartLine[];
                if (idx >= 0) {
                    next = [...prev];
                    next[idx] = {
                        ...next[idx],
                        quantity: next[idx].quantity + 1,
                    };
                } else {
                    next = [...prev, { book, quantity: 1 }];
                }
                saveToStorage(next);
                return next;
            });
        },
        []
    );

    const adjustQuantity = useCallback((bookId: number, delta: number) => {
        setLines((prev) => {
            const next = prev
                .map((line) =>
                    line.book.bookID === bookId
                        ? { ...line, quantity: line.quantity + delta }
                        : line
                )
                .filter((line) => line.quantity > 0);
            saveToStorage(next);
            return next;
        });
    }, []);

    const setQuantity = useCallback((bookId: number, quantity: number) => {
        if (quantity < 1) {
            setLines((prev) => {
                const next = prev.filter((l) => l.book.bookID !== bookId);
                saveToStorage(next);
                return next;
            });
            return;
        }
        setLines((prev) => {
            const next = prev.map((line) =>
                line.book.bookID === bookId ? { ...line, quantity } : line
            );
            saveToStorage(next);
            return next;
        });
    }, []);

    const removeLine = useCallback((bookId: number) => {
        setLines((prev) => {
            const next = prev.filter((l) => l.book.bookID !== bookId);
            saveToStorage(next);
            return next;
        });
    }, []);

    const totalItemCount = useMemo(
        () => lines.reduce((sum, l) => sum + l.quantity, 0),
        [lines]
    );

    const grandTotal = useMemo(
        () =>
            lines.reduce(
                (sum, l) => sum + l.book.price * l.quantity,
                0
            ),
        [lines]
    );

    const value = useMemo<CartContextValue>(
        () => ({
            lines,
            totalItemCount,
            grandTotal,
            addToCart,
            adjustQuantity,
            setQuantity,
            removeLine,
        }),
        [
            lines,
            totalItemCount,
            grandTotal,
            addToCart,
            adjustQuantity,
            setQuantity,
            removeLine,
        ]
    );

    return (
        <CartContext.Provider value={value}>{children}</CartContext.Provider>
    );
}

export function useCart(): CartContextValue {
    const ctx = useContext(CartContext);
    if (!ctx) {
        throw new Error("useCart must be used within a CartProvider");
    }
    return ctx;
}
