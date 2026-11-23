import '../css/app.css';
import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';

const appName = import.meta.env.VITE_APP_NAME || 'Newbie Service';

function initApp() {
    const appElement = document.getElementById('app');
    const scriptElement = document.querySelector('script[data-page="app"][type="application/json"]');

    let initialPage = null;
    if (scriptElement?.textContent) {
        try {
            initialPage = JSON.parse(scriptElement.textContent);
        } catch (e) {
            console.error('Failed to parse Inertia script data-page', e);
        }
    } else if (appElement?.dataset?.page) {
        try {
            initialPage = JSON.parse(appElement.dataset.page);
        } catch (e) {
            console.error('Failed to parse Inertia dataset page', e);
        }
    }

    if (!appElement || !initialPage) {
        return;
    }

    createInertiaApp({
        page: initialPage,
        title: (title) => (title ? `${title} - ${appName}` : appName),
        resolve: (name) =>
            resolvePageComponent(
                `./Pages/${name}.jsx`,
                import.meta.glob('./Pages/**/*.jsx')
            ),
        setup({ el, App, props }) {
            const root = createRoot(el);
            root.render(<App {...props} />);
        },
        progress: {
            color: '#4F46E5',
        },
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}
