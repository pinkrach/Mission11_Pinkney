import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Book } from "./types/book";

type NewBook = Omit<Book, "bookID">;

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5204";

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

function AddBook() {
    const navigate = useNavigate();
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

            const res = await fetch(`${API_BASE}/api/book`, {
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
            navigate("/");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to add book");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="container py-4 mt-4">
            <div className="row justify-content-center">
                <div className="col-12 col-md-10 col-lg-8 col-xl-6">
            <form
                onSubmit={submit}
                className="stack-form-card"
                style={{
                    width: "100%",
                    maxWidth: "520px",
                    margin: "0 auto",
                    textAlign: "left",
                }}
            >
                <h1 className="stack-brand-heading" style={{ marginBottom: "0.25rem" }}>
                    The Stack
                </h1>
                <p className="stack-brand-sub" style={{ marginBottom: "1rem" }}>
                    New acquisition
                </p>
                <h2 className="stack-form-title">Add Book</h2>
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
                        className="stack-btn-primary"
                        disabled={submitting}
                        style={{
                            width: "auto",
                            marginTop: 0,
                            opacity: submitting ? 0.65 : 1,
                            cursor: submitting ? "not-allowed" : "pointer",
                        }}
                    >
                        {submitting ? "Saving..." : "Add Book"}
                    </button>
                </div>
            </form>
                </div>
            </div>
        </div>
    );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <label
            className="stack-toolbar"
            style={{ display: "grid", gap: "0.35rem", color: "var(--stack-ink-muted, #4a4f6a)" }}
        >
            <span style={{ fontFamily: "var(--stack-mono, 'Roboto Mono', monospace)", fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</span>
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
            outline: 2px solid rgba(0, 122, 255, 0.45);
            outline-offset: 2px;
          }
        `}
            </style>
        </label>
    );
}

export default AddBook;

