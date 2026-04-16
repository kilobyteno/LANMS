import GuestLayout from "@/components/layout/guest-layout";

export default function GuestGroupLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <GuestLayout>{children}</GuestLayout>;
}
