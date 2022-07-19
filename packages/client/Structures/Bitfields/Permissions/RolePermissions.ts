import { BigString } from "../../../../util/snowflakes";
import { Bitfield } from "../BitField";

export const RolePermissions = {
  /** Allows creation of instant invites. */
  createInstantInvite: 1n << 0n,
  /** Allows kicking members */
  kickMembers: 1n << 1n,
  /** Allows banning members. */
  banMembers: 1n << 2n,
  /** Allows all permissions and bypasses server-wide permission overwrites. */
  administrator: 1n << 3n,
  /** Allows management and editing of channels. */
  manageChannels: 1n << 4n,
  /** Allows management and editing of the server. */
  manageGuild: 1n << 5n,
  /** Allows for the addition of reactions to messages. */
  addReactions: 1n << 6n,
  /** Allows for viewing of audit logs. */
  viewAuditLog: 1n << 7n,
  /** Allows for using priority speaker in a voice channel. */
  prioritySpeaker: 1n << 8n,
  /** Allows the user to go live. */
  stream: 1n << 9n,
  /** Allows guild members to view a channel, which includes reading messages in text channels and joining voice channels. */
  viewChannel: 1n << 10n,
  /** Allows for sending messages in a channel and creating threads in a forum (does not allow sending messages in threads). */
  sendMessages: 1n << 11n,
  /** Allows for sending of tts messages. */
  sendTTSMessages: 1n << 12n,
  /** Allows for deletion of other users messages. */
  manageMessages: 1n << 13n,
  /** Links sent by users with this permission will be auto-embedded. */
  embedLinks: 1n << 14n,
  /** Allows for uploading images and files. */
  attachFiles: 1n << 15n,
  /** Allows for reading of message history. */
  readMessageHistory: 1n << 16n,
  /** Allows for using the @everyone tag to notify all users in a channel, and the @here tag to notify all online users in a channel. */
  mentionEveryone: 1n << 17n,
  /** Allows for using custom emojis from other servers. */
  useExternalEmojis: 1n << 18n,
  /** Allows for viewing guild insights. */
  viewGuildInsights: 1n << 19n,
  /** Allows for joining of a voice channel. */
  connect: 1n << 20n,
  /** Allows for speaking in a voice channel. */
  speak: 1n << 21n,
  /** Allows for muting members in a voice channel. */
  muteMembers: 1n << 22n,
  /** Allows for deafening of members in a voice channel. */
  deafenMembers: 1n << 23n,
  /** Allows for moving of members between voice channels. */
  moveMembers: 1n << 24n,
  /** Allows for using voice-activity-detection in a voice channel. */
  useVAD: 1n << 25n,
  /** Allows for modification of own nickname. */
  changeNickname: 1n << 26n,
  /** Allows for modification of other users nicknames. */
  manageNicknames: 1n << 27n,
  /** Allows management and editing of roles. */
  manageRoles: 1n << 28n,
  /** Allows management and editing of webhooks. */
  manageWebhooks: 1n << 29n,
  /** Allows management and editing of emojis and stickers. */
  manageEmojisAndStickers: 1n << 30n,
  /** Allows members to use application commands, including slash commands and context menu commands. */
  useApplicationCommands: 1n << 31n,
  /** Allows for requesting to speak in stage channels. */
  requestToSpeak: 1n << 32n,
  /** Allows for creating, editing, and deleting scheduled events. */
  manageEvents: 1n << 33n,
  /** Allows for deleting and archiving threads, and viewing all private threads. */
  manageThreads: 1n << 34n,
  /** Allows for creating public and announcement threads. */
  createPublicThreads: 1n << 35n,
  /** Allows for creating private threads. */
  createPrivateThreads: 1n << 36n,
  /** Allows the usage of custom stickers from other servers. */
  useCustomStickers: 1n << 37n,
  /** Allows for sending messages in threads. */
  sendMessagesInThreads: 1n << 38n,
  /** Allows for using Activities (applications with the EMBEDDED flag) in a voice channel. */
  useEmbeddedActivities: 1n << 39n,
  /** Allows for timing out users to prevent them from sending or reacting to messages in chat and threads, and from speaking in voice and stage channels. */
  moderateMembers: 1n << 40n,
};

export type RolePermissionsKeys = keyof typeof RolePermissions;

export class RolePermission extends Bitfield {
  constructor(bits?: BigString) {
    super();

    if (bits) this.bitfield = BigInt(bits);
  }

  /** Whether or not this role has the permission to create instant invites. */
  get createInstantInvite(): boolean {
    return super.contains(RolePermissions.createInstantInvite);
  }

