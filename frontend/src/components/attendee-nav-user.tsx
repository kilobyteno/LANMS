import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {Button} from "@/components/ui/button";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {Link, useNavigate} from "react-router-dom";
import {useAuth} from "@/context/AuthContext";
import {SignOut, Password} from "@phosphor-icons/react";
import {route, RouteConfig} from "@/routes/route-config";
import {useTranslation} from "react-i18next";


export function AttendeeNavUser() {
    const navigate = useNavigate();
    const {logout, user} = useAuth();
    const {t} = useTranslation();
    const handleSignOut = async () => {
        await logout();
        navigate(route(RouteConfig.LOGIN));
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                        <AvatarImage src={user?.photo_url || ""} alt={user?.name || ""}/>
                        <AvatarFallback>{user?.name?.[0] || "U"}</AvatarFallback>
                    </Avatar>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user?.name}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                            {user?.email}
                        </p>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator/>
                {/* <DropdownMenuItem onClick={() => navigate("/attendee/profile")}>
                    <UserCircle />
                    {t('nav.user.profile')}
                </DropdownMenuItem>
                <DropdownMenuSeparator /> */}
                <DropdownMenuGroup>
                    <Link to={RouteConfig.ATTENDEE.USER.PASSWORD_CHANGE}>
                        <DropdownMenuItem>
                            <Password/>
                            {t('nav.user.change_password')}
                        </DropdownMenuItem>
                    </Link>
                </DropdownMenuGroup>
                <DropdownMenuSeparator/>
                <DropdownMenuItem onClick={handleSignOut}>
                    <SignOut/>
                    {t('nav.user.logout')}
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
