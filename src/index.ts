import { getOAuthClient } from '@lib/oauth/client';
import { RouteManager } from '@lib/routes'
import { Hono } from 'hono'

const rm = new RouteManager(__dirname);
await rm.loadLex('./routes');
await rm.loadRoutes('./routes');

const app = new Hono()

  .route('/.well-known', new Hono()
  
    .get('/atproto-oauth-meta.json', async (c) => {
      const client = await getOAuthClient();
      return c.json(client.clientMetadata);
    })

    .get('/jwks.json', async (c) => {
      const client = await getOAuthClient();
      return c.json(client.clientMetadata.jwks);
    })
  )

  .all('/xrpc/:nsid', async (c) => {
    const { nsid } = c.req.param();
    const route = rm.collections.get(nsid);
    
    const type = route?.lexicon?.defs.main.type;
    if (!route?.route || !type) return c.text('unknown route', 404);

    switch (type) {
      case 'query':
        if (c.req.method === 'GET') return route.route(c);
      
      case 'procedure':
        if (c.req.method === 'POST') return route.route(c);

      default:
        return c.text('unknown route', 404);
    }
  })

export default app