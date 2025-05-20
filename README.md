# SolarNode External Login Demo

This project contains a webapp that demonstrates how to integrate an external application with
the SolarNode login API, so that the login credentials can be managed by the external application
and used to authenticate to the SolarNode application progamatically.

![Demo screenshot](docs/solarnode-ext-login-demo.png)

# Use

Fill in a valid SolarNode username, password, and host, then click the **Login** button. This will
authenticate with SolarNode and load the logged-in SolarNode home screen inside a frame within the
demo main window.

# Building from source

To build yourself, clone or download this repository. You need to have Node 20.19+ installed. Then:

```sh
# initialize dependencies
npm ci

# run development live server on http://localhost:8080
npm run dev

# build for production
npm run build
```

Running the `build` script will generate the application into the `dist/` directory.

[npm]: https://www.npmjs.com/
