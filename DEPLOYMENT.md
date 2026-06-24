# Deployment Guide - Yahoo! Messenger Chat

## Option 1: Render (Recommended - Free)

Render offers free hosting with WebSocket support, perfect for this chat app.

### Steps:

1. **Create a Render account** at https://render.com

2. **Push your code to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin YOUR_GITHUB_REPO_URL
   git push -u origin main
   ```

3. **Create a Web Service on Render**
   - Go to Render Dashboard
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Configure:
     - **Name**: `ym-chat` (or your choice)
     - **Environment**: `Node`
     - **Build Command**: `npm install && npm run build`
     - **Start Command**: `npm start`
     - **Environment Variables**:
       - `NODE_ENV` = `production`
       - `CLIENT_URL` = (leave empty for now, will set after deployment)

4. **After deployment**, get your app URL (e.g., `https://ym-chat.onrender.com`)

5. **Update Environment Variables** on Render:
   - Set `CLIENT_URL` to your Render URL (e.g., `https://ym-chat.onrender.com`)

6. **Done!** Share your URL with friends to chat together.

**Note**: Free Render services spin down after 15 minutes of inactivity. First load might take 30-60 seconds.

---

## Option 2: Railway (Easy Alternative)

Railway is another great option with similar setup.

### Steps:

1. **Create account** at https://railway.app
2. **New Project** → **Deploy from GitHub**
3. Connect your repository
4. Railway will auto-detect settings
5. Add environment variables:
   - `NODE_ENV` = `production`
6. Get your deployment URL and share!

---

## Option 3: Fly.io (More Advanced)

For more control and better performance:

1. Install Fly CLI: https://fly.io/docs/hands-on/install-flyctl/
2. Create account: `fly auth signup`
3. Create `fly.toml` configuration file
4. Deploy: `fly deploy`

---

## Option 4: Self-Host (VPS)

If you have a VPS or want to host on your own server:

1. SSH into your server
2. Clone repository
3. Install dependencies: `npm install`
4. Build: `npm run build`
5. Run with PM2: `pm2 start npm --name "ym-chat" -- start`
6. Setup nginx reverse proxy on port 80/443
7. Get SSL certificate with Let's Encrypt

---

## Testing Deployment Locally

Before deploying, test the production build locally:

```bash
# Build the frontend
npm run build

# Start the production server
npm start
```

Visit `http://localhost:3001` to test.

---

## Environment Variables Summary

**Production**:
- `NODE_ENV=production`
- `PORT=3001` (or whatever your host assigns)
- `CLIENT_URL=https://your-deployed-url.com`

**Frontend** (set in Render/Railway dashboard or .env):
- `VITE_SERVER_URL=https://your-deployed-url.com`

For Render single-service deployment, you don't need VITE_SERVER_URL since the frontend and backend are on the same domain.
