import {RouterProvider} from 'react-router-dom';
import {AuthProvider} from './context/AuthContext';
import {OrganisationProvider} from './context/OrganisationContext';
import {EventProvider} from './context/EventContext';
import {router} from './routes';
import {ThemeProvider} from "@/providers/theme-provider";

function App() {
    return (
        <ThemeProvider>
            <AuthProvider>
                <OrganisationProvider>
                    <EventProvider>
                        <RouterProvider router={router}/>
                    </EventProvider>
                </OrganisationProvider>
            </AuthProvider>
        </ThemeProvider>
    );
}

export default App;
