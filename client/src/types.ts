export type Difficulty = 'easy' | 'medium' | 'hard'

export interface Recipe {
    id: number
    name: string
    preparationTime: number
    difficulty: Difficulty
    ingredients: string[]
    instructions: string
    categoryId?: number
}

export type RecipeInput = Omit<Recipe, 'id' | 'categoryId'> & { categoryId: number | null }

export interface Category {
    id: number
    name: string
}

export function isDifficulty(value: unknown): value is Difficulty {
    return value === 'easy' || value === 'medium' || value === 'hard'
}

export function isRecipe(value: unknown): value is Recipe {
    if (typeof value !== 'object' || value === null) {
        return false
    }
    return 'id' in value && typeof value.id === 'number'
    && 'name' in value && typeof value.name === 'string'
    && 'preparationTime' in value && typeof value.preparationTime === 'number'
    && 'difficulty' in value && isDifficulty(value.difficulty)
    && 'ingredients' in value && Array.isArray(value.ingredients)
    && value.ingredients.every((ingredient: unknown) => typeof ingredient === 'string')
    && 'instructions' in value && typeof value.instructions === 'string'
    && (!('categoryId' in value) || typeof value.categoryId === 'number')
}

export function isCategory(value: unknown): value is Category {
    if (typeof value !== 'object' || value === null) {
        return false
    }
    return 'id' in value && typeof value.id === 'number'
    && 'name' in value && typeof value.name === 'string'
}

export function withoutCategory(recipe: Recipe): Recipe {
    const copy = { ...recipe }

    delete copy.categoryId
    return copy
}