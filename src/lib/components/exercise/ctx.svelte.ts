import { getContext, setContext } from "svelte";
import exercisesDB from "$lib/exercises.json";

const EXERCISE_KEY = Symbol("EXERCISE");

export class ExerciseContext {
  // Props
  exercise = $state() as any;
  isOpened = $state(false);
  isLocked = $state(false);
  cooldownActive = $state(false);
  onUpdateActivityProp = $state() as any;
  onStartCooldownProp = $state() as any;

  // State
  initialized = $state(false);
  isFullScreen = $state(false);
  currentSet = $state(1);
  isSetInProgress = $state(false);
  timeLeft = $state(0);
  timerInterval: any;

  constructor(props: {
    exercise: any;
    isOpened: boolean;
    isLocked: boolean;
    cooldownActive: boolean;
    onUpdateActivity: any;
    onStartCooldown: any;
  }) {
    this.exercise = props.exercise;
    this.isOpened = props.isOpened;
    this.isLocked = props.isLocked;
    this.cooldownActive = props.cooldownActive;
    this.onUpdateActivityProp = props.onUpdateActivity;
    this.onStartCooldownProp = props.onStartCooldown;

    $effect(() => {
      if (!this.initialized && this.isOpened) {
        this.initialized = true;
      }
    });

    // Reset if status changes back to PENDING
    $effect(() => {
      if (this.status === "PENDING") {
        this.currentSet = 1;
        this.isSetInProgress = false;
        clearInterval(this.timerInterval);
        this.timeLeft = 0;
      }
    });
  }

  updateProps(props: {
    exercise: any;
    isOpened: boolean;
    isLocked: boolean;
    cooldownActive: boolean;
    onUpdateActivity: any;
    onStartCooldown: any;
  }) {
    this.exercise = props.exercise;
    this.isOpened = props.isOpened;
    this.isLocked = props.isLocked;
    this.cooldownActive = props.cooldownActive;
    this.onUpdateActivityProp = props.onUpdateActivity;
    this.onStartCooldownProp = props.onStartCooldown;
  }

  // Derived
  get detail() {
    return (
      exercisesDB.find(
        (e: any) => e.name.toLowerCase() === this.exercise.name.toLowerCase(),
      ) ||
      exercisesDB.find((e: any) =>
        e.name.toLowerCase().includes(this.exercise.name.toLowerCase()),
      )
    );
  }

  get activity() {
    return this.exercise.activities[0];
  }

  get status() {
    return this.activity?.status || "PENDING";
  }

  get totalSets() {
    return this.exercise.sets && !isNaN(parseInt(this.exercise.sets))
      ? parseInt(this.exercise.sets)
      : 1;
  }

  get isTimerExercise() {
    return this.detail?.tags?.includes("timer") ?? false;
  }

  get duration() {
    if (!this.isTimerExercise || !this.exercise.reps) return 0;
    const text = this.exercise.reps.toLowerCase();
    if (text.includes("min")) {
      return parseInt(text) * 60;
    }
    return parseInt(text) || 0;
  }

  // Actions
  startTimer() {
    this.timeLeft = this.duration;
    clearInterval(this.timerInterval);
    this.timerInterval = setInterval(() => {
      this.timeLeft--;
      if (this.timeLeft <= 0) {
        clearInterval(this.timerInterval);
      }
    }, 1000);
  }

  handleStartSet = () => {
    this.isSetInProgress = true;
    if (this.isTimerExercise) {
      this.startTimer();
    }
  };

  handleFinishSet = () => {
    this.isSetInProgress = false;
    clearInterval(this.timerInterval);
    if (this.currentSet < this.totalSets) {
      this.currentSet++;
    } else {
      this.handleComplete();
    }
  };

  handleComplete = () => {
    this.isFullScreen = false;
    this.onUpdateActivityProp(this.exercise.id, "COMPLETED", this.activity?.id);
    this.onStartCooldownProp();
  };

  handleUpdateActivity = async (id: string, status: string, aid?: string) => {
    if (status === "SKIPPED" || status === "COMPLETED") {
      this.isFullScreen = false;
    }
    // Fire API call without blocking UI
    return this.onUpdateActivityProp(id, status, aid);
  };

  handleFullscreenStart = () => {
    this.isFullScreen = true;
  };

  closeFullscreen = () => {
    this.isFullScreen = false;
  };
}

export function setExerciseContext(props: any) {
  const ctx = new ExerciseContext(props);
  setContext(EXERCISE_KEY, ctx);
  return ctx;
}

export function useExercise() {
  return getContext<ExerciseContext>(EXERCISE_KEY);
}
