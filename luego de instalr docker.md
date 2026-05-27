1.  **Install Docker** (if not already):
    ```bash
    sudo pacman -S docker
    ```

2.  **Start and Enable the Service**:
    ```bash
    sudo systemctl start docker
    sudo systemctl enable docker
    ```

3.  **Add User to Docker Group** (to run without `sudo`):
    ```bash
    sudo usermod -aG docker $USER
    ```
    Log out and back in, or run `newgrp docker`.

