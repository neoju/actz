<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import * as Card from "$lib/components/ui/card";
  import { Input } from "$lib/components/ui/input";
  import { Badge } from "$lib/components/ui/badge";
  import { cn } from "$lib/utils";
  import { slide } from "svelte/transition";
  import SearchIcon from "@lucide/svelte/icons/search";
  import FilterIcon from "@lucide/svelte/icons/filter";
  import ChevronDownIcon from "@lucide/svelte/icons/chevron-down";
  import ChevronUpIcon from "@lucide/svelte/icons/chevron-up";
  import DumbbellIcon from "@lucide/svelte/icons/dumbbell";
  import TargetIcon from "@lucide/svelte/icons/target";
  import AlertCircleIcon from "@lucide/svelte/icons/alert-circle";
  import YoutubeIcon from "@lucide/svelte/icons/youtube";
  import XIcon from "@lucide/svelte/icons/x";
  import { getExercises } from "$lib/exercises-loader";
  import "$lib/assets/css/exercises.css";
  import * as m from "$lib/paraglide/messages.js";

  const exercises = getExercises();

  // State management
  let searchQuery = $state("");
  let debouncedSearchQuery = $state("");
  let selectedCategory = $state<string | null>(null);
  let selectedLevel = $state<string | null>(null);
  let showFilters = $state(false);
  let expandedExercise = $state<string | null>(null);
  let debounceTimeout: ReturnType<typeof setTimeout> | null = null;

  // Debounce search query handler
  function handleSearchInput(event: Event) {
    const target = event.target as HTMLInputElement;
    searchQuery = target.value;

    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
    }

    debounceTimeout = setTimeout(() => {
      debouncedSearchQuery = searchQuery;
    }, 150);
  }

  function clearSearch() {
    searchQuery = "";
    debouncedSearchQuery = "";
    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
    }
  }

  // Extract unique categories and levels
  const categories = $derived(
    Array.from(new Set(exercises.map((ex) => ex.category))).sort(),
  );
  const levels = $derived(
    Array.from(new Set(exercises.map((ex) => ex.level))).sort(),
  );

  // Filtered exercises
  const filteredExercises = $derived.by(() => {
    let result = exercises;

    // Filter by search query
    if (debouncedSearchQuery.trim()) {
      const query = debouncedSearchQuery.toLowerCase();
      result = result.filter(
        (ex) =>
          ex.name.toLowerCase().includes(query) ||
          ex.description.toLowerCase().includes(query) ||
          ex.tags.some((tag) => tag.toLowerCase().includes(query)) ||
          ex.category.toLowerCase().includes(query),
      );
    }

    // Filter by category
    if (selectedCategory) {
      result = result.filter((ex) => ex.category === selectedCategory);
    }

    // Filter by level
    if (selectedLevel) {
      result = result.filter((ex) => ex.level === selectedLevel);
    }

    return result;
  });

  // Active filters count
  const activeFiltersCount = $derived(
    (selectedCategory ? 1 : 0) + (selectedLevel ? 1 : 0),
  );

  // Toggle exercise expansion
  function toggleExercise(exerciseName: string) {
    expandedExercise = expandedExercise === exerciseName ? null : exerciseName;
  }

  // Clear all filters
  function clearFilters() {
    selectedCategory = null;
    selectedLevel = null;
    searchQuery = "";
    debouncedSearchQuery = "";
  }

  // Get level color
  function getLevelColor(level: string) {
    switch (level.toLowerCase()) {
      case "beginner":
        return "badge-beginner";
      case "intermediate":
        return "badge-intermediate";
      case "advanced":
        return "badge-advanced";
      default:
        return "badge-default";
    }
  }

  // Get category icon/emoji
  function getCategoryEmoji(category: string) {
    const emojiMap: Record<string, string> = {
      Chest: "💪",
      Legs: "🦵",
      Core: "🎯",
      Back: "🔙",
      Shoulders: "🏋️",
      Arms: "💪",
      Cardio: "❤️",
      Flexibility: "🧘",
      "Full Body": "🔥",
    };
    return emojiMap[category] || "🏃";
  }
