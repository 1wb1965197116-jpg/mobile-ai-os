
#!/bin/bash
# Auto-deploy script for Working Copy
git add .
git commit -m "Auto-deploy Mobile-AI-OS"
git push origin main
echo "Project pushed to GitHub!"
