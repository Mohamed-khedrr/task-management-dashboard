FROM node:22-slim AS deps
WORKDIR /app
# There's no .git folder in the image, so the Husky hooks have nothing to install
ENV HUSKY=0
COPY package.json package-lock.json ./
RUN npm ci

FROM deps AS build
COPY . .
RUN npm run build

# The mock API: json-server, run from the same npm script as in local development
FROM deps AS api
COPY mock-api ./mock-api
EXPOSE 3030
# json-server listens on localhost by default, which isn't reachable from outside the container
CMD ["npm", "run", "mock:api", "--", "--host", "0.0.0.0"]

FROM nginx:1.27-alpine AS web
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist/task-management-dashboard/browser /usr/share/nginx/html
EXPOSE 80
