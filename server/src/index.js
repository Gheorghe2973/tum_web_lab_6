import 'dotenv/config'
import Fastify from 'fastify'
import cors from '@fastify/cors'
import supabase from './plugins/supabase.js'
import jwtPlugin from './plugins/jwt.js'
import tokenRoutes from './routes/token.js'
import gamesRoutes from './routes/games.js'

const app = Fastify({ logger: true })

await app.register(cors, { origin: '*' })
await app.register(jwtPlugin)

app.decorate('supabase', supabase)

app.get('/health', async (_, reply) => {
  try {
    const res = await fetch(`${process.env.SUPABASE_URL}/rest/v1/games?select=id&limit=1`, {
      headers: {
        apikey: process.env.SUPABASE_KEY,
        Authorization: `Bearer ${process.env.SUPABASE_KEY}`,
      },
    })
    const data = await res.json()
    return { status: 'ok', message: 'GameLog API is running', db: 'connected', rows: data.length ?? 0 }
  } catch (err) {
    return reply.code(503).send({ status: 'error', message: err.message })
  }
})

await app.register(tokenRoutes)
await app.register(gamesRoutes)

const PORT = process.env.PORT || 3000

try {
  await app.listen({ port: PORT, host: '0.0.0.0' })
  console.log(`Server running on http://localhost:${PORT}`)
} catch (err) {
  app.log.error(err)
  process.exit(1)
}
