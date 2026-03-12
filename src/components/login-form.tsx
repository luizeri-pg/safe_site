import { type FormEvent } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"

const TEAL = '#00ACD4'

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
          <h1 className="font-bold text-white" style={{ fontSize: '3.1em' }}>
            Seja bem-vindo!
          </h1>
          <p className="text-sm text-white">
            O conteúdo deste site é restrito, autentifique-se
          </p>
        </div>
        <Field>
          <FieldLabel htmlFor="username" className="text-white">
            Login
          </FieldLabel>
          <Input
            id="username"
            name="username"
            type="text"
            placeholder="seu.login"
            required
            disabled={isLoading}
            className="h-11 border border-white/70 bg-gray-800/50 px-4 py-2.5 text-base text-white placeholder:text-gray-500 focus-visible:border-[#00ACD4] focus-visible:ring-[#00ACD4] md:h-12 md:text-lg"
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="password" className="text-white">
            Senha
          </FieldLabel>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="********"
            required
            disabled={isLoading}
            className="h-11 border border-white/70 bg-gray-800/50 px-4 py-2.5 text-base text-white placeholder:text-gray-500 focus-visible:border-[#00ACD4] focus-visible:ring-[#00ACD4] md:h-12 md:text-lg"
          />
        </Field>
        {error && (
          <p className="text-sm text-red-400">{error}</p>
        )}
        <Field>
          <Button
            type="submit"
            disabled={isLoading}
            className="h-10 w-full border border-white/70 font-medium md:h-11"
            style={{ backgroundColor: TEAL }}
          >
            {isLoading ? "Entrando..." : "Entrar"}
          </Button>
        </Field>
      </FieldGroup>
    </form>
  )
}
