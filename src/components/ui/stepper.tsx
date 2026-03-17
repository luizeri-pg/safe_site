'use client';

/**
 * Stepper no estilo shadcn/ui (API compatível com Stepper, StepperItem, StepperTrigger, etc.).
 * Use para fluxos em etapas; suporta step ativo, concluído e navegação por clique.
 */
import * as React from 'react';
import { cn } from '@/lib/utils';

interface StepperContextValue {
  activeStep: number;
  setActiveStep: (step: number) => void;
  onStepClick?: (step: number) => void;
}

const StepperContext = React.createContext<StepperContextValue | null>(null);

function useStepper() {
  const ctx = React.useContext(StepperContext);
  if (!ctx) throw new Error('Stepper components must be used within Stepper');
  return ctx;
}

interface StepperProps extends React.HTMLAttributes<HTMLDivElement> {
  activeStep?: number;
  onStepClick?: (step: number) => void;
}

function Stepper({
  className,
  activeStep: controlledStep,
  onStepClick,
  children,
  ...props
}: StepperProps) {
  const [internalStep, setInternalStep] = React.useState(1);
  const isControlled = controlledStep !== undefined;
  const activeStep = isControlled ? controlledStep : internalStep;
  const setActiveStep = React.useCallback(
    (s: number) => {
      if (!isControlled) setInternalStep(s);
      onStepClick?.(s);
    },
    [isControlled, onStepClick]
  );
  const value = React.useMemo(
    () => ({
      activeStep,
      setActiveStep,
      onStepClick: setActiveStep,
    }),
    [activeStep, setActiveStep]
  );
  return (
    <StepperContext.Provider value={value}>
      <div
        data-slot="stepper"
        className={cn('flex items-start gap-2', className)}
        {...props}
      >
        {children}
      </div>
    </StepperContext.Provider>
  );
}

interface StepperItemProps extends React.HTMLAttributes<HTMLDivElement> {
  step: number;
}

function StepperItem({ className, step, children, ...props }: StepperItemProps) {
  const { activeStep } = useStepper();
  const state = step < activeStep ? 'completed' : step === activeStep ? 'active' : 'inactive';
  return (
    <div
      data-slot="stepper-item"
      data-step={step}
      data-state={state}
      className={cn(
        'group relative flex w-full flex-col items-center justify-center',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

interface StepperTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  step: number;
}

function StepperTrigger({ className, step, children, onClick, ...props }: StepperTriggerProps) {
  const { onStepClick } = useStepper();
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    onStepClick?.(step);
    onClick?.(e);
  };
  return (
    <button
      type="button"
      data-slot="stepper-trigger"
      data-step={step}
      className={cn(
        'flex items-center justify-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        className
      )}
      onClick={handleClick}
      {...props}
    >
      {children}
    </button>
  );
}

function StepperIndicator({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="stepper-indicator"
      className={cn(
        'flex size-10 shrink-0 items-center justify-center rounded-full border border-border bg-muted text-muted-foreground transition-colors',
        'group-data-[state=active]:border-primary group-data-[state=active]:bg-primary group-data-[state=active]:text-primary-foreground',
        'group-data-[state=completed]:border-primary group-data-[state=completed]:bg-primary/20 group-data-[state=completed]:text-primary',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}


interface StepperSeparatorProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Use "custom" quando o visual da linha for definido por CSS externo (ex.: linha pontilhada). */
  variant?: 'default' | 'custom';
}

function StepperSeparator({ className, variant = 'default', ...props }: StepperSeparatorProps) {
  return (
    <div
      data-slot="stepper-separator"
      role="presentation"
      className={cn(
        'absolute left-[calc(50%+20px)] right-[calc(-50%+10px)] top-5 block h-0.5 shrink-0 rounded-full',
        variant === 'default' && 'bg-muted group-data-[state=completed]:bg-primary',
        className
      )}
      {...props}
    />
  );
}

function StepperTitle({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="stepper-title"
      className={cn('text-center text-sm font-medium text-foreground', className)}
      {...props}
    />
  );
}

function StepperDescription({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="stepper-description"
      className={cn('text-center text-xs text-muted-foreground', className)}
      {...props}
    />
  );
}

export {
  Stepper,
  StepperItem,
  StepperTrigger,
  StepperIndicator,
  StepperSeparator,
  StepperTitle,
  StepperDescription,
  useStepper,
};
