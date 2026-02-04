<script lang="ts">
  import { toast } from "svelte-sonner";
  import {
    User,
    Calendar,
    Bell,
    Globe,
    Palette,
    FileText,
    Shield,
  } from "@lucide/svelte";
  import { Switch } from "$lib/components/ui/switch";
  import * as Select from "$lib/components/ui/select";
  import ModeSwitcher from "$lib/components/mode-switcher.svelte";
  import SettingsMenuItem from "$lib/components/settings-menu-item.svelte";
  import * as m from "$lib/paraglide/messages.js";
  import { setLocale, getLocale } from "$lib/paraglide/runtime.js";
  import { 
    subscribeToPushNotifications, 
    unsubscribeFromPushNotifications,
    areNotificationsSupported 
  } from "$lib/utils/notifications";

  let { data } = $props();
  let notificationsEnabled = $state(data.profile?.notificationsEnabled || false);
  let isUpdatingLanguage = $state(false);
  let isUpdatingNotifications = $state(false);

  const currentLocale = getLocale();
  const availableLocales = [
    { value: "en", label: m.language_en() },
    { value: "vi", label: m.language_vi() },
  ];

  const currentLanguage = $derived.by(
    () =>
      availableLocales.find((l) => l.value === currentLocale)?.label ||
      m.language_en(),
  );

  async function handleNotificationToggle(enabled: boolean) {
    if (isUpdatingNotifications) {
      return;
    }

    try {
      isUpdatingNotifications = true;

      if (enabled) {
        if (!areNotificationsSupported()) {
          throw new Error("Notifications not supported");
        }
        await subscribeToPushNotifications();
      } else {
        await unsubscribeFromPushNotifications();
      }

      toast.success(m.toast_profileUpdated(), {
        description: m.toast_profileUpdatedDesc(),
      });
    } catch (error) {
      console.error("Error updating notifications:", error);
      // Revert the toggle on error
      notificationsEnabled = !enabled;
      toast.error(m.toast_profileUpdateFailed(), {
        description: m.toast_profileUpdateFailedDesc(),
      });
    } finally {
      isUpdatingNotifications = false;
    }
  }

  async function handleLanguageChange(locale: string | undefined) {
    if (!locale || locale === currentLocale || isUpdatingLanguage) {
      return;
    }

    try {
      isUpdatingLanguage = true;

      // Update in database
      const response = await fetch("/api/user/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language: locale }),
      });

      if (!response.ok) {
        throw new Error("Failed to update language");
      }

      // Change the locale in UI
      setLocale(locale as any);

      toast.success(m.toast_profileUpdated(), {
        description: m.toast_profileUpdatedDesc(),
      });
    } catch (error) {
      console.error("Error updating language:", error);
      toast.error(m.toast_profileUpdateFailed(), {
        description: m.toast_profileUpdateFailedDesc(),
      });
    } finally {
      isUpdatingLanguage = false;
    }
  }
</script>

<div class="settings-container">
  <div class="settings-header">
    <h1 class="settings-title">{m.settings_title()}</h1>
  </div>

  <div class="settings-group">
    <h2 class="settings-group-title">{m.settings_preferences()}</h2>
    <div class="settings-group-content">
      <div class="settings-preference-item">
        <div class="preference-item-content">
          <Bell />
          <div class="preference-item-text">
            <span class="preference-item-label"
              >{m.settings_notifications()}</span
            >
            <span class="preference-item-desc">{m.notification_desc()}</span>
          </div>
        </div>
        <Switch
          bind:checked={notificationsEnabled}
          onCheckedChange={(checked) => handleNotificationToggle(checked)}
        />
      </div>

      <div class="settings-preference-item">
        <div class="preference-item-content">
          <Globe />
          <div class="preference-item-text">
            <span class="preference-item-label">{m.settings_language()}</span>
          </div>
        </div>
        <Select.Root
          type="single"
          onValueChange={(selected) => handleLanguageChange(selected)}
        >
          <Select.Trigger class="w-45">{currentLanguage}</Select.Trigger>
          <Select.Content>
            {#each availableLocales as locale}
              <Select.Item value={locale.value}>{locale.label}</Select.Item>
            {/each}
          </Select.Content>
        </Select.Root>
      </div>

      <div class="settings-preference-item">
        <div class="preference-item-content">
          <Palette />
          <div class="preference-item-text">
            <span class="preference-item-label">{m.settings_theme()}</span>
          </div>
        </div>
        <ModeSwitcher />
      </div>
    </div>
  </div>

  <div class="settings-group">
    <h2 class="settings-group-title">{m.settings_account()}</h2>
    <div class="settings-group-content">
      <SettingsMenuItem
        icon={User}
        label={m.settings_profile()}
        href="/settings/profile"
      />

      <SettingsMenuItem
        icon={Calendar}
        label={m.settings_exercisePlan()}
        href="/settings/exercise-plan"
      />

      <SettingsMenuItem
        icon={FileText}
        label={m.settings_terms()}
        href="/terms"
      />

      <SettingsMenuItem
        icon={Shield}
        label={m.settings_privacyPolicy()}
        href="/privacy-policy"
      />
    </div>
  </div>
</div>

<style>
  .settings-group {
    margin-bottom: 2rem;
  }

  .settings-group-title {
    font-size: 0.875rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: hsl(var(--muted-foreground));
    margin-bottom: 1rem;
  }

  .settings-group-content {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .settings-preference-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem;
    border-radius: 0.5rem;
    border: 1px solid hsl(var(--border));
    background: hsl(var(--card));
  }

  .preference-item-content {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    flex: 1;
  }

  .preference-item-text {
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
  }

  .preference-item-label {
    font-size: 0.9375rem;
    font-weight: 500;
  }

  .preference-item-desc {
    font-size: 0.8125rem;
    color: hsl(var(--muted-foreground));
  }
</style>
