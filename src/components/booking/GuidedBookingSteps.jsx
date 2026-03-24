import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

const bookingSteps = [
  'Select Event',
  'Choose Date/Time',
  'Select Seats',
  'Confirm Booking',
  'Payment',
  'Booking Confirmation',
];

export default function GuidedBookingSteps({ currentStep = 0, tip }) {
  return (
    <div className="space-y-4">
      <div className="overflow-x-auto pb-1">
        <div className="flex min-w-max items-center gap-2">
          {bookingSteps.map((step, index) => (
            <div key={step} className="flex items-center gap-2">
              <div
                className={cn(
                  'flex size-8 items-center justify-center rounded-full text-xs font-semibold transition-colors',
                  index < currentStep && 'bg-primary text-primary-foreground',
                  index === currentStep && 'bg-primary text-primary-foreground ring-4 ring-primary/20',
                  index > currentStep && 'bg-muted text-muted-foreground',
                )}
                aria-current={index === currentStep ? 'step' : undefined}
              >
                {index < currentStep ? <Check className="size-4" /> : index + 1}
              </div>
              <span
                className={cn(
                  'text-xs sm:text-sm whitespace-nowrap',
                  index === currentStep ? 'font-semibold text-foreground' : 'text-muted-foreground',
                )}
              >
                {step}
              </span>
              {index < bookingSteps.length - 1 && (
                <div className={cn('h-px w-6 sm:w-8', index < currentStep ? 'bg-primary' : 'bg-border')} />
              )}
            </div>
          ))}
        </div>
      </div>

      {tip && (
        <div className="rounded-lg border bg-muted/30 px-3 py-2 text-sm text-muted-foreground">
          <span className="font-medium text-foreground">Tip:</span> {tip}
        </div>
      )}
    </div>
  );
}
