import mock from 'mock-fs'

import { IsDefined, IsOptional } from 'class-validator'
import { loadConfig } from '../../src'

class Config {
  @IsDefined()
  name: string

  @IsOptional()
  suffix: string
}
describe('env plugin', () => {
  afterEach(() => {
    mock.restore()
  })
  it('should substitute single environment variable', () => {
    mock({
      'config/default.yml': 'name: ${env:NAME}',
      '.env': 'NAME=nuri-config-env',
    })
    const config = loadConfig(Config)
    expect(config.name).toEqual('nuri-config-env')
  })
  it('should substitute concatenated environment variables', () => {
    mock({
      'config/default.yml': 'name: ${env:NAME}-${env:SUFFIX}',
      '.env': 'NAME=nuri-config-env\nSUFFIX=suffix',
    })
    const config = loadConfig(Config)
    expect(config.name).toEqual('nuri-config-env-suffix')
  })
  it('should substitute multiple environment variables', () => {
    mock({
      'config/default.yml': 'name: ${env:NAME}\nsuffix: ${env:SUFFIX}',
      '.env': 'NAME=nuri-config-env\nSUFFIX=suffix',
    })
    const config = loadConfig(Config)
    expect(config.name).toEqual('nuri-config-env')
    expect(config.suffix).toEqual('suffix')
  })
})
