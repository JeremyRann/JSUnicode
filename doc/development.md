There are a couple of options to test out JSUnicode. Generally you'll want to run yarn from the root directory to get all your dependencies and then run `npm start` to spin up a development server. Note that browser-hosted tests for JSUnicode skip some tests (related to buffers since it's a node-only feature).

JSUnicode's Webpack config is designed to look for two environment variables, HOST and PORT, which control the dev server. As an example, on my development VM I use the machine's actual hostname to listen on, so I run

```
HOST=${HOSTNAME,,} npm start
```

Once your dev server is running, you can visit it and view the test page; it should reload automatically if any changes are made to the code.

Another option is to test using node from a command line. npm-watch is configured to watch for relevant changes and retest. To run, issue the following from a command line:

```
npm run watch
```
