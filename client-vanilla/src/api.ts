import { isRecipe } from './types.ts'
import type { Recipe, RecipeInput } from './types.ts'

const envUrl: unknown = import.meta.env.VITE_API_URL
const API_URL = typeof envUrl === 'string' && envUrl !== '' ? envUrl : 'http://localhost:3000'

async function readError(response: Response): Promise<string> {
    const body: unknown = await response.json().catch(() => null)

    if (typeof body === 'object' && body !== null && 'error' in body && typeof body.error === 'string') {
        return body.error
    }
    return `HTTP ${response.status}`
}

export async function fetchRecipes(): Promise<Recipe[]> {
    const response = await fetch(`${API_URL}/recipes`)

    if (!response.ok) {
        throw new Error(await readError(response))
    }
    const data: unknown = await response.json()

    if (!Array.isArray(data)) {
        throw new Error('Unexpected response: expected a list of recipes')
    }
    return data.filter(isRecipe)
}

export async function createRecipe(input: RecipeInput): Promise<Recipe> {
    const response = await fetch(`${API_URL}/recipes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
    })

    if (!response.ok) {
        throw new Error(await readError(response))
    }
    const data: unknown = await response.json()

    if (!isRecipe(data)) {
        throw new Error('Unexpected response: invalid recipe')
    }
    return data
}

export async function deleteRecipe(id: number): Promise<void> {
    const response = await fetch(`${API_URL}/recipes/${id}`, { method: 'DELETE' })

    if (!response.ok) {
        throw new Error(await readError(response))
    }
}