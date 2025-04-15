import * as React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Typography } from '@/components/ui/Typography';
import Billing from '@/components/sections/billing';
import HowPricingWorks from '@/components/sections/how-pricing-works';

export default function PricingPage() {
  return (
    <div className="container mx-auto px-4 py-24 md:py-32 space-y-16">
      {/* Page Title */}
      <div className="flex flex-col items-center justify-center text-center space-y-4">
        <Typography variant="h1">Flexible plan + pay as you go</Typography>
        <Typography
          variant="h2"
          className="text-muted-foreground font-semibold text-lg max-w-2xl"
        >
          Choose the plan that works best for your needs, with transparent
          pricing and no hidden costs.
        </Typography>
      </div>

      {/* Pricing Plans */}
      <Billing />

      {/* How Pricing Works */}
      <HowPricingWorks />

      {/* FAQ Section */}
      <div className="space-y-4 max-w-4xl mx-auto">
        <Typography variant="h2" className="text-center">
          Frequently asked questions
        </Typography>
        <p className="text-center text-muted-foreground">
          Got questions? We're glad to hear that because we have answers.
        </p>

        <Accordion
          type="single"
          collapsible
          className="w-full max-w-[40rem] mx-auto"
        >
          {[
            {
              value: 'prepaid-platform-usage',
              question:
                'What is the prepaid platform usage, and how much do I need?',
              answer:
                'The prepaid platform usage is a credit system that allows you to use our services. The amount you need depends on your usage requirements. Each plan comes with a specific amount of credits which you can spend on various actors or services.',
            },
            {
              value: 'free-trial',
              question: 'Can I try Apify for free?',
              answer:
                'Yes, you can start with our Free plan which gives you $5 in platform credits to explore our services. No credit card is required for the Free plan.',
            },
            {
              value: 'choose-plan',
              question: 'Which plan should I choose?',
              answer:
                'It depends on your needs. For personal or small projects, the Free or Starter plan might be sufficient. For businesses with moderate needs, the Scale plan offers better compute unit pricing. Larger operations would benefit from the Business plan, which includes account management and the best compute unit pricing.',
            },
            {
              value: 'actor-pricing',
              question: 'How much does it cost to run an Actor?',
              answer:
                'The cost of running an Actor depends on the compute units consumed during the run. Each plan has a different rate per compute unit, and you can monitor your usage in the dashboard.',
            },
            {
              value: 'upgrade-downgrade',
              question: 'Can I upgrade, downgrade or cancel my plan?',
              answer:
                'Yes, you can upgrade, downgrade, or cancel your plan at any time. Changes to your subscription will be applied at the end of your current billing period.',
            },
            {
              value: 'compute-units',
              question: 'What are compute units?',
              answer:
                'Compute units are a measure of the computational resources used by your Actors. They are calculated based on CPU, memory, and other factors during the execution of your tasks.',
            },
            {
              value: 'actor-run-time',
              question: 'How long does an Actor run take?',
              answer:
                'The duration of an Actor run can vary significantly based on the complexity of the task and the amount of data being processed. You can monitor the estimated time in the dashboard before starting a run.',
            },
            {
              value: 'prepaid-usage',
              question: 'What is the prepaid usage?',
              answer:
                'Prepaid usage refers to the credits you purchase in advance to use our services. This allows you to manage your budget and control costs effectively.',
            },
            {
              value: 'unused-prepaid',
              question: 'What happens to my unused prepaid usage?',
              answer:
                'Unused prepaid usage does not roll over to the next billing period. It is reset with each new billing cycle.',
            },
            {
              value: 'run-cost-difference',
              question: 'Why do some of my Actor runs cost more than others?',
              answer:
                'Actor run costs vary based on the complexity of the task, the amount of data processed, and the computational resources used. More complex operations or larger data sets will consume more compute units, resulting in higher costs.',
            },
            {
              value: 'pay-as-you-go',
              question: 'What is the pay-as-you-go model?',
              answer:
                'The pay-as-you-go model allows you to use our services as you need them. You pay only for the compute units consumed during your run.',
            },
            {
              value: 'discounts',
              question:
                'Does Apify offer any discounts for universities or nonprofit organizations?',
              answer:
                'Yes, Apify offers special discounts for educational institutions and nonprofit organizations. Contact our sales team for more information on these discount programs.',
            },
            {
              value: 'startup-pricing',
              question:
                'Do startups get the same pricing as enterprise customers?',
              answer:
                'Startups typically start with our standard pricing plans, but we offer special startup programs for eligible companies. Enterprise customers generally have custom pricing based on their specific needs and usage volumes.',
            },
            {
              value: 'develop-actors',
              question: 'Can I develop my own Actors?',
              answer:
                'Yes, you can develop your own Actors using our SDK and developer documentation. We provide the tools and resources needed to create custom Actors tailored to your specific needs.',
            },
          ].map((item, index) => (
            <AccordionItem key={index} value={item.value}>
              <AccordionTrigger className="text-lg">
                {item.question}
              </AccordionTrigger>
              <AccordionContent className="text-sm">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
}
