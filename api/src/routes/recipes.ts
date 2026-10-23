import { Router, Request, Response } from "express";
import { createRecipe, deleteRecipe, getAllRecipes, getCategoryById, getRecipeById, updateRecipe } from "../store";
import { validateRecipeInput, validateRecipeUpdate } from "../validation";

const router = Router();

function isUnknownCategory(categoryId: number | null | undefined): boolean {
    return typeof categoryId === "number" && getCategoryById(categoryId) === undefined;
}

const UNKNOWN_CATEGORY = { error: "invalid recipe", details: ["categoryId must reference an existing category"] };

router.get("/", (req: Request, res: Response) => {
    res.status(200).json(getAllRecipes());
});

router.get("/:id", (req: Request, res: Response) => {
    const recipe = getRecipeById(Number(req.params.id));

    if (recipe === undefined) {
        res.status(404).json({ error: "recipe not found" });
        return;
    }
    res.status(200).json(recipe);
});

router.post("/", (req: Request, res: Response) => {
    const result = validateRecipeInput(req.body);

    if (!result.ok) {
        res.status(400).json({ error: "invalid recipe", details: result.errors });
        return;
    }
    if (isUnknownCategory(result.value.categoryId)) {
        res.status(400).json(UNKNOWN_CATEGORY);
        return;
    }
    res.status(201).json(createRecipe(result.value));
});

router.put("/:id", (req: Request, res: Response) => {
    const id = Number(req.params.id);

    if (getRecipeById(id) === undefined) {
        res.status(404).json({ error: "recipe not found" });
        return;
    }
    const result = validateRecipeUpdate(req.body);

    if (!result.ok) {
        res.status(400).json({ error: "invalid recipe", details: result.errors });
        return;
    }
    if (isUnknownCategory(result.value.categoryId)) {
        res.status(400).json(UNKNOWN_CATEGORY);
        return;
    }
    res.status(200).json(updateRecipe(id, result.value));
});
router.delete("/:id", (req: Request, res: Response) => {
    if (!deleteRecipe(Number(req.params.id))) {
        res.status(404).json({ error: "recipe not found" });
        return;
    }
    res.status(204).send();
});

export default router;