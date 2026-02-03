<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import * as Card from "$lib/components/ui/card";
  import { cn } from "$lib/utils";
  import {
    Check,
    Lock,
    Loader,
    Clock,
    Sparkles,
    ArrowRight,
  } from "@lucide/svelte";
  import { navigating } from "$app/state";
  import { onMount } from "svelte";
  import { shouldShowTour, startCompleteTour } from "$lib/tour";
  import "$lib/assets/css/planned-exercises.css";

  let { data } = $props();
  let plan = $derived(data.plan);

  // Calculate current day index (0-based) only if plan exists
  let currentDayIndex = $derived.by(() => {
    if (!plan) return 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const start = new Date(plan.startDate);
    start.setHours(0, 0, 0, 0);

    const diffTime = today.getTime() - start.getTime();
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  });

  // Sort days only if plan exists
  let days = $derived(
    plan ? plan.days.sort((a: any, b: any) => a.order - b.order) : [],
  );

  // Check if plan is completed (currentDayIndex beyond all days)
  let isPlanCompleted = $derived(
    days.length > 0 && currentDayIndex >= days.length,
  );

  // Auto-scroll to today's card or new adventure section on mount
  onMount(() => {
    if (!plan) return;
    setTimeout(() => {
      if (isPlanCompleted) {
        // Scroll to new adventure section
        const newAdventureEl = document.querySelector(
          '[data-new-adventure="true"]',
        );
        if (newAdventureEl) {
          newAdventureEl.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }
      } else {
        // Scroll to today's card
        const todayCard = document.querySelector('[data-today="true"]');
        if (todayCard) {
          // Check if card is in viewport
          const rect = todayCard.getBoundingClientRect();
          const isInViewport =
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <=
              (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <=
              (window.innerWidth || document.documentElement.clientWidth);

          // Only scroll if not in viewport
          if (!isInViewport) {
            todayCard.scrollIntoView({
              behavior: "smooth",
              block: "center",
            });
          }

          // Add pulse animation briefly
          todayCard.classList.add("today-pulse");
          setTimeout(() => {
            todayCard.classList.remove("today-pulse");
          }, 2000);
        }
      }
    }, 100);

    // Start tour for first-time users after login
    if (shouldShowTour()) {
      setTimeout(() => {
        startCompleteTour();
      }, 1000);
    }
  });
</script>

<div class="page-container">
  {#if !plan}
    <div class="empty-state">
      <div class="empty-state-content">
        <h1 class="empty-state-title">No Active Plan</h1>
        <p class="empty-state-desc">
          You don't have an active workout plan currently.
        </p>
      </div>
      <Button href="/settings" variant="default" size="lg" class="gap-2">
        Generate a Plan
        <ArrowRight class="w-4 h-4" />
      </Button>
    </div>
  {:else}
    <!-- Header -->
    <div class="plan-header">
      <h1 class="plan-title">Your Weekly Plan</h1>

      <p class="plan-label">Description:</p>
      <div data-tour="plan-description">
        <p class={cn("plan-desc")}>
          {plan.planDescription || "Stay consistent!"}
        </p>
      </div>

      <p class="plan-label plan-label-spacing">Personal Trainer's Note:</p>
      <div data-tour="pt-summary">
        <p class={cn("plan-note")}>
          " {plan.ptSummary} "
        </p>
      </div>
    </div>

    <!-- Days List -->
    <div class="days-grid">
      {#each days as day, index}
        {@const isToday = index === currentDayIndex}
        {@const isFuture = index > currentDayIndex}
        {@const isPast = index < currentDayIndex}
        {@const isRestDay =
          day.exercises.length === 0 ||
          day.title.toLowerCase().includes("rest") ||
          day.dayName.toLowerCase().includes("rest")}
        {@const isCompleted =
          day.exercises.length > 0 &&
          day.exercises.every(
            (e: any) =>
              e.activities[0]?.status === "COMPLETED" ||
              e.activities[0]?.status === "SKIPPED",
          )}
        {@const isTouched = day.exercises.some(
          (e: any) =>
            e.activities[0]?.status === "IN_PROGRESS" ||
            e.activities[0]?.status === "COMPLETED" ||
            e.activities[0]?.status === "SKIPPED",
        )}
        {@const isPastUntouched = isPast && !isTouched}
        {@const isPastTouched = isPast && isTouched && !isCompleted}
        {@const isDisabled = isFuture || isPastUntouched || isRestDay}
        {@const dayLink = `/planned-exercises/${plan.id}/${day.slug}`}
        {@const isLoading = navigating.to?.url.pathname === dayLink}

        <a
          href={isDisabled ? undefined : dayLink}
          class={cn("day-card-link", isDisabled && "pointer-events-none")}
          data-today={isToday}
          data-tour={isToday && !isRestDay ? "today-card" : undefined}
        >
          <Card.Root
            class={cn(
              "day-card-root",
              !isDisabled && "day-card-interactive",
              isToday && !isRestDay && "day-card-today",
              isFuture && "day-card-future",
              isCompleted && "day-card-completed",
              isPastUntouched && "day-card-past-untouched",
              isPastTouched && "day-card-past-touched",
              isRestDay && "day-card-rest",
              isLoading && "day-card-loading",
            )}
          >
            <Card.Header class="day-card-header">
              <div class="space-y-1">
                <Card.Title
                  class={cn(
                    "day-card-title",
                    isPastUntouched &&
                      !isRestDay &&
                      "day-card-title-strikethrough",
                  )}
                >
                  Day {day.order}: {day.title}
                </Card.Title>
                <Card.Description
                  class={cn(
                    isPastUntouched &&
                      !isRestDay &&
                      "day-card-desc-strikethrough",
                  )}
                >
                  {day.dayName}
                </Card.Description>
              </div>
              {#if isLoading}
                <div class="status-icon-base">
                  <Loader class="h-8 w-8 animate-spin text-primary" />
                </div>
              {:else if isCompleted}
                <div class="status-icon-completed">
                  <Check class="h-5 w-5" />
                </div>
              {:else if isRestDay}
                <span class="status-badge-rest"> REST </span>
              {:else if isPastUntouched}
                <div class="status-icon-past-untouched">
                  <Lock class="h-5 w-5 text-red-600" />
                </div>
              {:else if isPastTouched}
                <div class="status-icon-past-touched">
                  <Clock class="h-5 w-5 text-yellow-600" />
                </div>
              {:else if isFuture}
                <Lock class="h-5 w-5 text-muted-foreground" />
              {:else if isToday}
                <span class="status-badge-today"> TODAY </span>
              {/if}
            </Card.Header>
            <Card.Content>
              {#if isRestDay}
                <p class="day-card-content-rest">
                  Recovery Day - No exercises scheduled
                </p>
              {:else}
                <p
                  class={cn(
                    "day-card-content-text",
                    isPastUntouched &&
                      !isRestDay &&
                      "day-card-desc-strikethrough",
                  )}
                >
                  {day.exercises.length} exercises • {day.estimatedTime ||
                    "N/A"}
                </p>
              {/if}
            </Card.Content>
          </Card.Root>
        </a>
      {/each}
    </div>

    <!-- New Adventure Section (when plan is completed) -->
    {#if isPlanCompleted}
      <div class="adventure-section" data-new-adventure="true">
        <div class="adventure-inner">
          <!-- Celebration Icon -->
          <div class="flex justify-center">
            <div class="adventure-icon-wrapper">
              <Sparkles class="h-10 w-10 text-primary" />
            </div>
          </div>

          <!-- Congratulations Message -->
          <div class="space-y-2">
            <h2 class="adventure-title">Congratulations!</h2>
            <p class="text-5xl my-6">🎉</p>
            <p class="adventure-subtext">You've completed your workout plan!</p>
          </div>

          <!-- Stats Summary -->
          <div class="adventure-stats-grid">
            <div class="adventure-stat-box">
              <p class="adventure-stat-label">Total Days</p>
              <p class="adventure-stat-value text-primary">
                {days.length}
              </p>
            </div>
            <div class="adventure-stat-box">
              <p class="adventure-stat-label">Completed</p>
              <p class="adventure-stat-value text-green-600">
                {days.filter((d) =>
                  d.exercises.every(
                    (e: any) =>
                      e.activities[0]?.status === "COMPLETED" ||
                      e.activities[0]?.status === "SKIPPED",
                  ),
                ).length}
              </p>
            </div>
          </div>

          <!-- Call to Action -->
          <div class="pt-4">
            <p class="text-muted-foreground mb-4">
              Ready to continue your fitness journey?
            </p>
            <Button href="/settings" size="lg" class="adventure-cta-btn">
              Start New Adventure
              <ArrowRight
                class="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform"
              />
            </Button>
            <p class="adventure-cta-footer">
              Generate a new workout plan in settings
            </p>
          </div>
        </div>
      </div>
    {/if}
  {/if}
</div>
