FROM node:24-alpine

WORKDIR /app

ENV PORT=4000
ENV DB_PATH=/app/data/exam.sqlite

COPY package*.json ./
RUN npm ci --omit=dev

COPY src ./src

RUN mkdir -p /app/data

EXPOSE 4000

VOLUME ["/app/data"]

CMD ["npm", "start"]
