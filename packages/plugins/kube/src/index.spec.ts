import { z } from 'zod'
import { describe, it, expect } from 'vitest'
import { loadConfig } from '@typed-config/core'
import { kubePlugin } from '.'
import fs from 'fs-extra'
import { dirname } from 'path'

interface IConfigFile {
  path: string
  content: string
}

const writeFiles = async (files: IConfigFile[]) => {
  const configPath = await fs.mkdtemp('/tmp/')
  const promises = files.map(async (file) => {
    await fs.mkdirs(dirname(`${configPath}/${file.path}`))
    await fs.writeFile(`${configPath}/${file.path}`, file.content)
  })
  await Promise.all(promises)
  return configPath
}

const schema = z.object({ domain: z.string() })
describe('kube plugin', () => {
  it.skip('should get a key from a secret', async () => {
    const value = await kubePlugin.getValue('daato/domain')
    expect(value).toBeDefined()
  })
  it.skip('should substitute single secret', async () => {
    const configPath = await writeFiles([
      {
        path: 'default.yml',
        content: 'domain: ${kube:daato/domain}'
      }
    ])
    const config = await loadConfig(schema, [kubePlugin], configPath)
    expect(config.domain).toBeDefined()
  })
})
