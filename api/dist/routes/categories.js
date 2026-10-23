"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const store_1 = require("../store");
const validation_1 = require("../validation");
const router = (0, express_1.Router)();
router.get("/", (req, res) => {
    res.status(200).json((0, store_1.getAllCategories)());
});
router.get("/:id", (req, res) => {
    const category = (0, store_1.getCategoryById)(Number(req.params.id));
    if (category === undefined) {
        res.status(404).json({ error: "category not found" });
        return;
    }
    res.status(200).json(category);
});
router.post("/", (req, res) => {
    const result = (0, validation_1.validateCategoryInput)(req.body);
    if (!result.ok) {
        res.status(400).json({ error: "invalid category", details: result.errors });
        return;
    }
    if ((0, store_1.isCategoryNameTaken)(result.value.name)) {
        res.status(409).json({ error: "a category with this name already exists" });
        return;
    }
    res.status(201).json((0, store_1.createCategory)(result.value));
});
router.put("/:id", (req, res) => {
    const id = Number(req.params.id);
    if ((0, store_1.getCategoryById)(id) === undefined) {
        res.status(404).json({ error: "category not found" });
        return;
    }
    const result = (0, validation_1.validateCategoryInput)(req.body);
    if (!result.ok) {
        res.status(400).json({ error: "invalid category", details: result.errors });
        return;
    }
    if ((0, store_1.isCategoryNameTaken)(result.value.name, id)) {
        res.status(409).json({ error: "a category with this name already exists" });
        return;
    }
    res.status(200).json((0, store_1.updateCategory)(id, result.value));
});
router.delete("/:id", (req, res) => {
    if (!(0, store_1.deleteCategory)(Number(req.params.id))) {
        res.status(404).json({ error: "category not found" });
        return;
    }
    res.status(204).send();
});
exports.default = router;
