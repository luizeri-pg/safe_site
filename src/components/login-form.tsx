import { type FormEvent } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"

export interface LoginFormProps extends React.ComponentProps<"form"> {
  onSubmit?: (e: FormEvent<HTMLFormElement>) => void
  error?: string | null
  isLoading?: boolean
}

export function LoginForm({
  className,
  onSubmit,
  error,
  isLoading = false,
  ...props
}: LoginFormProps) {
  return (
    <form
      className={cn("flex flex-col gap-6", className)}
      onSubmit={onSubmit}
      {...props}
    >
      <FieldGroup>
        <div className="flex flex-col gap-1 text-center">
          <h1 className="text-3xl font-bold text-primary-foreground">
            Seja bem-vindo!
          </h1>
          <p className="text-sm text-primary-foreground/90">
            O conteúdo deste site é restrito, autentifique-se
          </p>
        </div>
        <Field>
          <FieldLabel htmlFor="username" className="text-primary-foreground">
            Login
          </FieldLabel>
          <Input
            id="username"
            name="username"
            type="text"
            placeholder="seu.login"
            required
            disabled={isLoading}
            className="bg-background/90 border-border text-foreground placeholder:text-muted-foreground"
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="password" className="text-primary-foreground">
            Senha
          </FieldLabel>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="********"
            required
            disabled={isLoading}
            className="bg-background/90 border-border text-foreground placeholder:text-muted-foreground"
          />
        </Field>
        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}
        <Field>
          <Button
            type="submit"
            disabled={isLoading}
            size="lg"
            className="w-full border-2 border-white"
          >
            {isLoading ? "Entrando..." : "Entrar"}
          </Button>
        </Field>
      </FieldGroup>
    </form>
  )
}
