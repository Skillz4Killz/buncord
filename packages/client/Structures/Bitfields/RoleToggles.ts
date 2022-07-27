import { Bitfield } from "./BitField";

export const RoleToggle = {
  isHoisted: 1n << 0n,
  isMentionable: 1n << 1n,
  isManaged: 1n << 2n,
  isPremiumSubscriber: 1n << 3n,
};

export type RoleToggleKeys = keyof typeof RoleToggle;

export class RoleToggles extends Bitfield {
  /** Whether or not this role is mentionable. */
  get isMentionable(): boolean {
    return super.contains(RoleToggle.isMentionable);
  }

  /** Set whether or not this role is hoisted. */
  set isMentionable(value: boolean) {
    this.toggle(value, RoleToggle.isMentionable);
  }

  /** Whether or not this role is hoisted. */
  get isHoisted(): boolean {
    return super.contains(RoleToggle.isHoisted);
  }

  /** Set whether or not this role is hoisted. */
  set isHoisted(value: boolean) {
    this.toggle(value, RoleToggle.isHoisted);
  }

  /** Whether or not this role is managed. */
  get isManaged(): boolean {
    return super.contains(RoleToggle.isManaged);
  }

  /** Set whether or not this role is managed. */
  set isManaged(value: boolean) {
    this.toggle(value, RoleToggle.isManaged);
  }

  /** Whether or not this role is a subscriber to the premium server. */
  get isPremiumSubscriber(): boolean {
    return super.contains(RoleToggle.isPremiumSubscriber);
  }

  /** Set whether or not this role is a subscriber to the premium server. */
  set isPremiumSubscriber(value: boolean) {
    this.toggle(value, RoleToggle.isPremiumSubscriber);
  }

  /** Checks whether or not the permissions exist in this */
  has(permissions: RoleToggleKeys | RoleToggleKeys[]): boolean {
    if (!Array.isArray(permissions)) permissions = [permissions];
    return super.contains(permissions.reduce((a, b) => (a |= RoleToggle[b]), 0n));
  }

  /** Lists all the toggles for the role and whether or not each is true or false. */
  list(): Record<RoleToggleKeys, boolean> {
    const json: Record<string, boolean> = {};
    for (const [key, value] of Object.entries(RoleToggle)) {
      json[key] = super.contains(value);
    }

    return json as Record<RoleToggleKeys, boolean>;
  }
}

export default RoleToggles;