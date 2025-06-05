# Justfile for zk-wars website

build:
 node src/build.js

serve:
 node src/server.js

test:
 node --test test

lint:
 eslint src

publish: build
 wrangler pages deploy build --project-name $CF_PAGES_PROJECT --branch ${CF_PAGES_BRANCH:-main}

gen-example-data ARGS='':
 node scripts/gen-example-data.js {{ARGS}}
