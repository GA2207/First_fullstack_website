import { useState } from 'react'
import type { SubmitEvent } from 'react'
import type { Category } from '../types.ts'
import { validateCategoryName } from '../validation.ts'

interface CategoryRowProps {
    category: Category
    categories: Category[]
    recipeCount: number
    onRename: (id: number, name: string) => Promise<void>
    onDelete: (id: number) => Promise<void>
}

export default function CategoryRow({ category, categories, recipeCount, onRename, onDelete }: CategoryRowProps) {
    const [editing, setEditing] = useState<boolean>(false)
    const [draft, setDraft] = useState<string>(category.name)
    const [submitted, setSubmitted] = useState<boolean>(false)
    const [busy, setBusy] = useState<boolean>(false)
    const [error, setError] = useState<string>('')

    const validation = validateCategoryName(draft, categories, category.id)
    const fieldError = submitted && !validation.ok ? validation.error : ''

    function startEditing() {
        setDraft(category.name)
        setSubmitted(false)
        setError('')
        setEditing(true)
    }

    async function handleRename(event: SubmitEvent<HTMLFormElement>) {
        event.preventDefault()
        setSubmitted(true)
        if (!validation.ok) {
            return
        }
        setBusy(true)
        setError('')
        try {
            await onRename(category.id, validation.value)
            setEditing(false)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error')
        }
        setBusy(false)
    }

    async function handleDelete() {
        const warning = recipeCount > 0 ? `\n${recipeCount} recipe(s) will have no category anymore.` : ''

        if (!window.confirm(`Delete category "${category.name}"?${warning}`)) {
            return
        }
        setBusy(true)
        setError('')
        try {
            await onDelete(category.id)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error')
            setBusy(false)
        }
    }

    if (editing) {
        return (
            <li className="category-row">
                <form className="inline-form" onSubmit={handleRename} noValidate>
                    <input
                        type="text"
                        value={draft}
                        onChange={(event) => setDraft(event.target.value)}
                        aria-label="Category name"
                        aria-invalid={fieldError !== ''}
                        autoFocus
                    />
                    <button type="submit" className="primary" disabled={busy}>{busy ? 'Saving…' : 'Save'}</button>
                    <button type="button" onClick={() => setEditing(false)} disabled={busy}>Cancel</button>
                </form>
                {fieldError !== '' && <span className="field-error">{fieldError}</span>}
                {error !== '' && <p className="error">{error}</p>}
            </li>
        )
    }
    return (
        <li className="category-row">
            <div className="inline-form">
                <span className="category-name">
                    {category.name} <span className="meta">({recipeCount} recipe{recipeCount === 1 ? '' : 's'})</span>
                </span>
                <button type="button" onClick={startEditing} disabled={busy}>Rename</button>
                <button type="button" className="danger" onClick={handleDelete} disabled={busy}>
                    {busy ? 'Deleting…' : 'Delete'}
                </button>
            </div>
            {error !== '' && <p className="error">{error}</p>}
        </li>
    )
}