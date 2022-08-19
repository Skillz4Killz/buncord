find packages/*/index.ts -exec node_modules/.bin/esbuild {} --bundle --platform=node --minify --outfile={}/../dist.js \;
