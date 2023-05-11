
# DemoViewer Web Application

Demo app for working with [Open Cloud Server](https://cloud.opendesign.com/docs/index.html#/opencloud_server).

[Live Preview](http://cloud.opendesign.com/#/)

## Config

Config file placed at `public\config.json`.

Example:
```json 
{
  "registration_host": "http://localhost:9000",
  "api_host": "http://localhost:8080",
  "visualizejs_url": "",
  "supportFormats": [ "DGN", "DWF", "DWG", "DXF", "IFC", "IFCZIP", "NWC", "NWD", "OBJ", "RCS", "RFA", "RVT", "STEP", "STL", "STP", "VSFX" ]
}
```

### api_host

Open Cloud Server URL.

Set config `api_host` to [Open Cloud API](https://cloud.opendesign.com/docs//openapi.html) server URL you have installed and deployed.

### visualizejs_url

VisualizeJS library URL.

Set config `visualizejs_url` to your own [VisualizeJS](https://cloud.opendesign.com/docs/index.html#/visualizejs) library URL or leave it blank to use the default URL defined by [Client.js](https://cloud.opendesign.com/docs/index.html#/client_overview) you are using. 

*Note: Your own `VisualizeJS` library version must match the version of the `Client.js` you are using.*

## Building Application

### Production Build

In the project directory, run:

```sh
npm install
npm run build
```

This builds the app for production to the `build` folder. See the section about app [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### Development Mode

In the project directory, run:

```sh
npm install
npm start
```

This runs the app in the development mode. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

# Create React App

This app was bootstrapped with [Create React App](https://github.com/facebook/create-react-app). You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

# React

To learn React, check out the [React documentation](https://reactjs.org/).
