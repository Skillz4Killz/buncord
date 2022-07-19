/** https://discord.com/developers/docs/topics/permissions#role-object-role-structure */
export interface DiscordRole {
  /** The id of this role. */
  id: string;
  /** Whether or not this role is hoisted(shown separately in the right side bar) */
  hoist: boolean;
  /** The calculated permissions this role has. */
  permissions: string;
  /** Whether this role is managed by an integration */
  managed: boolean;
  /** Whether this role is mentionable */
  mentionable: boolean;
  /** The tags this role has */
  tags?: DiscordRoleTags;
  /** The emoji hash this role has been assigned. */
  icon?: string;
  /** The name of this role. */
  name: string;
  /** The color of this role. */
  color: number;
  /** The position of this role. */
  position: number;
  /** The unicode emoji of this role. */
  unicode_emoji?: string;
}

/** https://discord.com/developers/docs/topics/permissions#role-object-role-tags-structure */
export interface DiscordRoleTags {
  /** The bot id this role belongs to. */
  bot_id?: string;
  /** The integration id this role belongs to. */
  integration_id?: string;
  /** Whether or not this is the guild's booster role */
  premium_subscriber?: null;
}
