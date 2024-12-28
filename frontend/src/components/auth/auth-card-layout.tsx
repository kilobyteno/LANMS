import {Card, CardContent} from "@/components/ui/card";
import {Network} from "@phosphor-icons/react";

interface AuthCardLayoutProps {
    children: React.ReactNode;
}

export function AuthCardLayout({
                                   children,
                               }: AuthCardLayoutProps) {
    return (
        <>
            <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
                <div className="flex w-full max-w-sm flex-col gap-6">
                    <a href="/" className="flex items-center gap-2 self-center font-medium">
                        <div
                            className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
                            <Network className="size-4"/>
                        </div>
                        LANMS
                    </a>
                    <Card>
                        <CardContent className="p-0">
                            {children}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}
