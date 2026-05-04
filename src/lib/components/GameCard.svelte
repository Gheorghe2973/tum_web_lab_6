<script>
  import StarRating from './StarRating.svelte'
  import { library } from '../stores/library.js'
  import { selectedGame } from '../stores/ui.js'

  let { game } = $props()

  const STATUS_COLOR = { playing: '#3b82f6', completed: '#10b981', dropped: '#ef4444' }
  const STATUS_LABEL = { playing: 'Playing', completed: 'Completed', dropped: 'Dropped' }
  const STATUSES = ['playing', 'completed', 'dropped']
</script>

<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
<div class="card" onclick={() => selectedGame.set(game)}>
  <div
    class="cover"
    style={game.background_image
      ? `background-image: url(${game.background_image})`
      : 'background: linear-gradient(135deg, #1e1e2e, #2a2a3a)'}
  >
    <div class="cover-overlay">
      <span class="status-badge" style="background:{STATUS_COLOR[game.status]}">
        {STATUS_LABEL[game.status]}
      </span>
      <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
      <span onclick={e => e.stopPropagation()}>
        <button
          class="fav-btn"
          class:active={game.favorite}
          onclick={() => library.toggleFavorite(game.id)}
          aria-label="Favorite"
        >{game.favorite ? '♥' : '♡'}</button>
      </span>
    </div>
  </div>

  <div class="info">
    <h3 class="title" title={game.name}>{game.name}</h3>

    {#if game.genres.length}
      <div class="tags">
        {#each game.genres.slice(0, 2) as genre}
          <span class="tag">{genre}</span>
        {/each}
      </div>
    {/if}

    <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
    <div onclick={e => e.stopPropagation()}>
      <StarRating value={game.userRating} onrate={r => library.setRating(game.id, r)} />
    </div>

    <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
    <div class="actions" onclick={e => e.stopPropagation()}>
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

      <button
        class="remove-btn"
        onclick={() => library.remove(game.id)}
        aria-label="Remove"
      >✕</button>
    </div>
  </div>
</div>

<style>
  .card {
    background: var(--panel-bg);
    border-radius: 12px;
    overflow: hidden;
    border: 1px solid var(--border);
    display: flex;
    flex-direction: column;
    cursor: pointer;
    transition: box-shadow 0.2s, transform 0.2s;
  }

  .card:hover {
    box-shadow: 0 8px 24px rgba(0,0,0,0.25);
    transform: translateY(-2px);
  }

  .cover {
    aspect-ratio: 16/9;
    background-size: cover;
    background-position: center;
    position: relative;
  }

  .cover-overlay {
    position: absolute;
    inset: 0;
    padding: 0.6rem;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    background: linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, transparent 60%);
  }

  .status-badge {
    font-size: 0.7rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: #fff;
    padding: 0.2rem 0.55rem;
    border-radius: 999px;
  }

  .fav-btn {
    background: rgba(0,0,0,0.4);
    border: none;
    color: #fff;
    font-size: 1.1rem;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: color 0.15s, transform 0.15s;
    line-height: 1;
  }

  .fav-btn.active { color: #ef4444; }
  .fav-btn:hover { transform: scale(1.15); }

  .info {
    padding: 0.75rem;
    display: flex;
    flex-direction: column;
    gap: 0.45rem;
    flex: 1;
  }

  .title {
    margin: 0;
    font-size: 0.9rem;
    font-weight: 700;
    line-height: 1.3;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.3rem;
  }

  .tag {
    font-size: 0.65rem;
    padding: 0.1rem 0.4rem;
    border-radius: 4px;
    background: var(--tag-bg);
    color: var(--text-muted);
    border: 1px solid var(--border);
  }

  .actions {
    display: flex;
    gap: 0.4rem;
    align-items: center;
    margin-top: auto;
  }

  .status-select {
    flex: 1;
    padding: 0.3rem 0.5rem;
    border-radius: 6px;
    border: 1.5px solid var(--border);
    background: var(--bg);
    color: var(--text);
    font-size: 0.8rem;
    cursor: pointer;
  }

  .remove-btn {
    background: transparent;
    border: 1.5px solid var(--border);
    color: var(--text-muted);
    width: 30px;
    height: 30px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.8rem;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: color 0.15s, border-color 0.15s;
    flex-shrink: 0;
  }

  .remove-btn:hover { color: #ef4444; border-color: #ef4444; }
</style>
