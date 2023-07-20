# > docker build -t finschia_local_explorer .
# > docker run --rm -p 8080:8080 finschia_local_explorer

FROM node:16-alpine as build-env
WORKDIR /app

COPY . ./

RUN yarn --frozen-lockfile
RUN yarn build && yarn install --production --ignore-scripts --prefer-offline

FROM node:16-alpine as runner
WORKDIR /app

RUN npm install -g serve

ARG EXPOSE
EXPOSE ${EXPOSE}

COPY --from=build-env /app/dist .
CMD ["serve", "-l", "8080"]
