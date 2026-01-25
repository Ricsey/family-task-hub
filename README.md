## Getting started

Follow these steps to start the application locally using Docker compose.  
This setup includes the **backend**, **frontend**, **PostgreSQL database**, and **pgAdmin**.

### Prerequisites

Before starting, make sure you have the following installed:

- [Docker](https://docs.docker.com/get-docker/) (version 24+ recommended)
- [Docker Compose](https://docs.docker.com/compose/install/) (version 2+ recommended)

### Environment Variables

This project uses a `.env` file to configure services. Copy the example file and update the values:

```bash
cp .env.example .env
```

Edit the `.env` with your preferred credentials.

## Running the application

Start the full stack with:
```bash
docker compose up --build
```

**Notes:**  
- Entrypoints for the services handle the initialization setup.

### Accessing the services
Once the containers are running:

| Service  | URL                                            |
| -------- | ---------------------------------------------- |
| Backend  | [http://localhost:8000](http://localhost:8000) |
| Frontend | [http://localhost:5173](http://localhost:5173) |
| pgAdmin  | [http://localhost:8080](http://localhost:8080) |

Use the credentials from your `.env` file to log in to pgAdmin.

### Stopping the application

To stop all the services:
```bash
docker compose down
```

If you want to remove volumes as well (for a fresh start):
```bash
docker compose down -v
```


# Development Environment


## 🛠 Prerequisites
- **Docker Engine / Desktop** (Min. 4GB RAM allocated)
- **VS Code** with **Dev Containers** extension

---

## 🏗 Setup containers
Copy the .env file to `.devcontainer/` folder.
To avoid Memory Error `137` inside VS Code, run the builds and installations manually from your host terminal first **in the root directory**.

### 1. Build the Images
```bash
docker compose -f docker-compose.yml -f ./.devcontainer/docker-compose.dev.yml build
```

### 2. Install Frontend Dependencies (Bun)
This populates the anonymous volume for `node_modules`.
```bash
docker compose -f docker-compose.yml -f ./.devcontainer/docker-compose.dev.yml run --rm frontend bun install
```

### 3. Install Backend Dependencies (uv)
This populates the anonymous volume for the Python virtual environment.
```bash
docker compose -f docker-compose.yml -f ./.devcontainer/docker-compose.dev.yml run --rm backend uv sync
```

---

## Connect to a container
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
