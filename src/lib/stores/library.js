import { writable, derived } from 'svelte/store'

function load() {
  try { return JSON.parse(localStorage.getItem('gameLibrary') || '[]') }
  catch { return [] }
}

const _lib = writable(load())
_lib.subscribe(val => localStorage.setItem('gameLibrary', JSON.stringify(val)))

export const library = {
  subscribe: _lib.subscribe,

  add(rawgGame, status = 'playing') {
    _lib.update(lib => {
      if (lib.find(g => g.id === rawgGame.id)) return lib
      return [...lib, {
        id: rawgGame.id,
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
      }]
    })
  },

  remove(id) {
    _lib.update(lib => lib.filter(g => g.id !== id))
  },

  setStatus(id, status) {
    _lib.update(lib => lib.map(g => g.id === id ? { ...g, status } : g))
  },

  setRating(id, rating) {
    _lib.update(lib => lib.map(g => g.id === id ? { ...g, userRating: rating } : g))
  },

  setNotes(id, notes) {
    _lib.update(lib => lib.map(g => g.id === id ? { ...g, notes } : g))
  },

  toggleFavorite(id) {
    _lib.update(lib => lib.map(g => g.id === id ? { ...g, favorite: !g.favorite } : g))
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
