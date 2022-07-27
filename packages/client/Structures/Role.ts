import { RoleOptions } from "../../rest/typings";
import { DiscordRole } from "../../typings/discord";
import { BigString } from "../../util/snowflakes";
import Client from "../Client";
import { Base } from "./Base";
import RolePermission from "./Bitfields/Permissions/RolePermissions";
import RoleToggles from "./Bitfields/RoleToggles";

export class Role extends Base {
  /** The name of this role. */
  name: string;

  /** The ID of the guild this role is in. */
  guildID: BigString;

  /** The color of this role. */
  color: number;

  /** The icon hash of this role. */
  iconHash?: BigString;

  /** The permissions of this role. */
  permissions: RolePermission;

  /** The bot id, if this role is managed by a bot. */
  botID?: BigString;

  /** The integration id, if this role is managed by an integration. */
  integrationID?: BigString;

  /** The bitfield of this role, holding all the boolean values. */
  bitfield = new RoleToggles();

  /** The position of this role. */
  position: number;

  /** The unicode representation for this role's emoji. */
  unicodeEmoji?: string;

  constructor(client: Client, data: DiscordRole, guildID: BigString) {
    super(client, data.id);

    this.guildID = guildID;
    this.name = data.name;
    this.color = data.color;
    this.position = data.position;
    this.iconHash = data.icon ? client.compressHash(data.icon) : undefined;
    this.unicodeEmoji = data.unicode_emoji;
    this.botID = data.tags?.bot_id
      ? client.bigString(data.tags.bot_id)
      : undefined;
    this.integrationID = data.tags?.integration_id
      ? client.bigString(data.tags.integration_id)
      : undefined;
    this.isHoisted = !!data.hoist;
    this.isMentionable = !!data.mentionable;
    this.isManaged = !!data.managed;

    this.permissions = new RolePermission(data.permissions);
  }

  /** Whether this role is hoisted. */
  get isHoisted(): boolean {
    return this.bitfield.isHoisted;
  }

  /** Set whether or not this role is hoisted. */
  set isHoisted(value: boolean) {
    this.bitfield.isHoisted = value;
  }

  /** Whether this role is mentionable. */
  get isMentionable(): boolean {
    return this.bitfield.isMentionable;
  }

  /** Set whether or not this role is mentionable. */
  set isMentionable(value: boolean) {
    this.bitfield.isMentionable = value;
  }

  /** Whether this role is managed. */
  get isManaged(): boolean {
    return this.bitfield.isManaged;
  }

  /** Set whether or not this role is managed. */
  set isManaged(value: boolean) {
    this.bitfield.isManaged = value;
  }

  /** Whether or not this role is a premium subscriber. */
  get isPremiumSubscriber(): boolean {
    return this.bitfield.isPremiumSubscriber;
  }

  /** Set whether or not this role is a premium subscriber. */
  set isPremiumSubscriber(value: boolean) {
    this.bitfield.isPremiumSubscriber = value;
  }

  /** The special tags that are available on this role. */
  get tags(): RoleTags {
    return {
      botID: this.botID,
      integrationID: this.integrationID,
      premiumSubscriber: this.bitfield.isPremiumSubscriber,
    };
  }

  /** The icon hash for the role emoji. */
  get icon(): string | undefined {
    return this.iconHash
      ? this.client.decompressHash(this.iconHash)
      : undefined;
  }

  /** Whether or not the icon for this role is animated. */
  get isAnimatedIcon(): boolean {
    return !!this.icon?.startsWith("a_");
  }

  /** The url for this roles icon. */
  get iconURL(): string {
    return `https://cdn.discordapp.com/role-icons/${this.id}/${this.icon}.${
      this.isAnimatedIcon ? ".gif" : this.client.defaultImageFormat
    }?size=${this.client.defaultImageSize}`;
  }

  /** The string form of the role mention. */
  get mention(): string {
    return `<@&${this.id}>`;
  }

  /** Add this role to a guild member. */
  async addToMember(memberID: BigString, reason?: string): Promise<void> {
    return await this.client.addRole(this.guildID, memberID, this.id, reason);
  }

  /** Clone this role in the server. */
  async clone(name: string, reason?: string): Promise<Role> {
    return await this.client.createRole(
      this.guildID,
      {
        color: this.color,
        hoist: this.isHoisted,
        icon: this.icon,
        mentionable: this.isMentionable,
        permissions: this.permissions.bitfield,
        unicodeEmoji: this.unicodeEmoji,
        name,
      },
      reason
    );
  }

  /** Delete this role. */
  async delete(reason?: string): Promise<void> {
    return await this.client.deleteRole(this.guildID, this.id, reason);
  }

  /** Edit this role. */
  async edit(options: RoleOptions, reason?: string): Promise<void> {
    return await this.client.editRole(this.guildID, this.id, options, reason);
  }

  /** Remove this role from a guild member. */
  async removeFromMember(memberID: BigString, reason?: string): Promise<void> {
    return await this.client.removeRole(
      this.guildID,
      memberID,
      this.id,
      reason
    );
  }
}

export interface RoleTags {
  botID?: BigString;
  integrationID?: BigString;
  premiumSubscriber: boolean;
}

export default Role;
