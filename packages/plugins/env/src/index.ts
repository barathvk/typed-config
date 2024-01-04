import { type IBasePlugin } from '@typed-config/core'

export const envPlugin: IBasePlugin = {
  protocol: 'env',
  getValue: async (key: string) => {
    if (!process.env[key]) {
      throw new Error(`Failed to find an environment variable ${key}`)
    }
    return process.env[key]
  }
}
