import { parse } from 'csv-parse';
import type { RequestHandler } from '@sveltejs/kit';
import type { PostalCodeData, RateLimitData } from '$lib/types';
import { postalCodeData, rateLimitStore } from '$lib/stores';

// Function to load and parse CSV data
async function loadData() {
	try {
		const response = await fetch(
			'https://raw.githubusercontent.com/front-depiction/Postal_Code_Api/main/static/PostalCodeLatLong.csv',
			{
				headers: {
					'Content-Type': 'text/csv'
				}
			}
		);

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		const csvString = await response.text();

		const records: PostalCodeData[] = [];

		const parser = parse(csvString, {
			columns: ['postalCode', 'latitude', 'longitude'],
			skip_empty_lines: true
		});

		parser.on('readable', function () {
			let record;
			while ((record = parser.read())) {
				records.push(record);
			}
		});

		parser.on('end', function () {
			// All records have been parsed
			console.log('CSV parsed successfully');
		});

		parser.on('error', function (err) {
			console.error(err.message);
		});

		postalCodeData.set(records); // Update the store with the parsed data
	} catch (error) {
		console.error(`Error loading data: ${error}`);
	}
}

const MAX_REQUESTS = 5; // max requests per window per IP
const WINDOW_SIZE_MS = 10 * 1000; // 10 seconds

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
