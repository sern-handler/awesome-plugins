//@ts-nocheck
/**
 * @plugin
 * Inspired by the plugin "requirePermission" created by Benzo-Fury & needhamgary, this plugin will set permissions for specific subcommands without manually writing it into the code.
 *
 * @author @Peter-MJ-Parker [<@371759410009341952>]
 * @author @MaxiIsSlayy [<@237210568791031809>]
 * @version 1.0.1
 * @example
 * ```ts
 * import { subcommandPermCheck } from "../plugins/subcommandPerms.js";
 * import { commandModule, CommandType } from "@sern/handler";
 * import { PermissionFlagBits } from "discord.js";
 * export default commandModule({
 *  type: CommandType.Slash,
 *  plugins: [
 *   subcommandPermCheck({
 *    list: [
 *      { name: "string", perms: [PermissionFlagBits.Administrator] },
 *      { name: "number", perms: [PermissionFlagBits.SendMessages, PermissionFlagBits.UseVAD] }
 *    ],
 *   needAllPerms: true, //all = Require the member to have all perms stated or at least one?
 *   //response: "OPTIONAL - respond to user with this message or default."
 *   })
 *  ],
 *  execute: ({ interaction }) => {
 * 		//your code here
 *  }
 * })
 * ```
 * @end
 */
import type { GuildMember, PermissionResolvable, TextChannel, PermissionsBitField } from 'discord.js';
import { type CommandType, CommandControlPlugin, controller } from '@sern/handler';

export const permsToString = (...perms: PermissionResolvable[]) => {
  return new PermissionsBitField(perms)
    .toArray()
    .map((perm) => `\`${perm}\``)
    .join(", ");
};

export function subcommandPermCheck(opts: Options) {
  return CommandControlPlugin<CommandType.Slash>(async (ctx) => {
    if (!ctx.isSlash()) {
      throw new Error('You did not provide a slash command.', { cause: "The plugin 'subcommandPermCheck' is meant for Slash commands only!" });
      return controller.stop();
    }

    if (ctx.guild === null) {
      ctx.reply("PermCheck > A command stopped because we couldn't check a users permissions (was used in dms)");
      return controller.stop();
    }
    const member = ctx.member as GuildMember;
    const subcommands = opts.list;
    let subs = ctx.options.getSubcommand();

    if (!subcommands.some((opt) => opt.subcommand === subs)) {
      throw new Error("You provided a subcommand name which doesn't exist in given command.", {
        cause: `${subs} not found on command: ${ctx.interaction.commandName}.`
      });
      return controller.stop();
    }
    for (const { name, perms } of subcommands) {
        const each = permsToString(perms);
        const { needAllPerms } = opts;
        const memberPermissions = member.permissionsIn(ctx.channel as TextChannel);
        if (needAllPerms === true) {
          if (!memberPermissions.has(perms)) {
            await ctx.reply({
              content:
                opts.response ??
                `You are required to have all of the following permissions to run this subcommand in this channel:\n${each}`,
              ephemeral: true
            });
            return controller.stop();
          }
        } else {
          if (!memberPermissions.any(perms)) {
            await ctx.reply({
              content:
                opts.response ??
                `You are required to have at least one of the following permissions to run this subcommand in this channel:\n${each}`,
              ephemeral: true
            });
            return controller.stop();
          }
        }
    }
    return controller.next();
  });
}

interface Options {
  list: { name: string; perms: PermissionResolvable[] }[];
  needAllPerms: boolean;
  response?: string;
}
