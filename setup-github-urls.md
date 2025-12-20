# Setup GitHub URLs for npm Publishing

**Quick guide to update all GitHub URLs before publishing mySQLizer v1.1.0 to npm**

---

## 🎯 What You Need

Your GitHub username or organization name where you'll host the mySQLizer repository.

**Example:**
- If your GitHub username is `johndoe`
- Your repository will be: `https://github.com/johndoe/mysqlizer`

---

## 📝 Files to Update

### 1. package.json (3 locations)

**Find and replace:** `yourusername` → `YOUR_GITHUB_USERNAME`

**Lines to update:**

```json
{
  "repository": {
    "type": "git",
    "url": "https://github.com/yourusername/mysqlizer.git"
  },
  "bugs": {
    "url": "https://github.com/yourusername/mysqlizer/issues"
  },
  "homepage": "https://github.com/yourusername/mysqlizer#readme"
}
```

**After updating (example with username `johndoe`):**

```json
{
  "repository": {
    "type": "git",
    "url": "https://github.com/johndoe/mysqlizer.git"
  },
  "bugs": {
    "url": "https://github.com/johndoe/mysqlizer/issues"
  },
  "homepage": "https://github.com/johndoe/mysqlizer#readme"
}
```

---

### 2. README.md (Logo URLs)

**Find and replace:** `yourusername` → `YOUR_GITHUB_USERNAME`

**Lines to update (near the top of README.md):**

```markdown
<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/yourusername/mysqlizer/main/assets/mysqlizer-logo.png">
  <source media="(prefers-color-scheme: light)" srcset="https://raw.githubusercontent.com/yourusername/mysqlizer/main/assets/mysqlizer-logo.png">
  <img alt="mySQLizer Logo" src="./assets/mysqlizer-logo.png" width="400">
</picture>
```

**After updating (example with username `johndoe`):**

```markdown
<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/johndoe/mysqlizer/main/assets/mysqlizer-logo.png">
  <source media="(prefers-color-scheme: light)" srcset="https://raw.githubusercontent.com/johndoe/mysqlizer/main/assets/mysqlizer-logo.png">
  <img alt="mySQLizer Logo" src="./assets/mysqlizer-logo.png" width="400">
</picture>
```

---

## 🤖 Quick Find & Replace

### Using VS Code
1. Press `Ctrl+Shift+H` (Windows/Linux) or `Cmd+Shift+H` (Mac)
2. In "Find": Enter `yourusername`
3. In "Replace": Enter your GitHub username
4. Click "Replace All" or review each replacement

### Using Command Line (Linux/Mac)
```bash
# Replace in package.json
sed -i 's/yourusername/YOUR_GITHUB_USERNAME/g' package.json

# Replace in README.md
sed -i 's/yourusername/YOUR_GITHUB_USERNAME/g' README.md
```

### Using Command Line (Windows PowerShell)
```powershell
# Replace in package.json
(Get-Content package.json) -replace 'yourusername', 'YOUR_GITHUB_USERNAME' | Set-Content package.json

# Replace in README.md
(Get-Content README.md) -replace 'yourusername', 'YOUR_GITHUB_USERNAME' | Set-Content README.md
```

---

## ✅ Verification Checklist

After making updates, verify:

### 1. Check package.json
```bash
# Search for 'yourusername' - should return no results
grep "yourusername" package.json
```

### 2. Check README.md
```bash
# Search for 'yourusername' - should return no results
grep "yourusername" README.md
```

### 3. Verify URLs are correct
- [ ] `repository.url` has your username
- [ ] `bugs.url` has your username
- [ ] `homepage` has your username
- [ ] Logo URLs in README have your username

---

## 🚀 Push to GitHub

After updating URLs:

```bash
# Create GitHub repository first (if not done)
# Go to https://github.com/new
# Repository name: mysqlizer
# Make it public (important for logo display)

# Initialize git (if not already done)
git init

# Add remote (replace YOUR_GITHUB_USERNAME)
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/mysqlizer.git

# Add all files
git add .

# Commit
git commit -m "Prepare mySQLizer v1.1.0 for npm publishing"

# Push to main branch
git push -u origin main
```

