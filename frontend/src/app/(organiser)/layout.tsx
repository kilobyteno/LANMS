import { ProtectedRoute } from "@/routes/ProtectedRoute";

export default function OrganiserGroupLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <ProtectedRoute layout="organiser">{children}</ProtectedRoute>;
}
