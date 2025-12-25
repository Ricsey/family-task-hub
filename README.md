# Family Task Hub - Development Environment

---

## 🛠 Prerequisites
- **Docker Engine / Desktop** (Min. 4GB RAM allocated)
- **VS Code** with **Dev Containers** extension

---

## 🏗 Setup Phase 1: The Heavy Lifting
To avoid Memory Error `137` inside VS Code, run the builds and installations manually from your host terminal first.

### 1. Build the Images
```bash
docker compose build
```

### 2. Install Frontend Dependencies (Bun)
This populates the anonymous volume for `node_modules`.
```bash
docker compose run --rm frontend bun install
```

### 3. Install Backend Dependencies (uv)
This populates the anonymous volume for the Python virtual environment.
```bash
docker compose run --rm backend uv sync
```

---

## 🚀 Setup Phase 2: VS Code Integration
Now that the volumes are "warm," you can safely attach VS Code.

1. Open the project folder in VS Code.
2. Press `F1` and select **"Dev Containers: Reopen in Container"**.
3. Choose the service you wish to work on (e.g., `frontend`).
4. The `postCreateCommand` will detect existing dependencies and finish instantly.

---

## 🏃 Running the Apps
Once inside the container terminal:

**Frontend:**
```bash
bun run dev
```

**Backend:**
```bash
uv run uvicorn src.main:app --host 0.0.0.0 --port 8000 --reload
```

---

## ⚠️ Troubleshooting
- **Permission Denied:** Run `sudo chown -R 1000:1000 .` on your host.
- **Database Issues:** Run `docker compose down -v` to wipe volumes and restart.
- **OOM Kill (137):** Increase Docker RAM limit to 4GB+ in Settings.
