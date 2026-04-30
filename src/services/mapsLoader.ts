/* Singleton Google Maps loader — shared across all components */
let ready = false;
let loading = false;
const queue: (() => void)[] = [];

export function loadGoogleMaps(apiKey: string): Promise<void> {
  return new Promise(resolve => {
    if (ready || (window.google && window.google.maps)) {
      ready = true;
      resolve();
      return;
    }
    queue.push(resolve);
    if (loading) return;
    loading = true;

    (window as any).__charzoMapsReady = () => {
      ready = true;
      queue.forEach(cb => cb());
      queue.length = 0;
    };

    // Don't inject if already in DOM
    if (document.querySelector('script[src*="maps.googleapis.com"]')) {
      // Script already injected — poll until ready
      const poll = setInterval(() => {
        if (window.google && window.google.maps) {
          clearInterval(poll);
          (window as any).__charzoMapsReady?.();
        }
      }, 100);
      return;
    }

    const s = document.createElement('script');
    s.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=__charzoMapsReady`;
    s.async = true;
    s.defer = true;
    document.head.appendChild(s);
  });
}
