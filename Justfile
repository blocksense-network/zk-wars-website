# Justfile for zk-wars website

build:
 node src/build.js

serve:
 node src/server.js

test:
 node --test test

lint:
 eslint src
