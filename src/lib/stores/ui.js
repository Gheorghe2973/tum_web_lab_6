import { writable } from 'svelte/store'

export const searchOpen = writable(false)
export const selectedGame = writable(null)
export const statusFilter = writable('all')
export const genreFilter = writable('all')
export const platformFilter = writable('all')
export const favoritesOnly = writable(false)
export const sortBy = writable('addedAt')
