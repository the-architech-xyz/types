export class GoogleAnalyticsGenerator {
    static generateAnalyticsProvider(config) {
        return `import React from 'react';
import Script from 'next/script';
import { useRouter } from 'next/router';
import * as gtag from './gtag';

const GoogleAnalyticsProvider: React.FC = () => {
  const router = useRouter();

  React.useEffect(() => {
    const handleRouteChange = (url: string) => {
      gtag.pageview(url);
    };
    router.events.on('routeChangeComplete', handleRouteChange);
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router.events]);

  return (
    <>
      <Script
        strategy="afterInteractive"
        src={\`https://www.googletagmanager.com/gtag/js?id=\${gtag.GA_TRACKING_ID}\`}
      />
      <Script
        id="gtag-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: \`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '\${gtag.GA_TRACKING_ID}', {
              page_path: window.location.pathname,
            });
          \`,
        }}
      />
    </>
  );
};

export default GoogleAnalyticsProvider;
`;
    }
    static generateGtagHelper(config) {
        return `export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_ID;

// https://developers.google.com/analytics/devguides/collection/gtagjs/pages
export const pageview = (url: string) => {
  if (!GA_TRACKING_ID) return;
  window.gtag('config', GA_TRACKING_ID, {
    page_path: url,
  });
};

// https://developers.google.com/analytics/devguides/collection/gtagjs/events
export const event = ({ action, category, label, value }: { action: string, category: string, label: string, value: number }) => {
  if (!GA_TRACKING_ID) return;
  window.gtag('event', action, {
    event_category: category,
    event_label: label,
    value: value,
  });
};
`;
    }
    static generateEnvConfig(config) {
        return `NEXT_PUBLIC_GA_ID="${config.measurementId}"`;
    }
}
//# sourceMappingURL=GoogleAnalyticsGenerator.js.map