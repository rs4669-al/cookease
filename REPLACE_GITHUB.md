# Replace your current GitHub repository with this CookEase version

## 1. Make a backup first

Download or copy your current repository somewhere safe before replacing anything. This package preserves the existing app screens and local-storage data logic, but a backup is still recommended.

## 2. Replace the project files

1. Download and unzip `cookease-updated.zip` on your computer.
2. Open the extracted `cookease` folder. You should see `package.json`, `src`, `public`, `vercel.json`, and `README.md`.
3. In your existing local Git repository, replace the project files with the contents of this extracted folder.
4. Do **not** copy `node_modules` from an old project. This ZIP intentionally excludes dependencies and Git metadata; npm will install dependencies from `package.json`/`package-lock.json`.
5. Keep the existing `.git` folder in your local repository so the folder remains connected to your GitHub repository. If you are replacing files through GitHub's website instead, upload the changed files to the same repository rather than creating a new repository.

## 3. Test before pushing

From the project root, run:

```bash
npm install
npm run build
npm start
```

Confirm the landing page opens at `http://localhost:3000`, and click **Get started free** or **Open CookEase** to enter the existing app. Test the Fridge, Scan & Add, Shopping, Recipes, and Analytics screens before deployment.

## 4. Commit and push to the existing GitHub repo

In Terminal, from your local repository root:

```bash
git status
git add -A
git commit -m "Add CookEase landing page and fix build warnings"
git push origin main
```

If your default branch is named `master` or something else, push that branch instead of `main`. If Git says there is nothing to commit, check that you copied the extracted files into the repository you intended.

## 5. Redeploy on Vercel

If Vercel is connected to this GitHub repository, pushing the commit should trigger a new deployment automatically. Confirm these settings in Vercel if needed:

- Build command: `npm run build`
- Output directory: `build`
- Install command: `npm install`

The included `vercel.json` supports direct navigation to React routes such as `/dashboard` and `/recipes`.

## Important about login and saved data

The supplied app does not contain a real authentication service or cloud database. The landing page therefore routes directly into the existing app rather than showing a fake login screen. Kitchen data is stored in the current browser's local storage and does not automatically sync between devices or users. Real sign-in requires an authentication provider and user-scoped database integration.
