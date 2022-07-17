/** Converts a discord id into the timestamp(in milliseconds) when it was created. */
export function snowflakeCreatedAt(id: BigString) {
    return Number(BigInt(id) / 4194304n + 1420070400000n);
}

export type BigString = string | bigint;