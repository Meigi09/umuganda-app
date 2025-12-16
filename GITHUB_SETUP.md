# GitHub Repository Setup Guide

## ✅ Local Repository Initialized

Your git repository has been initialized with:

- **Initial Commit**: 49 files committed (17,462 insertions)
- **Branches Created**:
  - `master` (default branch)
  - `develop` (for development)

### Current Status

```
* master  → Main production branch (current HEAD)
  develop → Development/staging branch
```

---

## 🚀 Next Steps: Connect to GitHub

### Step 1: Create Repository on GitHub

1. Go to [https://github.com/new](https://github.com/new)
2. Fill in the form:
   - **Repository name**: `umuganda-app` (or your preferred name)
   - **Description**: "Social Impact Tracking Platform for Rwanda - tracking community service activities"
   - **Visibility**: Choose based on your needs
     - Public: For open-source
     - Private: For proprietary/internal use
   - **Initialize repository**: Keep unchecked (we already have files)
   - Click "Create repository"

### Step 2: Configure Remote

Once you create the repository on GitHub, you'll get a URL like:

```
https://github.com/YOUR-USERNAME/umuganda-app.git
```

Run this command in your project directory (replace with your actual URL):

```bash
git remote add origin https://github.com/YOUR-USERNAME/umuganda-app.git
```

Verify the remote was added:

```bash
git remote -v
```

You should see:

```
origin  https://github.com/YOUR-USERNAME/umuganda-app.git (fetch)
origin  https://github.com/YOUR-USERNAME/umuganda-app.git (push)
```

### Step 3: Push to GitHub

```bash
# Push master branch
git push -u origin master

# Push develop branch
git push -u origin develop
```

### Step 4: Set Default Branch (Recommended)

In GitHub repository settings:

1. Go to **Settings** → **Branches**
2. Set default branch to `master` for production stability
3. (Optional) Set `develop` as protection branch for PR requirements

---

## 📋 Branch Strategy

### Current Setup

- **master**: Production-ready code
- **develop**: Development/staging code

### Recommended Workflow

For new features, create feature branches:

```bash
git checkout develop
git pull origin develop
git checkout -b feature/feature-name
# Make changes
git add .
git commit -m "Add feature description"
git push origin feature/feature-name
```

Then create a Pull Request on GitHub from `feature/feature-name` → `develop`

For releases:

```bash
git checkout master
git pull origin master
git merge develop --no-ff -m "Release v1.0.0"
git tag v1.0.0
git push origin master develop --tags
```

---

## 🔧 Recommended GitHub Settings

### Branch Protection Rules

For `master` branch:

1. Require a pull request before merging
2. Dismiss stale pull request approvals when new commits are pushed
3. Require status checks to pass before merging
4. Require branches to be up to date before merging
5. Restrict who can push to matching branches

For `develop` branch:

1. Require a pull request before merging
2. Allow auto-merge

### Repository Settings

- Enable "Automatically delete head branches" after PR merge
- Enable "Require status checks to pass" for CI/CD
- Set up GitHub Actions for testing/building (see next section)

---

## 🤖 GitHub Actions Setup (Optional)

Create `.github/workflows/ci.yml` for automated testing:

```yaml
name: CI

on:
  push:
    branches: [master, develop]
  pull_request:
    branches: [master, develop]

jobs:
  test:
    runs-on: ubuntu-latest

    strategy:
      matrix:
        node-version: [18.x, 20.x]

    steps:
      - uses: actions/checkout@v3

      - name: Use Node.js ${{ matrix.node-version }}
        uses: actions/setup-node@v3
        with:
          node-version: ${{ matrix.node-version }}

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm test

      - name: Run linter
        run: npm run lint

      - name: Build
        run: npm run build
```

---

## 📦 Deployment Setup (Optional)

### Docker Hub

1. Create account at [Docker Hub](https://hub.docker.com)
2. Create new repository: `your-username/umuganda-app`
3. Add secrets to GitHub:
   - `DOCKER_USERNAME`
   - `DOCKER_PASSWORD` (or access token)

### Environment Secrets for GitHub Actions

Add to GitHub repository:

- Settings → Secrets and variables → Actions
- Add required secrets for deployment:
  ```
  DATABASE_URL
  NEXTAUTH_SECRET
  NEXTAUTH_URL
  CLOUDINARY_CLOUD_NAME (for image uploads)
  CLOUDINARY_API_KEY
  CLOUDINARY_API_SECRET
  ```

---

## 🔐 Security Checklist

- ✅ Never commit `.env.local` or sensitive credentials
- ✅ Use `.gitignore` (already configured)
- ✅ Enable branch protection on `master`
- ✅ Use GitHub secrets for sensitive environment variables
- ✅ Enable 2FA on your GitHub account
- ✅ Review collaborators and their permissions regularly

---

## 📊 Repository Maintenance

### Regular Tasks

**Weekly:**

- Review and merge pull requests
- Monitor CI/CD status
- Check for security alerts

**Monthly:**

- Review open issues
- Plan next sprint
- Update dependencies with `npm update`

**Per Release:**

- Create release notes
- Tag release version
- Update CHANGELOG.md
- Merge to master and develop

---

## 🆘 Troubleshooting

### Authentication Issues

If you get authentication errors:

**Option 1: Use HTTPS with Personal Access Token**

```bash
git remote set-url origin https://YOUR-TOKEN@github.com/USERNAME/umuganda-app.git
```

**Option 2: Use SSH** (recommended)

```bash
# Generate SSH key if you haven't
ssh-keygen -t ed25519 -C "your-email@example.com"

# Add to GitHub: Settings → SSH and GPG keys → New SSH key

# Update remote
git remote set-url origin git@github.com:USERNAME/umuganda-app.git
```

### Branch Push Issues

```bash
# If develop branch won't push
git push -u origin develop --force-with-lease

# Check remote tracking
git branch -vv

# Fix tracking if needed
git branch --set-upstream-to=origin/develop develop
```

### Merge Conflicts

```bash
# When pulling updates
git pull origin develop

# Resolve conflicts in files, then
git add .
git commit -m "Resolve merge conflicts"
git push origin develop
```

---

## 📚 Resources

- [GitHub Documentation](https://docs.github.com)
- [Git Workflow Guide](https://guides.github.com)
- [Semantic Versioning](https://semver.org)
- [Conventional Commits](https://www.conventionalcommits.org)

---

## ✨ Next Steps

1. **Push to GitHub**

   ```bash
   git remote add origin https://github.com/YOUR-USERNAME/umuganda-app.git
   git push -u origin master develop
   ```

2. **Setup Branch Protection**

   - Go to Settings → Branches
   - Add rule for `master` branch

3. **Enable GitHub Pages** (optional)

   - For project documentation
   - Settings → Pages → Deploy from main/docs folder

4. **Start Contributing**
   - Create feature branches
   - Submit pull requests
   - Follow the workflow

---

## 🎯 Team Collaboration

### For Team Members

Clone the repository:

```bash
git clone https://github.com/YOUR-USERNAME/umuganda-app.git
cd umuganda-app
npm install
```

Create feature branch:

```bash
git checkout develop
git pull origin develop
git checkout -b feature/your-feature
```

Make changes and push:

```bash
git add .
git commit -m "Description of changes"
git push origin feature/your-feature
```

### Code Review Process

1. Push feature branch to GitHub
2. Create Pull Request (PR) to `develop`
3. Link to any related issues
4. Request reviewers
5. Address feedback
6. Merge when approved

---

**Repository Status**: ✅ INITIALIZED & READY  
**Current Branch**: master (49 files, 17,462 insertions)  
**Remote Status**: Awaiting GitHub connection  
**Next Action**: Create GitHub repository and push branches

---

For questions, refer to [GitHub Docs](https://docs.github.com/en) or contact your team lead.
