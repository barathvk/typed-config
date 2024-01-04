import { describe, expect, it } from 'vitest'
import { loadConfig } from '.'
import { z } from 'zod'
import { dirname } from 'path'
import fs from 'fs-extra'
interface IConfigFile {
  path: string
  content: string
}
export const writeFiles = async (files: IConfigFile[]) => {
  const configPath = await fs.mkdtemp('/tmp/')
  const promises = files.map(async (file) => {
    await fs.mkdirs(dirname(`${configPath}/${file.path}`))
    await fs.writeFile(`${configPath}/${file.path}`, file.content)
  })
  await Promise.all(promises)
  return configPath
}
describe('index', () => {
  it('should load empty config', async () => {
    const configPath = await writeFiles([
      {
        path: 'default.yml',
        content: 'name: dummy-config'
      }
    ])
    const config = await loadConfig(
      z.object({ name: z.string() }),
      [],
      configPath
    )
    expect(config.name).toEqual('dummy-config')
  })
  it('should load overloaded config', async () => {
    const configPath = await writeFiles([
      {
        path: 'default.yml',
        content: 'name: dummy-config'
      },
      {
        path: 'test.yml',
        content: 'name: dummy-config-test'
      }
    ])
    const config = await loadConfig(
      z.object({ name: z.string() }),
      [],
      configPath
    )
    expect(config.name).toEqual('dummy-config-test')
  })
})
