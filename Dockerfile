# STAGE 1: Build (temp - not be saved in Image)

FROM node:14-alpine AS ts-builder

# Create and change to the app directory.
WORKDIR /app

# Copy application dependency manifests to the container image.
# A wildcard is used to ensure copying both package.json AND package-lock.json (when available).
# Copying this first prevents re-running npm install on every code change.
COPY package*.json ./

# Copy local code to the container image.
COPY . ./

RUN npm ci

RUN npm run clean

RUN npm run build


# STAGE 2: Run

FROM node:14-alpine AS ts-run-prod

# Create and change to the app directory.
WORKDIR /app

# Copy /dist from previous Stage
COPY --from=ts-builder ./app/dist ./dist

# Copy application dependency manifests to the container image.
# A wildcard is used to ensure copying both package.json AND package-lock.json (when available).
COPY package*.json ./

# Install production dependencies.
RUN npm ci --only=production

# Run the web service on container startup.
CMD [ "node", "dist/index.js" ]