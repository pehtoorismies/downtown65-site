import { createRoute, z } from '@hono/zod-openapi'
import type { AppAPI } from '../app-api'
import {
  EventCreateSchema,
  EventListSchema,
  EventPathParamSchema,
  EventSchema,
  EventUpdateSchema,
} from '../schemas/event'
import type { EventStore } from '../store/eventsStore'

const MessageSchema = z.object({
  message: z.string(),
})

export const registerEventRoutes = (app: AppAPI, store: EventStore): void => {
  app.openapi(
    createRoute({
      method: 'get',
      path: '/events',
      security: [{ ApiKeyAuth: [] }],
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
        422: {
          $ref: '#/components/responses/ValidationError',
        },
      },
    }),
    (c) => {
      return c.json(store.list())
    },
  )

  app.openapi(
    createRoute({
      method: 'get',
      path: '/events/{id}',
      security: [{ ApiKeyAuth: [] }],
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
      const event = store.get(id)
      if (!event) {
        return c.json({ message: `Event ${id} not found` }, 404)
      }
      return c.json(event, 200)
    },
  )

  app.openapi(
    createRoute({
      method: 'post',
      path: '/events',
      security: [{ ApiKeyAuth: [] }],
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
      method: 'patch',
      path: '/events/{id}',
      security: [{ ApiKeyAuth: [] }],
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
      security: [{ ApiKeyAuth: [] }],
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
}
