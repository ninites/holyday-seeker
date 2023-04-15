FROM node:19 as node
RUN mkdir -p /app

COPY . /app/client
WORKDIR /app/client
ARG REACT_APP_API_BASE_URL
ENV REACT_APP_API_BASE_URL=$REACT_APP_API_BASE_URL
RUN npm install
EXPOSE 5173
ENTRYPOINT ["/app/client/entrypoint.sh"]
CMD ["npm","run" ,"dev","--host"]