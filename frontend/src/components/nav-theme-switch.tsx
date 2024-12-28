import {Button} from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {useTheme} from "@/components/theme-provider"
import {DesktopTower, Moon, Sun} from "@phosphor-icons/react";
import {useTranslation} from "react-i18next";
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "@/components/ui/tooltip.tsx";

export function NavThemeSwitch() {
    const {setTheme, theme} = useTheme()
    const {t} = useTranslation()

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger>
                                <div className="h-[1.2rem] w-[1.2rem] flex justify-center items-center">
                                    <Sun
                                        className={`absolute h-full w-full transition-all duration-300 ${
                                            theme === 'dark' ? 'rotate-[-90deg] scale-0' : 'rotate-0 scale-100'
                                        }`}
                                    />
                                    <Moon
                                        className={`absolute h-full w-full transition-all duration-300 ${
                                            theme === 'dark' ? 'rotate-0 scale-100' : 'rotate-90 scale-0'
                                        }`}
                                    />
                                </div>
                                <span className="sr-only">Toggle theme</span>
                            </TooltipTrigger>
                            <TooltipContent>{t("theme.switch")}</TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setTheme("light")}>
                    <Sun className="mr-2"/> {t("theme.light")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("dark")}>
                    <Moon className="mr-2"/> {t("theme.dark")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("system")}>
                    <DesktopTower className="mr-2"/> {t("theme.system")}
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
