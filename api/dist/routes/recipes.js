"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const store_1 = require("../store");
const validation_1 = require("../validation");
const router = (0, express_1.Router)();
function isUnknownCategory(categoryId) {
    return typeof categoryId === "number" && (0, store_1.getCategoryById)(categoryId) === undefined;
}
const UNKNOWN_CATEGORY = { error: "invalid recipe", details: ["categoryId must reference an existing category"] };
router.get("/", (req, res) => {
    res.status(200).json((0, store_1.getAllRecipes)());
});
router.get("/:id", (req, res) => {
    const recipe = (0, store_1.getRecipeById)(Number(req.params.id));
    if (recipe === undefined) {
        res.status(404).json({ error: "recipe not found" });
        return;
    }
    res.status(200).json(recipe);
});
router.post("/", (req, res) => {
    const result = (0, validation_1.validateRecipeInput)(req.body);
    if (!result.ok) {
        res.status(400).json({ error: "invalid recipe", details: result.errors });
        return;
    }
    if (isUnknownCategory(result.value.categoryId)) {
        res.status(400).json(UNKNOWN_CATEGORY);
        return;
    }
    res.status(201).json((0, store_1.createRecipe)(result.value));
});
router.put("/:id", (req, res) => {
    const id = Number(req.params.id);
    if ((0, store_1.getRecipeById)(id) === undefined) {
        res.status(404).json({ error: "recipe not found" });
        return;
    }
    const result = (0, validation_1.validateRecipeUpdate)(req.body);
    if (!result.ok) {
        res.status(400).json({ error: "invalid recipe", details: result.errors });
        return;
    }
    if (isUnknownCategory(result.value.categoryId)) {
        res.status(400).json(UNKNOWN_CATEGORY);
        return;
    }
    res.status(200).json((0, store_1.updateRecipe)(id, result.value));
});
router.delete("/:id", (req, res) => {
    if (!(0, store_1.deleteRecipe)(Number(req.params.id))) {
        res.status(404).json({ error: "recipe not found" });
        return;
    }
    res.status(204).send();
});
exports.default = router;
