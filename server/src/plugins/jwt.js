import fp from 'fastify-plugin'
import fastifyJwt from '@fastify/jwt'

async function jwtPlugin(app) {
  await app.register(fastifyJwt, {
    secret: process.env.JWT_SECRET,
  })

  app.decorate('authenticate', async function (request, reply) {
    try {
      await request.jwtVerify()
    } catch {
      return reply.code(401).send({ error: 'Unauthorized', message: 'Missing or invalid token' })
    }
  })

  app.decorate('requirePermission', function (permission) {
    return async function (request, reply) {
      try {
        await request.jwtVerify()
        const { permissions } = request.user
        if (!permissions?.includes(permission)) {
          return reply.code(403).send({ error: 'Forbidden', message: `Missing permission: ${permission}` })
        }
      } catch {
        return reply.code(401).send({ error: 'Unauthorized', message: 'Missing or invalid token' })
      }
    }
  })
}

export default fp(jwtPlugin)
