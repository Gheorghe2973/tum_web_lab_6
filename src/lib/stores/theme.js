import { writable } from 'svelte/store'

const stored = localStorage.getItem('theme') || 'dark'
export const theme = writable(stored)

theme.subscribe(val => {
  localStorage.setItem('theme', val)
  document.documentElement.setAttribute('data-theme', val)
})
