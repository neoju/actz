<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import * as Card from "$lib/components/ui/card";
  import { Switch } from "$lib/components/ui/switch";
  import { Bell, BellOff, TestTube } from "@lucide/svelte";
  import {
    areNotificationsSupported,
    getNotificationPermission,
    requestNotificationPermission,
    subscribeToPushNotifications,
    unsubscribeFromPushNotifications,
    showTestNotification,
    formatTimeDisplay,
  } from "$lib/utils/notifications";
  import { toast } from "svelte-sonner";

  interface Props {
    preferredWorkoutTime?: string | null;
    reminderMinutesBefore?: number | null;
    notificationsEnabled?: boolean | null;
    onUpdate?: (data: { notificationsEnabled: boolean }) => Promise<void>;
  }

  let {
    preferredWorkoutTime = null,
    reminderMinutesBefore = 30,
    notificationsEnabled = false,
    onUpdate,
  }: Props = $props();

  let isUpdating = $state(false);
  let isTesting = $state(false);
  let isSupported = $state(false);
  let permissionStatus = $state<NotificationPermission | null>(null);

  // Check support and permission on mount
  $effect(() => {
    if (typeof window !== "undefined") {
      isSupported = areNotificationsSupported();
      permissionStatus = getNotificationPermission();
    }
  });

  async function handleToggleNotifications(enabled: boolean) {
    if (!isSupported) {
      toast.error("Notifications not supported", {
        description: "Your browser doesn't support push notifications.",
      });
      return;
    }

    try {
      isUpdating = true;

      if (enabled) {
        // Request permission if not granted
        if (permissionStatus !== "granted") {
          const permission = await requestNotificationPermission();
          permissionStatus = permission;

          if (permission !== "granted") {
            toast.error("Permission denied", {
              description:
                "Please allow notifications in your browser settings.",
            });
            return;
          }
        }

        // Subscribe to push notifications
        await subscribeToPushNotifications();

        if (onUpdate) {
          await onUpdate({ notificationsEnabled: true });
        }

        toast.success("Notifications enabled", {
          description:
            "You'll receive workout reminders before your scheduled time.",
        });
      } else {
        // Unsubscribe
        await unsubscribeFromPushNotifications();

        if (onUpdate) {
          await onUpdate({ notificationsEnabled: false });
        }

        toast.success("Notifications disabled", {
          description: "You won't receive workout reminders anymore.",
        });
      }
    } catch (error) {
      console.error("Notification toggle error:", error);
      toast.error("Failed to update notifications", {
        description: "Please try again or check your browser settings.",
      });
    } finally {
      isUpdating = false;
    }
  }

  async function handleTestNotification() {
    try {
      isTesting = true;

      if (permissionStatus !== "granted") {
        const permission = await requestNotificationPermission();
        permissionStatus = permission;

        if (permission !== "granted") {
          toast.error("Permission denied", {
            description: "Please allow notifications to test them.",
          });
          return;
        }
      }

      await showTestNotification();
      toast.success("Test notification sent!", {
        description: "Check if you received it.",
      });
    } catch (error) {
      console.error("Test notification error:", error);
      toast.error("Failed to send test notification", {
        description: "Please check your browser settings.",
      });
    } finally {
      isTesting = false;
    }
  }

  const reminderText = $derived(() => {
    if (!reminderMinutesBefore) return "30 minutes before";
    if (reminderMinutesBefore === 15) return "15 minutes before";
    if (reminderMinutesBefore === 30) return "30 minutes before";
    if (reminderMinutesBefore === 60) return "1 hour before";
    if (reminderMinutesBefore === 120) return "2 hours before";
    return `${reminderMinutesBefore} minutes before`;
  });
</script>

<Card.Root class="mt-4">
  <Card.Header>
    <div class="flex items-start justify-between">
      <div>
        <Card.Title class="flex items-center gap-2">
          {#if notificationsEnabled}
            <Bell class="h-5 w-5" />
          {:else}
            <BellOff class="h-5 w-5" />
          {/if}
          Workout Reminders
        </Card.Title>
        <Card.Description>
          Get notified before your scheduled workout time
        </Card.Description>
      </div>
      <Switch
        checked={notificationsEnabled || false}
        onCheckedChange={handleToggleNotifications}
        disabled={isUpdating || !isSupported}
      />
    </div>
  </Card.Header>

  <Card.Content class="space-y-4">
    {#if !isSupported}
      <div
        class="rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800"
      >
        <p class="font-medium">Browser not supported</p>
        <p class="mt-1">
          Your browser doesn't support push notifications. Please use a modern
          browser like Chrome, Firefox, or Edge.
        </p>
      </div>
    {:else if permissionStatus === "denied"}
      <div
        class="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800"
      >
        <p class="font-medium">Notifications blocked</p>
        <p class="mt-1">
          You've blocked notifications for this site. Please enable them in your
          browser settings to use this feature.
        </p>
      </div>
    {:else}
      <div class="space-y-3">
        {#if preferredWorkoutTime}
          <div class="flex items-center justify-between text-sm">
            <span class="text-muted-foreground">Workout time</span>
            <span class="font-medium"
              >{formatTimeDisplay(preferredWorkoutTime)}</span
            >
          </div>
        {/if}

        {#if reminderMinutesBefore}
          <div class="flex items-center justify-between text-sm">
            <span class="text-muted-foreground">Reminder</span>
            <span class="font-medium">{reminderText()}</span>
          </div>
        {/if}

        {#if notificationsEnabled}
          <div
            class="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800"
          >
            <p class="font-medium">✓ Reminders active</p>
            <p class="mt-1 text-xs">
              You'll be notified on workout days (excluding rest days) {reminderText()}
              your scheduled time.
            </p>
          </div>
        {:else}
          <div
            class="rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm text-gray-600"
          >
            <p>Enable notifications to receive workout reminders</p>
          </div>
        {/if}
      </div>

      <Button
        variant="outline"
        size="sm"
        class="w-full"
        onclick={handleTestNotification}
        disabled={isTesting || !notificationsEnabled}
      >
        <TestTube class="mr-2 h-4 w-4" />
        {isTesting ? "Sending..." : "Send Test Notification"}
      </Button>
    {/if}
  </Card.Content>
</Card.Root>
