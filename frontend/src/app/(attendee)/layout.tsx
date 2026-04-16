import { ProtectedRoute } from "@/routes/ProtectedRoute";

export default function AttendeeGroupLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <ProtectedRoute layout="attendee">{children}</ProtectedRoute>;
}
