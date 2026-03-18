import { useState } from "react";
import type { Book } from "./types/book";

type Props = {
    onAdded: () => void;
};

type NewBook = Omit<Book, "bookID">;

const empty: NewBook = {
    title: "",
    author: "",
    publisher: "",
    isbn: "",
    classification: "",
    category: "",
    pageCount: 0,
    price: 0,
};

function AddBook({ onAdded }: Props) {
    const [form, setForm] = useState<NewBook>(empty);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const set = <K extends keyof NewBook>(key: K, value: NewBook[K]) =>
        setForm((prev) => ({ ...prev, [key]: value }));

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setError(null);
            setSubmitting(true);

            const res = await fetch("http://localhost:5204/api/book", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });

            if (!res.ok) {
                const text = await res.text().catch(() => "");
                throw new Error(
                    `Request failed: ${res.status} ${res.statusText}${text ? ` — ${text}` : ""}`
                );
            }

            setForm(empty);
            onAdded();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to add book");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div style={{ display: "flex", justifyContent: "center", marginTop: "1.5rem" }}>
            <form
                onSubmit={submit}
                style={{
                    width: "35%",
                    minWidth: "320px",
                    maxWidth: "520px",
                    background: "white",
                    borderRadius: "0.75rem",
                    padding: "1.25rem 1.5rem",
                    border: "1px solid rgba(148, 163, 184, 0.4)",
                    boxShadow:
                        "0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1)",
                    textAlign: "left",
                }}
            >
                <h2 style={{ margin: 0, marginBottom: "0.75rem" }}>Add Book</h2>
                {error && <p style={{ color: "crimson", marginBottom: "0.75rem" }}>{error}</p>}

                <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "0.75rem" }}>
                    <Field label="Title">
                        <input value={form.title} onChange={(e) => set("title", e.target.value)} required />
                    </Field>
                    <Field label="Author">
                        <input value={form.author} onChange={(e) => set("author", e.target.value)} required />
                    </Field>
                    <Field label="Publisher">
                        <input
                            value={form.publisher}
                            onChange={(e) => set("publisher", e.target.value)}
                            required
                        />
                    </Field>
                    <Field label="ISBN">
                        <input value={form.isbn} onChange={(e) => set("isbn", e.target.value)} required />
                    </Field>
                    <Field label="Classification">
                        <input
                            value={form.classification}
                            onChange={(e) => set("classification", e.target.value)}
                            required
                        />
                    </Field>
                    <Field label="Category">
                        <input value={form.category} onChange={(e) => set("category", e.target.value)} required />
                    </Field>
                    <Field label="Page Count">
                        <input
                            type="number"
                            min={0}
                            value={form.pageCount}
                            onChange={(e) => set("pageCount", Number(e.target.value))}
                            required
                        />
                    </Field>
                    <Field label="Price">
                        <input
                            type="number"
                            min={0}
                            step="0.01"
                            value={form.price}
                            onChange={(e) => set("price", Number(e.target.value))}
                            required
                        />
                    </Field>
                </div>

                <div style={{ marginTop: "1rem", display: "flex", justifyContent: "flex-end" }}>
                    <button
                        type="submit"
                        disabled={submitting}
                        style={{
                            padding: "0.4rem 0.9rem",
                            borderRadius: "0.5rem",
                            border: "1px solid #cbd5f5",
                            background: submitting ? "#e5e7eb" : "white",
                            cursor: submitting ? "default" : "pointer",
                        }}
                    >
                        {submitting ? "Saving..." : "Add Book"}
                    </button>
                </div>
            </form>
        </div>
    );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <label style={{ display: "grid", gap: "0.35rem", fontSize: "0.9rem", color: "#475569" }}>
            <span>{label}</span>
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                }}
            >
                <div style={{ width: "100%" }}>{children}</div>
            </div>
            <style>
                {`
          input {
            width: 100%;
            box-sizing: border-box;
            padding: 0.4rem 0.55rem;
            border-radius: 0.5rem;
            border: 1px solid rgba(148, 163, 184, 0.6);
            font-size: 0.95rem;
          }
          input:focus {
            outline: 2px solid rgba(170, 59, 255, 0.35);
            outline-offset: 2px;
          }
        `}
            </style>
        </label>
    );
}

export default AddBook;

