import { IBasePlugin } from '.'
export const envPlugin: IBasePlugin = {
  protocol: 'env',
  getValue: (key: string) => {
    return process.env[key]
  },
}
