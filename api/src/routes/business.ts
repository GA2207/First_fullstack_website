import { Router, Response } from 'express';
import db from '../database';
import { verifyToken, checkRole, AuthenticatedRequest } from '../middlewares/auth';

const router = Router();

interface IngredientRow {
  id: number;
  nom_ingredient: string;
  quantite: number;
  unite: string;
  prix_unitaire: number;
}

router.get('/admin/stats', verifyToken, checkRole(['admin']), (req: AuthenticatedRequest, res: Response): void => {
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
  const recipeCount = db.prepare('SELECT COUNT(*) as count FROM recettes').get() as { count: number };
  const topRecipes = db.prepare('SELECT nom, vues FROM recettes ORDER BY vues DESC LIMIT 5').all();

  res.status(200).json({
    total_users: userCount.count,
    total_recipes: recipeCount.count,
    top_recipes: topRecipes
  });
});

router.get('/recipes/:id/portion', verifyToken, checkRole(['premium', 'professionnel', 'admin']), (req: AuthenticatedRequest, res: Response): void => {
  const recipeId = req.params.id;
  const portions = Number(req.query.portions) || 4; // Par défaut base de 4 portions

  const recipe = db.prepare('SELECT * FROM recettes WHERE id = ?').get(recipeId);
  if (!recipe) {
    res.status(404).json({ error: 'Recette introuvable.' });
    return;
  }

  const ingredients = db.prepare('SELECT * FROM recette_ingredients WHERE recette_id = ?').all(recipeId) as IngredientRow[];

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

router.get('/pro/recipes/:id/cost', verifyToken, checkRole(['professionnel', 'admin']), (req: AuthenticatedRequest, res: Response): void => {
  const recipeId = req.params.id;

  const recipe = db.prepare('SELECT * FROM recettes WHERE id = ?').get(recipeId);
  if (!recipe) {
    res.status(404).json({ error: 'Recette introuvable.' });
    return;
  }

  const ingredients = db.prepare('SELECT * FROM recette_ingredients WHERE recette_id = ?').all(recipeId) as IngredientRow[];

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

export default router;