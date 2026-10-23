import type { Recipe } from '../types.ts'

interface RecipeCardProps {
    recipe: Recipe
    categoryName: string | undefined
    onSelect: (id: number) => void
}

export default function RecipeCard({ recipe, categoryName, onSelect }: RecipeCardProps) {
    return (
        <li className="recipe-card">
            <button type="button" onClick={() => onSelect(recipe.id)}>
                {categoryName !== undefined && <span className="category">{categoryName}</span>}
                <h3>{recipe.name}</h3>
                <p className="meta">
                    {recipe.preparationTime} min · <span className={`badge ${recipe.difficulty}`}>{recipe.difficulty}</span>
                </p>
            </button>
        </li>
    )
}