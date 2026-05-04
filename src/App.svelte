<script>
  import { theme } from './lib/stores/theme.js'
  import { searchOpen, selectedGame } from './lib/stores/ui.js'
  import LibraryView from './lib/components/LibraryView.svelte'
  import SearchModal from './lib/components/SearchModal.svelte'
  import GameDetail from './lib/components/GameDetail.svelte'

  function toggleTheme() {
    theme.update(t => t === 'dark' ? 'light' : 'dark')
  }
</script>

<div class="app" data-theme={$theme}>
  <header>
    <div class="brand">
      <span class="logo">🎮</span>
      <span class="app-name">GameLog</span>
    </div>
    <div class="header-actions">
      <button class="add-btn" onclick={() => searchOpen.set(true)}>+ Add Game</button>
      <button class="theme-btn" onclick={toggleTheme} aria-label="Toggle theme">
        {$theme === 'dark' ? '☀️' : '🌙'}
      </button>
    </div>
  </header>

  <main>
    <LibraryView />
  </main>

  {#if $searchOpen}
    <SearchModal />
  {/if}

  {#if $selectedGame}
    <GameDetail />
  {/if}
</div>

<style>
  :global(*, *::before, *::after) { box-sizing: border-box; }
  :global(:root) { font-family: 'Inter', system-ui, sans-serif; }

  :global([data-theme='dark']) {
    --bg: #0f0f13;
    --panel-bg: #16161e;
    --text: #e2e2f0;
    --text-muted: #5c5c7a;
    --border: #252535;
    --tag-bg: #1e1e2e;
    --accent: #7c3aed;
  }

  :global([data-theme='light']) {
    --bg: #f4f4f8;
    --panel-bg: #ffffff;
    --text: #1a1a2e;
    --text-muted: #8888aa;
    --border: #e0e0ec;
    --tag-bg: #eeeef8;
    --accent: #7c3aed;
  }

  :global(body) {
    margin: 0;
    background: var(--bg);
    color: var(--text);
    transition: background 0.2s, color 0.2s;
    min-height: 100dvh;
  }

  :global(select option) {
    background: var(--panel-bg);
    color: var(--text);
  }

  .app { min-height: 100dvh; display: flex; flex-direction: column; }

  header {
    position: sticky;
    top: 0;
    z-index: 100;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.75rem 1.25rem;
    background: var(--panel-bg);
    border-bottom: 1px solid var(--border);
  }

  .brand { display: flex; align-items: center; gap: 0.5rem; }
  .logo { font-size: 1.3rem; }

  .app-name {
    font-size: 1.15rem;
    font-weight: 800;
    background: linear-gradient(135deg, var(--accent), #ec4899);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .header-actions { display: flex; align-items: center; gap: 0.6rem; }

  .add-btn {
    padding: 0.4rem 1rem;
    border-radius: 8px;
    border: none;
    background: var(--accent);
    color: #fff;
    font-weight: 700;
    font-size: 0.88rem;
    cursor: pointer;
    transition: opacity 0.15s;
  }

  .add-btn:hover { opacity: 0.85; }

  .theme-btn {
    background: var(--bg);
    border: 1.5px solid var(--border);
    border-radius: 8px;
    padding: 0.35rem 0.55rem;
    font-size: 1rem;
    cursor: pointer;
  }

  main { flex: 1; }
</style>
