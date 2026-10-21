# For production dockerfile, it is best to use a multi-stage build to reduce the size of the final image.

# builder stage
FROM node:26-alpine3.23 as builder

WORKDIR /app
ARG NPM_TOKEN
ENV NPM_TOKEN=$NPM_TOKEN

COPY package.json .
COPY tsconfig.json ./
COPY .npmrc ./
COPY src ./src
COPY tools ./tools
RUN npm install -g npm@latest
RUN npm ci && npm run build


FROM node:26-alpine3.23 as runner
WORKDIR /app
# using alpine as the base image allows the use of apk to install curl
RUN apk add --no-cache curl
COPY package.json .
COPY tsconfig.json ./
COPY .npmrc ./
COPY src ./src
# for production, we will be using pm2 which is a process manager for Node.js, it will help us to manage the application and restart it if it crashes. -g installs the package globally in the container.
RUN npm install -g pm2 npm@latest
# install only production dependencies, ignore dev dependencies
# we are using ci instead of install to ensure that the dependencies are installed in the correct order and this will be run in a pipeline to ensure that the dependencies are installed in the correct order.
RUN npm ci --production
COPY --from=builder /app/build ./build

EXPOSE 4004

CMD ["npm", "run", "start"]