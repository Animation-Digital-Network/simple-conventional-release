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

# Set working directory
WORKDIR /app

# Install git
RUN apk add --no-cache git

# Copy only the necessary files from the build stage
COPY --from=build /app/package.json /app/package-lock.json ./
COPY --from=build /app/node_modules /app/node_modules
COPY --from=build /app/dist /app/dist

# Install only production dependencies (optional)
RUN npm prune --production

# Set the default command to execute the release script
CMD ["node", "dist/export.js"]
