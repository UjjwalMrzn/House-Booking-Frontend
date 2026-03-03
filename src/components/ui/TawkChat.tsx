import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// This tells TypeScript to stop complaining about the window object
declare global {
  interface Window {
    Tawk_API: any;
    Tawk_LoadStart: Date;
  }
}

const TawkChat = () => {
  const location = useLocation();

  // 1. Inject the Tawk script into the site safely
  useEffect(() => {
    if (!window.Tawk_API) {
      window.Tawk_API = window.Tawk_API || {};
      window.Tawk_LoadStart = new Date();
      const s1 = document.createElement("script");
      s1.async = true;
      // NOTE: Your client will replace this URL with the one from their Tawk dashboard
      s1.src='https://embed.tawk.to/69a68da7749bcd1c3393704d/1jip9ilvk';
      s1.charset = 'UTF-8';
      s1.setAttribute('crossorigin', '*');
      document.head.appendChild(s1);
    }
  }, []);

  // 2. Watch the URL and hide the widget if we enter the Admin panel
  useEffect(() => {
    const isAdmin = location.pathname.startsWith('/admin');

    const toggleVisibility = () => {
      if (window.Tawk_API && typeof window.Tawk_API.hideWidget === 'function') {
        if (isAdmin) {
          window.Tawk_API.hideWidget();
        } else {
          window.Tawk_API.showWidget();
        }
      }
    };

    // Try hiding/showing it immediately
    toggleVisibility();

    // Setup a failsafe: if the script is still downloading, trigger this once it finishes loading
    window.Tawk_API = window.Tawk_API || {};
    window.Tawk_API.onLoad = toggleVisibility;

  }, [location.pathname]);

  return null; // This component works invisibly in the background!
};

export default TawkChat;