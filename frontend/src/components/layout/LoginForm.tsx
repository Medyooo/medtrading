import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Eye, EyeOff, Loader2, Lock, Mail } from "lucide-react"
import { cn } from "@/lib/utils"
import { useLogin } from "@/hooks/useLogin"
import type { ApiError } from "@/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"

const loginSchema = z.object({
    email: z.string().email("Adresse e-mail invalide"),
    password: z.string().min(6, "Au moins 6 caractères"),
})

type LoginFormValues = z.infer<typeof loginSchema>

export function LoginForm() {
    const { login, isLoading } = useLogin()
    const [showPassword, setShowPassword] = useState(false)

    const form = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    })

    const onSubmit = async (data: LoginFormValues) => {
        try {
            await login(data)
        } catch (err) {
            const apiError = err as ApiError
            form.setError("root", {
                message: apiError.message ?? "Identifiants incorrects ou serveur indisponible",
            })
        }
    }

    const rootError = form.formState.errors.root?.message

    return (
        <main className="flex h-full min-h-0 flex-col px-4 py-10 sm:px-6 lg:px-10 lg:py-12 xl:px-16">
            <div className="flex min-h-0 flex-1 flex-col justify-center">
                <Card
                    className={cn(
                        "w-full border-border/70 border-t-2 border-t-emerald-600 shadow-lg shadow-emerald-900/8",
                        "ring-1 ring-foreground/10 backdrop-blur-md",
                        "supports-[backdrop-filter]:bg-card/92",
                        "dark:border-emerald-950/50 dark:border-t-emerald-500 dark:shadow-black/40 dark:ring-white/10",
                        "relative overflow-visible",
                    )}
                >
                    <CardHeader className="space-y-1 pb-2">
                        <CardTitle className="font-heading text-xl tracking-tight">
                            Bon retour
                        </CardTitle>
                        <CardDescription>
                            Entrez l’e-mail et le mot de passe associés à votre compte.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-2">
                        <Form {...form}>
                            <form
                                onSubmit={form.handleSubmit(onSubmit)}
                                className="space-y-5"
                                noValidate
                            >
                                <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-foreground">E-mail</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Mail
                                                    className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                                                    aria-hidden
                                                />
                                                <Input
                                                    type="email"
                                                    autoComplete="email"
                                                    inputMode="email"
                                                    placeholder="vous@exemple.fr"
                                                    className="h-10 pl-9"
                                                    {...field}
                                                />
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <div className="flex items-center justify-between gap-2">
                                            <FormLabel className="text-foreground">
                                                Mot de passe
                                            </FormLabel>
                                            <button
                                                type="button"
                                                className="text-xs font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                                            >
                                                Mot de passe oublié ?
                                            </button>
                                        </div>
                                        <FormControl>
                                            <div className="relative">
                                                <Lock
                                                    className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                                                    aria-hidden
                                                />
                                                <Input
                                                    type={showPassword ? "text" : "password"}
                                                    autoComplete="current-password"
                                                    placeholder="••••••••"
                                                    className="hide-native-password-ui h-10 pr-10 pl-9"
                                                    {...field}
                                                />
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon-sm"
                                                    className="absolute top-1/2 right-1 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                                    onClick={() => setShowPassword((prev) => !prev)}
                                                    aria-label={
                                                        showPassword
                                                            ? "Masquer le mot de passe"
                                                            : "Afficher le mot de passe"
                                                    }
                                                >
                                                    {showPassword ? (
                                                        <EyeOff className="size-4" />
                                                    ) : (
                                                        <Eye className="size-4" />
                                                    )}
                                                </Button>
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {rootError ? (
                                <div
                                    role="alert"
                                    className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive dark:bg-destructive/15"
                                >
                                    {rootError}
                                </div>
                            ) : null}

                            <Button
                                type="submit"
                                size="lg"
                                className={cn(
                                    "h-11 w-full gap-2 border-0 font-semibold text-white shadow-md",
                                    "bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700",
                                    "hover:shadow-lg hover:shadow-emerald-900/20",
                                    "focus-visible:ring-2 focus-visible:ring-emerald-400/90 focus-visible:ring-offset-2",
                                    "dark:bg-emerald-500 dark:hover:bg-emerald-400 dark:active:bg-emerald-600",
                                    "dark:shadow-emerald-950/40 dark:hover:shadow-emerald-900/25",
                                    "dark:focus-visible:ring-emerald-300/70",
                                )}
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2
                                            className="size-4 animate-spin"
                                            aria-hidden
                                        />
                                        Connexion en cours…
                                    </>
                                ) : (
                                    "Se connecter"
                                )}
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
            </div>
        </main>
    )
}