---

## 🖼️ Verify Logo Display

After pushing to GitHub, verify the logo is accessible:

**Open in browser:**
```
https://raw.githubusercontent.com/YOUR_GITHUB_USERNAME/mysqlizer/main/assets/mysqlizer-logo.png
```

**Replace `YOUR_GITHUB_USERNAME` with your actual username.**

✅ If the logo displays, you're ready to publish to npm!
❌ If it shows 404, check:
- Repository is public
- File path is correct: `assets/mysqlizer-logo.png`
- Branch name is `main` (not `master`)

---

## 📋 Complete Example

**If your GitHub username is `johndoe`:**

### package.json
```json
{
  "name": "mysqlizer",
  "version": "1.1.0",
  "repository": {
    "type": "git",
    "url": "https://github.com/johndoe/mysqlizer.git"
  },
  "bugs": {
    "url": "https://github.com/johndoe/mysqlizer/issues"
  },
  "homepage": "https://github.com/johndoe/mysqlizer#readme"
}
```

### README.md (Logo section)
```markdown
<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/johndoe/mysqlizer/main/assets/mysqlizer-logo.png">
  <source media="(prefers-color-scheme: light)" srcset="https://raw.githubusercontent.com/johndoe/mysqlizer/main/assets/mysqlizer-logo.png">
  <img alt="mySQLizer Logo" src="./assets/mysqlizer-logo.png" width="400">
</picture>
```

### Verify logo URL
```
https://raw.githubusercontent.com/johndoe/mysqlizer/main/assets/mysqlizer-logo.png
```

---

## 🎯 Next Steps

After updating URLs and pushing to GitHub:

1. ✅ Verify logo displays on GitHub README
2. ✅ Verify logo is accessible via raw URL
3. ✅ Test package locally: `npm pack`
4. ✅ Login to npm: `npm login`
5. ✅ Dry run: `npm publish --dry-run`
6. ✅ Publish: `npm publish`
7. ✅ Check npm page for logo: `https://www.npmjs.com/package/mysqlizer`

---

## 💡 Important Notes

### Why GitHub URLs Matter

1. **Logo Display on npm:** npm displays the README from your GitHub repository, so absolute GitHub URLs ensure the logo shows correctly.

2. **Package Metadata:** Proper repository URLs help users find your source code and report issues.

3. **npm Badge:** Repository link appears on your npm package page.

### Branch Name

If your default branch is `master` instead of `main`, update the URLs:
```
https://raw.githubusercontent.com/USERNAME/mysqlizer/master/assets/mysqlizer-logo.png
```

### Private Repository

If your repository is private:
- Logo will NOT display on npm
- Make repository public, or
- Host logo elsewhere (CDN, imgur, etc.)

---

## 🆘 Troubleshooting

### "Logo not showing on npm"

1. Wait 5-10 minutes for npm CDN to cache
2. Verify GitHub URL works in browser
3. Ensure repository is public
4. Check `assets/` folder is in package.json `files` array
5. Clear browser cache and reload npm page

### "Repository URL broken"

- Check for typos in username
- Ensure repository name is exactly `mysqlizer`
- Verify repository exists on GitHub

### "Cannot push to GitHub"

```bash
# Check remote URL
git remote -v

# Update remote URL if needed
git remote set-url origin https://github.com/YOUR_USERNAME/mysqlizer.git

# Try pushing again
git push -u origin main
```

---

## ✨ Ready to Publish!

Once you've:
- ✅ Updated all GitHub URLs
- ✅ Pushed to GitHub
- ✅ Verified logo displays
- ✅ Tested package locally

You're ready to publish to npm! 🚀

See `NPM_PUBLISH_GUIDE.md` for detailed publishing instructions.

---

**Last Updated:** 2025  
**Version:** 1.1.0  
**Status:** Ready for npm publishing