# AngularTaskManager

## Using Tailwind CSS with Angular

You can integrate [Tailwind CSS](https://tailwindcss.com/) into your Angular project by following these steps:

### 1. Install Tailwind CSS and dependencies

Run the following command in your project root:

```bash
ng new my-project --style css
cd my-project
```

### 2. Initialize Tailwind CSS

```bash
npm install tailwindcss @tailwindcss/postcss postcss --force
```

### 3. Create a .postcssrc.json file in the root of your project and add the @tailwindcss/postcss plugin to your PostCSS configuration.
````json
// .postcssrc.json
{
  "plugins": {
    "@tailwindcss/postcss": {}
  }
}
````

### 4. Add Tailwind directives to your styles

Add the Tailwind directives to your main CSS file (e.g., `src/styles.css`):

```css
@import "tailwindcss";
```

### 5. Start your development server

Now you can use Tailwind utility classes in your Angular components. Start your server with:

```bash
ng serve
```

For more details, see the [official Tailwind CSS Angular guide](https://tailwindcss.com/docs/guides/angular).


This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 20.0.3.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.