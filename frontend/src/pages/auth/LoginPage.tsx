import { AppFooter } from "@/components/layout/AppFooter"
import { AppHeader } from "@/components/layout/AppHeader"
import { LoginForm } from "@/components/layout/LoginForm"
import { LoginHero } from "@/components/layout/LoginHero"

export default function LoginPage() {
    return (
        <div className="relative flex min-h-svh flex-col overflow-hidden bg-background">
            <AppHeader
                placement="fixed"
                themeToggleVariant="floating"
                subtitle="Journal de trades et performance"
            />
            <div
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-muted/35 dark:bg-muted/15"
            />

            <div className="relative z-0 flex min-h-0 flex-1 flex-col pt-16 sm:pt-[4.25rem]">
                <div className="mx-auto grid min-h-0 w-full max-w-6xl flex-1 content-center px-0 lg:grid-cols-[1fr_minmax(0,420px)] lg:items-stretch">
                    <LoginHero />
                    <LoginForm />
                </div>
            </div>

            <AppFooter>
                En vous connectant, vous acceptez les conditions d’utilisation du service.
            </AppFooter>
        </div>
    )
}
