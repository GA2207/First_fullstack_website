"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const database_1 = __importDefault(require("../database"));
const auth_1 = require("../middlewares/auth");
const router = (0, express_1.Router)();
router.get('/admin/stats', auth_1.verifyToken, (0, auth_1.checkRole)(['admin']), (req, res) => {
    const userCount = database_1.default.prepare('SELECT COUNT(*) as count FROM users').get();
    const recipeCount = database_1.default.prepare('SELECT COUNT(*) as count FROM recettes').get();
    const topRecipes = database_1.default.prepare('SELECT nom, vues FROM recettes ORDER BY vues DESC LIMIT 5').all();
    res.status(200).json({
        total_users: userCount.count,
        total_recipes: recipeCount.count,
        top_recipes: topRecipes
    });
});
router.get('/recipes/:id/portion', auth_1.verifyToken, (0, auth_1.checkRole)(['premium', 'professionnel', 'admin']), (req, res) => {
    const recipeId = req.params.id;
    const portions = Number(req.query.portions) || 4; // Par défaut base de 4 portions
    const recipe = database_1.default.prepare('SELECT * FROM recettes WHERE id = ?').get(recipeId);
    if (!recipe) {
        res.status(404).json({ error: 'Recette introuvable.' });
        return;
    }
    const ingredients = database_1.default.prepare('SELECT * FROM recette_ingredients WHERE recette_id = ?').all(recipeId);
    const adjustedIngredients = ingredients.map(ing => ({
        ...ing,
        quantite: Number((ing.quantite * (portions / 4)).toFixed(2))
    }));
    res.status(200).json({
        recipe,
        target_portions: portions,
        ingredients: adjustedIngredients
    });
});
router.get('/pro/recipes/:id/cost', auth_1.verifyToken, (0, auth_1.checkRole)(['professionnel', 'admin']), (req, res) => {
    const recipeId = req.params.id;
    const recipe = database_1.default.prepare('SELECT * FROM recettes WHERE id = ?').get(recipeId);
    if (!recipe) {
        res.status(404).json({ error: 'Recette introuvable.' });
        return;
    }
    const ingredients = database_1.default.prepare('SELECT * FROM recette_ingredients WHERE recette_id = ?').all(recipeId);
    let totalCost = 0;
    const detailedIngredients = ingredients.map(ing => {
        const cost = ing.quantite * (ing.prix_unitaire || 1.0);
        totalCost += cost;
        return {
            ...ing,
            cout_total: Number(cost.toFixed(2))
        };
    });
    const suggestedPrice = Number((totalCost * 2.5).toFixed(2));
    res.status(200).json({
        recipe,
        ingredients: detailedIngredients,
        cout_revient_total: Number(totalCost.toFixed(2)),
        prix_vente_suggere: suggestedPrice
    });
});
exports.default = router;
