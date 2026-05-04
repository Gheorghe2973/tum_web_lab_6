<script>
  import { searchOpen } from '../stores/ui.js'
  import { library } from '../stores/library.js'
  import { searchGames } from '../api/rawg.js'

  let query = $state('')
  let results = $state([])
  let loading = $state(false)
  let error = $state('')
  let addedIds = $state(new Set())
  let pendingStatus = $state({}) // gameId -> status being picked

  const STATUSES = ['playing', 'completed', 'dropped']
  const STATUS_LABEL = { playing: 'Playing', completed: 'Completed', dropped: 'Dropped' }

  let debounce
  async function onInput() {
    clearTimeout(debounce)
    if (!query.trim()) { results = []; return }
    debounce = setTimeout(async () => {
      loading = true
      error = ''
      try {
        results = await searchGames(query)
      } catch {
        error = 'Search failed. Try again.'
      } finally {
        loading = false
      }
    }, 400)
  }

  function addGame(game, status) {
    library.add(game, status)
    addedIds = new Set([...addedIds, game.id])
    pendingStatus = { ...pendingStatus, [game.id]: undefined }
  }

  function close() {
    searchOpen.set(false)
    query = ''
    results = []
    addedIds = new Set()
    pendingStatus = {}
  }

  function onKeydown(e) {
    if (e.key === 'Escape') close()
  }
</script>

<svelte:window onkeydown={onKeydown} />

<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
<div class="overlay" onclick={close}>
  <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
  <div class="modal" onclick={e => e.stopPropagation()}>
    <div class="modal-header">
      <h2>Add a Game</h2>
      <button class="close-btn" onclick={close}>✕</button>
    </div>

    <div class="search-bar">
      <input
        class="search-input"
        type="text"
        placeholder="Search for a game..."
        bind:value={query}
        oninput={onInput}
        autofocus
      />
      {#if loading}
        <span class="spinner"></span>
      {/if}
    </div>

    {#if error}
      <p class="error">{error}</p>
    {/if}

    <div class="results">
      {#if results.length === 0 && query && !loading}
        <p class="empty">No results found.</p>
      {/if}

      {#each results as game (game.id)}
        {@const isAdded = addedIds.has(game.id)}
        {@const picking = pendingStatus[game.id] !== undefined}
        <div class="result">
          <div
            class="thumb"
            style={game.background_image
              ? `background-image:url(${game.background_image})`
              : 'background:#1e1e2e'}
          ></div>

          <div class="result-info">
            <span class="result-name">{game.name}</span>
            {#if game.genres?.length}
              <span class="result-genres">{game.genres.map(g => g.name).join(', ')}</span>
            {/if}
          </div>

          <div class="result-action">
            {#if isAdded}
              <span class="added-badge">✓ Added</span>
            {:else if picking}
              <div class="status-picker">
                {#each STATUSES as s}
                  <button class="status-opt" onclick={() => addGame(game, s)}>
                    {STATUS_LABEL[s]}
                  </button>
                {/each}
              </div>
            {:else}
              <button class="add-btn" onclick={() => pendingStatus = { ...pendingStatus, [game.id]: true }}>
                + Add
              </button>
            {/if}
          </div>
        </div>
      {/each}
    </div>
  </div>
</div>

<style>
  .overlay {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.65);
    z-index: 200;
    display: flex;
    align-items: flex-start;
    justify-content: center;
    padding: 5vh 1rem;
    backdrop-filter: blur(4px);
  }

  .modal {
    background: var(--panel-bg);
    border-radius: 16px;
    border: 1px solid var(--border);
    width: 100%;
    max-width: 580px;
    max-height: 85vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1.1rem 1.25rem 0.75rem;
  }

  .modal-header h2 { margin: 0; font-size: 1.1rem; }

  .close-btn {
    background: transparent;
    border: none;
    color: var(--text-muted);
    font-size: 1rem;
    cursor: pointer;
    padding: 0.25rem 0.5rem;
    border-radius: 6px;
    transition: color 0.15s;
  }

  .close-btn:hover { color: var(--text); }

  .search-bar {
    padding: 0 1.25rem 0.75rem;
    position: relative;
  }

  .search-input {
    width: 100%;
    padding: 0.65rem 2.5rem 0.65rem 0.9rem;
    border-radius: 10px;
    border: 1.5px solid var(--border);
    background: var(--bg);
    color: var(--text);
    font-size: 0.95rem;
    outline: none;
    transition: border-color 0.15s;
  }

  .search-input:focus { border-color: var(--accent); }

  .spinner {
    position: absolute;
    right: 1.9rem;
    top: 50%;
    transform: translateY(-50%);
    width: 16px;
    height: 16px;
    border: 2px solid var(--border);
    border-top-color: var(--accent);
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
  }

  .results {
    overflow-y: auto;
    flex: 1;
    padding: 0 0.75rem 0.75rem;
  }

  .result {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.6rem 0.5rem;
    border-radius: 10px;
    transition: background 0.12s;
  }

  .result:hover { background: var(--bg); }

  .thumb {
    width: 72px;
    height: 40px;
    border-radius: 6px;
    background-size: cover;
    background-position: center;
    flex-shrink: 0;
  }

  .result-info {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 0.15rem;
  }

  .result-name {
    font-size: 0.88rem;
    font-weight: 600;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .result-genres {
    font-size: 0.72rem;
    color: var(--text-muted);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .result-action { flex-shrink: 0; }

  .add-btn {
    padding: 0.3rem 0.8rem;
    border-radius: 7px;
    border: 1.5px solid var(--accent);
    background: transparent;
    color: var(--accent);
    font-size: 0.82rem;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.15s, color 0.15s;
    white-space: nowrap;
  }

  .add-btn:hover { background: var(--accent); color: #fff; }

  .status-picker {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .status-opt {
    padding: 0.2rem 0.6rem;
    border-radius: 5px;
    border: 1px solid var(--border);
    background: var(--bg);
    color: var(--text);
    font-size: 0.75rem;
    cursor: pointer;
    transition: background 0.12s;
    white-space: nowrap;
    text-align: left;
  }

  .status-opt:hover { background: var(--accent); color: #fff; border-color: var(--accent); }

  .added-badge {
    font-size: 0.78rem;
    color: #10b981;
    font-weight: 600;
  }

  .empty, .error {
    padding: 1.5rem 0.5rem;
    text-align: center;
    color: var(--text-muted);
    font-size: 0.9rem;
  }

  .error { color: #ef4444; }

  @keyframes spin { to { transform: translateY(-50%) rotate(360deg); } }
</style>
