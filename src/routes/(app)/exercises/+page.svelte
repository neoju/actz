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
    import exercises from "$lib/exercises.json";

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
        expandedExercise =
            expandedExercise === exerciseName ? null : exerciseName;
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
                return "bg-green-500/10 text-green-700 border-green-500/20";
            case "intermediate":
                return "bg-yellow-500/10 text-yellow-700 border-yellow-500/20";
            case "advanced":
                return "bg-red-500/10 text-red-700 border-red-500/20";
            default:
                return "bg-gray-500/10 text-gray-700 border-gray-500/20";
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

<div class="space-y-4 pb-8">
    <!-- Header -->
    <div class="space-y-2 pt-4" data-tour="library-header">
        <h1 class="text-3xl font-bold tracking-tight">Exercise Library</h1>
        <p class="text-sm text-muted-foreground">
            Browse and learn about all available exercises
        </p>
    </div>

    <!-- Search Bar -->
    <div class="relative" data-tour="library-search">
        <SearchIcon
            class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
        />
        <Input
            type="text"
            placeholder="Search exercises, tags, or categories..."
            value={searchQuery}
            oninput={handleSearchInput}
            class="pl-10 pr-10"
        />
        {#if searchQuery}
            <button
                onclick={clearSearch}
                class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label="Clear search"
            >
                <XIcon class="h-4 w-4" />
            </button>
        {/if}
    </div>

    <!-- Filter Toggle Button -->
    <div class="flex items-center justify-between">
        <Button
            variant="outline"
            size="sm"
            onclick={() => (showFilters = !showFilters)}
            class="gap-2"
            data-tour="library-filters"
        >
            <FilterIcon class="h-4 w-4" />
            Filters
            {#if activeFiltersCount > 0}
                <Badge variant="default" class="ml-1 h-5 px-1.5">
                    {activeFiltersCount}
                </Badge>
            {/if}
            {#if showFilters}
                <ChevronUpIcon class="h-4 w-4" />
            {:else}
                <ChevronDownIcon class="h-4 w-4" />
            {/if}
        </Button>

        {#if activeFiltersCount > 0}
            <Button
                variant="ghost"
                size="sm"
                onclick={clearFilters}
                class="text-muted-foreground"
            >
                Clear all
            </Button>
        {/if}
    </div>

    <!-- Filters Panel -->
    {#if showFilters}
        <div
            class="space-y-4 p-4 border rounded-lg bg-muted/30"
            transition:slide={{ duration: 300 }}
        >
            <!-- Category Filter -->
            <div class="space-y-2">
                <p class="text-sm font-medium">Category</p>
                <div class="flex flex-wrap gap-2">
                    {#each categories as category}
                        <Button
                            variant={selectedCategory === category
                                ? "default"
                                : "outline"}
                            size="sm"
                            onclick={() =>
                                (selectedCategory =
                                    selectedCategory === category
                                        ? null
                                        : category)}
                            class="gap-1"
                        >
                            <span>{getCategoryEmoji(category)}</span>
                            {category}
                        </Button>
                    {/each}
                </div>
            </div>

            <!-- Level Filter -->
            <div class="space-y-2">
                <p class="text-sm font-medium">Level</p>
                <div class="flex flex-wrap gap-2">
                    {#each levels as level}
                        <Button
                            variant={selectedLevel === level
                                ? "default"
                                : "outline"}
                            size="sm"
                            onclick={() =>
                                (selectedLevel =
                                    selectedLevel === level ? null : level)}
                        >
                            {level}
                        </Button>
                    {/each}
                </div>
            </div>
        </div>
    {/if}

    <!-- Results Count -->
    <div
        class="flex items-center justify-between text-sm text-muted-foreground"
    >
        <span>
            {filteredExercises.length} exercise{filteredExercises.length !== 1
                ? "s"
                : ""} found
        </span>
    </div>

    <!-- Exercise List -->
    <div class="space-y-3">
        {#if filteredExercises.length === 0}
            <Card.Root class="border-dashed">
                <Card.Content
                    class="flex flex-col items-center justify-center py-12"
                >
                    <AlertCircleIcon
                        class="h-12 w-12 text-muted-foreground mb-4"
                    />
                    <p class="text-sm font-medium">No exercises found</p>
                    <p class="text-xs text-muted-foreground mt-1">
                        Try adjusting your filters or search query
                    </p>
                    {#if activeFiltersCount > 0 || debouncedSearchQuery}
                        <Button
                            variant="outline"
                            size="sm"
                            onclick={clearFilters}
                            class="mt-4"
                        >
                            Clear filters
                        </Button>
                    {/if}
                </Card.Content>
            </Card.Root>
        {:else}
            {#each filteredExercises as exercise (exercise.name)}
                {@const isExpanded = expandedExercise === exercise.name}
                <Card.Root
                    class={cn(
                        "transition-all hover:shadow-md",
                        isExpanded && "shadow-lg border-primary/50",
                    )}
                    data-tour={filteredExercises.indexOf(exercise) === 0
                        ? "library-exercise-card"
                        : undefined}
                >
                    <button
                        onclick={() => toggleExercise(exercise.name)}
                        class="w-full text-left"
                        aria-label="Toggle exercise details for {exercise.name}"
                    >
                        <Card.Header class="pb-3">
                            <div class="flex items-start justify-between gap-2">
                                <div class="flex-1 space-y-1">
                                    <div class="flex items-center gap-2">
                                        <span class="text-lg">
                                            {getCategoryEmoji(
                                                exercise.category,
                                            )}
                                        </span>
                                        <Card.Title class="text-base">
                                            {exercise.name}
                                        </Card.Title>
                                    </div>
                                    <Card.Description class="text-xs">
                                        {exercise.description}
                                    </Card.Description>
                                </div>
                                <div class="flex flex-col items-end gap-2">
                                    <Badge
                                        variant="outline"
                                        class={getLevelColor(exercise.level)}
                                    >
                                        {exercise.level}
                                    </Badge>
                                    {#if isExpanded}
                                        <ChevronUpIcon
                                            class="h-5 w-5 text-muted-foreground"
                                        />
                                    {:else}
                                        <ChevronDownIcon
                                            class="h-5 w-5 text-muted-foreground"
                                        />
                                    {/if}
                                </div>
                            </div>

                            <!-- Tags -->
                            <div class="flex flex-wrap gap-1.5 pt-2">
                                <Badge variant="secondary" class="text-xs">
                                    {exercise.category}
                                </Badge>
                                {#each exercise.tags as tag}
                                    <Badge variant="outline" class="text-xs">
                                        {tag}
                                    </Badge>
                                {/each}
                            </div>
                        </Card.Header>
                    </button>

                    <!-- Expanded Content -->
                    {#if isExpanded}
                        <div transition:slide={{ duration: 333 }}>
                            <Card.Content class="space-y-4 pt-0">
                                <!-- Key Principles -->
                                <div class="space-y-2">
                                    <div class="flex items-center gap-2">
                                        <TargetIcon
                                            class="h-4 w-4 text-primary"
                                        />
                                        <h3 class="text-sm font-semibold">
                                            Key Principles
                                        </h3>
                                    </div>
                                    <p
                                        class="text-sm text-muted-foreground pl-6 bg-primary/5 p-3 rounded-md"
                                    >
                                        {exercise.key_principles}
                                    </p>
                                </div>

                                <!-- Technical Checkpoints -->
                                <div class="space-y-2">
                                    <div class="flex items-center gap-2">
                                        <DumbbellIcon
                                            class="h-4 w-4 text-primary"
                                        />
                                        <h3 class="text-sm font-semibold">
                                            Technical Checkpoints
                                        </h3>
                                    </div>
                                    <p
                                        class="text-sm text-muted-foreground pl-6 bg-orange-500/5 p-3 rounded-md"
                                    >
                                        {exercise.key_technical_checkpoints}
                                    </p>
                                </div>

                                <!-- Instructions -->
                                <div class="space-y-2">
                                    <h3 class="text-sm font-semibold">
                                        Instructions
                                    </h3>
                                    <ol class="space-y-2 pl-6">
                                        {#each exercise.instructions as instruction, index}
                                            <li
                                                class="text-sm text-muted-foreground list-decimal"
                                            >
                                                {instruction}
                                            </li>
                                        {/each}
                                    </ol>
                                </div>

                                <!-- YouTube Video -->
                                {#if exercise.tutor_video}
                                    <div class="space-y-2">
                                        <div class="flex items-center gap-2">
                                            <YoutubeIcon
                                                class="h-4 w-4 text-red-500"
                                            />
                                            <h3 class="text-sm font-semibold">
                                                Video Tutorial
                                            </h3>
                                        </div>
                                        <a
                                            href={exercise.tutor_video.replace(
                                                "/embed/",
                                                "/watch?v=",
                                            )}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            class="block"
                                            aria-label="Watch video tutorial for {exercise.name} on YouTube"
                                        >
                                            <div
                                                class="aspect-video rounded-md overflow-hidden border border-border hover:border-primary transition-colors"
                                            >
                                                <iframe
                                                    src={exercise.tutor_video}
                                                    title="YouTube video player for {exercise.name}"
                                                    frameborder="0"
                                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                    allowfullscreen
                                                    class="w-full h-full"
                                                ></iframe>
                                            </div>
                                        </a>
                                    </div>
                                {/if}

                                <!-- Collapse Button -->
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onclick={() =>
                                        toggleExercise(exercise.name)}
                                    class="w-full"
                                >
                                    <ChevronUpIcon class="h-4 w-4 mr-2" />
                                    Show Less
                                </Button>
                            </Card.Content>
                        </div>
                    {/if}
                </Card.Root>
            {/each}
        {/if}
    </div>
</div>
