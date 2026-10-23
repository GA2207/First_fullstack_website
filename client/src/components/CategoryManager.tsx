import { useState } from 'react'
import type { SubmitEvent } from 'react'
import CategoryRow from './CategoryRow.tsx'
import type { Category, Recipe } from '../types.ts'
import { validateCategoryName } from '../validation.ts'

interface CategoryManagerProps {
    categories: Category[]
    recipes: Recipe[]
    onCreate: (name: string) => Promise<void>
    onRename: (id: number, name: string) => Promise<void>
    onDelete: (id: number) => Promise<void>
    onBack: () => void
}

export default function CategoryManager({ categories, recipes, onCreate, onRename, onDelete, onBack }: CategoryManagerProps) {
    const [name, setName] = useState<string>('')
    const [submitted, setSubmitted] = useState<boolean>(false)
    const [submitting, setSubmitting] = useState<boolean>(false)
    const [error, setError] = useState<string>('')

    const validation = validateCategoryName(name, categories)
    const fieldError = submitted && !validation.ok ? validation.error : ''

    async function handleCreate(event: SubmitEvent<HTMLFormElement>) {
        event.preventDefault()
        setSubmitted(true)
        if (!validation.ok) {
            return
        }
        setSubmitting(true)
        setError('')
        try {
            await onCreate(validation.value)
            setName('')
            setSubmitted(false)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error')
        }
        setSubmitting(false)
    }

    return (
        <section className="category-manager">
            <button type="button" onClick={onBack}>← Back</button>
            <h2>Categories</h2>
            <form onSubmit={handleCreate} noValidate>
                <div className="inline-form">
                    <input
                        type="text"
                        placeholder="New category name"
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                        aria-label="New category name"
                        aria-invalid={fieldError !== ''}
                    />
                    <button type="submit" className="primary" disabled={submitting}>{submitting ? 'Adding…' : 'Add'}</button>
                </div>
                {fieldError !== '' && <span className="field-error">{fieldError}</span>}
                {error !== '' && <p className="error">{error}</p>}
            </form>
            {categories.length === 0 ? (
                <p className="empty">No categories yet.</p>
            ) : (
                <ul className="category-list">
                    {categories.map((category) => (
                        <CategoryRow
                            key={category.id}
                            category={category}
                            categories={categories}
                            recipeCount={recipes.filter((recipe) => recipe.categoryId === category.id).length}
                            onRename={onRename}
                            onDelete={onDelete}
                        />
                    ))}
                </ul>
            )}
        </section>
    )
}