</script>

<div class="exercises-container">
  <!-- Header -->
  <div class="exercises-header" data-tour="library-header">
    <h1 class="header-title">{m.library_title()}</h1>
    <p class="header-desc">{m.library_description()}</p>
  </div>

  <!-- Search Bar -->
  <div class="search-container" data-tour="library-search">
    <SearchIcon class="search-icon" />
    <Input
      type="text"
      placeholder={m.library_searchPlaceholder()}
      value={searchQuery}
      oninput={handleSearchInput}
      class="search-input"
    />
    {#if searchQuery}
      <button
        onclick={clearSearch}
        class="search-clear-btn"
        aria-label="Clear search"
      >
        <XIcon class="search-clear-icon" />
      </button>
    {/if}
  </div>

  <!-- Filter Toggle Button -->
  <div class="filter-actions">
    <Button
      variant="outline"
      size="sm"
      onclick={() => (showFilters = !showFilters)}
      class="filter-toggle-btn"
      data-tour="library-filters"
    >
      <FilterIcon class="filter-icon" />
      {m.library_filters()}
      {#if activeFiltersCount > 0}
        <Badge variant="default" class="filter-count-badge">
          {activeFiltersCount}
        </Badge>
      {/if}
      {#if showFilters}
        <ChevronUpIcon class="filter-chevron" />
      {:else}
        <ChevronDownIcon class="filter-chevron" />
      {/if}
    </Button>

    {#if activeFiltersCount > 0}
      <Button
        variant="ghost"
        size="sm"
        onclick={clearFilters}
        class="filter-clear-all-btn"
      >
        {m.library_clearAll()}
      </Button>
    {/if}
  </div>

  <!-- Filters Panel -->
  {#if showFilters}
    <div class="filters-panel" transition:slide={{ duration: 300 }}>
      <!-- Category Filter -->
      <div class="filter-group">
        <p class="filter-label">{m.library_category()}</p>
        <div class="filter-options">
          {#each categories as category}
            <Button
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onclick={() =>
                (selectedCategory =
                  selectedCategory === category ? null : category)}
              class="filter-option-btn"
            >
              <span>{getCategoryEmoji(category)}</span>
              {category}
            </Button>
          {/each}
        </div>
      </div>

      <!-- Level Filter -->
      <div class="filter-group">
        <p class="filter-label">{m.library_level()}</p>
        <div class="filter-options">
          {#each levels as level}
            <Button
              variant={selectedLevel === level ? "default" : "outline"}
              size="sm"
              onclick={() =>
                (selectedLevel = selectedLevel === level ? null : level)}
            >
              {level}
            </Button>
          {/each}
        </div>
      </div>
    </div>
  {/if}

  <!-- Results Count -->
  <div class="results-count">
    <span>
      {m.library_resultsCount({ 
        count: filteredExercises.length.toString(),
        plural: filteredExercises.length !== 1 ? "s" : ""
      })}
    </span>
  </div>

  <!-- Exercise List -->
  <div class="exercises-list">
    {#if filteredExercises.length === 0}
      <Card.Root class="no-results-card">
        <Card.Content class="no-results-content">
          <AlertCircleIcon class="no-results-icon" />
          <p class="no-results-title">{m.library_noResults()}</p>
          <p class="no-results-desc">
            {m.library_noResultsDesc()}
          </p>
          {#if activeFiltersCount > 0 || debouncedSearchQuery}
            <Button
              variant="outline"
              size="sm"
              onclick={clearFilters}
              class="no-results-clear-btn"
            >
              {m.library_clearFilters()}
            </Button>
          {/if}
        </Card.Content>
      </Card.Root>
    {:else}
      {#each filteredExercises as exercise (exercise.name)}
        {@const isExpanded = expandedExercise === exercise.name}
        <Card.Root
          class={cn("exercise-card", isExpanded && "exercise-card-expanded")}
          data-tour={filteredExercises.indexOf(exercise) === 0
            ? "library-exercise-card"
            : undefined}
        >
          <button
            onclick={() => toggleExercise(exercise.name)}
            class="exercise-toggle-btn"
            aria-label="Toggle exercise details for {exercise.name}"
          >
            <Card.Header class="exercise-header-content">
              <div class="exercise-header-flex">
                <div class="exercise-info">
                  <div class="exercise-title-row">
                    <span class="exercise-emoji">
                      {getCategoryEmoji(exercise.category)}
                    </span>
                    <Card.Title class="exercise-title">
                      {exercise.name}
                    </Card.Title>
                  </div>
                  <Card.Description class="exercise-desc">
                    {exercise.description}
                  </Card.Description>
                </div>
                <div class="exercise-meta">
                  <Badge
                    variant="outline"
                    class={getLevelColor(exercise.level)}
                  >
                    {exercise.level}
                  </Badge>
                  {#if isExpanded}
                    <ChevronUpIcon class="chevron-icon" />
                  {:else}
                    <ChevronDownIcon class="chevron-icon" />
                  {/if}
                </div>
              </div>

              <!-- Tags -->
              <div class="tags-list">
                <Badge variant="secondary" class="tag-category">
                  {exercise.category}
                </Badge>
                {#each exercise.tags as tag}
                  <Badge variant="outline" class="tag-item">
                    {tag}
                  </Badge>
                {/each}
              </div>
            </Card.Header>
          </button>

          <!-- Expanded Content -->
          {#if isExpanded}
            <div transition:slide={{ duration: 333 }}>
              <Card.Content class="expanded-content">
                <!-- Key Principles -->
                <div class="content-section">
                  <div class="section-header">
                    <TargetIcon class="section-icon" />
                    <h3 class="section-title">{m.library_keyPrinciples()}</h3>
                  </div>
                  <p class="section-text-primary">
                    {exercise.key_principles}
                  </p>
                </div>

                <!-- Technical Checkpoints -->
                <div class="content-section">
                  <div class="section-header">
                    <DumbbellIcon class="section-icon" />
                    <h3 class="section-title">{m.library_technicalCheckpoints()}</h3>
                  </div>
                  <p class="section-text-orange">
                    {exercise.key_technical_checkpoints}
                  </p>
                </div>

                <!-- Instructions -->
                <div class="content-section">
                  <h3 class="section-title">{m.library_instructions()}</h3>
                  <ol class="instructions-list">
                    {#each exercise.instructions as instruction, index}
                      <li class="instruction-item">
                        {instruction}
                      </li>
                    {/each}
                  </ol>
                </div>

                <!-- YouTube Video -->
                {#if exercise.tutor_video}
                  <div class="content-section">
                    <div class="section-header">
                      <YoutubeIcon class="section-icon-red" />
                      <h3 class="section-title">{m.library_videoTutorial()}</h3>
                    </div>
                    <a
                      href={exercise.tutor_video.replace(
                        "/embed/",
                        "/watch?v=",
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      class="video-link"
                      aria-label="Watch video tutorial for {exercise.name} on YouTube"
                    >
                      <div class="video-container">
                        <iframe
                          src={exercise.tutor_video}
                          title="YouTube video player for {exercise.name}"
                          frameborder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowfullscreen
                          class="video-iframe"
                        ></iframe>
                      </div>
                    </a>
                  </div>
                {/if}

                <!-- Collapse Button -->
                <Button
                  variant="ghost"
                  size="sm"
                  onclick={() => toggleExercise(exercise.name)}
                  class="collapse-btn"
                >
                  <ChevronUpIcon class="collapse-icon" />
                  {m.library_showLess()}
                </Button>
              </Card.Content>
            </div>
          {/if}
        </Card.Root>
      {/each}
    {/if}
  </div>
</div>
