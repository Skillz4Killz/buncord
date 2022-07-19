import { RestManager } from "../rest";
import { RoleOptions } from "../rest/typings";
import { iconBigintToHash, iconHashToBigInt } from "../util/hash";
import { BigString } from "../util/snowflakes";
import Role from "./Structures/Role";

export class Client {
  /** The options that this client was configured with. */
  options: ClientOptions;

  /** The manager that communicates to discord's rest api. */
  rest: RestManager;

  constructor(options: ClientOptions) {
    this.options = options;
    this.rest = new RestManager(options);
  }

  /** Whether or not to use bigints. */
  get useBigints(): boolean {
    return !!this.options.useBigints;
  }

  /** Add a role to a guild member */
  async addRole(
    guildID: BigString,
    memberID: BigString,
    roleID: BigString,
    reason?: string
  ): Promise<void> {
    // Cannot add the @everyone role to a member.
    if (guildID === roleID)
      throw new Error("Cannot add the @everyone role to a member.");

    return await this.rest.addRole(guildID, memberID, roleID, reason);
  }

  /** Create a role in a guild. */
  async createRole(guildID: BigString, options: RoleOptions, reason?: string) {
    const response = await this.rest.createRole(guildID, options, reason);
    const role = new Role(this, response, guildID);

    // TODO: cache
    // await this.cache.handle("role", role);

    return role;
  }

  /** Delete a role in a guild. */
  async deleteRole(
    guildID: BigString,
    roleID: BigString,
    reason?: string
  ): Promise<void> {
    // Cannot delete the @everyone role.
    if (guildID === roleID)
      throw new Error("Cannot delete the @everyone role.");

    return await this.rest.deleteRole(guildID, roleID, reason);
  }

  /** Edit a role in a guild. */
  async editRole(
    guildID: BigString,
    roleID: BigString,
    options: RoleOptions,
    reason?: string
  ) {
    return await this.rest.editRole(guildID, roleID, options, reason);
  }

  /** Get all the roles in the guild. */
  async getRoles(guildID: BigString) {
    return await this.rest.getRoles(guildID);
  }

  /** Remove a role from a guild member */
  async removeRole(
    guildID: BigString,
    memberID: BigString,
    roleID: BigString,
    reason?: string
  ): Promise<void> {
    // Cannot remove the @everyone role from a member.
    if (guildID === roleID)
      throw new Error("Cannot remove the @everyone role from a member.");

    return await this.rest.removeRole(guildID, memberID, roleID, reason);
  }

  /** Converts the string to a bigint if selected in the options. */
  bigString(str: BigString): BigString {
    if (this.useBigints) return BigInt(str);

    return str;
  }

  /** Compresses the icon hash into a bigint form for optimal memory storage, if enabled in the options. */
  compressHash(hash: string): BigString {
    return this.useBigints ? iconHashToBigInt(hash) : hash;
  }

  /** Decompress the icon hash back into a string form. */
  decompressHash(hash: BigString): string {
    return this.useBigints ? iconBigintToHash(hash) : (hash as string);
  }
}

export default Client;

export interface ClientOptions {
  /** The token to use for the client. */
  token: string;
  /** Whether or not to use bigints. */
  useBigints?: boolean;
}
