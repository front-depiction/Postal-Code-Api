// src/lib/stores.ts
import { writable } from 'svelte/store';
import type { PostalCodeData, RateLimitData } from './types';

export const postalCodeData = writable<PostalCodeData[]>([]);
export const rateLimitStore = writable<Map<string, RateLimitData>>(new Map());
