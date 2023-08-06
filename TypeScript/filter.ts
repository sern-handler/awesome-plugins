import { CommandControlPlugin, CommandType, Context, controller } from '@sern/handler';
import { GuildMember, GuildMemberRoleManager, PermissionResolvable, PermissionsBitField, User } from 'discord.js';

export type Test = (context: Context) => boolean;

export class Criteria {
  public constructor(
    public readonly name: string,
    public readonly execute: Test,
    public readonly children: Array<Criteria>,
  ) {}
}

export class FilterImpl {
  public readonly test: Test;

  public constructor(
    public readonly criteria: Criteria,
    public message?: string
  ) {
    this.test = this.criteria.execute;
  }

  public static or(...filters: Array<FilterImpl>): FilterImpl {
    function execute(context: Context): boolean {
      for (const filter of filters) {
        if (filter.test(context)) {
          return true;
        }
      }

      return false;
    }

    const children: Array<Criteria> = filters.map((x) => x.criteria);

    return new this(new Criteria('or', execute, children), `or(${filters.map(x=>x.message).join(', ')})`);
  }

  public static and(...filters: Array<FilterImpl>): FilterImpl {
    function execute(context: Context): boolean {
      for (const filter of filters) {
        if (!filter.test(context)) {
          return false;
        }
      }

      return true;
    }

    const children: Array<Criteria> = filters.map((x) => x.criteria);

    return new this(new Criteria('and', execute, children), `and(${filters.map(x=>x.message).join(', ')})`);
  }

  public static not(filter: FilterImpl): FilterImpl {
    function execute(context: Context): boolean {
      return !filter.test(context);
    }

    return new this(new Criteria('not', execute, [filter.criteria]), `not(${filter.criteria})`);
  }

  public static custom(execute: Test, message?: string): FilterImpl {
    return new this(new Criteria('custom', execute, []), message);
  }

  public static withCustomMessage(filter: FilterImpl, message?: string): FilterImpl {
    return new this(filter.criteria, message);
  }

  public static hasGuildPermission(permission: PermissionResolvable): FilterImpl {
    const b = PermissionsBitField.resolve(permission);
    const field = Object.entries(PermissionsBitField.Flags).find(([,v]) => v === b);

    if (field === undefined) {
      throw new Error(`unknown permission \`${permission}\` in filter \`hasGuildPermission\``);
    }

    const [name] = field;

    function execute(context: Context): boolean {
      if (context.member !== null) {
        if (typeof context.member.permissions === 'string') {
          return new PermissionsBitField(BigInt(context.member.permissions)).has(b);
        }

        return context.member.permissions.has(b);
      }

      return true;
    }

    return new this(new Criteria('hasGuildPermission', execute, []), `has guild permission: ${name}`)
  }

  public static hasChannelPermission(permission: PermissionResolvable, channelId?: string): FilterImpl {
    const b = PermissionsBitField.resolve(permission);
    const field = Object.entries(PermissionsBitField.Flags).find(([,v]) => v === b);

    if (field === undefined) {
      throw new Error(`unknown permission \`${permission}\` in filter \`hasChannelPermission\``);
    }

    const [name] = field;

    function execute(context: Context): boolean {
      if (context.member !== null) {
        const channel = (channelId !== undefined) ? context.guild?.channels.cache.get(channelId) : context.channel;

        // ?
        if (channel === undefined || channel === null) { return false; }

        if (channel.isDMBased()) {
          return true;
        }

        const field2 = channel.permissionsFor(context.user);

        // assume we have no permission overrides
        if (field2 === null) {
          if (context.member !== null) {
            if (typeof context.member.permissions === 'string') {
              return new PermissionsBitField(BigInt(context.member.permissions)).has(b);
            }
    
            return context.member.permissions.has(b);
          }
    
          return false;
        }

        return field2.has(b);
      }

      return true;
    }

    return new this(new Criteria('hasChannelPermission', execute, []), channelId !== undefined ? `has channel permission ${name} in <#${channelId}>` : `has channel permission ${name}`);
  }

  public static canAddReactions(channelId?: string): FilterImpl {
		return this.hasChannelPermission('AddReactions', channelId);
	}

	public static canAttachFiles(channelId?: string): FilterImpl {
		return this.hasChannelPermission('AttachFiles', channelId);
	}

	public static canBanMembers(): FilterImpl {
		return this.hasGuildPermission('BanMembers');
	}

	public static canChangeNickname(): FilterImpl {
		return this.hasGuildPermission('ChangeNickname');
	}

	public static canConnect(channelId?: string): FilterImpl {
		return this.hasChannelPermission('Connect', channelId);
	}

	public static canCreateInstantInvite(channelId?: string): FilterImpl {
		return this.hasChannelPermission('CreateInstantInvite', channelId);
	}

	public static canDeafenMembers(channelId?: string): FilterImpl {
		return this.hasChannelPermission('DeafenMembers', channelId);
	}

	public static canEmbedLinks(channelId?: string): FilterImpl {
		return this.hasChannelPermission('EmbedLinks', channelId);
	}

