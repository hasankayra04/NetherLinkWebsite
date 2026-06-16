/**
 * @type {import('@docusaurus/plugin-content-docs').SidebarsConfig}
 */
const sidebars = {
  tutorialSidebar: [
    {
      type: 'doc',
      id: 'overview',
      label: 'Overview',
    },
    {
      type: 'category',
      label: 'Connect from console',
      collapsible: true,
      collapsed: false,
      items: [
        { type: 'doc', id: 'howto/friend-howto', label: 'Friends Mode' },
        { type: 'doc', id: 'howto/java-howto', label: 'Java Mode' },
        { type: 'doc', id: 'howto/nintendo-howto', label: 'Nintendo Switch' },
        { type: 'doc', id: 'howto/playstation-xbox-howto', label: 'PlayStation & Xbox' },
      ],
    },
    {
      type: 'category',
      label: 'Features',
      collapsible: true,
      collapsed: false,
      items: [
        { type: 'doc', id: 'features/account', label: 'Account & Profile' },
        { type: 'doc', id: 'features/player-lookup', label: 'Player Lookup' },
        { type: 'doc', id: 'features/server-tracker', label: 'Server Tracker' },
        { type: 'doc', id: 'features/skins', label: 'Skins' },
        { type: 'doc', id: 'features/friends-chat', label: 'Friends & Chat' },
      ],
    },
    {
      type: 'category',
      label: 'For server owners',
      collapsible: true,
      collapsed: false,
      items: [
        { type: 'doc', id: 'partner-servers/partner-overview', label: 'Partner Server Program' },
        { type: 'doc', id: 'discord-bot/discord-bot-setup', label: 'Discord Bot' },
      ],
    },
    {
      type: 'category',
      label: 'Reference',
      collapsible: true,
      collapsed: true,
      items: [
        { type: 'doc', id: 'api/api-overview', label: 'API' },
      ],
    },
    {
      type: 'category',
      label: 'Common issues',
      collapsible: true,
      collapsed: true,
      items: [
        { type: 'doc', id: 'issues/dns-issue', label: 'Nintendo DNS Not Working' },
        { type: 'doc', id: 'issues/does-not-appear-issue', label: 'MCCompanion Not Appearing' },
        { type: 'doc', id: 'issues/friend-issue', label: 'Friends Mode Not Working' },
        { type: 'doc', id: 'issues/mcf-issue', label: 'Multiplayer Connection Failed' },
      ],
    },
  ],
};

export default sidebars;
