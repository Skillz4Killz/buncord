export class Bitfield {
  /** The bitfield that holds all the boolean values. */
  bitfield = 0n;

  /** Tests whether or not this bitfield has the permission requested. */
  contains(bits: bigint): boolean {
    return Boolean(this.bitfield & bits);
  }

  /** Adds some bits to the bitfield. */
  add(bits: bigint): this {
    this.bitfield |= bits;
    return this;
  }

  /** Removes some bits from the bitfield. */
  remove(bits: bigint): this {
    this.bitfield &= ~bits;
    return this;
  }

  /** Adds or removes the value from the bitfield. */
  toggle(value: boolean, bits: bigint): this {
    if (value) {
      this.add(bits);
    } else {
      this.remove(bits);
    }

    return this;
  }

  /** Checks whether or not the permissions exist in this */
  includes(permissions: bigint | bigint[]): boolean {
    if (!Array.isArray(permissions)) permissions = [permissions];

    return this.contains(permissions.reduce((a, b) => (a |= b), 0n));
  }
}
