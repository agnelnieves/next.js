import fs from 'fs-extra'

import { join } from 'path'
import { execSync } from 'child_process'

import { FileRef, createNext } from 'e2e-utils'

const dirFirstTimeSetup = join(__dirname, '../first-time-setup')
const dirFirstTimeSetupTS = join(__dirname, '../first-time-setup-ts')

describe('Next Build', () => {
  ;(process.env.TURBOPACK_DEV ? describe.skip : describe)(
    'production mode',
    () => {
      test('first time setup', async () => {
        const next = await createNext({
          files: new FileRef(dirFirstTimeSetup),
          skipStart: true,
        })

        try {
          const eslintrcJsonPath = join(next.testDir, '.eslintrc.json')
          await fs.writeFile(eslintrcJsonPath, '')

          const nextBuildCommand = await next.build()
          const buildOutput = nextBuildCommand.cliOutput
          expect(buildOutput).toContain(
            'No ESLint configuration detected. Run next lint to begin setup'
          )

          // TODO: Should we exit non-zero here if the config was created? Should we maybe even directly start linting?
          expect(() => {
            execSync(`pnpm next lint --strict`, {
              cwd: next.testDir,
              encoding: 'utf8',
            })
          }).toThrow('Command failed: pnpm next lint --strict')

          const eslintConfigAfterSetupJSON = await execSync(
            `pnpm eslint --print-config pages/index.js`,
            {
              cwd: next.testDir,
              encoding: 'utf8',
            }
          )
          const { parser, settings, ...eslintConfigAfterSetup } = JSON.parse(
            eslintConfigAfterSetupJSON
          )

          expect(eslintConfigAfterSetup).toMatchSnapshot()
          expect({
            parser,
            settings,
          }).toEqual({
            // parser: require.resolve('eslint-config-next')
            parser: expect.stringContaining('eslint-config-next'),
            settings: {
              'import/parsers': expect.any(Object),
              'import/resolver': expect.any(Object),
              react: {
                version: 'detect',
              },
            },
          })
          expect(Object.entries(settings['import/parsers'])).toEqual([
            [
              // require.resolve('@typescript-eslint/parser')
              expect.stringContaining('@typescript-eslint/parser'),
              ['.ts', '.mts', '.cts', '.tsx', '.d.ts'],
            ],
          ])
          expect(Object.entries(settings['import/resolver'])).toEqual([
            [
              // require.resolve('eslint-import-resolver-node')
              expect.stringContaining('eslint-import-resolver-node'),
              { extensions: ['.js', '.jsx', '.ts', '.tsx'] },
            ],
            [
              // require.resolve('eslint-import-resolver-typescript')
              expect.stringContaining('eslint-import-resolver-typescript'),
              { alwaysTryTypes: true },
            ],
          ])
        } finally {
          await next.destroy()
        }
      })

      test('first time setup with TypeScript', async () => {
        const next = await createNext({
          files: new FileRef(dirFirstTimeSetupTS),
          skipStart: true,
        })

        try {
          const eslintrcJsonPath = join(next.testDir, '.eslintrc.json')
          await fs.writeFile(eslintrcJsonPath, '')

          const nextBuildCommand = await next.build()
          const buildOutput = nextBuildCommand.cliOutput
          expect(buildOutput).toContain(
            'No ESLint configuration detected. Run next lint to begin setup'
          )

          // TODO: Should we exit non-zero here if the config was created? Should we maybe even directly start linting?
          expect(() => {
            execSync(`pnpm next lint --strict`, {
              cwd: next.testDir,
              encoding: 'utf8',
            })
          }).toThrow('Command failed: pnpm next lint --strict')

          const eslintConfigAfterSetupJSON = await execSync(
            `pnpm eslint --print-config pages/index.tsx`,
            {
              cwd: next.testDir,
              encoding: 'utf8',
            }
          )
          const { parser, settings, ...eslintConfigAfterSetup } = JSON.parse(
            eslintConfigAfterSetupJSON
          )

          expect(eslintConfigAfterSetup).toMatchSnapshot()
          expect({
            parser,
            settings,
          }).toEqual({
            // parser: require.resolve('@typescript-eslint/parser')
            parser: expect.stringContaining('@typescript-eslint/parser'),
            settings: {
              'import/parsers': expect.any(Object),
              'import/resolver': expect.any(Object),
              react: {
                version: 'detect',
              },
            },
          })
          expect(Object.entries(settings['import/parsers'])).toEqual([
            [
              // require.resolve('@typescript-eslint/parser')
              expect.stringContaining('@typescript-eslint/parser'),
              ['.ts', '.mts', '.cts', '.tsx', '.d.ts'],
            ],
          ])
          expect(Object.entries(settings['import/resolver'])).toEqual([
            [
              // require.resolve('eslint-import-resolver-node')
              expect.stringContaining('eslint-import-resolver-node'),
              { extensions: ['.js', '.jsx', '.ts', '.tsx'] },
            ],
            [
              // require.resolve('eslint-import-resolver-typescript')
              expect.stringContaining('eslint-import-resolver-typescript'),
              { alwaysTryTypes: true },
            ],
          ])
        } finally {
          await next.destroy()
        }
      })
    }
  )
})
