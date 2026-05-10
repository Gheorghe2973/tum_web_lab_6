const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

let _token = null
let _tokenExpiry = 0

async function getToken() {
  if (_token && Date.now() < _tokenExpiry - 5000) return _token

  const res = await fetch(`${BASE_URL}/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ role: 'ADMIN' }),
  })
  const data = await res.json()
  _token = data.token
  _tokenExpiry = Date.now() + 60_000
  return _token
}

async function request(path, options = {}) {
  const token = await getToken()
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
  })
  if (res.status === 204) return null
  return res.json()
}

export const gamelogApi = {
  getGames: (page = 1, limit = 100) =>
    request(`/games?page=${page}&limit=${limit}`),

  getGame: (id) => request(`/games/${id}`),

  addGame: (game) =>
    request('/games', { method: 'POST', body: JSON.stringify(game) }),

  updateGame: (id, changes) =>
    request(`/games/${id}`, { method: 'PUT', body: JSON.stringify(changes) }),

  deleteGame: (id) =>
    request(`/games/${id}`, { method: 'DELETE' }),
}
