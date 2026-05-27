### Corrected `docker-compose.yaml`

Update the `volumes` section to map to `/data/db`:

```yaml
services:
  mongodb:
    image: mongodb/mongodb-community-server:7.0-ubi8
    container_name: mongodb_server
    restart: always
    ports:
      - "27017:27017"
    environment:
      - MONGODB_INITDB_ROOT_USERNAME=resilientcode
      - MONGODB_INITDB_ROOT_PASSWORD=villejscodeforce9
    volumes:
      - ./data/db:/data/db  # Corrected path
```

### Steps to Run

1.  **Create the directory** (optional, Docker often creates it, but good for permissions):
    ```bash
    mkdir -p ./data/db
    ```
    *Note: On Arch Linux, if you encounter permission errors, you may need to ensure the directory is writable by the Docker daemon user or run `chmod -R 777 ./data/db` for local testing.*

2.  **Start the container**:
    ```bash
    docker compose up -d
    ```

3.  **Verify logs** (to ensure it started without permission errors):
    ```bash
    docker logs mongodb_server
    ```

4.  **Connect**:
    ```bash
    docker exec -it mongodb_server mongosh -u resilientcode -p villejscodeforce9
    ```

