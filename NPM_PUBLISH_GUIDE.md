# NPM Publishing Guide for miniORM

This guide will walk you through the process of publishing miniORM to npm.

## Prerequisites

Before publishing, ensure you have:

1. **Node.js and npm installed**
   ```bash
   node --version
   npm --version
   ```

2. **An npm account**
   - If you don't have one, create it at [npmjs.com](https://www.npmjs.com/signup)

3. **Verified email address** on npm
   - Check your npm profile settings to ensure your email is verified

## Pre-Publishing Checklist

### 1. Update Package Information

Before publishing, update the following fields in `package.json`:

```json
{
  "author": "Your Name <your.email@example.com>",
  "repository": {
    "type": "git",
    "url": "https://github.com/yourusername/miniorm.git"
  },
  "bugs": {
    "url": "https://github.com/yourusername/miniorm/issues"
  },
  "homepage": "https://github.com/yourusername/miniorm#readme"
}
```

**Note:** If you don't have a GitHub repository yet, you can either:
- Create one and push your code
- Or remove the `repository`, `bugs`, and `homepage` fields (not recommended)

### 2. Check Package Name Availability

The name `miniorm` might already be taken on npm. Check availability:

```bash
npm search miniorm
```

If taken, consider alternatives:
- `@yourusername/miniorm` (scoped package)
- `mini-orm-mysql`
- `miniorm-mysql`
- `lightweight-mysql-orm`

To use a scoped package, update `package.json`:
```json
{
  "name": "@yourusername/miniorm"
}
```

### 3. Test Your Package Locally

Before publishing, test the package locally:

```bash
# Run tests
npm test

# Test the build
npm pack
```

This creates a `.tgz` file showing exactly what will be published. Extract and review it:
```bash
tar -xzf miniorm-1.0.0.tgz
cd package
ls -la
```

### 4. Review Files to be Published

The `files` field in `package.json` controls what gets published:

```json
"files": [
  "miniORM.js",
  "builder/",
  "db/",
  "execute/",
  "helper/",
  "README.md",
  "LICENSE"
]
```

## Publishing Steps

### Step 1: Login to npm

```bash
npm login
```

You'll be prompted for:
- Username
- Password
- Email
- One-time password (if 2FA is enabled)

Verify you're logged in:
```bash
npm whoami
```

### Step 2: Dry Run (Optional but Recommended)

See what will be published without actually publishing:

```bash
npm publish --dry-run
```

This shows:
- Package name and version
- Files that will be included
- Package size

### Step 3: Publish to npm

For a public package (free):
```bash
npm publish
```

For a scoped package (if using @username/miniorm):
```bash
npm publish --access public
```

### Step 4: Verify Publication

After publishing, verify:

1. Visit your package page: `https://www.npmjs.com/package/miniorm`
2. Try installing it:
   ```bash
   mkdir test-install
   cd test-install
   npm init -y
   npm install miniorm
   ```

## Post-Publishing

### 1. Add Badges to README

Add npm badges to your README.md:

```markdown
[![npm version](https://img.shields.io/npm/v/miniorm.svg)](https://www.npmjs.com/package/miniorm)
[![npm downloads](https://img.shields.io/npm/dm/miniorm.svg)](https://www.npmjs.com/package/miniorm)
[![license](https://img.shields.io/npm/l/miniorm.svg)](https://github.com/yourusername/miniorm/blob/main/LICENSE)
```

### 2. Create a Git Tag

Tag your release:
```bash
git tag -a v1.0.0 -m "Release version 1.0.0"
git push origin v1.0.0
```

### 3. Create a GitHub Release

If using GitHub, create a release:
1. Go to your repository
2. Click "Releases" → "Create a new release"
3. Select the tag you just created
4. Add release notes

## Updating Your Package

When you need to publish updates:

### 1. Update Version Number

Use npm's version command:

```bash
# For bug fixes (1.0.0 → 1.0.1)
npm version patch

# For new features (1.0.0 → 1.1.0)
npm version minor

# For breaking changes (1.0.0 → 2.0.0)
npm version major
```

This automatically:
- Updates `package.json`
- Creates a git commit
- Creates a git tag

### 2. Push Changes

```bash
git push
git push --tags
```

### 3. Publish Update

```bash
npm publish
```

## Common Issues and Solutions

### Issue: "You do not have permission to publish"

**Solution:** The package name is already taken. Choose a different name or use a scoped package.

### Issue: "Package name too similar to existing package"

**Solution:** npm might block names similar to popular packages. Choose a more unique name.

### Issue: "npm ERR! 403 Forbidden"

**Solutions:**
- Ensure you're logged in: `npm whoami`
- Check if 2FA is enabled on your account
- Verify email address is confirmed

### Issue: "Missing README"

**Solution:** npm requires a README.md file. Ensure it exists in your project root.

### Issue: Main file not found

**Solution:** Ensure the `main` field in `package.json` points to the correct file:
```json
{
  "main": "miniORM.js"
}
```

## Security Best Practices

1. **Enable 2FA on npm**
   ```bash
   npm profile enable-2fa auth-and-writes
   ```

2. **Never commit sensitive data**
   - API keys
   - Database credentials
   - `.env` files

3. **Review `.npmignore`**
   - Ensure test files, examples, and development files are excluded

4. **Use npm audit**
   ```bash
   npm audit
   npm audit fix
   ```

## Unpublishing (Emergency Only)

If you need to unpublish within 72 hours:

```bash
npm unpublish miniorm@1.0.0
```

**Warning:** 
- Only works within 72 hours of publishing
- You cannot republish the same version
- Unpublishing is permanent
- Use deprecation instead when possible:
  ```bash
  npm deprecate miniorm@1.0.0 "Use version 1.0.1 instead"
  ```

## Useful Commands

```bash
# View package info
npm view miniorm

# View all versions
npm view miniorm versions

# Check what files will be published
npm pack --dry-run

# See package details
npm show miniorm

# List your published packages
npm access ls-packages

# Check outdated dependencies
npm outdated
```

## Resources

- [npm Documentation](https://docs.npmjs.com/)
- [npm Package Publishing Guide](https://docs.npmjs.com/packages-and-modules/contributing-packages-to-the-registry)
- [Semantic Versioning](https://semver.org/)
- [npm CLI Documentation](https://docs.npmjs.com/cli/v8/commands/npm-publish)

## Need Help?

If you encounter issues:
1. Check [npm status](https://status.npmjs.org/)
2. Review [npm support](https://www.npmjs.com/support)
3. Ask in the npm [community forum](https://github.com/npm/feedback)

---

**Good luck with your npm package! 🚀**