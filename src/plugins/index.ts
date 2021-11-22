import { envPlugin } from './env'

export type Primitive = string | boolean | number
export interface IBasePlugin {
  protocol: string
  getValue: (key: string) => Primitive
}
export const defaultPlugins = [envPlugin]
