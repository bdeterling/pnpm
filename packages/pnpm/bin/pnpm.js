#!/usr/bin/env node
const [major, minor] = process.version.substr(1).split('.')

if (major < 10 || major == 10 && minor < 13) {
  console.log(`ERROR: This version of pnpm requires at least Node.js v10.13
The current version of Node.js is ${process.version}`)
  process.exit(1)
}

require('../lib/bin/pnpm')
