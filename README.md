# `typed-config`

## Why?
Configuration management is hard.
  * Multiple environments mean multiple `.env` files
  * `.env` files are a list of keys and values, they have no structure
  * No runtime validation (you can check for existence of environment variables, but not much more (easily))
  * No dev time help (autosuggestions)
  * How to populate secrets secrets safely (and for multiple environments, possibly with different encyrption keys and in isolated environments)?
  * How to allow developers to specify secrets without having access to these secrets?

  ## How?

   * Create a `./config` directory in your project root
   * Add a `default.yml` in this folder and populate it with your configuration
     ```yaml
     # example for `bunyan` logger config
     logger:
       name: my-awesome-project
       level: info
     ```
   * Create a class that represents your configuration using the amazing `class-validator to define validations
     ```typescript
     import { IsDefined } from 'class-validator'
     import { LoggerOptions } from 'bunyan'
     export class Config {
       @IsDefined()
       logger: LoggerOptions
     }
     ```
   * In the `index.ts` (or whatever your `main` file is) load the config
   ```typescript
   import { loadConfig } from '@barath/typed-config'
   import { Config } from './lib/config'
   import bunyan from 'bunyan'
   export const config = loadConfig(Config)
   export const logger = bunyan.createLogger(config.logger)

   logger.info('hello world')
   ```
