export type Difficulty = "easy" | "medium" | "hard";

export interface Recipe {
    id: number;
    name: string;
    preparationTime: number;
    difficulty: Difficulty;
    ingredients: string[];
    instructions: string;
    categoryId?: number;
}

export type RecipeInput = Omit<Recipe, "id">;

export type RecipeChanges = Partial<Omit<RecipeInput, "categoryId">> & { categoryId?: number | null };

export interface Category {
    id: number;
    name: string;
}

export type CategoryInput = Omit<Category, "id">;