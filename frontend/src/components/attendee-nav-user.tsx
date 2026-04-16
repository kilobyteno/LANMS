"use client";

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
import Link from "next/link";
import { useRouter } from "next/navigation";
import {useAuth} from "@/context/AuthContext";
import {SignOut, Password} from "@phosphor-icons/react";
import {useTranslation} from "react-i18next";


export function AttendeeNavUser() {
    const router = useRouter();
    const {logout, user} = useAuth();
    const {t} = useTranslation();
    const handleSignOut = async () => {
        await logout();
        router.replace("/login");
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
                    <DropdownMenuItem asChild>
                        <Link href="/attendee/user/password/change">
                            <Password/>
                            {t('nav.user.change_password')}
                        </Link>
                    </DropdownMenuItem>
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
