import './style.css'
import { createRecipe, deleteRecipe, fetchRecipes } from './api.ts'
import { renderRecipes } from './render.ts'
import { isDifficulty } from './types.ts'

function getElement<T extends HTMLElement>(selector: string, type: new () => T): T {
    const element = document.querySelector(selector)

    if (!(element instanceof type)) {
        throw new Error(`Element ${selector} not found`)
    }
    return element
}

const form = getElement('#recipe-form', HTMLFormElement)
const list = getElement('#recipe-list', HTMLUListElement)
const status = getElement('#status', HTMLParagraphElement)

function showStatus(message: string, isError: boolean): void {
    status.textContent = message
    status.className = isError ? 'error' : ''
}

async function loadRecipes(): Promise<void> {
    showStatus('Loading…', false)
    try {
        const recipes = await fetchRecipes()

        renderRecipes(list, recipes, handleDelete)
        showStatus(recipes.length === 0 ? 'No recipes yet.' : '', false)
    } catch (error) {
        showStatus(error instanceof Error ? error.message : 'Unknown error', true)
    }
}

async function handleDelete(id: number): Promise<void> {
    try {
        await deleteRecipe(id)
        await loadRecipes()
    } catch (error) {
        showStatus(error instanceof Error ? error.message : 'Unknown error', true)
    }
}

async function handleSubmit(event: SubmitEvent): Promise<void> {
    event.preventDefault()

    const data = new FormData(form)
    const name = String(data.get('name') ?? '').trim()
    const preparationTime = Number(data.get('preparationTime'))
    const difficulty = data.get('difficulty')
    const ingredients = String(data.get('ingredients') ?? '')
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line !== '')
    const instructions = String(data.get('instructions') ?? '').trim()

    if (!isDifficulty(difficulty)) {
        showStatus('Invalid difficulty', true)
        return
    }
    try {
        await createRecipe({ name, preparationTime, difficulty, ingredients, instructions })
        form.reset()
        await loadRecipes()
    } catch (error) {
        showStatus(error instanceof Error ? error.message : 'Unknown error', true)
    }
}

form.addEventListener('submit', handleSubmit)
loadRecipes()