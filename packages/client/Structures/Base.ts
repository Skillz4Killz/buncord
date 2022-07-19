import { BigString, snowflakeCreatedAt } from "../../util/snowflakes";
import Client from "../Client";

export class Base {
    /** The unique id of this object, usually a snowflake(long number). */
    id: BigString;
    /** The client manager. */
    client: Client;

    constructor(client: Client, id: BigString) {
        this.client = client;
        this.id = client.bigString(id);
    }

    /** The timestamp in milliseconds when this object was created. */
    get createdAt(): number {
        return snowflakeCreatedAt(this.id);
    }
}