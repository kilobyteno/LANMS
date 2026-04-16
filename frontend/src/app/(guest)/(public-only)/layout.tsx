import { PublicOnlyRoute } from "@/routes/PublicOnlyRoute";

export default function PublicOnlyLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <PublicOnlyRoute>{children}</PublicOnlyRoute>;
}
