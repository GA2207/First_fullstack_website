import type { Category, Difficulty, RecipeInput } from './types.ts'

export interface RecipeFormValues {
    name: string
    preparationTime: string
    difficulty: Difficulty
    ingredients: string
    instructions: string
    categoryId: string
}

export type RecipeFormErrors = Partial<Record<keyof RecipeFormValues, string>>

export type FormValidation =
    | { ok: true; value: RecipeInput }
    | { ok: false; errors: RecipeFormErrors }

const NAME_MAX_LENGTH = 100
const PREPARATION_TIME_MAX = 10080
const CATEGORY_NAME_MAX_LENGTH = 50

export function validateRecipeForm(values: RecipeFormValues): FormValidation {
    const errors: RecipeFormErrors = {}
    const name = values.name.trim()
    const preparationTime = Number(values.preparationTime)
    const ingredients = values.ingredients.split('\n').map((line) => line.trim()).filter((line) => line !== '')
    const instructions = values.instructions.trim()

    if (name === '') {
        errors.name = 'Name is required.'
    } else if (name.length > NAME_MAX_LENGTH) {
        errors.name = `Name must be at most ${NAME_MAX_LENGTH} characters.`
    }
    if (values.preparationTime.trim() === '') {
        errors.preparationTime = 'Preparation time is required.'
    } else if (!Number.isInteger(preparationTime) || preparationTime <= 0) {
        errors.preparationTime = 'Preparation time must be a whole number of minutes greater than 0.'
    } else if (preparationTime > PREPARATION_TIME_MAX) {
        errors.preparationTime = `Preparation time must be at most ${PREPARATION_TIME_MAX} minutes (7 days).`
    }
    if (ingredients.length === 0) {
        errors.ingredients = 'Add at least one ingredient (one per line).'
    }
    if (instructions === '') {
        errors.instructions = 'Instructions are required.'
    }
    if (Object.keys(errors).length > 0) {
        return { ok: false, errors: errors }
    }
    return {
        ok: true,
        value: {
            name: name,
            preparationTime: preparationTime,
            difficulty: values.difficulty,
            ingredients: ingredients,
            instructions: instructions,
            categoryId: values.categoryId === '' ? null : Number(values.categoryId),
        },
    }
}

export type NameValidation =
    | { ok: true; value: string }
    | { ok: false; error: string }

export function validateCategoryName(input: string, categories: Category[], exceptId?: number): NameValidation {
    const name = input.trim()

    if (name === '') {
        return { ok: false, error: 'Category name is required.' }
    }
    if (name.length > CATEGORY_NAME_MAX_LENGTH) {
        return { ok: false, error: `Category name must be at most ${CATEGORY_NAME_MAX_LENGTH} characters.` }
    }
    if (categories.some((category) => category.id !== exceptId && category.name.toLowerCase() === name.toLowerCase())) {
        return { ok: false, error: 'A category with this name already exists.' }
    }
    return { ok: true, value: name }
}