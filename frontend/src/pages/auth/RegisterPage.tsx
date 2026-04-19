import { AppFooter } from "@/components/layout/AppFooter"
import { RegisterForm } from "@/components/layout/RegisterForm"
import { LoginHero } from "@/components/layout/LoginHero"

export default function RegisterPage() {
    return (
        <div className="relative flex min-h-0 flex-1 flex-col">
            <div
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-muted/35 dark:bg-muted/15"
            />
            <div className="relative z-0 flex min-h-0 flex-1 flex-col pt-16 sm:pt-[4.25rem]">
                <div className="mx-auto grid min-h-0 w-full max-w-6xl flex-1 content-center px-0 lg:grid-cols-[1fr_minmax(0,520px)] lg:items-stretch">
                    <LoginHero />
                    <RegisterForm />
                </div>
            </div>
            <AppFooter>
                En vous inscrivant, vous acceptez les conditions d'utilisation du service.
            </AppFooter>
        </div>
    )
}
