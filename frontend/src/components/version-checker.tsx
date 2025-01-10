import { useEffect, useState } from 'react';
import { compareVersions } from 'compare-versions';
import { CURRENT_VERSION, GITHUB_API_URL, GITHUB_REPO } from '@/env';
import { useTranslation } from 'react-i18next';

import { Badge } from './ui/badge';

interface GithubRelease {
    tag_name: string;
    html_url: string;
}

export function VersionChecker() {
    const { t } = useTranslation();
    const [hasUpdate, setHasUpdate] = useState(false);
    const [latestVersion, setLatestVersion] = useState<string | null>(null);

    useEffect(() => {
        const checkVersion = async () => {
            try {
                const response = await fetch(`${GITHUB_API_URL}/releases`);
                const data: GithubRelease[] = await response.json();
                const latest = data[0].tag_name.replace('v', '');
                setLatestVersion(latest);

                if (compareVersions(latest, CURRENT_VERSION) > 0) {
                    setHasUpdate(true);
                }
            } catch (error) {
                console.error('Failed to check version:', error);
            }
        };

        checkVersion();
        // Check every 24 hours
        const interval = setInterval(checkVersion, 24 * 60 * 60 * 1000);
        return () => clearInterval(interval);
    }, [CURRENT_VERSION]);

    return (
        <>
            <a href='https://lanms.net' target='_blank' rel='noopener noreferrer' className='text-xs text-gray-300 dark:text-gray-500 hover:text-muted-foreground dark:hover:text-secondary-foreground'>LANMS {CURRENT_VERSION}</a>
            {hasUpdate && (
                <Badge variant="outline">
                    <a
                        href={`https://github.com/${GITHUB_REPO}/releases/latest`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-2"
                    >
                        {t('version.newAvailable')}: {latestVersion}
                    </a>
                </Badge>
            )}
        </>
    );
} 