export function getLogoUrl(): string | undefined {
  let logoUrl: string | undefined;
  const favicon = document.querySelector('link[rel*="icon"]') || document.querySelector('link[rel="shortcut icon"]');
  if (favicon && favicon instanceof HTMLLinkElement) {
    logoUrl = window.location.origin + favicon.getAttribute('href');
  }
  return logoUrl;
}
