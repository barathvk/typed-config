import * as k8s from '@kubernetes/client-node'
import atob from 'atob'
import * as process from 'process'

import { type IBasePlugin } from '@typed-config/core'

const kc = new k8s.KubeConfig()
if (process.env.KUBERNETES_SERVICE_HOST) {
  console.debug('running inside kubernetes')
  kc.loadFromCluster()
} else {
  kc.loadFromDefault()
}

export const kubePlugin: IBasePlugin = {
  protocol: 'kube',
  getValue: async (key: string) => {
    try {
      const api = kc.makeApiClient(k8s.CoreV1Api)
      const split = key.split('/')
      const secretKey = split[0]
      let secretName = secretKey
      let namespace: string
      if (secretKey.includes('.')) {
        const secretSplit = secretKey.split('.')
        secretName = secretSplit[0]
        namespace = secretSplit[1]
        if (namespace.startsWith('$')) {
          if (process.env[namespace.substring(1)]) {
            namespace = process.env[namespace.substring(1)] ?? 'default'
          } else {
            const error = `Failed to find an environment variable ${namespace}`
            const message = `[${key}] (context: ${kc.currentContext}) ${error}`
            console.error(message)
            throw new Error(message)
          }
        }
      } else {
        namespace = 'default'
      }
      const dataKey = split[1]
      const secret = await api.readNamespacedSecret({ name: secretName, namespace })
      return secret?.data?.data ? atob(secret.data.data[dataKey]) : undefined
    } catch (error) {
      const err = error as Error
      console.error(`[${key}] (context: ${kc.currentContext}) ${err.message}`)
      throw err
    }
  }
}
