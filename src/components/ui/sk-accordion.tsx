
import * as React from "react"
import * as AccordionPrimitive from "@radix-ui/react-accordion"
import { ChevronDown } from "lucide-react"

import { cn } from "@/lib/utils"

const SkAccordion = AccordionPrimitive.Root

const SkAccordionItem = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>
>(({ className, ...props }, ref) => (
  <AccordionPrimitive.Item
    ref={ref}
    className={cn("sk-accordion-v2-item", className)}
    {...props}
  />
))
SkAccordionItem.displayName = "SkAccordionItem"

const SkAccordionTrigger = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Header className="sk-accordion-v2-header !rounded-lg">
    <AccordionPrimitive.Trigger
      ref={ref}
      className={cn(
        "rounded-md sk-accordion-v2-button sk-h5 bold flex flex-1 items-center justify-between py-4 font-medium transition-all hover:underline [&[data-state=open]>svg]:rotate-180",
        className
      )}
      {...props}
    >
      {children}
      <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
    </AccordionPrimitive.Trigger>
  </AccordionPrimitive.Header>
))
SkAccordionTrigger.displayName = AccordionPrimitive.Trigger.displayName

const SkAccordionContent = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Content
    ref={ref}
    className="sk-accordion-v2-collapse overflow-hidden text-sm transition-all data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
    {...props}
  >
    <div className={cn("sk-accordion-v2-body pb-4 pt-0", className)}>{children}</div>
  </AccordionPrimitive.Content>
))

SkAccordionContent.displayName = AccordionPrimitive.Content.displayName

export { SkAccordion, SkAccordionItem, SkAccordionTrigger, SkAccordionContent }
