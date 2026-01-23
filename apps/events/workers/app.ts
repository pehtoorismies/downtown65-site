import { createRequestHandler, RouterContextProvider } from 'react-router'

// export function getLoadContext(
//   req: Request,
//   res: Response,
//   ctx: { cloudflare: { env: Env } }, // shape depends on your adapter
// ) {
//   console.log('getLoadContext executing********')
//   const routerCtx = new RouterContextProvider()

//   // Put env into typed RouterContextProvider
//   //   routerCtx.set(envContext, ctx.cloudflare.env);

//   // Optional: incremental migration — keep legacy access paths
//   // so existing code using context.cloudflare.env keeps working.
//   //   (routerCtx as any).cloudflare = { env: ctx.cloudflare.env };

//   return routerCtx
// }
declare module 'react-router' {
  export interface RouterContextProvider {
    cloudflare: {
      env: Env
      ctx: ExecutionContext
    }
  }
}

function getLoadContext(ctx: {
  cloudflare: { env: Env; ctx: ExecutionContext }
}) {
  const routerCtx = new RouterContextProvider()
  routerCtx.cloudflare = {
    env: ctx.cloudflare.env,
    ctx: ctx.cloudflare.ctx,
  }

  return routerCtx
}

const requestHandler = createRequestHandler(
  () => import('virtual:react-router/server-build'),
  import.meta.env.MODE,
)

export default {
  async fetch(request, env, ctx) {
    const context = { cloudflare: { env, ctx } }

    return requestHandler(request, getLoadContext(context))
  },
} satisfies ExportedHandler<Env>
