FROM node:16-alpine

RUN apk update && apk add dumb-init
RUN mkdir /web-viewer
RUN chown node:node /web-viewer
WORKDIR /web-viewer

USER node
COPY --chown=node:node public ./public
COPY --chown=node:node src ./src
COPY --chown=node:node package.json ./

RUN echo "{\
  \"registration_host\": \"http://localhost:9000\",\
  \"api_host\": \"http://localhost:8080\",\
  \"visualizejs_url\": \"\",\
  \"supportFormats\": [ \"DGN\", \"DWF\", \"DWG\", \"DXF\", \"IFC\", \"IFCZIP\", \"NWC\", \"NWD\", \"OBJ\", \"RCS\", \"RFA\", \"RVT\", \"STEP\", \"STL\", \"STP\", \"VSFX\" ]\
}" > public/config.json

RUN npm install && npm run build
CMD dumb-init npm start
