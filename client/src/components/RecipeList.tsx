import RecipeCard from './RecipeCard.tsx'
import type { Category, Recipe } from '../types.ts'

interface RecipeListProps {
    recipes: Recipe[]
    categories: Category[]
    emptyMessage: string
    onSelect: (id: number) => void
}

export default function RecipeList({ recipes, categories, emptyMessage, onSelect }: RecipeListProps) {
    if (recipes.length === 0) {
        return <p className="empty">{emptyMessage}</p>
    }
    return (
        <ul className="recipe-list">
            {recipes.map((recipe) => (
                <RecipeCard
                    key={recipe.id}
                    recipe={recipe}
                    categoryName={categories.find((category) => category.id === recipe.categoryId)?.name}
                    onSelect={onSelect}
                />
            ))}
        </ul>
    )
}