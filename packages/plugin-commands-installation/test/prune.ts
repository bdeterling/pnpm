import { install, link, prune } from '@pnpm/plugin-commands-installation'
import prepare from '@pnpm/prepare'
import { REGISTRY_MOCK_PORT } from '@pnpm/registry-mock'
import { copyFixture } from '@pnpm/test-fixtures'
import path = require('path')
import test = require('tape')

const REGISTRY_URL = `http://localhost:${REGISTRY_MOCK_PORT}`

const DEFAULT_OPTIONS = {
  argv: {
    original: [],
  },
  bail: false,
  cliOptions: {},
  include: {
    dependencies: true,
    devDependencies: true,
    optionalDependencies: true,
  },
  lock: true,
  pnpmfile: 'pnpmfile.js',
  rawConfig: { registry: REGISTRY_URL },
  rawLocalConfig: { registry: REGISTRY_URL },
  registries: {
    default: REGISTRY_URL,
  },
  sort: true,
  workspaceConcurrency: 1,
}

test('prune removes external link that is not in package.json', async function (t) {
  const project = prepare(t)
  const storeDir = path.resolve('store')
  await copyFixture('local-pkg', 'local')

  await link.handler({
    ...DEFAULT_OPTIONS,
    dir: process.cwd(),
    storeDir,
  }, ['./local'])

  await project.has('local-pkg')

  await prune.handler({
    ...DEFAULT_OPTIONS,
    dir: process.cwd(),
    storeDir,
  })

  await project.hasNot('local-pkg')
  t.end()
})

test('prune removes dev dependencies', async (t) => {
  const project = prepare(t, {
    dependencies: { 'is-positive': '1.0.0' },
    devDependencies: { 'is-negative': '1.0.0' },
  })
  const storeDir = path.resolve('store')

  await install.handler({
    ...DEFAULT_OPTIONS,
    dir: process.cwd(),
    linkWorkspacePackages: true,
  })

  await prune.handler({
    ...DEFAULT_OPTIONS,
    dev: false,
    dir: process.cwd(),
    storeDir,
  })

  await project.has('is-positive')
  await project.hasNot('is-negative')
  t.end()
})
