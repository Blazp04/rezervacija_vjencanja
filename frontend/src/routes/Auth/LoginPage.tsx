import { useState } from "react"
import { cn } from "@/utils/utils"
import { useLogin, useRegister } from "@/services/auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [mode, setMode] = useState<"login" | "signup">("login")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const login = useLogin()
  const register = useRegister()
  const isPending = login.isPending || register.isPending
  const error = (mode === "login" ? login.error?.message : register.error?.message) ?? ""

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (mode === "login") {
      login.mutate({ email, password })
      return
    }

    register.mutate({ name, email, password })
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="p-0">
          <form className="p-6 md:p-8" onSubmit={handleSubmit}>
            <FieldGroup>
              <div className="grid grid-cols-2 rounded-lg bg-muted p-1">
                <button
                  type="button"
                  className={cn(
                    "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    mode === "login" ? "bg-background shadow-sm" : "text-muted-foreground",
                  )}
                  onClick={() => setMode("login")}
                >
                  Sign in
                </button>
                <button
                  type="button"
                  className={cn(
                    "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    mode === "signup" ? "bg-background shadow-sm" : "text-muted-foreground",
                  )}
                  onClick={() => setMode("signup")}
                >
                  Sign up
                </button>
              </div>
              <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-2xl font-bold">
                  {mode === "login" ? "Welcome back" : "Create your account"}
                </h1>
                <p className="text-balance text-muted-foreground">
                  {mode === "login"
                    ? "Use your email and password to access the dashboard."
                    : "New users are created with the viewer role by default."}
                </p>
              </div>
              {error && (
                <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}
              {mode === "signup" && (
                <Field>
                  <FieldLabel htmlFor="name">Full name</FieldLabel>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Ada Lovelace"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </Field>
              )}
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                />
              </Field>
              <Field>
                <Button type="submit" disabled={isPending} className="w-full">
                  {isPending
                    ? "Working..."
                    : mode === "login"
                      ? "Sign in"
                      : "Create account"}
                </Button>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
