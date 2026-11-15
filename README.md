# 3-Tier Dockerized App (Hardened Setup)

A simple 3-tier web application (Nginx, Node.js, PostgreSQL) containerized with Docker. I built this project to move beyond basic "it works on my machine" setups and practice real-world container security, network isolation, and image optimization.

## How It's Wired Together

```text
[Browser] ---> [Nginx (Port 80)] ---> [Node.js API (Port 3001)] ---> [PostgreSQL]
                  (frontend-net)         (frontend-net + backend-net)    (backend-net)
```

* **Frontend:** Nginx serving static files on port `80`.
* **Backend:** Node.js REST API acting as the bridge between the frontend and the database.
* **Database:** PostgreSQL running in an isolated network with persistent volume storage (`postgres-data`) and auto-seeding via `init.sql`.

## Key Things Implemented

* **Multi-stage Dockerfile:** Separated dependency installation from the final runtime image and cleaned the npm cache in the same layer to keep the image light.
* **Layer Caching:** Ordered `Dockerfile` instructions so `package.json` installs before copying source code, making rebuilds much faster when editing code.
* **Non-Root Execution:** Created a dedicated `nodejs` user (`UID 1001`) so the app never runs as `root`.
* **Container Hardening:** 
  * Set the backend root filesystem to `read_only: true` (with a writable `/tmp` in RAM via `tmpfs`).
  * Dropped all Linux kernel capabilities (`cap_drop: ALL`) and blocked privilege escalation (`no-new-privileges:true`).
  * Added CPU and memory limits to every service so one container can't starve the host.
* **Network Isolation & Healthchecks:** Put the database in a private `backend-net` (unreachable from the frontend) and used healthchecks so services wait until dependencies are actually ready before starting.

## Running It Locally

1. Clone the repo and go into the project folder:
   ```bash
   git clone [https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git](https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git)
   cd YOUR_REPO_NAME
   ```

2. Build and start the containers:
   ```bash
   docker compose up -d --build
   ```

3. Check that everything is up and healthy:
   ```bash
   docker compose ps
   ```

4. Open `http://localhost` in your browser.

## Testing the Security Rules

If you want to verify the hardening rules inside the running backend container:

```bash
# Should return 'nodejs' instead of 'root'
docker compose exec backend whoami

# Should fail with 'Read-only file system'
docker compose exec backend touch /app/test.txt
```

## Next Steps

* [ ] Add a GitHub Actions workflow to automate image builds and run vulnerability scans (`Docker Scout` / `Trivy`) on every push.
* [ ] Route `/api` traffic through Nginx as a reverse proxy so port `3001` doesn't need to be exposed to the host.