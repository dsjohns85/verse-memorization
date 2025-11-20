FROM mcr.microsoft.com/devcontainers/typescript-node:1-20-bookworm

# Install PostgreSQL client tools
RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
    && apt-get -y install --no-install-recommends postgresql-client \
    && apt-get clean -y && rm -rf /var/lib/apt/lists/*

# Install global npm packages
RUN npm install -g npm@latest

# Set up workspace
WORKDIR /workspaces/verse-memorization
