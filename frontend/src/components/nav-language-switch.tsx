import {useTranslation} from "react-i18next"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import {Button} from "@/components/ui/button"
import {Globe} from "@phosphor-icons/react"
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "@/components/ui/tooltip.tsx";

const languages = [
    {code: "en", name: "English"},
    {code: "no", name: "Norsk"},
    {code: "sv", name: "Svenska"},
    {code: "da", name: "Dansk"},
]

export function NavLanguageSwitch() {
    const {i18n, t} = useTranslation()

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger>
                                <Globe className="h-[1.2rem] w-[1.2rem]"/>
                            </TooltipTrigger>
                            <TooltipContent>{t("language.switch")}</TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                {languages.map((lang) => (
                    <DropdownMenuItem
                        key={lang.code}
                        onClick={() => i18n.changeLanguage(lang.code)}
                    >
                        {lang.name}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
