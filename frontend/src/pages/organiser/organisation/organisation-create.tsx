import { Breadcrumb } from '../../../components/breadcrumb';
import { useBreadcrumbs } from '../../../hooks/use-breadcrumbs';
import { OrganisationForm } from './organisation-form';

export function OrganisationCreate() {
    const breadcrumbs = useBreadcrumbs();

    return (
        <>
            <Breadcrumb items={breadcrumbs} />
            <OrganisationForm />
        </>
    );
}