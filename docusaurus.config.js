// @ts-check
import {themes as prismThemes} from 'prism-react-renderer';

/** @type {import('@docusaurus/types').Config} */

const config = {
  title: 'MCCompanion — The Complete Minecraft Companion App',
  tagline: 'Console relay, player lookup, skin editor, Minecraft wiki, friends & chat — all in one free app.',
  favicon: 'img/icon.png',

  plugins: ["./src/plugins/tailwind-config.js"],

  future: { 
    v4: true,
  },

  url: 'https://mccompanion.net',
  baseUrl: '/',

  organizationName: 'MCCompanion',
  projectName: 'MCCompanionWebsite',

  onBrokenLinks: 'warn',

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      ({
        docs: {
          sidebarPath: './sidebars.js',
          routeBasePath: 'docs',
          editUrl: 'https://github.com/MCCORG/MCCompanionWebsite/tree/main/docs/',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      colorMode: {
        defaultMode: 'dark',
        disableSwitch: false,
        respectPrefersColorScheme: false,
      },
      navbar: {
        logo: {
          alt: 'MCCompanion Logo',
          src: 'img/icon.png',
        },
        title: 'MCCompanion Docs',
        items: [
          {
            type: 'docSidebar',
            sidebarId: 'tutorialSidebar',
            position: 'left',
            label: 'Docs',
          },
          {
            to: '/beta',
            label: 'Beta',
            position: 'right',
          },
          {
            to: '/status',
            label: 'Status',
            position: 'right',
          },
          {
            href: 'https://github.com/MCCORG/MCCompanionWebsite',
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        copyright: `Copyright © ${new Date().getFullYear()} MCCompanion. Built with Docusaurus.`,
      },
      prism: {
        theme: prismThemes.dracula,
        darkTheme: prismThemes.dracula,
      },
      metadata: [
        { name: "description", content: "Console relay for PlayStation, Xbox & Switch, player lookup, skin editor, Minecraft wiki, friends & chat. The all-in-one Minecraft companion app. Free on Windows, macOS, Android and iOS." },
        { name: "keywords", content: "MCCompanion, Minecraft companion app, Minecraft Bedrock console, PlayStation Minecraft, Xbox Minecraft, Nintendo Switch Minecraft, Minecraft player lookup, Minecraft skin editor, Minecraft wiki, no port forwarding" },
        { name: "author", content: "Jens-Co" },
        { name: "theme-color", content: "#0a0a0f" },
        { property: "og:type", content: "website" },
        { property: "og:url", content: "https://mccompanion.net" },
        { property: "og:site_name", content: "MCCompanion" },
        { property: "og:title", content: "MCCompanion — The Complete Minecraft Companion App" },
        { property: "og:description", content: "Console relay, player lookup, skin editor, Minecraft wiki and friends & chat — all in one free app. Available on Windows, macOS, Android and iOS." },
        { property: "og:locale", content: "en_US" }
      ],
    }),
};

export default config;