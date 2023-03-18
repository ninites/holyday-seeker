FROM node:latest

# Install pm2
RUN yarn global add pm2 && yarn global add nodemon

RUN mkdir -p /app

WORKDIR /app/server
COPY . /app/server
RUN cd /app/server
RUN npm install
# Start pm2.json process file
ENTRYPOINT ["pm2-docker"]