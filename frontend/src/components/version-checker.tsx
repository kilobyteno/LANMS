import { useEffect, useState } from 'react';
import { compareVersions } from 'compare-versions';
import { CURRENT_VERSION, GITHUB_API_URL, GITHUB_REPO } from '@/env';
import { useTranslation } from 'react-i18next';

import { Badge } from './ui/badge';
import { ShootingStar } from '@phosphor-icons/react';

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
                if (data.length > 0) {
                    const latest = data[0].tag_name.replace('v', '');
                    setLatestVersion(latest);
                    if (compareVersions(latest, CURRENT_VERSION) > 0) {
                        setHasUpdate(true);
                    }
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
            <a href='https://lanms.net' target='_blank' rel='noopener noreferrer' className='text-xs text-muted-foreground hover:text-primary dark:text-muted-foreground dark:hover:text-primary cursor-pointer'>LANMS {CURRENT_VERSION}</a>
            {hasUpdate && (
                <Badge variant="update" className='flex items-center mt-1'>
                    <a
                        href={`https://github.com/${GITHUB_REPO}/releases/latest`}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <ShootingStar className="size-4 inline-block mr-1" weight="fill" />
                        {t('common.update_available')}
                    </a>
                </Badge>
            )}
        </>
    );
} 