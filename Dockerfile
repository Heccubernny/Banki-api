FROM node:18-alpine

WORKDIR /src
COPY package.json package-lock.json /src/
RUN npm install --production

COPY . /src

# RUN npm run build

EXPOSE 8085

CMD ["node"]
