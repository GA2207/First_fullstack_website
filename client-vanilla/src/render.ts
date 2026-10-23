import type { Recipe } from './types.ts'

function createRecipeItem(recipe: Recipe, onDelete: (id: number) => void): HTMLLIElement {
    const item = document.createElement('li')
    item.className = 'recipe'

    const title = document.createElement('h3')
    title.textContent = recipe.name

    const meta = document.createElement('p')
    meta.className = 'meta'
    meta.textContent = `${recipe.preparationTime} min · ${recipe.difficulty}`

    const ingredients = document.createElement('ul')
    for (const ingredient of recipe.ingredients) {
        const line = document.createElement('li')
        line.textContent = ingredient
        ingredients.appendChild(line)
    }

    const instructions = document.createElement('p')
    instructions.textContent = recipe.instructions

    const deleteButton = document.createElement('button')
    deleteButton.type = 'button'
    deleteButton.textContent = 'Delete'
    deleteButton.addEventListener('click', () => onDelete(recipe.id))

    item.append(title, meta, ingredients, instructions, deleteButton)
    return item
}

export function renderRecipes(list: HTMLUListElement, recipes: Recipe[], onDelete: (id: number) => void): void {
    list.replaceChildren(...recipes.map((recipe) => createRecipeItem(recipe, onDelete)))
}