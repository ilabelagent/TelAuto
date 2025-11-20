# 🚀 GitHub Sync Guide

## ⚡ One-Command Sync

```cmd
cd C:\Users\josh\Desktop\GodBrainAI\ai-chat-system
sync-to-github.bat
```

That's it! The script handles everything.

---

## 📖 What the Script Does

1. ✅ Checks if Git is installed
2. ✅ Initializes Git repository (if needed)
3. ✅ Creates .gitignore (protects sensitive files)
4. ✅ Creates README.md (if needed)
5. ✅ Adds all files to Git
6. ✅ Commits changes
7. ✅ Adds GitHub remote
8. ✅ Pushes to https://github.com/ilabelagent/TelAuto.git

---

## 🔒 Protected Files (.gitignore)

These files are automatically excluded from Git:

❌ **Service Account Keys:**
- `ilabeliman-*.json`
- Any `.json` file

❌ **Secrets:**
- `.env` files
- `credentials`

❌ **Session Files:**
- `*.session`
- Learning data with personal info

❌ **Dependencies:**
- `node_modules/`
- Downloaded models

✅ **What IS committed:**
- Source code (.js files)
- Deployment configurations
- Documentation
- Package.json
- Dockerfile

---

## 🛠️ Before First Sync

### 1. Install Git (if not installed)

```cmd
winget install Git.Git
```

Or download from: https://git-scm.com/download/win

### 2. Configure Git (first time only)

```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

### 3. Authenticate with GitHub

**Option A: GitHub CLI (Recommended)**
```bash
gh auth login
```

**Option B: Personal Access Token**
1. Go to: https://github.com/settings/tokens
2. "Generate new token (classic)"
3. Give it `repo` scope
4. Copy the token
5. Use as password when pushing

**Option C: Git Credential Manager**
- Automatically prompts on first push
- Saves credentials securely

---

## 🔄 Updating After Changes

Every time you make changes:

```cmd
cd C:\Users\josh\Desktop\GodBrainAI\ai-chat-system
sync-to-github.bat
```

Or manually:

```bash
git add .
git commit -m "Your commit message"
git push
```

---

## 📝 Commit Message Tips

Good commit messages:
- ✅ "Add AWS App Runner deployment config"
- ✅ "Fix: Telegram authentication error"
- ✅ "Update: Ollama model to mistral"
- ✅ "Docs: Add Cloud Run guide"

Bad commit messages:
- ❌ "update"
- ❌ "fix stuff"
- ❌ "test"

---

## 🌐 After Syncing to GitHub

### 1. View Your Repo:
https://github.com/ilabelagent/TelAuto

### 2. Deploy to Render:

1. Go to: https://render.com
2. Click "New" → "Web Service"
3. Connect GitHub account
4. Select `TelAuto` repository
5. Render auto-detects `render.yaml`
6. Set environment variables:
   - `TELEGRAM_API_ID`
   - `TELEGRAM_API_HASH`
   - `TELEGRAM_PHONE`
   - `OLLAMA_MODEL`
7. Click "Create Web Service"
8. Wait 5-10 minutes
9. Bot is live! 🎉

**Cost:** $25/month

### 3. Enable GitHub Actions (Optional):

Create `.github/workflows/deploy.yml` for auto-deploy on push.

### 4. Add Badges to README:

Add to README.md:
```markdown
![Deploy Status](https://github.com/ilabelagent/TelAuto/actions/workflows/deploy.yml/badge.svg)
```

---

## ⚠️ Common Issues

### "Repository not found"

**Solution:** Create the repo on GitHub first:

1. Go to: https://github.com/new
2. Repository name: `TelAuto`
3. Make it **Public** or **Private**
4. Don't initialize with README (we already have one)
5. Click "Create repository"
6. Run `sync-to-github.bat` again

### "Authentication failed"

**Solution:** Use GitHub CLI:
```bash
gh auth login
```

Or create Personal Access Token:
- https://github.com/settings/tokens
- Generate token with `repo` scope
- Use as password

### "Rejected - non-fast-forward"

**Solution:** Pull first, then push:
```bash
git pull origin main --rebase
git push
```

### ".gitignore not working"

**Solution:** Files already tracked? Remove them:
```bash
git rm --cached ilabeliman-*.json
git commit -m "Remove service account keys"
git push
```

---

## 🔐 Security Checklist

Before pushing, verify:

- [ ] `.gitignore` exists
- [ ] No `ilabeliman-*.json` files in git
- [ ] No API keys in code
- [ ] No passwords in config files
- [ ] `.env` files excluded
- [ ] Session files excluded

Check what will be pushed:
```bash
git status
git diff --cached
```

---

## 📊 Git Workflow

```
Local Changes
    ↓
git add .
    ↓
git commit -m "message"
    ↓
git push
    ↓
GitHub Repository
    ↓
Render/AWS/GCP
 (auto-deploy)
```

---

## 🎓 Next Steps

### After First Sync:

1. ✅ Verify repo on GitHub: https://github.com/ilabelagent/TelAuto
2. ✅ Check README displays correctly
3. ✅ Verify sensitive files are NOT there
4. ✅ Deploy to Render ($25/mo) OR
5. ✅ Deploy to AWS ($50/mo) OR
6. ✅ Deploy to GCP ($150/mo)

### Regular Updates:

```bash
# Make changes to code
# Then sync:
sync-to-github.bat

# If deployed to Render, it auto-deploys from GitHub!
```

---

## 🔗 Quick Links

- **GitHub Repo:** https://github.com/ilabelagent/TelAuto
- **Render Dashboard:** https://dashboard.render.com
- **AWS Console:** https://console.aws.amazon.com
- **GCP Console:** https://console.cloud.google.com

---

**Ready to sync?** Run `sync-to-github.bat`! 🚀