	public static canKickMembers(): FilterImpl {
		return this.hasGuildPermission('KickMembers');
	}

	public static canManageChannelWebhooks(channelId?: string): FilterImpl {
		return this.hasChannelPermission('ManageWebhooks', channelId);
	}

	public static canManageChannels(channelId?: string): FilterImpl {
		return this.hasChannelPermission('ManageChannels', channelId);
	}

	public static canManageEmojisAndStickers(): FilterImpl {
		return this.hasGuildPermission('ManageEmojisAndStickers');
	}

	public static canManageGuild(): FilterImpl {
		return this.hasGuildPermission('ManageGuild');
	}

	public static canManageGuildWebhooks(): FilterImpl {
		return this.hasGuildPermission('ManageWebhooks');
	}

	public static canManageMessages(channelId?: string): FilterImpl {
		return this.hasChannelPermission('ManageMessages', channelId);
	}

	public static canManageNicknames(): FilterImpl {
		return this.hasGuildPermission('ManageNicknames');
	}

	public static canManageRoles(): FilterImpl {
		return this.hasGuildPermission('ManageRoles');
	}

	public static canMentionEveryone(channelId?: string): FilterImpl {
		return this.hasChannelPermission('MentionEveryone', channelId);
	}

	public static canMoveMembers(channelId?: string): FilterImpl {
		return this.hasChannelPermission('MoveMembers', channelId);
	}

	public static canMuteMembers(channelId?: string): FilterImpl {
		return this.hasChannelPermission('MuteMembers', channelId);
	}

	public static canPrioritySpeaker(channelId?: string): FilterImpl {
		return this.hasChannelPermission('PrioritySpeaker', channelId);
	}

	public static canReadMessageHistory(channelId?: string): FilterImpl {
		return this.hasChannelPermission('ReadMessageHistory', channelId);
	}

	public static canViewChannel(channelId: string): FilterImpl {
		return this.hasChannelPermission('ViewChannel', channelId);
	}

	public static canSendMessages(channelId: string): FilterImpl {
		return this.hasChannelPermission('SendMessages', channelId);
	}

	public static canSendTtsMessages(channelId?: string): FilterImpl {
		return this.hasChannelPermission('SendTTSMessages', channelId);
	}

	public static canSpeak(channelId?: string): FilterImpl {
		return this.hasChannelPermission('Speak', channelId);
	}

	public static canStream(channelId?: string): FilterImpl {
		return this.hasChannelPermission('Stream', channelId);
	}

	public static canUseExternalEmojis(channelId?: string): FilterImpl {
		return this.hasChannelPermission('UseExternalEmojis', channelId);
	}

	public static canUseVoiceActivity(channelId?: string): FilterImpl {
		return this.hasChannelPermission('UseVAD', channelId);
	}

	public static canViewAuditLog(): FilterImpl {
		return this.hasGuildPermission('ViewAuditLog');
	}

	public static canViewGuildInsights(): FilterImpl {
		return this.hasGuildPermission('ViewGuildInsights');
	}

	public static channelIdIn(channelIds: Array<string>): FilterImpl {
    function execute(context: Context): boolean {
      return channelIds.includes(context.isMessage() ? context.message.channelId : context.interaction.channelId);
    }

		return new this(
			new Criteria(
				'channelIdIn',
				execute,
				[],
      ),
			`channel is one of: ${channelIds.map((v) => `<#${v}>`).join(', ')}`
		);
	}

	public static hasEveryRole(roles: Array<string>): FilterImpl {
		return this.withCustomMessage(
			this.and(...roles.map((v) => this.hasRole(v))),
			`has all of: ${roles.map((v) => `<@&${v}>`).join(', ')}`
		);
	}

	public static hasMentionableRole(): FilterImpl {
    function execute(context: Context): boolean {
      if (context.member !== null) {
        if (context.member.roles instanceof GuildMemberRoleManager) {
          return context.member.roles.cache.filter(x => x.mentionable === true).size > 0;
        }

        if (context.guild === null) {
          return false;
        }

        return context.member.roles.map(roleId => context.guild!.roles.cache.get(roleId)).filter(x => x !== undefined).some(x => x!.mentionable);
      }

      return false;
    }
		return new this(
			new Criteria('hasMentionableRole', execute, []),
			'has a mentionable role'
		);
	}

