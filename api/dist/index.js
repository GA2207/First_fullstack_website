"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = require("dotenv");
const categories_1 = __importDefault(require("./routes/categories"));
const recipes_1 = __importDefault(require("./routes/recipes"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const auth_1 = __importDefault(require("./routes/auth"));
const database_1 = require("./database");
(0, dotenv_1.config)({ quiet: true });
(0, database_1.initDatabase)();
const app = (0, express_1.default)();
const port = Number(process.env.PORT ?? 3000);
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
app.use('/api/auth', auth_1.default);
app.use("/recipes", recipes_1.default);
app.use("/categories", categories_1.default);
app.use((req, res) => {
    res.status(404).json({ error: "route not found" });
});
app.use((err, req, res, next) => {
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
