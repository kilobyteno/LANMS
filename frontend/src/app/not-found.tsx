import GuestLayout from "@/components/layout/guest-layout";
import { NotFound } from "@/views/error/NotFound";

export default function NotFoundPage() {
    return (
        <GuestLayout>
            <NotFound />
        </GuestLayout>
    );
}
