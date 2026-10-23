import { CategoryInput, Difficulty, RecipeChanges, RecipeInput } from "./types";

type ValidationResult<T> =
    | {ok : true; value: T}
    | {ok : false; errors: string[]};


const DIFFICULTIES: Difficulty[] = ["easy", "medium", "hard"];
const CATEGORY_NAME_MAX_LENGTH = 50;

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isNonEmptyString(value: unknown): value is string {
    return typeof value === "string" && value.trim() !== "";
}

function isDifficulty(value: unknown): value is Difficulty {
    return DIFFICULTIES.some((difficulty) => difficulty === value);
}

function isPositiveInteger(value: unknown): value is number {
    return typeof value === "number" && Number.isInteger(value) && value > 0;
}

function validateFields(body: Record<string, unknown>, partial: boolean): ValidationResult<RecipeChanges> {
    const errors: string[] = [];
    const value: RecipeChanges = {};

    if (body.name !== undefined || !partial) {
        if (isNonEmptyString(body.name)) {
            value.name = body.name.trim();
        } else {
            errors.push("name must be a non-empty string");
        }
    }
    if (body.preparationTime !== undefined || !partial) {
        if (typeof body.preparationTime === "number" && Number.isInteger(body.preparationTime) && body.preparationTime > 0) {
            value.preparationTime = body.preparationTime;
        } else {
            errors.push("preparationTime must be a positive integer (minutes)");
        }
    }
    if (body.difficulty !== undefined || !partial) {
        if (isDifficulty(body.difficulty)) {
            value.difficulty = body.difficulty;
        } else {
            errors.push("difficulty must be one of: easy, medium, hard");
        }
    }
    if (body.ingredients !== undefined || !partial) {
        const ingredients = body.ingredients;

        if (Array.isArray(ingredients) && ingredients.length > 0 && ingredients.every(isNonEmptyString)) {
            value.ingredients = ingredients.map((ingredient) => ingredient.trim());
        } else {
            errors.push("ingredients must be a non-empty array of non-empty strings");
        }
    }
    if (body.instructions !== undefined || !partial) {
        if (isNonEmptyString(body.instructions)) {
            value.instructions = body.instructions.trim();
        } else {
            errors.push("instructions must be a non-empty string");
        }
    }
    if (body.categoryId !== undefined) {
        if (body.categoryId === null || isPositiveInteger(body.categoryId)) {
            value.categoryId = body.categoryId;
        } else {
            errors.push("categoryId must be a positive integer or null");
        }
    }
    if (errors.length > 0) {
        return { ok: false, errors: errors };
    }
    return { ok: true, value: value };
}

export function validateRecipeInput(body: unknown): ValidationResult<RecipeInput> {
    if (!isRecord(body)) {
        return { ok: false, errors: ["body must be a JSON object"] };
    }
    const result = validateFields(body, false);

    if (!result.ok) {
        return result;
    }
    const { name, preparationTime, difficulty, ingredients, instructions, categoryId } = result.value;

    if (name === undefined || preparationTime === undefined || difficulty === undefined
        || ingredients === undefined || instructions === undefined) {
        return { ok: false, errors: ["missing fields"] };
    }
    const recipe: RecipeInput = { name, preparationTime, difficulty, ingredients, instructions };

    if (typeof categoryId === "number") {
        recipe.categoryId = categoryId;
    }
    return { ok: true, value: recipe };
}

export function validateRecipeUpdate(body: unknown): ValidationResult<RecipeChanges> {
    if (!isRecord(body)) {
        return { ok: false, errors: ["body must be a JSON object"] };
    }
    const result = validateFields(body, true);

    if (result.ok && Object.keys(result.value).length === 0) {
        return { ok: false, errors: ["body must contain at least one recipe field"] };
    }
    return result;
}

export function validateCategoryInput(body: unknown): ValidationResult<CategoryInput> {
    if (!isRecord(body)) {
        return { ok: false, errors: ["body must be a JSON object"] };
    }
    if (!isNonEmptyString(body.name)) {
        return { ok: false, errors: ["name must be a non-empty string"] };
    }
    const name = body.name.trim();

    if (name.length > CATEGORY_NAME_MAX_LENGTH) {
        return { ok: false, errors: [`name must be at most ${CATEGORY_NAME_MAX_LENGTH} characters`] };
    }
    return { ok: true, value: { name: name } };
}