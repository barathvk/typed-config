import merge from 'deepmerge'
import { config as dotenvConfig } from 'dotenv'
import { flatten, unflatten } from 'flat'
import fs from 'fs'
import yaml from 'js-yaml'
import path from 'path'
import { type z } from 'zod'
import findup from 'findup-sync'

let config

export const readAndMergeConfigFiles = (dir: string) => {
  const defaultConfig =
    yaml.load(fs.readFileSync(`${dir}/default.yml`, 'utf8')) || {}
  const exists = fs.existsSync(`${dir}/${process.env.NODE_ENV}.yml`)
  let overrideConfig: any = {}
  if (exists) {
    overrideConfig = yaml.load(
      fs.readFileSync(`${dir}/${process.env.NODE_ENV}.yml`, 'utf8')
    )
  }
  const overwriteMerge = (destinationArray: any[], sourceArray: any[]): any[] => sourceArray
  return merge(defaultConfig, overrideConfig, {
    arrayMerge: overwriteMerge
  })
}
export type Primitive = string | boolean | number | undefined
export interface IBasePlugin {
  protocol: string
  getValue: (key: string) => Promise<Primitive>
  init?: () => Promise<void>
}

export const loadConfig = async (
  schema: z.AnyZodObject,
  plugins: IBasePlugin[] = [],
  dir: string = path.resolve(process.cwd(), 'config')
) => {
  if (!config || process.env.NODE_ENV === 'test') {
    dotenvConfig({ path: findup('.env') ?? '.env' })
    await Promise.all(
      plugins
        .map(async (plugin) => { plugin.init ? await plugin.init() : undefined })
        .filter(async (initialize) => { await initialize })
    )
    const merged = readAndMergeConfigFiles(dir)
    const flattened: any = flatten(merged)
    const errors: string[] = []
    const keyRegex = /\${(.*?):(.*?)}/g
    for (const flKey of Object.keys(flattened)) {
      if (typeof flattened[flKey] === 'string') {
        const key = flattened[flKey] as string
        const matches = key.matchAll(keyRegex)
        for (const match of matches || []) {
          const protocol = match[1]
          const plugin = plugins.find((pl) => pl.protocol === protocol)
          if (!plugin) {
            const error = `Failed to find plugin for protocol ${protocol}: ${match}`
            errors.push(error)
          } else {
            const substitution = match[2]
            const value = await plugin.getValue(substitution)
            if (value) {
              flattened[flKey] = (flattened[flKey] as string).replace(
                match[0],
                value.toString()
              )
            } else {
              const error = `Failed to find value ${protocol}: ${match}`
              errors.push(error)
            }
          }
        }
      }
    }
    config = unflatten(flattened)
    const result = schema.safeParse(config)
    if (!result.success) {
      const issues = (result as any).error.errors.map((ex: any) => {
        const expected = `[expected: ${ex.expected}, received: ${ex.received}]`
        return `[${ex.code}] ${ex.path.join(', ')}: ${ex.message} ${expected}`
      })
      for (const issue of issues) {
        errors.push(issue)
      }
    }
    if (errors.length > 0) {
      console.error('\x1b[31m---------------------------------\x1b[0m')
      for (const message of errors) {
        console.error(`\x1b[31m* ${message}\x1b[0m`)
      }
      console.error('\x1b[31m---------------------------------\x1b[0m')
      console.error('\x1b[31m[FATAL] failed to validate config\x1b[0m')
    }
  }
  return schema.parse(config)
}
