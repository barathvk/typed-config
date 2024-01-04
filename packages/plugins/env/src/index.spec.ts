import { describe, it, expect } from 'vitest'
import { z } from 'zod'
import { dirname } from 'path'
import fs from 'fs-extra'
import { loadConfig } from '@typed-config/core'
import { envPlugin } from '.'
interface IConfigFile {
  path: string
  content: string
}

const schema = z.object({
  name: z.string(),
  suffix: z.string().optional()
})

const writeFiles = async (files: IConfigFile[]) => {
  const configPath = await fs.mkdtemp('/tmp/')
  const promises = files.map(async (file) => {
    await fs.mkdirs(dirname(`${configPath}/${file.path}`))
    await fs.writeFile(`${configPath}/${file.path}`, file.content)
  })
  await Promise.all(promises)
  return configPath
}

describe('env plugin', () => {
  it('should substitute single environment variable', async () => {
    const configPath = await writeFiles([
      {
        path: 'default.yml',
        content: 'name: ${env:NAME}'
      }
    ])
    process.env.NAME = 'dummy-name'
    const config = await loadConfig(schema, [envPlugin], configPath)
    expect(config.name).toEqual('dummy-name')
  })
  it('should substitute concatenated environment variables', async () => {
    const configPath = await writeFiles([
      {
        path: 'default.yml',
        content: 'name: ${env:NAME}-${env:SUFFIX}'
      }
    ])
    process.env.NAME = 'dummy-name'
    process.env.SUFFIX = 'suffix'
    const config = await loadConfig(schema, [envPlugin], configPath)
    expect(config.name).toEqual('dummy-name-suffix')
  })
  it('should substitute multiple environment variables', async () => {
    const configPath = await writeFiles([
      {
        path: 'default.yml',
        content: 'name: ${env:NAME}\nsuffix: ${env:SUFFIX}'
      }
    ])
    process.env.NAME = 'dummy-name'
    process.env.SUFFIX = 'suffix'
    const config = await loadConfig(schema, [envPlugin], configPath)
    expect(config.name).toEqual('dummy-name')
    expect(config.suffix).toEqual('suffix')
  })
  it('should fail with undefined environment variable', async () => {
    const configPath = await writeFiles([
      {
        path: 'default.yml',
        content: 'name: ${env:NAME}'
      }
    ])
    delete process.env.NAME
    await expect(loadConfig(schema, [envPlugin], configPath)).rejects.toThrow(
      'Failed to find an environment variable NAME'
    )
  })
})
