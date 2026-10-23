import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import { config } from "dotenv";
import categoriesRouter from "./routes/categories";
import recipesRouter from "./routes/recipes";
import cookieParser from 'cookie-parser';
import authRoutes from './routes/auth';
import { initDatabase } from "./database";
import businessRoutes from './routes/business';

config({ quiet: true });

initDatabase();

const app = express();
const port = Number(process.env.PORT ?? 3000);

app.use(cors());
app.use(express.json());
app.use(cookieParser());

app.use('/api/auth', authRoutes);
app.use("/recipes", recipesRouter);
app.use("/categories", categoriesRouter);
app.use('/api', businessRoutes);

app.use((req: Request, res: Response) => {
    res.status(404).json({ error: "route not found" });
});

app.use((err: unknown, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof SyntaxError) {
        res.status(400).json({ error: "malformed JSON body" });
        return;
    }
    console.error(err);
    res.status(500).json({ error: "internal server error" });
});

app.listen(port, () => {
    console.log(`Recipe API listening at http://localhost:${port}`);
});