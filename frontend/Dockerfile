#Build dulu app, karena perlu multi-build
FROM node:20-alpine AS build
WORKDIR /app

#Install dependencies
COPY package.json ./
RUN npm install

#Copy everything and build
COPY . .
RUN npm run build

#Masuk stage 2 buat serving aja dan ambil hanya hasil build biar tidak bengkak container sizenya
FROM nginx:1.27-alpine AS runtime

COPY --from=build /app/dist /user/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://127.0.0.1/healthz || exit 1

CMD ["nginx", "-g", "daemon off;"]