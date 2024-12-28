import { Breadcrumb } from '../../../components/breadcrumb';
import { useBreadcrumbs } from '../../../hooks/use-breadcrumbs';
import { EventForm } from './event-form';

export function EventEdit() {
    const breadcrumbs = useBreadcrumbs();

    return (
        <>
            <Breadcrumb items={breadcrumbs} />
            <EventForm />
        </>
    );
} 