"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRecipeInput = validateRecipeInput;
exports.validateRecipeUpdate = validateRecipeUpdate;
exports.validateCategoryInput = validateCategoryInput;
const DIFFICULTIES = ["easy", "medium", "hard"];
const CATEGORY_NAME_MAX_LENGTH = 50;
function isRecord(value) {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}
function isNonEmptyString(value) {
    return typeof value === "string" && value.trim() !== "";
}
function isDifficulty(value) {
    return DIFFICULTIES.some((difficulty) => difficulty === value);
}
function isPositiveInteger(value) {
    return typeof value === "number" && Number.isInteger(value) && value > 0;
}
function validateFields(body, partial) {
    const errors = [];
    const value = {};
    if (body.name !== undefined || !partial) {
        if (isNonEmptyString(body.name)) {
            value.name = body.name.trim();
        }
        else {
            errors.push("name must be a non-empty string");
        }
    }
    if (body.preparationTime !== undefined || !partial) {
        if (typeof body.preparationTime === "number" && Number.isInteger(body.preparationTime) && body.preparationTime > 0) {
            value.preparationTime = body.preparationTime;
        }
        else {
            errors.push("preparationTime must be a positive integer (minutes)");
        }
    }
    if (body.difficulty !== undefined || !partial) {
        if (isDifficulty(body.difficulty)) {
            value.difficulty = body.difficulty;
        }
        else {
            errors.push("difficulty must be one of: easy, medium, hard");
        }
    }
    if (body.ingredients !== undefined || !partial) {
        const ingredients = body.ingredients;
        if (Array.isArray(ingredients) && ingredients.length > 0 && ingredients.every(isNonEmptyString)) {
            value.ingredients = ingredients.map((ingredient) => ingredient.trim());
        }
        else {
            errors.push("ingredients must be a non-empty array of non-empty strings");
        }
    }
    if (body.instructions !== undefined || !partial) {
        if (isNonEmptyString(body.instructions)) {
            value.instructions = body.instructions.trim();
        }
        else {
            errors.push("instructions must be a non-empty string");
        }
    }
    if (body.categoryId !== undefined) {
        if (body.categoryId === null || isPositiveInteger(body.categoryId)) {
            value.categoryId = body.categoryId;
        }
        else {
            errors.push("categoryId must be a positive integer or null");
        }
    }
    if (errors.length > 0) {
        return { ok: false, errors: errors };
    }
    return { ok: true, value: value };
}
function validateRecipeInput(body) {
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
    const recipe = { name, preparationTime, difficulty, ingredients, instructions };
    if (typeof categoryId === "number") {
        recipe.categoryId = categoryId;
    }
    return { ok: true, value: recipe };
}
function validateRecipeUpdate(body) {
    if (!isRecord(body)) {
        return { ok: false, errors: ["body must be a JSON object"] };
    }
    const result = validateFields(body, true);
    if (result.ok && Object.keys(result.value).length === 0) {
        return { ok: false, errors: ["body must contain at least one recipe field"] };
    }
    return result;
}
function validateCategoryInput(body) {
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
