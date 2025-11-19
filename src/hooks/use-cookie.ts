"use client";

import { useCallback } from 'react';

export function useCookie() {
  const getCookie = useCallback((name: string): string | null => {
    if (typeof document === 'undefined') return null;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
    return null;
  }, []);

  const setCookie = useCallback((name: string, value: string) => {
    const expires = new Date();
    expires.setFullYear(expires.getFullYear() + 100);
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
  }, []);

  return { getCookie, setCookie };
}