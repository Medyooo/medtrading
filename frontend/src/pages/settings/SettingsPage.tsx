import { ThemeToggle } from "@/components/theme-toggle"
import { useTheme } from "@/components/theme-provider"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"

export default function SettingsPage() {
    const { theme } = useTheme()
    const modeLabel = theme === "dark" ? "Sombre" : "Clair"

    return (
        <div className="mx-auto max-w-2xl space-y-8">
            <div>
                <h1 className="font-heading text-2xl font-semibold tracking-tight text-foreground">
                    Paramètres
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    Préférences de l’application.
                </p>
            </div>

            <Card>
                <CardHeader className="border-b border-border/60 pb-4">
                    <CardTitle className="text-base">Apparence</CardTitle>
                    <CardDescription>
                        Choisissez le thème affiché dans MedTrading.
                    </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <p className="font-medium text-foreground">Mode d’affichage</p>
                            <p className="text-sm text-muted-foreground">
                                Actuellement : <span className="text-foreground">{modeLabel}</span>
                            </p>
                        </div>
                        <ThemeToggle />
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
