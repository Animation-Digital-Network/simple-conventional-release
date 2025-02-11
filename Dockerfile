# ---- Build Stage ----
FROM node:22-alpine AS build

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json first for better caching
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy the entire project (excluding files in .dockerignore)
COPY . .

# Compile the code
RUN npm run build

# ---- Runtime Stage ----
FROM node:22-alpine AS runtime

# Create a directory for the repository
RUN mkdir -p /app/repository

# Set the custom repository path
ENV CUSTOM_REPOSITORY_PATH="/app/repository"
# Set the custom output path
ENV CUSTOM_OUTPUT_PATH="/app/repository/RELEASE_NOTES.md"

# Set working directory
WORKDIR /app/repository

# Install git
RUN apk add --no-cache git

# Copy only the necessary files from the build stage
COPY --from=build /app/package.json /app/package-lock.json ./
COPY --from=build /app/node_modules /app/node_modules
COPY --from=build /app/dist /app/dist

# Set the default directory for safe
RUN git config --global --add safe.directory /app/repository

# Install only production dependencies (optional)
RUN npm prune --production

# Set the default command to execute the release script
CMD ["node", "/app/dist/export.js"]
