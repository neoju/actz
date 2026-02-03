<script lang="ts">
  import * as Accordion from "$lib/components/ui/accordion";
  import { Button } from "$lib/components/ui/button";
  import { ArrowLeft } from "@lucide/svelte";
  import "$lib/assets/css/legal.css";
  import * as m from "$lib/paraglide/messages.js";
</script>

<div class="faq-container">
  <div class="faq-header">
    <h1 class="faq-title">
      {m.faq_title()}
    </h1>
  </div>

  <div class="space-y-6">
    <p class="faq-description">
      {m.faq_description()}
    </p>

    <Accordion.Root type="single" class="w-full">
      <Accordion.Item value="item-1">
        <Accordion.Trigger class="accordion-trigger"
          >{m.faq_q1()}</Accordion.Trigger
        >
        <Accordion.Content>
          {m.faq_a1()}
        </Accordion.Content>
      </Accordion.Item>

      <Accordion.Item value="item-2">
        <Accordion.Trigger class="accordion-trigger"
          >{m.faq_q2()}</Accordion.Trigger
        >
        <Accordion.Content>
          {m.faq_a2()}
        </Accordion.Content>
      </Accordion.Item>

      <Accordion.Item value="item-3">
        <Accordion.Trigger class="accordion-trigger"
          >{m.faq_q3()}</Accordion.Trigger
        >
        <Accordion.Content>
          {m.faq_a3()}
        </Accordion.Content>
      </Accordion.Item>

      <Accordion.Item value="item-4">
        <Accordion.Trigger class="accordion-trigger"
          >{m.faq_q4()}</Accordion.Trigger
        >
        <Accordion.Content>
          {m.faq_a4()}
        </Accordion.Content>
      </Accordion.Item>

      <Accordion.Item value="item-5">
        <Accordion.Trigger class="accordion-trigger"
          >{m.faq_q5()}</Accordion.Trigger
        >
        <Accordion.Content>
          {m.faq_a5()}
        </Accordion.Content>
      </Accordion.Item>

      <Accordion.Item value="item-6">
        <Accordion.Trigger class="accordion-trigger"
          >{m.faq_q6()}</Accordion.Trigger
        >
        <Accordion.Content>
          {m.faq_a6()}
        </Accordion.Content>
      </Accordion.Item>

      <Accordion.Item value="item-7">
        <Accordion.Trigger class="accordion-trigger"
          >{m.faq_q7()}</Accordion.Trigger
        >
        <Accordion.Content>
          {m.faq_a7()}
          encourages sticking to a plan for at least a few days to see results,
          rather than constantly switching routines.
        </Accordion.Content>
      </Accordion.Item>

      <Accordion.Item value="item-8">
        <Accordion.Trigger class="accordion-trigger"
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
        <Accordion.Trigger class="accordion-trigger"
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

    <div class="contact-section">
      <p class="contact-text">Still have questions?</p>
      <Button variant="outline" href="mailto:neo01796@gmail.com"
        >Contact Support</Button
      >
    </div>
  </div>
</div>