  /** Set whether or not this role has the permission to create instant invites. */
  set createInstantInvite(value: boolean) {
    this.toggle(value, RolePermissions.createInstantInvite);
  }

  /** Whether or not this role has the permission to kick members. */
  get kickMembers(): boolean {
    return super.contains(RolePermissions.kickMembers);
  }

  /** Set whether or not this role has the permission to kick members. */
  set kickMembers(value: boolean) {
    this.toggle(value, RolePermissions.kickMembers);
  }

  /** Whether or not this role has the permission to ban members. */
  get banMembers(): boolean {
    return super.contains(RolePermissions.banMembers);
  }

  /** Set whether or not this role has the permission to ban members. */
  set banMembers(value: boolean) {
    this.toggle(value, RolePermissions.banMembers);
  }

  /** Whether or not this role has the permission to administrater. */
  get administrator(): boolean {
    return super.contains(RolePermissions.administrator);
  }

  /** Set whether or not this role has the permission to administrater. */
  set administrator(value: boolean) {
    this.toggle(value, RolePermissions.administrator);
  }

  /** Whether or not this role has the permission to manage channels. */
  get manageChannels(): boolean {
    return super.contains(RolePermissions.manageChannels);
  }

  /** Set whether or not this role has the permission to manage channels. */
  set manageChannels(value: boolean) {
    this.toggle(value, RolePermissions.manageChannels);
  }

  /** Whether or not this role has the permission to manage the server. */
  get manageGuild(): boolean {
    return super.contains(RolePermissions.manageGuild);
  }

  /** Set whether or not this role has the permission to manage the server. */
  set manageGuild(value: boolean) {
    this.toggle(value, RolePermissions.manageGuild);
  }

  /** Whether or not this role has the permission to add reactions. */
  get addReactions(): boolean {
    return super.contains(RolePermissions.addReactions);
  }

  /** Set whether or not this role has the permission to add reactions. */
  set addReactions(value: boolean) {
    this.toggle(value, RolePermissions.addReactions);
  }

  /** Whether or not this role has the permission to view the audit log. */
  get viewAuditLog(): boolean {
    return super.contains(RolePermissions.viewAuditLog);
  }

  /** Set whether or not this role has the permission to view the audit log. */
  set viewAuditLog(value: boolean) {
    this.toggle(value, RolePermissions.viewAuditLog);
  }

  /** Whether or not this role has the permission to use priority speaker in a voice channel. */
  get prioritySpeaker(): boolean {
    return super.contains(RolePermissions.prioritySpeaker);
  }

  /** Set whether or not this role has the permission to use priority speaker in a voice channel. */
  set prioritySpeaker(value: boolean) {
    this.toggle(value, RolePermissions.prioritySpeaker);
  }

  /** Whether or not this role has the permission to stream in a voice channel. */
  get stream(): boolean {
    return super.contains(RolePermissions.stream);
  }

  /** Set whether or not this role has the permission to stream in a voice channel. */
  set stream(value: boolean) {
    this.toggle(value, RolePermissions.stream);
  }

  /** Whether or not this role has the permission to view the channel. */
  get viewChannel(): boolean {
    return super.contains(RolePermissions.viewChannel);
  }

  /** Set whether or not this role has the permission to view the channel. */
  set viewChannel(value: boolean) {
    this.toggle(value, RolePermissions.viewChannel);
  }

  /** Whether or not this role has the permission to send messages. */
  get sendMessages(): boolean {
    return super.contains(RolePermissions.sendMessages);
  }

  /** Set whether or not this role has the permission to send messages. */
  set sendMessages(value: boolean) {
    this.toggle(value, RolePermissions.sendMessages);
  }

  /** Whether or not this role has the permission to send text-to-speech messages. */
  get sendTTSMessages(): boolean {
    return super.contains(RolePermissions.sendTTSMessages);
  }

  /** Set whether or not this role has the permission to send text-to-speech messages. */
  set sendTTSMessages(value: boolean) {
    this.toggle(value, RolePermissions.sendTTSMessages);
  }

  /** Whether or not this role has the permission to manage messages. */
  get manageMessages(): boolean {
    return super.contains(RolePermissions.manageMessages);
  }

  /** Set whether or not this role has the permission to manage messages. */
  set manageMessages(value: boolean) {
    this.toggle(value, RolePermissions.manageMessages);
  }

  /** Whether or not this role has the permission to embed links. */
  get embedLinks(): boolean {
    return super.contains(RolePermissions.embedLinks);
  }

  /** Set whether or not this role has the permission to embed links. */
  set embedLinks(value: boolean) {
    this.toggle(value, RolePermissions.embedLinks);
  }

  /** Whether or not this role has the permission to attach files. */
  get attachFiles(): boolean {
    return super.contains(RolePermissions.attachFiles);
  }

