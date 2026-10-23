import { isCategory, isRecipe } from './types.ts'
import type { Category, Recipe, RecipeInput } from './types.ts'

const envUrl: unknown = import.meta.env.VITE_API_URL
const API_URL = typeof envUrl === 'string' && envUrl !== '' ? envUrl : 'http://localhost:3000'

async function request(path: string, init?: RequestInit): Promise<Response> {
    try {
        return await fetch(`${API_URL}${path}`, init)
    } catch {
        throw new Error(`Cannot reach the API at ${API_URL}. Is the server running?`)
    }
}

async function readJson(response: Response): Promise<unknown> {
    try {
        return await response.json()
    } catch {
        throw new Error('Unexpected response: the server did not send valid JSON')
    }
}

async function readError(response: Response): Promise<string> {
    const body: unknown = await response.json().catch(() => null)

    if (typeof body !== 'object' || body === null || !('error' in body) || typeof body.error !== 'string') {
        return `HTTP ${response.status}`
    }
    if ('details' in body && Array.isArray(body.details) && body.details.length > 0) {
        return `${body.error}: ${body.details.join(', ')}`
    }
    return body.error
}

async function readItem<T>(response: Response, isValid: (value: unknown) => value is T, label: string): Promise<T> {
    if (!response.ok) {
        throw new Error(await readError(response))
    }
    const data = await readJson(response)

    if (!isValid(data)) {
        throw new Error(`Unexpected response: invalid ${label}`)
    }
    return data
}

function readRecipe(response: Response): Promise<Recipe> {
    return readItem(response, isRecipe, 'recipe')
}

function readCategory(response: Response): Promise<Category> {
    return readItem(response, isCategory, 'category')
}
export interface RecipesResult {
    recipes: Recipe[]
    invalidCount: number
}

export async function fetchRecipes(): Promise<RecipesResult> {
    const response = await request('/recipes')

    if (!response.ok) {
        throw new Error(await readError(response))
    }
    const data = await readJson(response)

    if (!Array.isArray(data)) {
        throw new Error('Unexpected response: expected a list of recipes')
    }
    const recipes = data.filter(isRecipe)

    return { recipes: recipes, invalidCount: data.length - recipes.length }
}

export async function fetchRecipe(id: number): Promise<Recipe> {
    return readRecipe(await request(`/recipes/${id}`))
}

export async function createRecipe(input: RecipeInput): Promise<Recipe> {
    return readRecipe(await request('/recipes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
    }))
}

export async function updateRecipe(id: number, input: RecipeInput): Promise<Recipe> {
    return readRecipe(await request(`/recipes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
    }))
}

export async function deleteRecipe(id: number): Promise<void> {
    const response = await request(`/recipes/${id}`, { method: 'DELETE' })

    if (!response.ok) {
        throw new Error(await readError(response))
    }
}

export async function fetchCategories(): Promise<Category[]> {
    const response = await request('/categories')

    if (!response.ok) {
        throw new Error(await readError(response))
    }
    const data = await readJson(response)

    if (!Array.isArray(data) || !data.every(isCategory)) {
        throw new Error('Unexpected response: invalid list of categories')
    }
    return data
}

export async function createCategory(name: string): Promise<Category> {
    return readCategory(await request('/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name }),
    }))
}

export async function updateCategory(id: number, name: string): Promise<Category> {
    return readCategory(await request(`/categories/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name }),
    }))
}

export async function deleteCategory(id: number): Promise<void> {
    const response = await request(`/categories/${id}`, { method: 'DELETE' })

    if (!response.ok) {
        throw new Error(await readError(response))
    }
}