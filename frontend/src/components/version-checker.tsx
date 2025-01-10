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

const CACHE_KEY = 'version_check';
const CACHE_DURATION = 12 * 60 * 60 * 1000; // 12 hours in milliseconds

export function VersionChecker() {
    const { t } = useTranslation();
    const [hasUpdate, setHasUpdate] = useState(false);
    const [latestVersion, setLatestVersion] = useState<string | null>(null);

    useEffect(() => {
        const checkVersion = async () => {
            try {
                // Check cache first
                const cachedData = localStorage.getItem(CACHE_KEY);
                if (cachedData) {
                    const { timestamp, data } = JSON.parse(cachedData);
                    if (Date.now() - timestamp < CACHE_DURATION) {
                        setLatestVersion(data.version);
                        setHasUpdate(compareVersions(data.version, CURRENT_VERSION) > 0);
                        return;
                    }
                }

                // Make API call with headers to avoid rate limiting
                const response = await fetch(`${GITHUB_API_URL}/releases`, {
                    headers: {
                        'Accept': 'application/vnd.github.v3+json',
                        'If-None-Match': localStorage.getItem('version_etag') || ''
                    }
                });

                // Handle 304 Not Modified
                if (response.status === 304) {
                    return;
                }

                // Save ETag for future requests
                const etag = response.headers.get('ETag');
                if (etag) {
                    localStorage.setItem('version_etag', etag);
                }

                const data: GithubRelease[] = await response.json();
                if (data.length > 0) {
                    const latest = data[0].tag_name.replace('v', '');
                    setLatestVersion(latest);
                    const needsUpdate = compareVersions(latest, CURRENT_VERSION) > 0;
                    setHasUpdate(needsUpdate);

                    // Cache the result
                    localStorage.setItem(CACHE_KEY, JSON.stringify({
                        timestamp: Date.now(),
                        data: { version: latest }
                    }));
                }
            } catch (error) {
                console.error('Failed to check version:', error);
                // On error, use cached data if available
                const cachedData = localStorage.getItem(CACHE_KEY);
                if (cachedData) {
                    const { data } = JSON.parse(cachedData);
                    setLatestVersion(data.version);
                    setHasUpdate(compareVersions(data.version, CURRENT_VERSION) > 0);
                }
            }
        };

        checkVersion();
        // Check every 12 hours
        const interval = setInterval(checkVersion, CACHE_DURATION);
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