  /** Set whether or not this role has the permission to attach files. */
  set attachFiles(value: boolean) {
    this.toggle(value, RolePermissions.attachFiles);
  }

  /** Whether or not this role has the permission to read message history. */
  get readMessageHistory(): boolean {
    return super.contains(RolePermissions.readMessageHistory);
  }

  /** Set whether or not this role has the permission to read message history. */
  set readMessageHistory(value: boolean) {
    this.toggle(value, RolePermissions.readMessageHistory);
  }

  /** Whether or not this role has the permission to mention everyone. */
  get mentionEveryone(): boolean {
    return super.contains(RolePermissions.mentionEveryone);
  }

  /** Set whether or not this role has the permission to mention everyone. */
  set mentionEveryone(value: boolean) {
    this.toggle(value, RolePermissions.mentionEveryone);
  }

  /** Whether or not this role has the permission to use external emojis. */
  get useExternalEmojis(): boolean {
    return super.contains(RolePermissions.useExternalEmojis);
  }

  /** Set whether or not this role has the permission to use external emojis. */
  set useExternalEmojis(value: boolean) {
    this.toggle(value, RolePermissions.useExternalEmojis);
  }

  /** Whether or not this role has permission to view guild insights. */
  get viewGuildInsights(): boolean {
    return super.contains(RolePermissions.viewGuildInsights);
  }

  /** Set whether or not this role has permission to view guild insights. */
  set viewGuildInsights(value: boolean) {
    this.toggle(value, RolePermissions.viewGuildInsights);
  }

  /** Allows for joining of a voice channel. */
  get connect(): boolean {
    return super.contains(RolePermissions.connect);
  }

  /** Set whether or not this role has permission to join a voice channel. */
  set connect(value: boolean) {
    this.toggle(value, RolePermissions.connect);
  }

  /** Allows for speaking in a voice channel. */
  get speak(): boolean {
    return super.contains(RolePermissions.speak);

  }

  /** Set whether or not this role has permission to speak in a voice channel. */
  set speak(value: boolean) {
    this.toggle(value, RolePermissions.speak);
  }

  /** Allows for muting members in a voice channel. */
  get muteMembers(): boolean {
    return super.contains(RolePermissions.muteMembers);
  }

  /** Set whether or not this role has permission to mute members in a voice channel. */
  set muteMembers(value: boolean) {
    this.toggle(value, RolePermissions.muteMembers);
  }

  /** Allows for deafening of members in a voice channel. */
  get deafenMembers(): boolean {
    return super.contains(RolePermissions.deafenMembers);
  }

  /** Set whether or not this role has permission to deafen members in a voice channel. */
  set deafenMembers(value: boolean) {
    this.toggle(value, RolePermissions.deafenMembers);
  }

  /** Allows for moving of members in a voice channel. */
  get moveMembers(): boolean {
    return super.contains(RolePermissions.moveMembers);
  }

  /** Set whether or not this role has permission to move members in a voice channel. */
  set moveMembers(value: boolean) {
    this.toggle(value, RolePermissions.moveMembers);
  }

  /** Allows for using voice-activity-detection in a voice channel. */
  get useVAD(): boolean {
    return super.contains(RolePermissions.useVAD);
  }

  /** Set whether or not this role has permission to use voice-activity-detection in a voice channel. */
  set useVAD(value: boolean) {
    this.toggle(value, RolePermissions.useVAD);
  }

  /** Allows for changing of nicknames. */
  get changeNickname(): boolean {
    return super.contains(RolePermissions.changeNickname);
  }

  /** Set whether or not this role has permission to change nicknames. */
  set changeNickname(value: boolean) {
    this.toggle(value, RolePermissions.changeNickname);
  }

  /** Allows for modification of other users nicknames. */
  get manageNicknames(): boolean {
    return super.contains(RolePermissions.manageNicknames);
  }

  /** Set whether or not this role has permission to modify other users nicknames. */
  set manageNicknames(value: boolean) {
    this.toggle(value, RolePermissions.manageNicknames);
  }

  /** Allows for modification of other users roles. */
  get manageRoles(): boolean {
    return super.contains(RolePermissions.manageRoles);
  }

  /** Set whether or not this role has permission to modify other users roles. */
  set manageRoles(value: boolean) {
    this.toggle(value, RolePermissions.manageRoles);
  }

  /** Allows for management and editing of webhooks. */
  get manageWebhooks(): boolean {
    return super.contains(RolePermissions.manageWebhooks);
  }

  /** Set whether or not this role has permission to manage webhooks. */
  set manageWebhooks(value: boolean) {
    this.toggle(value, RolePermissions.manageWebhooks);
  }

