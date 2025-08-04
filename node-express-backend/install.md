# 🚀 Node Express + TypeScript Setup Guide

This project demonstrates how to set up a basic Express.js server using TypeScript and `pnpm`.

## 📁 Project Structure
.
├── src
│ └── server.ts
├── package.json
├── tsconfig.json
└── nodemon.json
`


## 🛠️ Installation Steps

1. **Initialize the project**
   ```bash
   pnpm init
   ```
2. Install Express and types
```bash
   pnpm init
   ```
3. Install dev dependencies
```bash
   pnpm add express
   pnpm add -D @types/express
   pnpm add -D typescript ts-node nodemon

```
4. Create a TypeScript config file
```bash
pnpm exec tsc --init
```
4. Add a nodemon.json configuration
```bash
  "watch": ["src"],
  "ext": "ts",
  "exec": "ts-node src/server.ts"
```