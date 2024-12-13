FROM node:alpine AS build

WORKDIR /app/frontend

ARG VITE_BACKEND_URL

ENV VITE_BACKEND_URL=$VITE_BACKEND_URL

COPY . .

RUN npm install && npm run build && mv dist /app/front-end && rm -rf /app/frontend /root/.npm /tmp/*

FROM nginx:alpine

COPY --from=build /app/front-end /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
