import { useEffect, useState } from 'react'
import { fetchRecipe } from '../api.ts'
import type { Category, Recipe } from '../types.ts'

interface RecipeDetailProps {
    id: number
    categories: Category[]
    onBack: () => void
    onEdit: (recipe: Recipe) => void
    onDelete: (id: number) => Promise<void>
}

export default function RecipeDetail({ id, categories, onBack, onEdit, onDelete }: RecipeDetailProps) {
    const [recipe, setRecipe] = useState<Recipe | null>(null)
    const [error, setError] = useState<string>('')
    const [deleting, setDeleting] = useState<boolean>(false)
    const [deleteError, setDeleteError] = useState<string>('')

    useEffect(() => {
        let ignore = false

        fetchRecipe(id)
            .then((data) => {
                if (!ignore) {
                    setRecipe(data)
                }
            })
            .catch((err: unknown) => {
                if (!ignore) {
                    setError(err instanceof Error ? err.message : 'Unknown error')
                }
            })
        return () => {
            ignore = true
        }
    }, [id])

    async function handleDelete(target: Recipe) {
        if (!window.confirm(`Delete "${target.name}"?`)) {
            return
        }
        setDeleting(true)
        setDeleteError('')
        try {
            await onDelete(target.id)
        } catch (err) {
            setDeleteError(err instanceof Error ? err.message : 'Unknown error')
            setDeleting(false)
        }
    }

    if (error !== '') {
        return (
            <section>
                <p className="error">{error}</p>
                <button type="button" onClick={onBack}>Back</button>
            </section>
        )
    }
    if (recipe === null) {
        return <p>Loading…</p>
    }

    const categoryName = categories.find((category) => category.id === recipe.categoryId)?.name

    return (
        <article className="recipe-detail">
            <button type="button" onClick={onBack} disabled={deleting}>← Back</button>
            {categoryName !== undefined && <span className="category">{categoryName}</span>}
            <h2>{recipe.name}</h2>
            <p className="meta">
                {recipe.preparationTime} min · <span className={`badge ${recipe.difficulty}`}>{recipe.difficulty}</span>
            </p>
            <h3>Ingredients</h3>
            <ul>
                {recipe.ingredients.map((ingredient, index) => (
                    <li key={index}>{ingredient}</li>
                ))}
            </ul>
            <h3>Instructions</h3>
            <p className="instructions">{recipe.instructions}</p>
            {deleteError !== '' && <p className="error">{deleteError}</p>}
            <div className="actions">
                <button type="button" onClick={() => onEdit(recipe)} disabled={deleting}>Edit</button>
                <button type="button" className="danger" onClick={() => handleDelete(recipe)} disabled={deleting}>
                    {deleting ? 'Deleting…' : 'Delete'}
                </button>
            </div>
        </article>
    )
}