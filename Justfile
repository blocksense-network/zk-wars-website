# Justfile for zk-wars website

build:
 node src/build.js

serve:
 node src/server.js

test:
 node --test test

lint:
 eslint src --ext .ts,.tsx

lint-fix:
 eslint src --ext .ts,.tsx --fix

publish: build
 wrangler pages deploy build --project-name $CF_PAGES_PROJECT --branch ${CF_PAGES_BRANCH:-main}
