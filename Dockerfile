FROM node:latest

# Install pm2
RUN npm install pm2 -g

RUN mkdir -p /app

COPY . /app/server/
WORKDIR /app/server/
RUN npm install

ENTRYPOINT ["/app/server/entrypoint.sh"]
# Start pm2.json process file
CMD ["pm2-docker","pm2.json"]