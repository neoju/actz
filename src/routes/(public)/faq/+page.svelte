<script lang="ts">
  import * as Accordion from "$lib/components/ui/accordion";
  import { Button } from "$lib/components/ui/button";
  import { ArrowLeft } from "@lucide/svelte";
</script>

<div class="container mx-auto py-10 px-4 max-w-3xl">
  <div class="mb-8 flex items-center gap-4">
    <Button variant="ghost" size="icon" href="/">
      <ArrowLeft class="h-4 w-4" />
    </Button>
    <h1 class="text-3xl font-bold tracking-tight">
      Frequently Asked Questions
    </h1>
  </div>

  <div class="space-y-6">
    <p class="text-muted-foreground">
      Find answers to common questions about your fitness journey with Actz.
    </p>

    <Accordion.Root type="single" class="w-full">
      <Accordion.Item value="item-1">
        <Accordion.Trigger class="font-semibold"
          >What is Actz?</Accordion.Trigger
        >
        <Accordion.Content>
          Actz is an AI-powered fitness companion designed to generate
          personalized weekly and monthly workout plans based on your unique
          profile, goals, and available equipment. Whether you're a beginner or
          an advanced athlete, Actz tailors the routine to you.
        </Accordion.Content>
      </Accordion.Item>

      <Accordion.Item value="item-2">
        <Accordion.Trigger class="font-semibold"
          >Is Actz suitable for beginners?</Accordion.Trigger
        >
        <Accordion.Content>
          Absolutely! When you set up your profile, you can select "Beginner" as
          your fitness level. The AI will design workouts that focus on building
          a solid foundation, proper form, and manageable intensity to help you
          get started safely.
        </Accordion.Content>
      </Accordion.Item>

      <Accordion.Item value="item-3">
        <Accordion.Trigger class="font-semibold"
          >Do I need gym equipment to use Actz?</Accordion.Trigger
        >
        <Accordion.Content>
          No. Actz adapts to your environment. You can specify "Bodyweight" or
          "Home Gym" in your profile settings, and the generated plan will only
          include exercises you can perform with what you have.
        </Accordion.Content>
      </Accordion.Item>

      <Accordion.Item value="item-4">
        <Accordion.Trigger class="font-semibold"
          >How is my data used and stored?</Accordion.Trigger
        >
        <Accordion.Content>
          We take your privacy seriously. Your profile data (age, weight, goals,
          etc.) is used solely to generate your workout plans. If you use
          "Continue as Guest," your identity is stored locally on your device.
          We do not sell your personal data to third parties.
        </Accordion.Content>
      </Accordion.Item>

      <Accordion.Item value="item-5">
        <Accordion.Trigger class="font-semibold"
          >Are the workout plans safe?</Accordion.Trigger
        >
        <Accordion.Content>
          Our AI generates plans based on general fitness principles and the
          limitations you provide. However, Actz is not a substitute for
          professional medical advice. We strongly recommend consulting with a
          healthcare provider before starting any new exercise program,
          especially if you have pre-existing conditions.
        </Accordion.Content>
      </Accordion.Item>

      <Accordion.Item value="item-6">
        <Accordion.Trigger class="font-semibold"
          >What happens if I use the "Guest" mode?</Accordion.Trigger
        >
        <Accordion.Content>
          Guest mode allows you to use the full features of Actz without
          creating a social account. Your progress is linked to a unique ID
          stored on your current device. <strong>Note:</strong> If you clear your
          browser cache or switch devices, you may lose access to your guest account
          history.
        </Accordion.Content>
      </Accordion.Item>

      <Accordion.Item value="item-7">
        <Accordion.Trigger class="font-semibold"
          >Why is there a limit on generating plans?</Accordion.Trigger
        >
        <Accordion.Content>
          To ensure fair usage and manage the costs associated with our advanced
          AI models, we limit plan generations to 5 per week. This also
          encourages sticking to a plan for at least a few days to see results,
          rather than constantly switching routines.
        </Accordion.Content>
      </Accordion.Item>

      <Accordion.Item value="item-8">
        <Accordion.Trigger class="font-semibold"
          >Can I customize specific days in my plan?</Accordion.Trigger
        >
        <Accordion.Content>
          Currently, the plan is generated as a cohesive weekly or monthly
          block. If a specific day doesn't work for you, you can simply skip it
          or mark it as a rest day. We are working on more granular
          customization features for future updates.
        </Accordion.Content>
      </Accordion.Item>

      <Accordion.Item value="item-9">
        <Accordion.Trigger class="font-semibold"
          >How do I reset my plan limit?</Accordion.Trigger
        >
        <Accordion.Content>
          The plan generation limit resets on a rolling weekly basis. This means
          a slot becomes available 7 days after it was used. You can check your
          current usage and the next available reset time in the Settings page
          under the "Plans" tab.
        </Accordion.Content>
      </Accordion.Item>
    </Accordion.Root>

    <div class="mt-12 text-center">
      <p class="text-sm text-muted-foreground mb-4">Still have questions?</p>
      <Button variant="outline" href="mailto:neo01796@gmail.com"
        >Contact Support</Button
      >
    </div>
  </div>
</div>
