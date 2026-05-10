const ROLES = {
  ADMIN:   { role: 'ADMIN',   permissions: ['READ', 'WRITE', 'DELETE'] },
  VISITOR: { role: 'VISITOR', permissions: ['READ'] },
}

export default async function tokenRoutes(app) {
  app.post('/token', {
    schema: {
      tags: ['Auth'],
      summary: 'Get a signed JWT for a given role',
      security: [],
      body: {
        type: 'object',
        required: ['role'],
        properties: {
          role: { type: 'string', enum: ['ADMIN', 'VISITOR'] },
        },
      },
    },
  }, async (request, reply) => {
    const { role } = request.body

    if (!ROLES[role]) {
      return reply.code(400).send({ error: 'Invalid role', message: 'Role must be ADMIN or VISITOR' })
    }

    const payload = ROLES[role]
    const token = app.jwt.sign(payload, { expiresIn: '1m' })

    return reply.code(200).send({
      token,
      role: payload.role,
      permissions: payload.permissions,
      expiresIn: '1 minute',
    })
  })
}