	public static hasNickname(nickname?: string): FilterImpl {
    function execute(context: Context): boolean {
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

        return context.member.nick !== null && context.member.nick !== undefined;
      }

      // dm members can technically have nicknames but they're per-user, so this should never be true.
      return false;
    }
		return new this(
			new Criteria('hasNickname', execute, []),
			'has a nickname'
		);
	}

	public static hasParentId(parentId: string): FilterImpl {
    function execute(context: Context): boolean {
      if (context.channel !== null) {
        if (context.channel.isDMBased()) { return false; }

        return context.channel.parentId === parentId;
      }

      return false;
    }

		return new this(
			new Criteria('hasParentId', execute, []),
			`has channel parent <#${parentId}>`
		);
	}

	public static hasRole(roleId: string): FilterImpl {
    function execute(context: Context): boolean {
      if (context.member !== null) {
        if (context.member.roles instanceof GuildMemberRoleManager) {
          return context.member.roles.cache.has(roleId);
        }

        if (context.guild === null) {
          return false;
        }

        return context.member.roles.includes(roleId);
      }

      // assume dm members have every role ever.
      return true;
    }

		return new this(
			new Criteria('hasRole', execute, []),
			`has role <@&${roleId}>`
		);
	}

	public static hasSomeRole(roles: Array<string>): FilterImpl {
		return this.withCustomMessage(
			this.or(...roles.map((role) => this.hasRole(role))),
			`has any of: ${roles.map((v) => `<@&${v}>`).join(', ')}`
		);
	}

	public static isAdministator(): FilterImpl {
		return this.hasGuildPermission('Administrator');
	}

	public static isChannelId(channelId: string): FilterImpl {
    function execute(context: Context): boolean {
      if (context.isMessage()) {
        return context.message.channelId === channelId;
      }

      return context.interaction.channelId === channelId;
    }

		return new this(
			new Criteria('isChannelId', execute, []),
			`is channel <#${channelId}>`
		);
	}

	public static isChannelNsfw(): FilterImpl {
    function execute(context: Context): boolean {
      if (context.channel !== null) {
        if (context.channel.isDMBased() || context.channel.isThread()) { return false; }

        return context.channel.nsfw;
      }

      return false;
    }
		return new this(
			new Criteria('isChannelNsfw', execute, []),
			'channel marked as nsfw'
		);
	}

	public static isGuildOwner(): FilterImpl {
    function execute(context: Context): boolean {
      if (context.guild !== null) {
        return context.guild.ownerId === context.user.id;
      }

      return true;
    }
		return new this(
			new Criteria('isGuildOwner', execute, []),
			'is guild owner'
		);
	}

	public static isBotOwner(): FilterImpl {
    function execute(context: Context): boolean {
      if (context.client.application !== null) {
        if (context.client.application.owner !== null) {
          if (context.client.application.owner instanceof User) {
            return context.user.id === context.client.application.owner.id;
          }

          return context.client.application.owner.members.has(context.user.id);
        }
      }

      // nope
      return false;
    }
		return new this(
			new Criteria('isBotOwner', execute, []),
			'is bot owner'
		);
	}

	public static isUserId(userId: string): FilterImpl {
    function execute(context: Context): boolean {
      return context.user.id === userId;
    }
		return new this(
			new Criteria('isUserId', execute, []),
			`is user: <@${userId}>`
		);
	}

	public static parentIdIn(parentIds: Array<string>): FilterImpl {
		return this.withCustomMessage(
			this.or(...parentIds.map((v) => this.hasParentId(v))),
			`channel parent is one of: ${parentIds.map((v) => `<#${v}>`).join(', ')}`
		);
	}

	public static userIdIn(userIds: Array<string>): FilterImpl {
		return this.withCustomMessage(
			this.or(...userIds.map((v) => this.isUserId(v))),
			`user is one of: ${userIds.map((v) => `<@${v}>`).join(', ')}`
		);
	}

	public static isInGuild(): FilterImpl {
    function execute(context: Context): boolean {
      return context.guildId !== null;
    }

		return new this(
			new Criteria('isInGuild', execute, []),
			'is in guild'
		);
	}

	public static isInDm(): FilterImpl {
		return this.withCustomMessage(this.not(this.isInGuild()), 'is in dm');
	}

  public static never(): FilterImpl {
    function execute(context: Context): boolean { void context; return false; }
    return new this(new Criteria('never', execute, []), 'never');
  }

  public static always(): FilterImpl {
    function execute(context: Context): boolean { void context; return true; }
    return new this(new Criteria('always', execute, []), 'always');
  }
}

export type FilterOptions = [
  filters: Array<FilterImpl>,
  onFailed?: (context: Context, filters: Array<FilterImpl>) => unknown,
]

/**
 * Generalized `filter` plugin.
 *
 * @author @trueharuu [<@504698587221852172>]
 * @version 1.0.0
 * @example ```ts
 * import { filter } from '../plugins/filter';
 * import { commandModule } from '@sern/handler';
 * 
 * export default commandModule({
 *     plugins: filter([filter.not(filter.isGuildOwner()), filter.canMentionEveryone()]),
 *     async execute(context) {
 *       // your code here
 *     }
 * });
 * ```
 */
export const filter = Object.assign({}, FilterImpl, (options: FilterOptions) => {
  return CommandControlPlugin<CommandType.Both>(async (context) => {
    const value = filter.and(...options[0]).test(context);

    if (value) {
      return controller.next();
    }

    if (options[1] !== undefined) {
      await options[1](context, options[0]);
    } else {
      await context.reply({
        ephemeral: true,
        content: `you do not match the criteria for this command:\n${options[0].map(x=>x.message).filter(x=>x !== undefined).join('\n')}`,
        allowedMentions: {
          repliedUser: false,
          parse: []
        }
      });
    }

    return controller.stop();
  });
})
