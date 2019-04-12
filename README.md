## @npmcorp/fastify-metrics

This is a [fastify](https://www.fastify.io) plugin to provide some basic metrics as well as attach an instance of [numbat-emitter](https://github.com/numbat-metrics/numbat-emitter) to the running process.

### Options

The following properties may be passed when registering the plugin:

- `app`: a string used as an identifier for the microservice
- `metrics`: a settings object passed directly to [numbat-emitter](https://github.com/numbat-metrics/numbat-emitter#configuration)
