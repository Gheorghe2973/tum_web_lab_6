const KEY = import.meta.env.VITE_RAWG_KEY
const BASE = 'https://api.rawg.io/api'

export async function searchGames(query) {
  const res = await fetch(
    `${BASE}/games?search=${encodeURIComponent(query)}&key=${KEY}&page_size=12&search_precise=false`
  )
  if (!res.ok) throw new Error('Search failed')
  const data = await res.json()
  return data.results ?? []
}
