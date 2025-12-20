# NPM Publishing Guide for mySQLizer

**Package:** mySQLizer  
**Current Version:** 1.1.0  
**Package Name:** mysqlizer

This guide will walk you through publishing mySQLizer to npm with proper logo display on both GitHub and npm.

---

## 📋 Prerequisites

Before publishing, ensure you have:

1. **Node.js and npm installed**
   ```bash
   node --version  # Should be >= 14.0.0
   npm --version
   ```

2. **An npm account**
   - Create at [npmjs.com/signup](https://www.npmjs.com/signup)
   - Verify your email address

3. **GitHub repository (for logo display)**
   - Logo must be accessible via GitHub raw URL
   - Repository should be public

---

## 🔧 Pre-Publishing Setup

### Step 1: Update GitHub Repository URL

**IMPORTANT:** Update `package.json` with your actual GitHub username/organization:

```json
{
  "repository": {
    "type": "git",
    "url": "https://github.com/YOURUSERNAME/mysqlizer.git"
  },
  "bugs": {
    "url": "https://github.com/YOURUSERNAME/mysqlizer/issues"
  },
  "homepage": "https://github.com/YOURUSERNAME/mysqlizer#readme"
}
```

Replace `YOURUSERNAME` with your actual GitHub username.

### Step 2: Update README Logo URL

In `README.md`, update the logo URLs (lines 3-5):

```markdown
<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/YOURUSERNAME/mysqlizer/main/assets/mysqlizer-logo.png">
  <source media="(prefers-color-scheme: light)" srcset="https://raw.githubusercontent.com/YOURUSERNAME/mysqlizer/main/assets/mysqlizer-logo.png">
  <img alt="mySQLizer Logo" src="./assets/mysqlizer-logo.png" width="400">
</picture>
```

Replace `YOURUSERNAME` with your actual GitHub username.

**Note:** The `<picture>` element provides:
- Absolute GitHub URLs for npm display
- Relative path fallback for local/GitHub display
- Dark/light mode support

### Step 3: Update Author Information

Update `package.json`:

```json
{
  "author": "Your Name <your.email@example.com>"
}
```

### Step 4: Push to GitHub

Ensure your code is pushed to GitHub:

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Prepare mySQLizer v1.1.0 for npm publishing"

# Add remote (replace with your URL)
git remote add origin https://github.com/YOURUSERNAME/mysqlizer.git

# Push to main branch
git push -u origin main

# Verify logo is accessible
# Visit: https://raw.githubusercontent.com/YOURUSERNAME/mysqlizer/main/assets/mysqlizer-logo.png
```

**Verify the logo loads:** Open the raw GitHub URL in your browser to ensure the logo is accessible.

---

## ✅ Pre-Publishing Checklist

Before publishing, verify:

- [ ] GitHub repository exists and is public
- [ ] Logo file exists at `assets/mysqlizer-logo.png`
- [ ] Logo is accessible via GitHub raw URL
- [ ] `package.json` has correct GitHub URLs
- [ ] `README.md` has correct logo URLs
- [ ] Author information is updated
- [ ] Version is set to 1.1.0
- [ ] `assets/` folder is included in `files` array

Check what will be published:

```bash
# See files that will be included
npm pack --dry-run

# Create a test package
npm pack
```

This creates `mysqlizer-1.1.0.tgz`. Extract and verify:

```bash
tar -xzf mysqlizer-1.1.0.tgz
cd package
ls -la
```

Verify these files are present:
- ✅ `mySQLizer.js`
- ✅ `README.md`
- ✅ `LICENSE`
- ✅ `assets/mysqlizer-logo.png`
- ✅ `builder/` directory
- ✅ `db/` directory
- ✅ `execute/` directory
- ✅ `helper/` directory

---

## 📦 Publishing to npm

### Step 1: Login to npm

```bash
npm login
```

Enter:
- Username
- Password
- Email
- OTP (if 2FA enabled)

Verify login:
```bash
npm whoami
```

### Step 2: Check Package Name

Verify `mysqlizer` is available (or if you've already published):

```bash
npm view mysqlizer
```

If the name is taken and not yours, consider:
- `@yourusername/mysqlizer` (scoped package)
- Contact npm support if you have rights to the name

### Step 3: Test Locally

Run tests before publishing:

```bash
npm test
```

### Step 4: Dry Run

See what will be published:

```bash
npm publish --dry-run
```

Review the output carefully:
- Package name: `mysqlizer`
- Version: `1.1.0`
- Files included (should show assets folder)
- Package size

### Step 5: Publish

```bash
npm publish
```

For scoped packages (if using @username/mysqlizer):
```bash
npm publish --access public
```

---

## ✅ Post-Publishing Verification

### Step 1: Verify on npm

1. Visit: https://www.npmjs.com/package/mysqlizer
2. Check that the logo displays correctly
3. Verify README formatting
4. Check package details

### Step 2: Test Installation

```bash
# Create test directory
mkdir test-mysqlizer
cd test-mysqlizer

# Initialize and install
npm init -y
npm install mysqlizer

# Test import
node -e "import('mysqlizer').then(() => console.log('✅ Package works!'))"
```

### Step 3: Create Git Tag

Tag the release:

```bash
git tag -a v1.1.0 -m "Release mySQLizer v1.1.0"
git push origin v1.1.0
git push --tags
```

### Step 4: Create GitHub Release

1. Go to: https://github.com/YOURUSERNAME/mysqlizer/releases
2. Click "Create a new release"
3. Select tag: `v1.1.0`
4. Release title: `mySQLizer v1.1.0`
5. Add release notes:

```markdown
## mySQLizer v1.1.0

### ✨ What's New
- Improved README with better logo display
- Enhanced npm package configuration
- Logo now displays on both GitHub and npm

### 📦 Installation
```bash
npm install mysqlizer
```

### 🔗 Links
- [npm Package](https://www.npmjs.com/package/mysqlizer)
- [Documentation](https://github.com/YOURUSERNAME/mysqlizer#readme)
```

6. Publish release

---

## 🔄 Updating the Package

For future updates:

### Update Version

```bash
# For bug fixes (1.1.0 → 1.1.1)
npm version patch

# For new features (1.1.0 → 1.2.0)
npm version minor

# For breaking changes (1.1.0 → 2.0.0)
npm version major
```

This automatically:
- Updates `package.json`
- Creates a git commit
- Creates a git tag

### Update Changelog

Create/update `CHANGELOG.md`:

```markdown
## [1.1.1] - 2025-XX-XX
### Fixed
- Bug fix description

### Added
- New feature description
```

### Publish Update

```bash
# Push changes
git push
git push --tags

# Publish to npm
npm publish
```

---

## 🐛 Troubleshooting

### Logo Not Displaying on npm

**Problem:** Logo shows broken image on npm

**Solutions:**
1. Verify GitHub repository is public
2. Check logo URL in browser: `https://raw.githubusercontent.com/YOURUSERNAME/mysqlizer/main/assets/mysqlizer-logo.png`
3. Wait 5-10 minutes for npm CDN to update
4. Ensure `assets/` is in the `files` array in package.json
5. Republish with version bump if needed

### "Cannot publish over existing version"

**Solution:** Increment version:
```bash
npm version patch
npm publish
```

### "You do not have permission to publish"

**Solutions:**
- Package name is taken by someone else
- Use scoped package: `@yourusername/mysqlizer`
- Contact npm support if you own the name

### "403 Forbidden"

**Solutions:**
- Verify login: `npm whoami`
- Re-login: `npm logout && npm login`
- Check 2FA is properly configured
- Verify email is confirmed on npm

### Missing Files in Package

**Problem:** Files not included after publishing

**Solution:** Check `files` array in `package.json`:
```json
{
  "files": [
    "mySQLizer.js",
    "builder/",
    "db/",
    "execute/",
    "helper/",
    "assets/",
    "README.md",
    "LICENSE"
  ]
}
```

### Logo Path Issues

**Problem:** Logo works locally but not on npm

**Solution:** Use absolute GitHub URLs in README:
```markdown
<img src="https://raw.githubusercontent.com/YOURUSERNAME/mysqlizer/main/assets/mysqlizer-logo.png" width="400">
```

---

## 🔒 Security Best Practices

### Enable Two-Factor Authentication

```bash
npm profile enable-2fa auth-and-writes
```

### Review What Gets Published

Create `.npmignore` to exclude files:

```
# .npmignore
node_modules/
.env
.env.*
*.log
.DS_Store
.vscode/
.idea/
test/
tests/
examples/
*.test.js
.git/
.github/
coverage/
.nyc_output/
```

### Audit Dependencies

```bash
npm audit
npm audit fix
```

### Use npm Automation Tokens

For CI/CD:
```bash
npm token create --read-only
```

---

## 📊 Package Maintenance

### Monitor Downloads

Check package statistics:
- npm website: https://www.npmjs.com/package/mysqlizer
- npm trends: https://npmtrends.com/mysqlizer

### Deprecate Old Versions

If a version has issues:
```bash
npm deprecate mysqlizer@1.0.0 "Please upgrade to 1.1.0 or later"
```

### Unpublish (Emergency Only)

Within 72 hours of publishing:
```bash
npm unpublish mysqlizer@1.1.0
```

**Warning:** 
- Only use in emergencies (security issues, leaked secrets)
- Cannot republish same version
- Breaks dependent projects
- Prefer deprecation instead

---

## 📝 Useful Commands

```bash
# View package info
npm view mysqlizer

# View all versions
npm view mysqlizer versions

# View latest version
npm view mysqlizer version

# See package details
npm info mysqlizer

# List your published packages
npm access ls-packages

# View package on npm
npm docs mysqlizer

# Check package size
npm pack --dry-run

# View package files
npm pack && tar -tzf mysqlizer-1.1.0.tgz

# Search npm registry
npm search mysqlizer

# View download stats (requires npm-stat package)
npx npm-stat mysqlizer
```

---

## 📚 Resources

- [npm Documentation](https://docs.npmjs.com/)
- [Publishing Packages](https://docs.npmjs.com/packages-and-modules/contributing-packages-to-the-registry)
- [Semantic Versioning](https://semver.org/)
- [npm CLI Reference](https://docs.npmjs.com/cli/v8/commands/npm-publish)
- [package.json Guide](https://docs.npmjs.com/cli/v8/configuring-npm/package-json)
- [npm Blog](https://blog.npmjs.org/)

---

## 🎯 Quick Checklist for v1.1.0

Before running `npm publish`, verify:

- [ ] Version in package.json is `1.1.0`
- [ ] GitHub repository URL is updated with your username
- [ ] README logo URL is updated with your username
- [ ] Author information is correct
- [ ] `assets/` folder is in the `files` array
- [ ] Code is pushed to GitHub
- [ ] Logo is accessible via GitHub raw URL
- [ ] Tests pass (`npm test`)
- [ ] Dry run looks good (`npm publish --dry-run`)
- [ ] Logged into npm (`npm whoami`)
- [ ] 2FA is enabled on npm account

---

## 🚀 Quick Publishing Commands

```bash
# 1. Update GitHub URLs in package.json and README.md

# 2. Push to GitHub
git add .
git commit -m "Prepare v1.1.0 for npm publishing"
git push

# 3. Verify logo URL
# Open: https://raw.githubusercontent.com/YOURUSERNAME/mysqlizer/main/assets/mysqlizer-logo.png

# 4. Test package
npm pack --dry-run

# 5. Login to npm
npm login

# 6. Dry run
npm publish --dry-run

# 7. Publish
npm publish

# 8. Create git tag
git tag -a v1.1.0 -m "Release v1.1.0"
git push --tags

# 9. Verify on npm
# Visit: https://www.npmjs.com/package/mysqlizer

# 10. Test installation
npm install mysqlizer
```

---

## 💡 Tips for Success

1. **Always test locally first** - Use `npm pack` and install the .tgz file
2. **Use semantic versioning** - Follow semver.org guidelines
3. **Write good release notes** - Help users understand what changed
4. **Keep README updated** - First impression matters
5. **Respond to issues** - Build trust with users
6. **Monitor security** - Run `npm audit` regularly
7. **Use automation** - Consider GitHub Actions for publishing
8. **Document breaking changes** - Be clear about migration paths
9. **Maintain changelog** - Track all changes over time
10. **Engage community** - Welcome contributions and feedback

---

**Ready to publish mySQLizer v1.1.0! 🎉**

For questions or issues, check:
- [npm Support](https://www.npmjs.com/support)
- [npm Community Forum](https://github.com/npm/feedback)
- [npm Status](https://status.npmjs.org/)

Good luck with your npm package! 🚀