import fs from 'node:fs';
import path from 'node:path';
import { parse } from 'csv-parse';
import type { RequestHandler } from '@sveltejs/kit';
import type { PostalCodeData, RateLimitData } from '$lib/types';
import { postalCodeData, rateLimitStore } from '$lib/stores';

let data: PostalCodeData[] | null = null;

// Function to load and parse CSV data
async function loadData() {
	let data: PostalCodeData[] = [];
	try {
		const dataPath = path.join(process.cwd(), 'static', 'PostalCodeLatLong.csv');
		const parser = fs.createReadStream(dataPath).pipe(
			parse({
				columns: ['postalCode', 'latitude', 'longitude'],
				skip_empty_lines: true
			})
		);

		for await (const record of parser) {
			data.push(record);
		}

		postalCodeData.set(data); // Update the store with the loaded data
	} catch (error) {
		console.error(`Error loading data: ${error}`);
	}
}

const MAX_REQUESTS = 30; // max requests per window per IP
const WINDOW_SIZE_MS = 60 * 1000; // 1 minute

export const GET: RequestHandler = async (request) => {
	const ip_address = request.getClientAddress();
	const currentTimestamp = Date.now();
	let rateLimitMap: Map<string, RateLimitData> = new Map();
	rateLimitStore.subscribe((value) => {
		rateLimitMap = value;
		console.log('rateLimitMap', rateLimitMap);
	})(); // Immediately invoked to unsubscribe right away

	// Rate limiting logic
	let rateLimitData = rateLimitMap.get(ip_address);

	if (rateLimitData) {
		console.log(
			'currentTimestamp',
			currentTimestamp,
			'rateLimitData.resetTime',
			rateLimitData.resetTime,
			'rateLimitData.count',
			rateLimitData.count
		);
		if (currentTimestamp > rateLimitData.resetTime) {
			// Reset the rate limit data if the current time is beyond the reset time
			rateLimitData = { count: 1, resetTime: currentTimestamp + WINDOW_SIZE_MS };
		} else {
			// Increment the request count within the current rate limit window
			rateLimitData.count++;
		}

		// Check if the request limit has been exceeded
		if (rateLimitData.count > MAX_REQUESTS) {
			// Calculate the Retry-After duration in seconds
			const retryAfter = Math.round((rateLimitData.resetTime - currentTimestamp) / 1000);

			return new Response(JSON.stringify({ error: 'Rate limit exceeded' }), {
				status: 429, // Too Many Requests
				headers: {
					'Content-Type': 'application/json',
					'Retry-After': `${retryAfter}`
				}
			});
		}
	} else {
		// Initialize rate limit data for a new IP address
		rateLimitData = { count: 1, resetTime: currentTimestamp + WINDOW_SIZE_MS };
	}

	// Update the map and store with the new or modified rate limit data
	rateLimitMap.set(ip_address, rateLimitData);
	rateLimitStore.set(rateLimitMap);

	// Load postal code data if not already loaded
	let postalData: PostalCodeData[] = [];
	postalCodeData.subscribe((value) => {
		postalData = value;
	})();

	if (!postalData || postalData.length === 0) {
		await loadData();
	}

	const postalCodeParam = request.params.postcode;
	const result = postalData.find((d) => d.postalCode === postalCodeParam);

	if (result) {
		return new Response(JSON.stringify(result), {
			status: 200,
			headers: { 'Content-Type': 'application/json' }
		});
	} else {
		return new Response(JSON.stringify({ error: 'Postal code not found' }), {
			status: 404,
			headers: { 'Content-Type': 'application/json' }
		});
	}
};
