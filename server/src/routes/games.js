export default async function gamesRoutes(app) {
  // GET /games?page=1&limit=10
  app.get('/games', {
    preHandler: app.authenticate,
    schema: {
      tags: ['Games'],
      summary: 'List all games (paginated)',
      querystring: {
        type: 'object',
        properties: {
          page:  { type: 'integer', minimum: 1, default: 1 },
          limit: { type: 'integer', minimum: 1, maximum: 100, default: 10 },
        },
      },
    },
  }, async (request, reply) => {
    const { page = 1, limit = 10 } = request.query
    const from = (page - 1) * limit
    const to = from + limit - 1

    const { data, error, count } = await app.supabase
      .from('games')
      .select('*', { count: 'exact' })
      .range(from, to)
      .order('id', { ascending: false })

    if (error) return reply.code(500).send({ error: error.message })

    return { data, total: count, page, limit, totalPages: Math.ceil(count / limit) }
  })

  // GET /games/:id
  app.get('/games/:id', {
    preHandler: app.authenticate,
    schema: {
      tags: ['Games'],
      summary: 'Get a single game by ID',
      params: { type: 'object', properties: { id: { type: 'integer' } } },
    },
  }, async (request, reply) => {
    const { id } = request.params

    const { data, error } = await app.supabase
      .from('games')
      .select('*')
      .eq('id', id)
      .single()

    if (error) return reply.code(404).send({ error: 'Game not found' })

    return data
  })

  // POST /games
  app.post('/games', {
    preHandler: app.requirePermission('WRITE'),
    schema: {
      tags: ['Games'],
      summary: 'Add a new game (requires WRITE permission)',
      body: {
        type: 'object',
        required: ['title'],
        properties: {
          title:       { type: 'string' },
          cover_url:   { type: 'string' },
          status:      { type: 'string', enum: ['playing', 'completed', 'backlog', 'dropped'] },
          rating:      { type: 'integer', minimum: 1, maximum: 5 },
          favorite:    { type: 'boolean' },
          rawg_id:     { type: 'integer' },
        },
      },
    },
  }, async (request, reply) => {
    const { data, error } = await app.supabase
      .from('games')
      .insert(request.body)
      .select()
      .single()

    if (error) return reply.code(500).send({ error: error.message })

    return reply.code(201).send(data)
  })

  // PUT /games/:id
  app.put('/games/:id', {
    preHandler: app.requirePermission('WRITE'),
    schema: {
      tags: ['Games'],
      summary: 'Update a game (requires WRITE permission)',
      params: { type: 'object', properties: { id: { type: 'integer' } } },
      body: {
        type: 'object',
        properties: {
          title:       { type: 'string' },
          cover_url:   { type: 'string' },
          status:      { type: 'string', enum: ['playing', 'completed', 'backlog', 'dropped'] },
          rating:      { type: 'integer', minimum: 1, maximum: 5 },
          favorite:    { type: 'boolean' },
        },
      },
    },
  }, async (request, reply) => {
    const { id } = request.params

    const { data, error } = await app.supabase
      .from('games')
      .update(request.body)
      .eq('id', id)
      .select()
      .single()

    if (error) return reply.code(500).send({ error: error.message })

    return data
  })

  // DELETE /games/:id
  app.delete('/games/:id', {
    preHandler: app.requirePermission('DELETE'),
    schema: {
      tags: ['Games'],
      summary: 'Delete a game (requires DELETE permission)',
      params: { type: 'object', properties: { id: { type: 'integer' } } },
    },
  }, async (request, reply) => {
    const { id } = request.params

    const { error } = await app.supabase
      .from('games')
      .delete()
      .eq('id', id)

    if (error) return reply.code(500).send({ error: error.message })

    return reply.code(204).send()
  })
}
