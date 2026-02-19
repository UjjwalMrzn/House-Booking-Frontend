# STAGE 1: Build (The "Kitchen")
# This stage installs node, copies your code, and runs the build command
FROM node:22-alpine AS build-stage
WORKDIR /app
COPY package*.json ./
# We use --legacy-peer-deps to ignore those version warnings you saw
RUN npm install --legacy-peer-deps
COPY . .
RUN npm run build

# STAGE 2: Production (The "Table")
# This stage only takes the finished 'dist' folder and serves it
FROM node:22-alpine
WORKDIR /app
# This line is the magic: it grabs 'dist' from the stage above, NOT from Windows
COPY --from=build-stage /app/dist ./dist
RUN npm install -g serve
EXPOSE 3000
CMD ["serve", "-s", "dist", "-l", "3000"]