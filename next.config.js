const withTM = require('next-transpile-modules')([
    '@fullcalendar/common',
    '@fullcalendar/react',
    '@fullcalendar/daygrid',
    '@fullcalendar/list',
    '@fullcalendar/timegrid',
    '@fullcalendar/timeline'
  ]);
  
  module.exports = withTM({
    reactStrictMode: true,
    webpack(config) {
      config.module.rules.push({
        test: /\.svg$/,
        issuer: { and: [/\.(js|ts|md)x?$/] },
        use: ['@svgr/webpack'],
      });
      return config;
    },
    async redirects() {
      return [
        {
          source: '/docs',
          destination: '/docs/welcome',
          permanent: true,
        },
      ];
    },
  });
  
  
