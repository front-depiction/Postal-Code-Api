export interface PostalCodeData {
	postalCode: string;
	latitude: string;
	longitude: string;
}

// Using a Map for the rate limiter allows for easy IP lookup
export interface RateLimitData {
	count: number;
	resetTime: number;
}
