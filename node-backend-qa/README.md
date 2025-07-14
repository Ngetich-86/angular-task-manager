# Getting started with jest on node.js with typescript
This is a simple example of how to set up Jest for testing a Node.js application written in TypeScript.
## Prerequisites
- Node.js installed
- npm or yarn installed
- TypeScript installed
- Jest installed
## Installation
1. Create a new directory for your project and navigate into it:
   ```bash
   mkdir jest-typescript-example
   cd jest-typescript-example
   ```
2. Initialize a new Node.js project:
   ```bash
    npm init -y
    ```
3. Install TypeScript and Jest as development dependencies:
   ```bash
   npm install --save-dev typescript jest ts-jest @types/jest
   ```
4. Initialize a TypeScript configuration file:
   ```bash
   npx tsc --init
   ```