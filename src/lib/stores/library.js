import { writable, derived } from 'svelte/store'
import { gamelogApi } from '../api/gamelog.js'

function loadLocal() {
  try { return JSON.parse(localStorage.getItem('gameLibrary') || '[]') }
  catch { return [] }
}

const _lib = writable(loadLocal())
_lib.subscribe(val => localStorage.setItem('gameLibrary', JSON.stringify(val)))

async function syncFromApi() {
  try {
    const res = await gamelogApi.getGames()
    if (!res?.data) return
    _lib.set(res.data.map(g => ({
      id: g.rawg_id ?? g.id,
      rawg_id: g.rawg_id,
      _dbId: g.id,
      name: g.name,
      background_image: g.background_image,
      genres: [],
      platforms: [],
      released: null,
      status: g.status ?? 'backlog',
      userRating: g.user_rating ?? 0,
      favorite: g.favorite ?? false,
      notes: '',
      addedAt: Date.now(),
    })))
  } catch {
    // fall back to localStorage if API is unavailable
  }
}

syncFromApi()

export const library = {
  subscribe: _lib.subscribe,

  async add(rawgGame, status = 'playing') {
    let existing
    _lib.update(lib => {
      existing = lib.find(g => g.id === rawgGame.id)
      if (existing) return lib
      const newGame = {
        id: rawgGame.id,
        rawg_id: rawgGame.id,
        name: rawgGame.name,
        background_image: rawgGame.background_image,
        genres: (rawgGame.genres ?? []).map(g => g.name),
        platforms: (rawgGame.platforms ?? []).map(p => p.platform.name),
        released: rawgGame.released,
        status,
        userRating: 0,
        favorite: false,
        notes: '',
        addedAt: Date.now(),
      }
      return [...lib, newGame]
    })
    if (!existing) {
      try {
        const created = await gamelogApi.addGame({
          name: rawgGame.name,
          background_image: rawgGame.background_image,
          status,
          rawg_id: rawgGame.id,
        })
        if (created?.id) {
          _lib.update(lib =>
            lib.map(g => g.id === rawgGame.id ? { ...g, _dbId: created.id } : g)
          )
        }
      } catch { /* keep local copy */ }
    }
  },

  async remove(id) {
    let dbId, rawgId
    _lib.update(lib => {
      const game = lib.find(g => g.id === id)
      dbId = game?._dbId
      rawgId = game?.rawg_id ?? id
      return lib.filter(g => g.id !== id)
    })
    try {
      if (!dbId) {
        const res = await gamelogApi.getGames()
        const match = res?.data?.find(g => g.rawg_id === rawgId)
        dbId = match?.id
      }
      if (dbId) await gamelogApi.deleteGame(dbId)
    } catch { /* local already removed */ }
  },

  async setStatus(id, status) {
    let dbId
    _lib.update(lib => {
      dbId = lib.find(g => g.id === id)?._dbId
      return lib.map(g => g.id === id ? { ...g, status } : g)
    })
    if (dbId) {
      try { await gamelogApi.updateGame(dbId, { status }) } catch { }
    }
  },

  async setRating(id, rating) {
    let dbId
    _lib.update(lib => {
      dbId = lib.find(g => g.id === id)?._dbId
      return lib.map(g => g.id === id ? { ...g, userRating: rating } : g)
    })
    if (dbId) {
      try { await gamelogApi.updateGame(dbId, { user_rating: rating }) } catch { }
    }
  },

  setNotes(id, notes) {
    _lib.update(lib => lib.map(g => g.id === id ? { ...g, notes } : g))
  },

  async toggleFavorite(id) {
    let dbId, newFav
    _lib.update(lib => {
      const g = lib.find(g => g.id === id)
      dbId = g?._dbId
      newFav = !g?.favorite
      return lib.map(g => g.id === id ? { ...g, favorite: newFav } : g)
    })
    if (dbId) {
      try { await gamelogApi.updateGame(dbId, { favorite: newFav }) } catch { }
    }
  },
}

export const allGenres = derived(_lib, lib => {
  const s = new Set()
  lib.forEach(g => g.genres.forEach(n => s.add(n)))
  return [...s].sort()
})

export const allPlatforms = derived(_lib, lib => {
  const s = new Set()
  lib.forEach(g => g.platforms.forEach(n => s.add(n)))
  return [...s].sort()
})
