<script>
  let { value = 0, onrate } = $props()
  let hover = $state(0)
</script>

<div class="stars" role="group" aria-label="Rating">
  {#each [1,2,3,4,5] as star}
    <button
      class="star"
      class:active={star <= (hover || value)}
      onmouseenter={() => hover = star}
      onmouseleave={() => hover = 0}
      onclick={() => onrate?.(star === value ? 0 : star)}
      aria-label="{star} star"
    >★</button>
  {/each}
</div>

<style>
  .stars { display: flex; gap: 1px; }

  .star {
    background: none;
    border: none;
    font-size: 1rem;
    cursor: pointer;
    color: var(--border);
    padding: 0 1px;
    line-height: 1;
    transition: color 0.1s, transform 0.1s;
  }

  .star.active { color: #f59e0b; }
  .star:hover { transform: scale(1.2); }
</style>
