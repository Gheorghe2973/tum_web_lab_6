<script>
  import { selectedGame } from '../stores/ui.js'
  import { library } from '../stores/library.js'
  import StarRating from './StarRating.svelte'

  const STATUSES = ['playing', 'completed', 'dropped']
  const STATUS_LABEL = { playing: 'Playing', completed: 'Completed', dropped: 'Dropped' }
  const STATUS_COLOR = { playing: '#3b82f6', completed: '#10b981', dropped: '#ef4444' }

  let game = $derived($selectedGame)
  let notes = $state('')

  $effect(() => {
    if (game) notes = game.notes ?? ''
  })

  function close() {
    selectedGame.set(null)
  }

  function saveNotes() {
    library.setNotes(game.id, notes)
  }

  function onKeydown(e) {
    if (e.key === 'Escape') close()
  }

  function releaseYear(released) {
    return released ? released.slice(0, 4) : null
  }
</script>

<svelte:window onkeydown={onKeydown} />

<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
<div class="overlay" onclick={close}>
  <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
  <div class="detail" onclick={e => e.stopPropagation()}>

    <div
      class="cover"
      style={game.background_image
        ? `background-image: url(${game.background_image})`
        : 'background: linear-gradient(135deg, #1e1e2e, #2a2a3a)'}
    >
      <div class="cover-top">
        <button class="close-btn" onclick={close}>✕</button>
        <button
          class="fav-btn"
          class:active={game.favorite}
          onclick={() => library.toggleFavorite(game.id)}
        >{game.favorite ? '♥' : '♡'}</button>
      </div>
    </div>

    <div class="body">
      <h2 class="title">{game.name}</h2>

      <div class="meta">
        {#if releaseYear(game.released)}
          <span class="meta-item">📅 {releaseYear(game.released)}</span>
        {/if}
        {#if game.platforms?.length}
          <span class="meta-item">🖥 {game.platforms.slice(0, 3).join(', ')}</span>
        {/if}
      </div>

      {#if game.genres?.length}
        <div class="tags">
          {#each game.genres as genre}
            <span class="tag">{genre}</span>
          {/each}
        </div>
      {/if}

      <div class="row">
        <div class="field">
          <label class="field-label">Status</label>
          <select
            class="status-select"
            value={game.status}
            onchange={e => library.setStatus(game.id, e.target.value)}
            style="border-color: {STATUS_COLOR[game.status]}"
          >
            {#each STATUSES as s}
              <option value={s}>{STATUS_LABEL[s]}</option>
            {/each}
          </select>
        </div>

        <div class="field">
          <label class="field-label">Your Rating</label>
          <StarRating value={game.userRating} onrate={r => library.setRating(game.id, r)} />
        </div>
      </div>

      <div class="field">
        <label class="field-label" for="notes">Review / Notes</label>
        <textarea
          id="notes"
          class="notes-input"
          placeholder="Write your thoughts about this game..."
          bind:value={notes}
          rows="4"
        ></textarea>
        <button class="save-btn" onclick={saveNotes}>Save Notes</button>
      </div>

      <button class="remove-btn" onclick={() => { library.remove(game.id); close() }}>
        Remove from library
      </button>
    </div>
  </div>
</div>

<style>
  .overlay {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.7);
    z-index: 200;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;
    backdrop-filter: blur(6px);
  }

  .detail {
    background: var(--panel-bg);
    border-radius: 18px;
    border: 1px solid var(--border);
    width: 100%;
    max-width: 480px;
    max-height: 90dvh;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
  }

  .cover {
    aspect-ratio: 16/9;
    background-size: cover;
    background-position: center;
    border-radius: 18px 18px 0 0;
    flex-shrink: 0;
    position: relative;
  }

  .cover-top {
    position: absolute;
    inset: 0;
    padding: 0.75rem;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    background: linear-gradient(to bottom, rgba(0,0,0,0.55) 0%, transparent 55%);
    border-radius: 18px 18px 0 0;
  }

  .close-btn {
    background: rgba(0,0,0,0.5);
    border: none;
    color: #fff;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    cursor: pointer;
    font-size: 0.9rem;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.15s;
  }

  .close-btn:hover { background: rgba(0,0,0,0.8); }

  .fav-btn {
    background: rgba(0,0,0,0.45);
    border: none;
    color: #fff;
    font-size: 1.2rem;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform 0.15s;
    line-height: 1;
  }

  .fav-btn.active { color: #ef4444; }
  .fav-btn:hover { transform: scale(1.15); }

  .body {
    padding: 1.25rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .title {
    margin: 0;
    font-size: 1.3rem;
    font-weight: 800;
    line-height: 1.3;
  }

  .meta {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
  }

  .meta-item {
    font-size: 0.82rem;
    color: var(--text-muted);
  }

  .tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.35rem;
  }

  .tag {
    font-size: 0.72rem;
    padding: 0.2rem 0.55rem;
    border-radius: 6px;
    background: var(--tag-bg);
    color: var(--text-muted);
    border: 1px solid var(--border);
  }

  .row {
    display: flex;
    gap: 1.5rem;
    flex-wrap: wrap;
    align-items: flex-end;
  }

  .field {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
    flex: 1;
  }

  .field-label {
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.07em;
    color: var(--text-muted);
    font-weight: 600;
  }

  .status-select {
    padding: 0.4rem 0.6rem;
    border-radius: 8px;
    border: 1.5px solid var(--border);
    background: var(--bg);
    color: var(--text);
    font-size: 0.88rem;
    cursor: pointer;
  }

  .notes-input {
    width: 100%;
    padding: 0.65rem 0.75rem;
    border-radius: 10px;
    border: 1.5px solid var(--border);
    background: var(--bg);
    color: var(--text);
    font-size: 0.88rem;
    resize: vertical;
    font-family: inherit;
    line-height: 1.5;
    outline: none;
    transition: border-color 0.15s;
  }

  .notes-input:focus { border-color: var(--accent); }

  .save-btn {
    align-self: flex-end;
    padding: 0.4rem 1rem;
    border-radius: 8px;
    border: none;
    background: var(--accent);
    color: #fff;
    font-weight: 700;
    font-size: 0.85rem;
    cursor: pointer;
    transition: opacity 0.15s;
  }

  .save-btn:hover { opacity: 0.85; }

  .remove-btn {
    background: transparent;
    border: 1.5px solid #ef444450;
    color: #ef4444;
    padding: 0.45rem;
    border-radius: 8px;
    cursor: pointer;
    font-size: 0.82rem;
    transition: background 0.15s;
    text-align: center;
  }

  .remove-btn:hover { background: #ef444415; }
</style>
