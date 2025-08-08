# 🎮 CLAUDE FLOW: THE ASCENSION - START GUIDE

## ✅ **QUICK START (PRODUCTION WITH AUTO-UPDATE)**

### Option 1: Full Auto-Update (RECOMMENDED)
```bash
# This ALWAYS checks for latest claude-flow@alpha
npm run start
```

### Option 2: Development Mode with Update
```bash
# Updates then starts both server and client
npm run dev:with-update
```

### Option 3: Simple Development Mode
```bash
# Just start the game (uses cached version)
npm run dev
```

Then open: **http://localhost:3000**

---

## 🚀 **AUTO-UPDATE SYSTEM EXPLAINED**

The game now has a **REAL server-side auto-update system** that:

1. **ALWAYS** checks for the latest claude-flow@alpha version
2. **Clears all caches** to ensure fresh download
3. **Forces npx** to download the latest version
4. **Runs update server** on port 3456 for monitoring
5. **Updates the game** with discovered features

### How It Works:
- **Server-side** (`/server/updateServer.js`) - Executes real npm/npx commands
- **Client-side** (`/src/systems/autoUpdateClient.ts`) - Fetches status from server
- **Update dialogue** - Shows real-time update progress in game

### Scripts Available:
```bash
npm run start              # Production start with full update
npm run dev:with-update    # Development with update server
npm run update:force       # Force update claude-flow
npm run server:update      # Run update server standalone
```

---

## 🎮 **GAME FEATURES**

### What's Working:
- ✅ **Auto-update system** - Real version checking
- ✅ **Interactive tutorial** - 12 steps
- ✅ **Command sandbox** - Practice commands
- ✅ **3D swarm visualization** - See agents in action
- ✅ **90+ achievements** - Unlock them all
- ✅ **Wiki integration** - Real Claude Flow knowledge
- ✅ **Easter eggs** - Find rUv tributes
- ✅ **XP system** - Level up to God Mode
- ✅ **Particle effects** - Visual feedback
- ✅ **Challenge modes** - 6 different types

### Game Progression:
1. **Level 1: The Awakening** - Basic commands
2. **Level 2: The Apprentice** - Agent coordination
3. **Level 3: The Coder** - SPARC methodology
4. **Level 4: The Architect** - System design
5. **Level 5: The Swarm Master** - Neural patterns
6. **Level 6: rUv God Mode** - Ultimate mastery

---

## 🎯 **CONTROLS**

- **Space** - Execute command
- **Tab** - Auto-complete
- **Enter** - Submit
- **Click** - Navigate panels
- **ESC** - Exit mode

---

## 🔧 **TROUBLESHOOTING**

### Update Server Not Running?
```bash
# Start it manually
node server/updateServer.js &
npm run dev
```

### Port Issues?
```bash
PORT=3002 npm run dev
```

### Cache Issues?
```bash
npm cache clean --force
rm -rf ~/.npm/_npx
npm run update:force
```

---

## 📊 **VERSION INFO**

The game will show you:
- Current claude-flow version
- Latest available version
- New features discovered
- Update status in real-time

Check the update dialogue that appears when the game starts!

---

## 🚀 **PLAY NOW!**

```bash
# Best experience with full auto-update:
npm run start

# Or quick development mode:
npm run dev
```

Open: **http://localhost:3000**

**Enjoy your journey from Noob to rUv God Mode!** 🎮

---

## 🌟 **IMPORTANT NOTES**

1. **Auto-update is REAL** - Not simulated, actually downloads latest
2. **Server required** - Update server must run for version checking
3. **First start slower** - Downloads latest claude-flow@alpha
4. **Cached for speed** - Subsequent starts use cached version
5. **Force update anytime** - Use `npm run update:force`

The game now truly ensures you're always using the latest Claude Flow version!