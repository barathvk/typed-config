import mock from 'mock-fs'

import { IsDefined } from 'class-validator'
import { loadConfig } from '../src'
class Config {
  @IsDefined()
  name: string
}
describe('index', () => {
  afterEach(() => {
    mock.restore()
  })
  it('should load empty config', () => {
    mock({
      'config/default.yml': 'name: nuri-config',
    })
    const config = loadConfig(Config)
    expect(config.name).toEqual('nuri-config')
  })
  it('should load overloaded config', () => {
    mock({
      'config/default.yml': 'name: nuri-config',
      'config/test.yml': 'name: nuri-config-development',
    })
    const config = loadConfig(Config)
    expect(config.name).toEqual('nuri-config-development')
  })
})
