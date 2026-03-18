import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';

export const useAuth = () => {
    const [auth, setAuth] = useState(false);
    const router = useRouter();
    const authUrl = process.env.NEXT_PUBLIC_AUTH_URL || '';

    const checkAuth = useCallback(async (token) => {
        const info = {
            app: "Zava Marketing Studio",
            url: process.env.NEXT_PUBLIC_APP_URL,
        };

        try {
            if (token && JSON.parse(atob(token))) {
                const authTokenParse = JSON.parse(atob(token));
                if (Date.now() > authTokenParse.expiry) {
                    // Token expired, check with the API.
                    const response = await fetch(`${authUrl}/check/`, {
                        headers: { 'x-token': authTokenParse.token },
                    });
                    if (!response.ok) {
                        window.location.href = `${authUrl}?v=${btoa(JSON.stringify(info))}`;
                        return;
                    } else {
                        sessionStorage.setItem('authToken', token);
                        setAuth(true);
                    }
                } else {
                    // Token is still valid.
                    sessionStorage.setItem('authToken', token);
                    setAuth(true);
                }
            } else {
                throw new Error('Invalid token');
            }
        } catch (error) {
            sessionStorage.removeItem('authToken');
            window.location.href = `${authUrl}?v=${btoa(JSON.stringify(info))}`;
        }
    }, [authUrl]);

    useEffect(() => {
        if (!router.isReady) return;

        const token = router.query.t || sessionStorage.getItem('authToken');
        const authEnabled = process.env.NEXT_PUBLIC_AUTH === 'true';

        if (authEnabled) {
            if (token) {
                checkAuth(token);
                if (router.query.t) {
                    router.push('/');
                }
            } else {
                checkAuth('');
            }
        } else {
            setAuth(true);
            // Only redirect to home if we're on the auth callback route (with token in query)
            if (router.query.t) {
                router.push('/');
            }
        }

    }, [router.isReady, router.query.t, checkAuth, router]);

    return auth;
};
