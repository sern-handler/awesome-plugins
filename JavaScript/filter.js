import { CommandControlPlugin, controller } from "@sern/handler";
import {
	GuildMember,
	GuildMemberRoleManager,
	PermissionsBitField,
	User,
} from "discord.js";
export class Criteria {
	constructor(name, execute, children) {
		this.name = name;
		this.execute = execute;
		this.children = children;
	}

	toString() {
		return this.name + " " + this.children.map((c) => c.name).join(", ");
	}
}
export const or = (...filters) => {
	function execute(context) {
		let pass = false;

		tests: for (const filter of filters) {
			if (filter.test(context)) {
				pass = true;
				break tests;
			}
		}

		return pass;
	}

	const children = filters.map((x) => x.criteria);
	return new FilterImpl(
		new Criteria("or", execute, children),
		`or(${filters.map((x) => x.message).join(", ")})`,
	);
};
export const and = (...filters) => {
	function execute(context) {
		for (const filter of filters) {
			if (!filter.test(context)) {
				return false;
			}
		}

		return true;
	}

	const children = filters.map((x) => x.criteria);
	return new FilterImpl(
		new Criteria("and", execute, children),
		`and(${filters.map((x) => x.message).join(", ")})`,
	);
};
export const not = (filter) => {
	function execute(context) {
		return !filter.test(context);
	}

	return new FilterImpl(
		new Criteria("not", execute, [filter.criteria]),
		`not(${filter.criteria})`,
	);
};
export const custom = (execute, message) => {
	return new FilterImpl(new Criteria("custom", execute, []), message);
};
export const withCustomMessage = (filter, message) => {
	return new FilterImpl(filter.criteria, message);
};
export const hasGuildPermission = (permission) => {
	const b = PermissionsBitField.resolve(permission);
	const field = Object.entries(PermissionsBitField.Flags).find(
		([, v]) => v === b,
	);

	if (field === undefined) {
		throw new Error(
			`unknown permission \`${permission}\` in filter \`hasGuildPermission\``,
		);
	}

	const [name] = field;

	function execute(context) {
		if (context.member !== null) {
			if (typeof context.member.permissions === "string") {
				return new PermissionsBitField(
					BigInt(context.member.permissions),
				).has(b);
			}

			return context.member.permissions.has(b);
		}

		return true;
	}

	return new FilterImpl(
		new Criteria("hasGuildPermission", execute, []),
		`has guild permission: ${name}`,
	);
};
export const hasChannelPermission = (permission, channelId) => {
	const b = PermissionsBitField.resolve(permission);
	const field = Object.entries(PermissionsBitField.Flags).find(
		([, v]) => v === b,
	);

	if (field === undefined) {
		throw new Error(
			`unknown permission \`${permission}\` in filter \`hasChannelPermission\``,
		);
	}

	const [name] = field;

	function execute(context) {
		if (context.member !== null) {
			const channel =
				channelId !== undefined
					? context.guild?.channels.cache.get(channelId)
					: context.channel; // ?

			if (channel == undefined || channel === null) {
				return false;
			}

			if (channel.isDMBased()) {
				return true;
			}

			const field2 = channel.permissionsFor(context.user); // assume we have no permission overrides

			if (field2 === null) {
				if (context.member !== null) {
					if (typeof context.member.permissions === "string") {
						return new PermissionsBitField(
							BigInt(context.member.permissions),
						).has(b);
					}

					return context.member.permissions.has(b);
				}

				return false;
			}

			return field2.has(b);
		}

		return true;
	}

	return new FilterImpl(
		new Criteria("hasChannelPermission", execute, []),
		channelId !== undefined
			? `has channel permission ${name} in <#${channelId}>`
			: `has channel permission ${name}`,
	);
};
export const canAddReactions = (channelId) => {
	return hasChannelPermission("AddReactions", channelId);
};
export const canAttachFiles = (channelId) => {
	return hasChannelPermission("AttachFiles", channelId);
};
export const canBanMembers = () => {
	return hasGuildPermission("BanMembers");
};
export const canChangeNickname = () => {
	return hasGuildPermission("ChangeNickname");
};
export const canConnect = (channelId) => {
	return hasChannelPermission("Connect", channelId);
};
export const canCreateInstantInvite = (channelId) => {
	return hasChannelPermission("CreateInstantInvite", channelId);
};
export const canDeafenMembers = (channelId) => {
	return hasChannelPermission("DeafenMembers", channelId);
};
export const canEmbedLinks = (channelId) => {
	return hasChannelPermission("EmbedLinks", channelId);
};
export const canKickMembers = () => {
	return hasGuildPermission("KickMembers");
};
export const canManageChannelWebhooks = (channelId) => {
	return hasChannelPermission("ManageWebhooks", channelId);
};
export const canManageChannels = (channelId) => {
	return hasChannelPermission("ManageChannels", channelId);
};
export const canManageEmojisAndStickers = () => {
	return hasGuildPermission("ManageEmojisAndStickers");
};
export const canManageGuild = () => {
	return hasGuildPermission("ManageGuild");
};
export const canManageGuildWebhooks = () => {
	return hasGuildPermission("ManageWebhooks");
};
export const canManageMessages = (channelId) => {
	return hasChannelPermission("ManageMessages", channelId);
};
export const canManageNicknames = () => {
	return hasGuildPermission("ManageNicknames");
};
export const canManageRoles = () => {
	return hasGuildPermission("ManageRoles");
};
export const canMentionEveryone = (channelId) => {
	return hasChannelPermission("MentionEveryone", channelId);
};
export const canMoveMembers = (channelId) => {
	return hasChannelPermission("MoveMembers", channelId);
};
export const canMuteMembers = (channelId) => {
	return hasChannelPermission("MuteMembers", channelId);
};
export const canPrioritySpeaker = (channelId) => {
	return hasChannelPermission("PrioritySpeaker", channelId);
};
export const canReadMessageHistory = (channelId) => {
	return hasChannelPermission("ReadMessageHistory", channelId);
};
export const canViewChannel = (channelId) => {
	return hasChannelPermission("ViewChannel", channelId);
};
export const canSendMessages = (channelId) => {
	return hasChannelPermission("SendMessages", channelId);
};
export const canSendTtsMessages = (channelId) => {
	return hasChannelPermission("SendTTSMessages", channelId);
};
export const canSpeak = (channelId) => {
	return hasChannelPermission("Speak", channelId);
};
export const canStream = (channelId) => {
	return hasChannelPermission("Stream", channelId);
};
export const canUseExternalEmojis = (channelId) => {
	return hasChannelPermission("UseExternalEmojis", channelId);
};
export const canUseVoiceActivity = (channelId) => {
	return hasChannelPermission("UseVAD", channelId);
};
export const canViewAuditLog = () => {
	return hasGuildPermission("ViewAuditLog");
};
export const canViewGuildInsights = () => {
	return hasGuildPermission("ViewGuildInsights");
};
export const channelIdIn = (channelIds) => {
	function execute(context) {
		return channelIds.includes(
			context.isMessage()
				? context.message.channelId
				: context.interaction.channelId,
		);
	}

	return new FilterImpl(
		new Criteria("channelIdIn", execute, []),
		`channel is one of: ${channelIds.map((v) => `<#${v}>`).join(", ")}`,
	);
};
export const hasEveryRole = (roles) => {
	return withCustomMessage(
		and(...roles.map((v) => hasRole(v))),
		`has all of: ${roles.map((v) => `<@&${v}>`).join(", ")}`,
	);
};
export const hasMentionableRole = () => {
	function execute(context) {
		if (context.member !== null) {
			if (context.member.roles instanceof GuildMemberRoleManager) {
				return (
					context.member.roles.cache.filter(
						(x) => x.mentionable === true,
					).size > 0
				);
			}

			if (context.guild === null) {
				return false;
			}

			return context.member.roles
				.map((roleId) => context.guild.roles.cache.get(roleId))
				.filter((x) => x !== undefined)
				.some((x) => x.mentionable);
		}

		return false;
	}

	return new FilterImpl(
		new Criteria("hasMentionableRole", execute, []),
		"has a mentionable role",
	);
};
export const hasNickname = (nickname) => {
	function execute(context) {
		if (context.member !== null) {
			if (context.member instanceof GuildMember) {
				if (nickname !== null) {
					return context.member.nickname === nickname;
				}

				return context.member.nickname !== null;
			}

			if (nickname !== null) {
				return context.member.nick === nickname;
			}

			return (
				context.member.nick !== null &&
				context.member.nick !== undefined
			);
		} // dm members can technically have nicknames but they're per-user, so this should never be true.

		return false;
	}

	return new FilterImpl(
		new Criteria("hasNickname", execute, []),
		"has a nickname",
	);
};
export const hasParentId = (parentId) => {
	function execute(context) {
		if (context.channel !== null) {
			if (context.channel.isDMBased()) {
				return false;
			}

			return context.channel.parentId === parentId;
		}

		return false;
	}

	return new FilterImpl(
		new Criteria("hasParentId", execute, []),
		`has channel parent <#${parentId}>`,
	);
};
export const hasRole = (roleId) => {
	function execute(context) {
		if (context.member !== null) {
			if (context.member.roles instanceof GuildMemberRoleManager) {
				return context.member.roles.cache.has(roleId);
			}

			if (context.guild === null) {
				return false;
			}

			return context.member.roles.includes(roleId);
		} // assume dm members have every role ever.

		return true;
	}

	return new FilterImpl(
		new Criteria("hasRole", execute, []),
		`has role <@&${roleId}>`,
	);
};
export const hasSomeRole = (roles) => {
	return withCustomMessage(
		or(...roles.map((role) => hasRole(role))),
		`has any of: ${roles.map((v) => `<@&${v}>`).join(", ")}`,
	);
};
export const isAdministator = () => {
	return hasGuildPermission("Administrator");
};
export const isChannelId = (channelId) => {
	function execute(context) {
		if (context.isMessage()) {
			return context.message.channelId === channelId;
		}

		return context.interaction.channelId === channelId;
	}

	return new FilterImpl(
		new Criteria("isChannelId", execute, []),
		`is channel <#${channelId}>`,
	);
};
export const isChannelNsfw = () => {
	function execute(context) {
		if (context.channel !== null) {
			if (context.channel.isDMBased() || context.channel.isThread()) {
				return false;
			}

			return context.channel.nsfw;
		}

		return false;
	}

	return new FilterImpl(
		new Criteria("isChannelNsfw", execute, []),
		"channel marked as nsfw",
	);
};
export const isGuildOwner = () => {
	function execute(context) {
		if (context.guild !== null) {
			return context.guild.ownerId === context.user.id;
		}

		return true;
	}

	return new FilterImpl(
		new Criteria("isGuildOwner", execute, []),
		"is guild owner",
	);
};
export const isBotOwner = () => {
	function execute(context) {
		if (context.client.application !== null) {
			if (context.client.application.owner !== null) {
				if (context.client.application.owner instanceof User) {
					return (
						context.user.id === context.client.application.owner.id
					);
				}

				return context.client.application.owner.members.has(
					context.user.id,
				);
			}
		} // nope

		return false;
	}

	return new FilterImpl(
		new Criteria("isBotOwner", execute, []),
		"is bot owner",
	);
};
export const isUserId = (userId) => {
	function execute(context) {
		return context.user.id === userId;
	}

	return new FilterImpl(
		new Criteria("isUserId", execute, []),
		`is user: <@${userId}>`,
	);
};
export const parentIdIn = (parentIds) => {
	return withCustomMessage(
		or(...parentIds.map((v) => hasParentId(v))),
		`channel parent is one of: ${parentIds
			.map((v) => `<#${v}>`)
			.join(", ")}`,
	);
};
export const userIdIn = (userIds) => {
	return withCustomMessage(
		or(...userIds.map((v) => isUserId(v))),
		`user is one of: ${userIds.map((v) => `<@${v}>`).join(", ")}`,
	);
};
export const isInGuild = () => {
	function execute(context) {
		return context.guildId !== null;
	}

	return new FilterImpl(
		new Criteria("isInGuild", execute, []),
		"is in guild",
	);
};
export const isInDm = () => {
	const notInGuild = compose(not, isInGuild);
	return withCustomMessage(notInGuild(), "is in dm");
};
export const never = () => {
	function execute(context) {
		void context;
		return false;
	}

	return new FilterImpl(new Criteria("never", execute, []), "never");
};
export const always = () => {
	function execute(context) {
		void context;
		return true;
	}

	return new FilterImpl(new Criteria("always", execute, []), "always");
};

/**
 * Call FilterImpls in right to left order.
 * @example
 * import { compose, isUserId, not } from '../plugins/filter'
 * const isNotUserId = compose(not, isUserId)
 *
 */
export const compose = (...funcs) => {
	return (
		arg, //@ts-ignore
	) => funcs.reduceRight((result, func) => func(result), arg);
};
export class FilterImpl {
	constructor(criteria, message) {
		this.criteria = criteria;
		this.message = message;
		this.test = this.criteria.execute;
	}
}

/**
 * @plugin
 * Generalized `filter` plugin. revised by jacoobes, all credit to original author.
 * Perform declarative conditionals as plugins.
 * @author @trueharuu [<@504698587221852172>]
 * @version 2.0.0
 * @example
 * import { filter, not, isGuildOwner, canMentionEveryone } from '../plugins/filter';
 * import { commandModule } from '@sern/handler';
 *
 * export default commandModule({
 *     plugins: [filter({ condition: [not(isGuildOwner()), canMentionEveryone()] })],
 *     async execute(context) {
 *       // your code here
 *     }
 * });
 */
export const filter = (options) => {
	return CommandControlPlugin(async (context) => {
		const arrayifiedCondition = Array.isArray(options.condition)
			? options.condition
			: [options.condition];
		const value = and(...arrayifiedCondition).test(context);

		if (value) {
			return controller.next();
		}

		if (options.onFailed !== undefined) {
			await options.onFailed(context, arrayifiedCondition);
		} else {
			await context.reply({
				ephemeral: true,
				content: `you do not match the criteria for this command:\n${arrayifiedCondition
					.map((x) => x.message)
					.filter((x) => x !== undefined)
					.join("\n")}`,
				allowedMentions: {
					repliedUser: false,
					parse: [],
				},
			});
		}

		return controller.stop();
	});
};
