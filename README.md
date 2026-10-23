# First fullstack website — Recipe manager

Recipe manager built with a TypeScript REST API (Node.js + Express) and a React + Vite client.
Data is stored in memory inside the API process (no database).

## Project structure

```
.
├── api/              REST API (Express + TypeScript)
├── client/           React client (milestones 3-4)
└── client-vanilla/   TypeScript + DOM client, no framework (milestone 2)
```

## Install the dependencies

```bash
cd api && npm install
cd ../client && npm install
cd ../client-vanilla && npm install
```

## Start the API

```bash
cd api
cp .env.example .env    # optional, PORT defaults to 3000
npm start
```

The API listens on `http://localhost:3000`.

| Method | Route          | Success | Purpose          |
|--------|----------------|---------|------------------|
| GET    | `/recipes`     | 200     | List all recipes |
| GET    | `/recipes/:id` | 200     | Read one recipe  |
| POST   | `/recipes`     | 201     | Create a recipe  |
| PUT    | `/recipes/:id` | 200     | Update a recipe  |
| DELETE | `/recipes/:id` | 204     | Delete a recipe  |

Errors: `400` for an invalid or malformed body, `404` for an unknown id.

### Categories (bonus)

| Method | Route             | Success | Purpose            |
|--------|-------------------|---------|--------------------|
| GET    | `/categories`     | 200     | List categories    |
| GET    | `/categories/:id` | 200     | Read one category  |
| POST   | `/categories`     | 201     | Create a category  |
| PUT    | `/categories/:id` | 200     | Rename a category  |
| DELETE | `/categories/:id` | 204     | Delete a category  |

Errors: `400` for an invalid name, `404` for an unknown id, `409` if the name is already used.

A recipe can belong to one category through an optional `categoryId` field
(`null` in a `PUT` removes it). Deleting a category removes it from its recipes.

## Start the React application

The API must be running first.

```bash
cd client
cp .env.example .env    # optional, defaults to http://localhost:3000
npm run dev
```

Open `http://localhost:5173`.

## Start the vanilla client (milestone 2)

```bash
cd client-vanilla
npm run dev
```
