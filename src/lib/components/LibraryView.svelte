<script>
  import { derived } from 'svelte/store'
  import GameCard from './GameCard.svelte'
  import { library, allGenres, allPlatforms } from '../stores/library.js'
  import { statusFilter, genreFilter, platformFilter, favoritesOnly, sortBy } from '../stores/ui.js'

  const STATUS_TABS = [
    { key: 'all',       label: 'All' },
    { key: 'playing',   label: 'Playing' },
    { key: 'completed', label: 'Completed' },
    { key: 'dropped',   label: 'Dropped' },
  ]

  const counts = derived(library, lib => ({
    all:       lib.length,
    playing:   lib.filter(g => g.status === 'playing').length,
    completed: lib.filter(g => g.status === 'completed').length,
    dropped:   lib.filter(g => g.status === 'dropped').length,
  }))

  const filtered = derived(
    [library, statusFilter, genreFilter, platformFilter, favoritesOnly, sortBy],
    ([$lib, $status, $genre, $platform, $fav, $sort]) => {
      let list = $lib
      if ($status !== 'all') list = list.filter(g => g.status === $status)
      if ($genre !== 'all') list = list.filter(g => g.genres.includes($genre))
      if ($platform !== 'all') list = list.filter(g => g.platforms.includes($platform))
      if ($fav) list = list.filter(g => g.favorite)
      return [...list].sort((a, b) => {
        if ($sort === 'name') return a.name.localeCompare(b.name)
        if ($sort === 'userRating') return b.userRating - a.userRating
        return b.addedAt - a.addedAt
      })
    }
  )
</script>

<div class="library">
  <div class="tabs-wrap">
    <div class="tabs">
      {#each STATUS_TABS as tab}
        <button
          class="tab"
          class:active={$statusFilter === tab.key}
          onclick={() => statusFilter.set(tab.key)}
        >
          {tab.label}
          <span class="count">{$counts[tab.key] ?? $counts.all}</span>
        </button>
      {/each}
    </div>
  </div>

  <div class="filter-bar">
    <select class="filter-select" bind:value={$genreFilter}>
      <option value="all">All Genres</option>
      {#each $allGenres as g}<option value={g}>{g}</option>{/each}
    </select>

    <select class="filter-select" bind:value={$platformFilter}>
      <option value="all">All Platforms</option>
      {#each $allPlatforms as p}<option value={p}>{p}</option>{/each}
    </select>

    <select class="filter-select" bind:value={$sortBy}>
      <option value="addedAt">Newest</option>
      <option value="name">Name A–Z</option>
      <option value="userRating">Top Rated</option>
    </select>

    <button
      class="fav-filter"
      class:active={$favoritesOnly}
      onclick={() => favoritesOnly.update(v => !v)}
    >♥ Favorites</button>
  </div>

  {#if $filtered.length === 0}
    <div class="empty-state">
      {#if $library.length === 0}
        <p class="empty-icon">🎮</p>
        <h2>Your library is empty</h2>
        <p>Search for a game to get started.</p>
      {:else}
        <p class="empty-icon">🔍</p>
        <h2>No games match</h2>
        <p>Try adjusting your filters.</p>
      {/if}
    </div>
  {:else}
    <div class="grid">
      {#each $filtered as game (game.id)}
        <GameCard {game} />
      {/each}
    </div>
  {/if}
</div>

<style>
  .library { display: flex; flex-direction: column; }

  .tabs-wrap {
    overflow-x: auto;
    border-bottom: 1px solid var(--border);
    background: var(--panel-bg);
    scrollbar-width: none;
  }

  .tabs-wrap::-webkit-scrollbar { display: none; }

  .tabs {
    display: flex;
    padding: 0 1rem;
    min-width: max-content;
  }

  .tab {
    background: transparent;
    border: none;
    border-bottom: 2px solid transparent;
    color: var(--text-muted);
    padding: 0.75rem 1rem;
    cursor: pointer;
    font-size: 0.88rem;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 0.4rem;
    transition: color 0.15s, border-color 0.15s;
    white-space: nowrap;
  }

  .tab:hover { color: var(--text); }

  .tab.active {
    color: var(--accent);
    border-bottom-color: var(--accent);
    font-weight: 700;
  }

  .count {
    font-size: 0.7rem;
    background: var(--bg);
    border-radius: 999px;
    padding: 0.05rem 0.4rem;
    color: var(--text-muted);
    font-weight: 600;
  }

  .tab.active .count { background: var(--accent); color: #fff; }

  .filter-bar {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    padding: 0.75rem 1rem;
    border-bottom: 1px solid var(--border);
  }

  .filter-select {
    padding: 0.35rem 0.65rem;
    border-radius: 8px;
    border: 1.5px solid var(--border);
    background: var(--panel-bg);
    color: var(--text);
    font-size: 0.82rem;
    cursor: pointer;
  }

  .fav-filter {
    padding: 0.35rem 0.75rem;
    border-radius: 8px;
    border: 1.5px solid var(--border);
    background: transparent;
    color: var(--text-muted);
    font-size: 0.82rem;
    cursor: pointer;
    transition: color 0.15s, border-color 0.15s, background 0.15s;
  }

  .fav-filter.active {
    color: #ef4444;
    border-color: #ef4444;
    background: #ef444415;
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(190px, 1fr));
    gap: 1rem;
    padding: 1rem;
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 4rem 2rem;
    text-align: center;
    color: var(--text-muted);
    gap: 0.5rem;
  }

  .empty-icon { font-size: 3rem; margin: 0; }
  .empty-state h2 { margin: 0; color: var(--text); }
  .empty-state p { margin: 0; }

  .cta {
    margin-top: 0.5rem;
    padding: 0.6rem 1.5rem;
    border-radius: 10px;
    border: none;
    background: var(--accent);
    color: #fff;
    font-weight: 700;
    font-size: 0.95rem;
    cursor: pointer;
    transition: opacity 0.15s;
  }

  .cta:hover { opacity: 0.85; }
</style>
