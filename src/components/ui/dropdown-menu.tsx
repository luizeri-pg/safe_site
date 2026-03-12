import * as React from 'react'
import { cn } from '@/lib/utils'

const DropdownMenuContext = React.createContext<{
  open: boolean
  setOpen: (v: boolean) => void
} | null>(null)

const DropdownMenu = ({
  children,
  open: controlledOpen,
  onOpenChange,
}: {
  children: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}) => {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false)
  const open = controlledOpen ?? uncontrolledOpen
  const setOpen = React.useCallback(
    (v: boolean) => {
      onOpenChange?.(v)
      if (controlledOpen === undefined) setUncontrolledOpen(v)
    },
    [onOpenChange, controlledOpen]
  )
  return (
    <DropdownMenuContext.Provider value={{ open, setOpen }}>
      <div className="relative inline-block text-left">{children}</div>
    </DropdownMenuContext.Provider>
  )
}

const DropdownMenuTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, onClick, ...props }, ref) => {
  const ctx = React.useContext(DropdownMenuContext)
  if (!ctx) return null
  return (
    <button
      ref={ref}
      type="button"
      className={cn(
        'inline-flex size-8 items-center justify-center rounded-md hover:bg-muted',
        className
      )}
      onClick={(e) => {
        ctx.setOpen(!ctx.open)
        onClick?.(e)
      }}
      {...props}
    />
  )
})
DropdownMenuTrigger.displayName = 'DropdownMenuTrigger'

const DropdownMenuContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const ctx = React.useContext(DropdownMenuContext)
  const contentRef = React.useRef<HTMLDivElement>(null)
  React.useImperativeHandle(ref, () => contentRef.current!)
  React.useEffect(() => {
    if (!ctx?.open) return
    const handle = (e: MouseEvent) => {
      if (contentRef.current?.contains(e.target as Node)) return
      const trigger = contentRef.current?.previousElementSibling
      if (trigger?.contains(e.target as Node)) return
      ctx.setOpen(false)
    }
    document.addEventListener('click', handle, true)
    return () => document.removeEventListener('click', handle, true)
  }, [ctx?.open, ctx])
  if (!ctx?.open) return null
  return (
    <div
      ref={contentRef}
      className={cn(
        'absolute right-0 z-50 mt-1 min-w-[10rem] overflow-hidden rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-md',
        className
      )}
      {...props}
    />
  )
})
DropdownMenuContent.displayName = 'DropdownMenuContent'

const DropdownMenuItem = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, onClick, ...props }, ref) => {
  const ctx = React.useContext(DropdownMenuContext)
  return (
    <button
      ref={ref}
      type="button"
      role="menuitem"
      className={cn(
        'relative flex w-full cursor-pointer select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-muted focus:bg-muted',
        className
      )}
      onClick={(e) => {
        ctx?.setOpen(false)
        onClick?.(e)
      }}
      {...props}
    />
  )
})
DropdownMenuItem.displayName = 'DropdownMenuItem'

export { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem }
