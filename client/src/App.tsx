import { useEffect, useState } from 'react'
import CategoryManager from './components/CategoryManager.tsx'
import RecipeDetail from './components/RecipeDetail.tsx'
import RecipeForm from './components/RecipeForm.tsx'
import RecipeList from './components/RecipeList.tsx'
import {
    createCategory,
    createRecipe,
    deleteCategory,
    deleteRecipe,
    fetchCategories,
    fetchRecipes,
    updateCategory,
    updateRecipe,
} from './api.ts'
import { withoutCategory } from './types.ts'
import type { Category, Recipe, RecipeInput } from './types.ts'

type View =
    | { kind: 'list' }
    | { kind: 'detail'; id: number }
    | { kind: 'create' }
    | { kind: 'edit'; recipe: Recipe }
    | { kind: 'categories' }

const ALL = 'all'
const UNCATEGORIZED = 'none'

export default function App() {
    const [recipes, setRecipes] = useState<Recipe[]>([])
    const [categories, setCategories] = useState<Category[]>([])
    const [loading, setLoading] = useState<boolean>(true)
    const [error, setError] = useState<string>('')
    const [view, setView] = useState<View>({ kind: 'list' })
    const [reloadKey, setReloadKey] = useState<number>(0)
    const [invalidCount, setInvalidCount] = useState<number>(0)
    const [filter, setFilter] = useState<string>(ALL)

    useEffect(() => {
        let ignore = false

        Promise.all([fetchRecipes(), fetchCategories()])
            .then(([recipesResult, categoriesResult]) => {
                if (!ignore) {
                    setRecipes(recipesResult.recipes)
                    setInvalidCount(recipesResult.invalidCount)
                    setCategories(categoriesResult)
                }
            })
            .catch((err: unknown) => {
                if (!ignore) {
                    setError(err instanceof Error ? err.message : 'Unknown error')
                }
            })
            .finally(() => {
                if (!ignore) {
                    setLoading(false)
                }
            })
        return () => {
            ignore = true
        }
    }, [reloadKey])

    function handleRetry() {
        setLoading(true)
        setError('')
        setReloadKey((current) => current + 1)
    }

    async function handleCreate(input: RecipeInput) {
        const created = await createRecipe(input)

        setRecipes((current) => [...current, created])
        setView({ kind: 'detail', id: created.id })
    }

    async function handleUpdate(id: number, input: RecipeInput) {
        const updated = await updateRecipe(id, input)

        setRecipes((current) => current.map((recipe) => (recipe.id === id ? updated : recipe)))
        setView({ kind: 'detail', id: id })
    }

    async function handleDelete(id: number) {
        await deleteRecipe(id)
        setRecipes((current) => current.filter((recipe) => recipe.id !== id))
        setView({ kind: 'list' })
    }

    async function handleCreateCategory(name: string) {
        const created = await createCategory(name)

        setCategories((current) => [...current, created])
    }

    async function handleRenameCategory(id: number, name: string) {
        const updated = await updateCategory(id, name)

        setCategories((current) => current.map((category) => (category.id === id ? updated : category)))
    }

    async function handleDeleteCategory(id: number) {
        await deleteCategory(id)
        setCategories((current) => current.filter((category) => category.id !== id))
        setRecipes((current) => current.map((recipe) => (recipe.categoryId === id ? withoutCategory(recipe) : recipe)))
        if (filter === String(id)) {
            setFilter(ALL)
        }
    }

    function renderList() {
        if (loading) {
            return <p>Loading…</p>
        }
        if (error !== '') {
            return (
                <div className="error-box">
                    <p className="error">{error}</p>
                    <button type="button" onClick={handleRetry}>Retry</button>
                </div>
            )
        }
        const visibleRecipes = recipes.filter((recipe) => {
            if (filter === ALL) {
                return true
            }
            if (filter === UNCATEGORIZED) {
                return recipe.categoryId === undefined
            }
            return recipe.categoryId === Number(filter)
        })

        return (
            <>
                {invalidCount > 0 && (
                    <p className="warning">
                        {invalidCount} recipe(s) could not be displayed because the server sent invalid data.
                    </p>
                )}
                <label className="filter">
                    Category
                    <select value={filter} onChange={(event) => setFilter(event.target.value)}>
                        <option value={ALL}>All categories</option>
                        {categories.map((category) => (
                            <option key={category.id} value={String(category.id)}>{category.name}</option>
                        ))}
                        <option value={UNCATEGORIZED}>No category</option>
                    </select>
                </label>
                <RecipeList
                    recipes={visibleRecipes}
                    categories={categories}
                    emptyMessage={recipes.length === 0 ? 'No recipes yet. Create your first one!' : 'No recipe in this category.'}
                    onSelect={(id) => setView({ kind: 'detail', id: id })}
                />
            </>
        )
    }

    function renderView() {
        switch (view.kind) {
            case 'detail':
                return (
                    <RecipeDetail
                        key={view.id}
                        id={view.id}
                        categories={categories}
                        onBack={() => setView({ kind: 'list' })}
                        onEdit={(recipe) => setView({ kind: 'edit', recipe: recipe })}
                        onDelete={handleDelete}
                    />
                )
            case 'create':
                return (
                    <RecipeForm
                        categories={categories}
                        submitLabel="Create recipe"
                        onSubmit={handleCreate}
                        onCancel={() => setView({ kind: 'list' })}
                    />
                )
            case 'edit':
                return (
                    <RecipeForm
                        initial={view.recipe}
                        categories={categories}
                        submitLabel="Save changes"
                        onSubmit={(input) => handleUpdate(view.recipe.id, input)}
                        onCancel={() => setView({ kind: 'detail', id: view.recipe.id })}
                    />
                )
            case 'categories':
                return (
                    <CategoryManager
                        categories={categories}
                        recipes={recipes}
                        onCreate={handleCreateCategory}
                        onRename={handleRenameCategory}
                        onDelete={handleDeleteCategory}
                        onBack={() => setView({ kind: 'list' })}
                    />
                )
            case 'list':
                return (
                    <>
                        <div className="toolbar">
                            <h2>Recipes</h2>
                            <div className="actions">
                                <button type="button" onClick={() => setView({ kind: 'categories' })} disabled={loading || error !== ''}>
                                    Categories
                                </button>
                                <button type="button" className="primary" onClick={() => setView({ kind: 'create' })}>+ New recipe</button>
                            </div>
                        </div>
                        {renderList()}
                    </>
                )
        }
    }

    return (
        <>
            <header>
                <h1>Recipe manager</h1>
            </header>
            <main>
                {renderView()}
            </main>
        </>
    )
}