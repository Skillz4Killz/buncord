import { BigString } from "../util/snowflakes";

export interface RoleOptions {
  /** The color of the role. */
  color?: number;
  /** Whether or not this role should be hoisted(shown separately in the member list).  */
  hoist?: boolean;
  /** The icon hash for this role. */
  icon?: string;
  /** Whether or not this role is mentionable. */
  mentionable?: boolean;
  /** The name of this role. */
  name?: string;
  /** The permissions of this role. */
  permissions?: BigString;
  /** The unicode emoji icon of this role. */
  unicodeEmoji?: string;
}