  /** Allows for management and editing of emojis. */

  get manageEmojisAndStickers(): boolean {
    return super.contains(RolePermissions.manageEmojisAndStickers);
  }

  /** Set whether or not this role has permission to manage emojis. */
  set manageEmojisAndStickers(value: boolean) {
    this.toggle(value, RolePermissions.manageEmojisAndStickers);
  }

  /** Allows members to use application commands. */
  get useApplicationCommands(): boolean {
    return super.contains(RolePermissions.useApplicationCommands);
  }

  /** Set whether or not this role has permission to use application commands. */
  set useApplicationCommands(value: boolean) {
    this.toggle(value, RolePermissions.useApplicationCommands);
  }

  /** Allows for requesting to speak in stage channels. */
  get requestToSpeak(): boolean {
    return super.contains(RolePermissions.requestToSpeak);
  }

  /** Set whether or not this role has permission to request to speak in stage channels. */
  set requestToSpeak(value: boolean) {
    this.toggle(value, RolePermissions.requestToSpeak);
  }

  /** Allows for creating, editing and deleting scheduled events. */
  get manageEvents(): boolean {
    return super.contains(RolePermissions.manageEvents);
  }

  /** Set whether or not this role has permission to create, edit and delete scheduled events. */
  set manageEvents(value: boolean) {
    this.toggle(value, RolePermissions.manageEvents);
  }

  /** Allows for deleting and archiving threads. */
  get manageThreads(): boolean {
    return super.contains(RolePermissions.manageThreads);
  }

  /** Set whether or not this role has permission to delete and archive threads. */
  set manageThreads(value: boolean) {
    this.toggle(value, RolePermissions.manageThreads);
  }

  /** Allows for creating public and announcement threads. */
  get createPublicThreads(): boolean {
    return super.contains(RolePermissions.createPublicThreads);
  }

  /** Set whether or not this role has permission to create public and announcement threads. */
  set createPublicThreads(value: boolean) {
    this.toggle(value, RolePermissions.createPublicThreads);
  }

  /** Allows for creating private threads. */
  get createPrivateThreads(): boolean {
    return super.contains(RolePermissions.createPrivateThreads);
  }

  /** Set whether or not this role has permission to create private threads. */
  set createPrivateThreads(value: boolean) {
    this.toggle(value, RolePermissions.createPrivateThreads);
  }

  /** Allows for the usage of custom stickers from other servers. */
  get useCustomStickers(): boolean {
    return super.contains(RolePermissions.useCustomStickers);
  }

  /** Set whether or not this role has permission to use custom stickers from other servers. */
  set useCustomStickers(value: boolean) {
    this.toggle(value, RolePermissions.useCustomStickers);
  }

  /** Allows for sending messages in threads. */
  get sendMessagesInThreads(): boolean {
    return super.contains(RolePermissions.sendMessagesInThreads);
  }

  /** Set whether or not this role has permission to send messages in threads. */
  set sendMessagesInThreads(value: boolean) {
    this.toggle(value, RolePermissions.sendMessagesInThreads);
  }

  /** Allows for using Activities (applications with the EMBEDDED flag) in a voice channel. */
  get useEmbeddedActivities(): boolean {
    return super.contains(RolePermissions.useEmbeddedActivities);
  }

  /** Set whether or not this role has permission to use Activities (applications with the EMBEDDED flag) in a voice channel. */
  set useEmbeddedActivities(value: boolean) {
    this.toggle(value, RolePermissions.useEmbeddedActivities);
  }

  /** Allows for timing out users to prevent them from sending or reacting to messages in chat and threads, and from speaking in voice and stage channels. */
  get moderateMembers(): boolean {
    return super.contains(RolePermissions.moderateMembers);
  }

  /** Set whether or not this role has permission to timeout users to prevent them from sending or reacting to messages in chat and threads, and from speaking in voice and stage channels. */
  set moderateMembers(value: boolean) {
    this.toggle(value, RolePermissions.moderateMembers);
  }
  

  /** Checks whether or not the permissions exist in this */
  has(permissions: RolePermissionsKeys | RolePermissionsKeys[]): boolean {
    if (!Array.isArray(permissions)) permissions = [permissions];
    return super.contains(
      permissions.reduce((a, b) => (a |= RolePermissions[b]), 0n)
    );
  }

  /** Lists all the toggles for the role and whether or not each is true or false. */
  list(): Record<RolePermissionsKeys, boolean> {
    const json: Record<string, boolean> = {};
    for (const [key, value] of Object.entries(RolePermissions)) {
      json[key] = super.contains(value);
    }

    return json as Record<RolePermissionsKeys, boolean>;
  }
}

export default RolePermission;
