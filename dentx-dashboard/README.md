## Frontend

Follow this guide to start working with the project:

1. **Clone the repository**:

```bash
git clone https://github.com/bakytzhankz/m-stom-be.git
```

2. **Create a Development Branch:** Create a feature branch based on your intended changes. Branch naming conventions are encouraged (e.g., feature/<feature-name>, bugfix/<bug-title>). The branch naming is an [Git Branch Naming Convention](https://dev.to/couchcamote/git-branching-name-convention-cch).

3. **Configure Environment Variables:** Update the environment variables file (src/config/environment.config.ts) with your development server ports and other configurations.

4. **Install Dependencies:**

```bash
npm ci
```

5. **Run the Application:**

```bash
npm run dev
```

## Backend

**Note:** This section references a specific feature branch (feature/admin-dashboard) within the backend repository (m-stom-be). This may change depending on the project's current focus.

The backend logic for the admin dashboard is located within the admin folder of the backend repository (m-stom-be). Refer to the existing codebase for stylistic conventions.

## Code Style Guide

1. **UI Framework:** We utilize the [shadcn/ui](https://ui.shadcn.com/) framework. Pre-built components are available in the src/shared/ui folder.

2. **TypeScript:** This project enforces the use of TypeScript for all code. JavaScript is not permitted.

3. **HTTP Requests:** Leverage [tanstack/react-query](https://tanstack.com/query/latest/docs/) for making HTTP requests and managing responses. Refer to existing examples within the project.

4. **Code Formatting:** A Prettier plugin is configured to format code automatically. Save your files to apply formatting, or use the following command:

```bash
npm run format
```

5. **Component Naming:** Component file names should use PascalCase (first letter capitalized). Othe utilities and helper files must consist its purpose (eg. auth.middleware.ts, auth.service.ts). Refer to codebase to see more examples.

6. **Module Structure:** Organize features and components based on domain and business logic. Common services and components can reside within the core or shared folders.
