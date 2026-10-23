import { useState } from 'react'
import type { SubmitEvent } from 'react'
import { isDifficulty } from '../types.ts'
import type { Category, Difficulty, Recipe, RecipeInput } from '../types.ts'
import { validateRecipeForm } from '../validation.ts'
import type { RecipeFormErrors } from '../validation.ts'

interface RecipeFormProps {
    initial?: Recipe
    categories: Category[]
    submitLabel: string
    onSubmit: (input: RecipeInput) => Promise<void>
    onCancel: () => void
}

interface FieldErrorProps {
    id: string
    message: string | undefined
}

function FieldError({ id, message }: FieldErrorProps) {
    if (message === undefined) {
        return null
    }
    return <span id={id} className="field-error">{message}</span>
}

export default function RecipeForm({ initial, categories, submitLabel, onSubmit, onCancel }: RecipeFormProps) {
    const [name, setName] = useState<string>(initial?.name ?? '')
    const [preparationTime, setPreparationTime] = useState<string>(initial ? String(initial.preparationTime) : '')
    const [difficulty, setDifficulty] = useState<Difficulty>(initial?.difficulty ?? 'easy')
    const [ingredients, setIngredients] = useState<string>(initial?.ingredients.join('\n') ?? '')
    const [instructions, setInstructions] = useState<string>(initial?.instructions ?? '')
    const [categoryId, setCategoryId] = useState<string>(initial?.categoryId === undefined ? '' : String(initial.categoryId))
    const [submitted, setSubmitted] = useState<boolean>(false)
    const [submitting, setSubmitting] = useState<boolean>(false)
    const [error, setError] = useState<string>('')

    const validation = validateRecipeForm({ name, preparationTime, difficulty, ingredients, instructions, categoryId })
    const errors: RecipeFormErrors = submitted && !validation.ok ? validation.errors : {}

    async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
        event.preventDefault()
        setSubmitted(true)
        if (!validation.ok) {
            return
        }
        setSubmitting(true)
        setError('')
        try {
            await onSubmit(validation.value)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error')
            setSubmitting(false)
        }
    }

    return (
        <form className="recipe-form" onSubmit={handleSubmit} noValidate>
            <label>
                Name
                <input
                    type="text"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    aria-invalid={errors.name !== undefined}
                    aria-describedby="name-error"
                />
                <FieldError id="name-error" message={errors.name} />
            </label>
            <label>
                Preparation time (min)
                <input
                    type="number"
                    min="1"
                    step="1"
                    value={preparationTime}
                    onChange={(event) => setPreparationTime(event.target.value)}
                    aria-invalid={errors.preparationTime !== undefined}
                    aria-describedby="preparation-time-error"
                />
                <FieldError id="preparation-time-error" message={errors.preparationTime} />
            </label>
            <label>
                Difficulty
                <select
                    value={difficulty}
                    onChange={(event) => {
                        const value = event.target.value

                        if (isDifficulty(value)) {
                            setDifficulty(value)
                        }
                    }}
                >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                </select>
            </label>
            <label>
                Category
                <select value={categoryId} onChange={(event) => setCategoryId(event.target.value)}>
                    <option value="">No category</option>
                    {categories.map((category) => (
                        <option key={category.id} value={String(category.id)}>{category.name}</option>
                    ))}
                </select>
            </label>
            <label>
                Ingredients (one per line)
                <textarea
                    rows={6}
                    value={ingredients}
                    onChange={(event) => setIngredients(event.target.value)}
                    aria-invalid={errors.ingredients !== undefined}
                    aria-describedby="ingredients-error"
                />
                <FieldError id="ingredients-error" message={errors.ingredients} />
            </label>
            <label>
                Instructions
                <textarea
                    rows={6}
                    value={instructions}
                    onChange={(event) => setInstructions(event.target.value)}
                    aria-invalid={errors.instructions !== undefined}
                    aria-describedby="instructions-error"
                />
                <FieldError id="instructions-error" message={errors.instructions} />
            </label>
            {error !== '' && <p className="error">{error}</p>}
            <div className="actions">
                <button type="submit" className="primary" disabled={submitting}>{submitting ? 'Saving…' : submitLabel}</button>
                <button type="button" onClick={onCancel} disabled={submitting}>Cancel</button>
            </div>
        </form>
    )
}