export function newRandomId(): string {
	return crypto.randomUUID().replace(/-/g, '');
}
