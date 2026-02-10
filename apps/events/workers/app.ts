import { createLogger, type Logger } from '@downtown65/logger'
import { createRequestHandler, RouterContextProvider } from 'react-router'

declare module 'react-router' {
  export interface RouterContextProvider {
    cloudflare: {
      env: Env
      ctx: ExecutionContext
    }
    logger: Logger
  }
}

const requestHandler = createRequestHandler(
  () => import('virtual:react-router/server-build'),
  import.meta.env.MODE,
)

export default {
  async fetch(request, env, ctx) {
    const routerCtx = new RouterContextProvider()
    routerCtx.cloudflare = {
      ctx,
      env,
    }
    routerCtx.logger = createLogger({
      appContext: 'Events',
      level: env.LOG_LEVEL,
    })

    return requestHandler(request, routerCtx)
  },
} satisfies ExportedHandler<Env>
