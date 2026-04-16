FROM node:20-alpine
WORKDIR /app
COPY package.json .

# Install dependencies
RUN npm install
COPY . .

# Expose the port Next.js uses
EXPOSE 3000
CMD ["npm", "run", "dev"]