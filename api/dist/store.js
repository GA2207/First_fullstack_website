"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllRecipes = getAllRecipes;
exports.getRecipeById = getRecipeById;
exports.createRecipe = createRecipe;
exports.updateRecipe = updateRecipe;
exports.deleteRecipe = deleteRecipe;
exports.getAllCategories = getAllCategories;
exports.getCategoryById = getCategoryById;
exports.isCategoryNameTaken = isCategoryNameTaken;
exports.createCategory = createCategory;
exports.updateCategory = updateCategory;
exports.deleteCategory = deleteCategory;
const categories = [
    { id: 1, name: "Bases" },
    { id: 2, name: "Confiserie" },
    { id: 3, name: "Petits gâteaux" },
];
let nextCategoryId = 4;
const recipes = [
    {
        id: 1,
        name: "Caramel Noisette",
        preparationTime: 30,
        difficulty: "medium",
        ingredients: ["150g sucre", "120g glucose", "30g eau", "200g crème", "20g trimoline", "8g sorbitol", "1 pincée fleur de sel", "25g beurre", "20g pâte de cacao", "35g noisette torrefiées concassées"],
        instructions: "Mettre dans une casserole le sucre, le glucose et l'eau, cuire le tout à 165°C. En simultané, faire bouillir la crème, la trimoline, le sorbitol et le sel. Déglacer le caramel avec le mélange de creme chaud et recuire le tout à 117°C. Ajouter le beurre, la pâte de cacao et les noisettes torrefiées et concassées",
        categoryId: 2,
    },
    {
        id: 2,
        name: "Crème pâtissière",
        preparationTime: 10,
        difficulty: "easy",
        ingredients: ["1L lait", "200g sucre", "200g jaunes d'oeuf", "90g poudre à crème", "150g beurre", "2 gousses de vanille"],
        instructions: "Mettre à bouillir la vanille avec le lait, pendant ce temps blanchir les jaunes d'oeuf avec le sucre et la poudre à crème. Une fois le lait à ébullition verser la moitié sur le mélange de jaune, sucre, PAC bien mélanger puis remettre le tout dans la casserole avec l'autre moitié de lait et recuire le tout jusqu'à ébullition (1 min d'ébulition par litre de lait environ). Hors du feu ajouter le beurre",
        categoryId: 1,
    },
    {
        id: 3,
        name: "Macarons",
        preparationTime: 120,
        difficulty: "hard",
        ingredients: ["150g poudre amande", "150g sucre glace", "110g blanc d'oeuf", "150g sucre", "40g eau"],
        instructions: "Faire une meringue italienne, verser sur le mélange poudre amande et sucre glace (macaronage), pocher, laisser croûter, puis cuire à 145°C pendant 13 min.",
        categoryId: 3,
    },
];
let nextId = 4;
function getAllRecipes() {
    return recipes;
}
function getRecipeById(id) {
    return recipes.find((recipe) => recipe.id === id);
}
function createRecipe(input) {
    const recipe = { id: nextId, ...input };
    nextId++;
    recipes.push(recipe);
    return recipe;
}
function updateRecipe(id, changes) {
    const recipe = getRecipeById(id);
    if (recipe === undefined) {
        return undefined;
    }
    const { categoryId, ...fields } = changes;
    Object.assign(recipe, fields);
    if (categoryId === null) {
        delete recipe.categoryId;
    }
    else if (categoryId !== undefined) {
        recipe.categoryId = categoryId;
    }
    return recipe;
}
function deleteRecipe(id) {
    const index = recipes.findIndex((recipe) => recipe.id === id);
    if (index === -1) {
        return false;
    }
    recipes.splice(index, 1);
    return true;
}
function getAllCategories() {
    return categories;
}
function getCategoryById(id) {
    return categories.find((category) => category.id === id);
}
function isCategoryNameTaken(name, exceptId) {
    return categories.some((category) => category.id !== exceptId && category.name.toLowerCase() === name.toLowerCase());
}
function createCategory(input) {
    const category = { id: nextCategoryId, ...input };
    nextCategoryId++;
    categories.push(category);
    return category;
}
function updateCategory(id, input) {
    const category = getCategoryById(id);
    if (category === undefined) {
        return undefined;
    }
    category.name = input.name;
    return category;
}
function deleteCategory(id) {
    const index = categories.findIndex((category) => category.id === id);
    if (index === -1) {
        return false;
    }
    categories.splice(index, 1);
    for (const recipe of recipes) {
        if (recipe.categoryId === id) {
            delete recipe.categoryId;
        }
    }
    return true;
}
