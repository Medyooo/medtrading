import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { Provider } from "react-redux"
import { ThemeProvider } from "@/components/theme-provider"
import { store } from "@/store"
import App from "./App.tsx"
import "./index.css"

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <ThemeProvider>
            <Provider store={store}>
                <App />
            </Provider>
        </ThemeProvider>
    </StrictMode>,
)