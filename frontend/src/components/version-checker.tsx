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
                <Badge variant="update" className='flex items-center justify-center my-2'>
                    <a
                        href={`https://github.com/${GITHUB_REPO}/releases/latest`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="relative flex items-center justify-center w-full"
                        onMouseEnter={(e) => {
                            const target = e.currentTarget;
                            target.querySelector('.version-default')?.classList.add('opacity-0');
                            target.querySelector('.version-hover')?.classList.remove('opacity-0');
                        }}
                        onMouseLeave={(e) => {
                            const target = e.currentTarget;
                            target.querySelector('.version-default')?.classList.remove('opacity-0');
                            target.querySelector('.version-hover')?.classList.add('opacity-0');
                        }}
                    >
                        <div className="version-default flex items-center justify-center transition-opacity duration-200">
                            <ShootingStar className="size-4 mr-1" weight="fill" />
                            <span>{t('common.update_available')}</span>
                        </div>
                        <div className="version-hover absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-200">
                            <ShootingStar className="size-4 mr-1" weight="fill" />
                            <span>{latestVersion}</span>
                        </div>
                    </a>
                </Badge>
            )}
        </>
    );
}