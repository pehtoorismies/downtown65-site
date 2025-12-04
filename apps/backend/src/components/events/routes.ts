import { createRoute, z } from '@hono/zod-openapi'
import { jwk } from 'hono/jwk'
import { apiKeyAuth } from '~/common/middleware/apiKeyAuth'
import { jwtToken } from '~/common/middleware/jwt'
import type { AppAPI } from '../../app-api'
import {
  EventCreateSchema,
  EventListSchema,
  EventPathParamSchema,
  EventSchema,
  EventUpdateSchema,
} from './schema'
import type { EventStore } from './store/eventsStore'

const MessageSchema = z.object({
  message: z.string(),
})

const defaultMiddleware = [apiKeyAuth, jwtToken()]

export const registerRoutes = (app: AppAPI, store: EventStore): void => {
  app.openapi(
    createRoute({
      method: 'get',
      path: '/events',
      security: [{ ApiKeyAuth: [], BearerToken: [] }],
      middleware: defaultMiddleware,
      responses: {
        200: {
          description: 'List all events',
          content: {
            'application/json': {
              schema: EventListSchema,
            },
          },
        },
        401: {
          $ref: '#/components/responses/UnauthorizedError',
        },
      },
    }),
    (c) => {
      const jwtPayload = c.get('jwtPayload')
      console.log('JWT Payload:', jwtPayload)
      return c.json(store.list())
    },
  )

  app.openapi(
    createRoute({
      method: 'get',
      path: '/events/{id}',
      security: [{ ApiKeyAuth: [] }],
      middleware: [apiKeyAuth, jwtToken({ allowAnon: true })],
      request: {
        params: EventPathParamSchema,
      },
      responses: {
        200: {
          description: 'Event found',
          content: {
            'application/json': { schema: EventSchema },
          },
        },
        401: {
          $ref: '#/components/responses/UnauthorizedError',
        },
        404: {
          description: 'Event not found',
          content: {
            'application/json': { schema: MessageSchema },
          },
        },
        422: {
          $ref: '#/components/responses/ValidationError',
        },
      },
    }),
    (c) => {
      const { id } = c.req.valid('param')
      return c.json({ message: `Event ${id} not found` }, 404)
    },
  )

  app.openapi(
    createRoute({
      method: 'post',
      path: '/events',
      security: [{ ApiKeyAuth: [], BearerToken: [] }],
      middleware: defaultMiddleware,
      request: {
        body: {
          description: 'Event payload',
          required: true,
          content: {
            'application/json': { schema: EventCreateSchema },
          },
        },
      },
      responses: {
        201: {
          description: 'Event created',
          content: {
            'application/json': { schema: EventSchema },
          },
        },
        401: {
          $ref: '#/components/responses/UnauthorizedError',
        },
        422: {
          $ref: '#/components/responses/ValidationError',
        },
      },
    }),
    async (c) => {
      const payload = await c.req.valid('json')
      const event = store.create(payload)
      return c.json(event, 201)
    },
  )

  app.openapi(
    createRoute({
      method: 'put',
      path: '/events/{id}',
      security: [{ ApiKeyAuth: [], BearerToken: [] }],
      middleware: defaultMiddleware,
      request: {
        params: EventPathParamSchema,
        body: {
          required: true,
          content: {
            'application/json': { schema: EventUpdateSchema },
          },
        },
      },
      responses: {
        200: {
          description: 'Event updated',
          content: {
            'application/json': { schema: EventSchema },
          },
        },
        401: {
          $ref: '#/components/responses/UnauthorizedError',
        },
        404: {
          description: 'Event not found',
          content: {
            'application/json': { schema: MessageSchema },
          },
        },
        422: {
          $ref: '#/components/responses/ValidationError',
        },
      },
    }),
    async (c) => {
      const { id } = c.req.valid('param')
      const payload = await c.req.valid('json')
      const updated = store.update(id, payload)
      if (!updated) {
        return c.json({ message: `Event ${id} not found` }, 404)
      }
      return c.json(updated, 200)
    },
  )

  app.openapi(
    createRoute({
      method: 'delete',
      path: '/events/{id}',
      security: [{ ApiKeyAuth: [], BearerToken: [] }],
      middleware: defaultMiddleware,
      request: {
        params: EventPathParamSchema,
      },
      responses: {
        204: {
          description: 'Event removed',
        },
        401: {
          $ref: '#/components/responses/UnauthorizedError',
        },
        404: {
          description: 'Event not found',
          content: {
            'application/json': { schema: MessageSchema },
          },
        },
        422: {
          $ref: '#/components/responses/ValidationError',
        },
      },
    }),
    (c) => {
      const { id } = c.req.valid('param')
      const deleted = store.delete(id)
      if (!deleted) {
        return c.json({ message: `Event ${id} not found` }, 404)
      }
      return c.body(null, 204)
    },
  )

  app.openapi(
    createRoute({
      method: 'post',
      path: '/events/{id}/participants/me',
      description: 'Register the authenticated user as a participant to the event',
      security: [{ ApiKeyAuth: [], BearerToken: [] }],
      middleware: defaultMiddleware,
      request: {
        params: EventPathParamSchema,
      },
      responses: {
        200: {
          description: 'User is registered for the event successfully',
        },
        401: {
          $ref: '#/components/responses/UnauthorizedError',
        },
        404: {
          description: 'Event not found',
          content: {
            'application/json': { schema: MessageSchema },
          },
        },
        422: {
          $ref: '#/components/responses/ValidationError',
        },
      },
    }),
    (c) => {
      // const { id } = c.req.valid('param')
      // const deleted = store.delete(id)
      // if (!deleted) {
      //   return c.json({ message: `Event ${id} not found` }, 404)
      // }
      return c.body(null, 204)
    },
  )

  app.openapi(
    createRoute({
      method: 'delete',
      path: '/events/{id}/participants/me',
      description: 'Unregister the authenticated user from the event',
      security: [{ ApiKeyAuth: [], BearerToken: [] }],
      middleware: defaultMiddleware,
      request: {
        params: EventPathParamSchema,
      },
      responses: {
        200: {
          description: 'User is unregistered from the event successfully',
        },
        401: {
          $ref: '#/components/responses/UnauthorizedError',
        },
        404: {
          description: 'Event not found',
          content: {
            'application/json': { schema: MessageSchema },
          },
        },
        422: {
          $ref: '#/components/responses/ValidationError',
        },
      },
    }),
    (c) => {
      // const { id } = c.req.valid('param')
      // const deleted = store.delete(id)
      // if (!deleted) {
      //   return c.json({ message: `Event ${id} not found` }, 404)
      // }
      return c.body(null, 204)
    },
  )
}
