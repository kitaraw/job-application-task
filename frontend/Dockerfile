# Dockerfile frontend
FROM node:18-alpine
ENV PATH="./node_modules/.bin:$PATH"
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "start"]