import { Router, Request, Response } from "express";
import {
    createCategory,
    deleteCategory,
    getAllCategories,
    getCategoryById,
    isCategoryNameTaken,
    updateCategory,
} from "../store";
import { validateCategoryInput } from "../validation";

const router = Router();

router.get("/", (req: Request, res: Response) => {
    res.status(200).json(getAllCategories());
});

router.get("/:id", (req: Request, res: Response) => {
    const category = getCategoryById(Number(req.params.id));

    if (category === undefined) {
        res.status(404).json({ error: "category not found" });
        return;
    }
    res.status(200).json(category);
});

router.post("/", (req: Request, res: Response) => {
    const result = validateCategoryInput(req.body);

    if (!result.ok) {
        res.status(400).json({ error: "invalid category", details: result.errors });
        return;
    }
    if (isCategoryNameTaken(result.value.name)) {
        res.status(409).json({ error: "a category with this name already exists" });
        return;
    }
    res.status(201).json(createCategory(result.value));
});

router.put("/:id", (req: Request, res: Response) => {
    const id = Number(req.params.id);

    if (getCategoryById(id) === undefined) {
        res.status(404).json({ error: "category not found" });
        return;
    }
    const result = validateCategoryInput(req.body);

    if (!result.ok) {
        res.status(400).json({ error: "invalid category", details: result.errors });
        return;
    }
    if (isCategoryNameTaken(result.value.name, id)) {
        res.status(409).json({ error: "a category with this name already exists" });
        return;
    }
    res.status(200).json(updateCategory(id, result.value));
});

router.delete("/:id", (req: Request, res: Response) => {
    if (!deleteCategory(Number(req.params.id))) {
        res.status(404).json({ error: "category not found" });
        return;
    }
    res.status(204).send();
});

export default router;