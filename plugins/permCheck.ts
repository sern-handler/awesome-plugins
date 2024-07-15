/**
 * @plugin
 * This is perm check, it allows users to parse the permission you want and let the plugin do the rest. (check user for that perm).
 * Each function (other than "command") allows multiple options! [ { ... }, { ... }, { ... } ] See examples!
 *
 * @author @Benzo-Fury [<@762918086349029386>]
 * @author @Peter-MJ-Parker [<@371759410009341952>]
 * @author @MaxiIsSlayy [<@237210568791031809>]
 * @version 2.1.0
 * @example
 * ```ts
 * import { permCheck } from "../plugins/permCheck";
 * import { commandModule } from "@sern/handler";
 * export default commandModule({
 *  plugins: [ permCheck(["Administrator", "AddReactions"], "I am a custom response!"),
 * 		permCheck.options([{ name: "user", needAllPerms: true, perms: ["AttachFiles", "CreateEvents"]}]),
 * 		permCheck.subcommands([{ name: "list", needAllPerms: false, perms: ["Connect"]}]),
 * 		permCheck.subGroups([{ name: "list", needAllPerms: false, perms: ["Connect"], response: "I am also a custom response!"}])],
 *  execute: (ctx) => {
 * 		//your code here
 *  }
 * })
 * ```
 * @end
 */

import {
  Colors,
  EmbedBuilder,
  PermissionsBitField,
  type GuildMember,
  type PermissionResolvable,
  type TextChannel,
} from "discord.js";
import {
  CommandControlPlugin,
  type CommandType,
  controller,
  Service,
} from "@sern/handler";

function command(perm: PermissionResolvable, response?: string) {
  return CommandControlPlugin<CommandType.Both>(async (ctx) => {
    if (ctx.guild === null) {
      await ctx.reply({
        content: "This command cannot be used in DM's!",
        ephemeral: !ctx.isMessage(),
      });
      return controller.stop();
    }
    const _perms = (ctx.member as GuildMember).permissionsIn(
      ctx.channel as TextChannel
    );
    if (!_perms.has(perm)) {
      await ctx.reply({
        embeds: [
          sendEmbed(
            response ??
              `You are missing required permissions to run this command:\n${permsToString(
                perm
              )}`
          ),
        ],
        ephemeral: !ctx.isMessage(),
      });
      return controller.stop();
    }
    if (!_perms.any(perm)) {
      await ctx.reply({
        embeds: [
          sendEmbed(
            response ??
              `You need at least one of the following permissions to run this command:\n${permsToString(
                perm
              )}`
          ),
        ],
        ephemeral: !ctx.isMessage(),
      });
      return controller.stop();
    }
    return controller.next();
  });
}
function subGroups(opts: BaseOptions[]) {
  return CommandControlPlugin<CommandType.Slash>(async (ctx) => {
    if (ctx.isMessage()) {
      return controller.stop()
    }
    if (ctx.guild === null) {
      await ctx.reply({
        content: "This sub command group cannot be used in DM's!",
        ephemeral: true,
      });
      return controller.stop();
    }

    const member = ctx.member as GuildMember;
    const group = ctx.options.getSubcommandGroup();
    const opt = opts.find((o) => o.name === group);

    if (!opt) {
      await ctx.reply({
        embeds: [
          sendEmbed(
            `[PLUGIN_permCheck.subGroups]: Failed to find specified subcommandGroup \`${group}\`!`
          ),
        ],
        ephemeral: true,
      });
      return controller.stop();
    }

    const _perms = member.permissionsIn(ctx.channel as TextChannel);

    if (opt.needAllPerms && !_perms.has(opt.perms)) {
      await ctx.reply({
        embeds: [
          sendEmbed(
            opt.response ??
              `You cannot use this group due to missing permissions: ${permsToString(
                opt.perms
              )}`
          ),
        ],
        ephemeral: true,
      });
      return controller.stop();
    }

    if (!opt.needAllPerms && !_perms.any(opt.perms)) {
      await ctx.reply({
        embeds: [
          sendEmbed(
            opt.response ??
              `You cannot use this group because you need at least one of the following permissions: ${permsToString(
                opt.perms
              )}`
          ),
        ],
        ephemeral: true,
      });
      return controller.stop();
    }

    return controller.next();
  });
}

function subcommands(opts: BaseOptions[]) {
  return CommandControlPlugin<CommandType.Slash>(async (ctx) => {
    if (ctx.isMessage()) {
      return controller.stop()
    }
    if (ctx.guild === null) {
      await ctx.reply({
        content: "This sub command cannot be used in DM's!",
        ephemeral: true,
      });
      return controller.stop();
    }

    const member = ctx.member as GuildMember;
    const sub = ctx.options.getSubcommand();
    const opt = opts.find((o) => o.name === sub);

    if (!opt) {
      await ctx.reply({
        embeds: [
          sendEmbed(
            `[PLUGIN_permCheck.subcommands]: Failed to find specified subcommand \`${sub}\`!`
          ),
        ],
        ephemeral: true,
      });
      return controller.stop();
    }

    const _perms = member.permissionsIn(ctx.channel as TextChannel);

    if (opt.needAllPerms && !_perms.has(opt.perms)) {
      await ctx.reply({
        embeds: [
          sendEmbed(
            opt.response ??
              `You cannot use this subcommand due to missing permissions: ${permsToString(
                opt.perms
              )}`
          ),
        ],
        ephemeral: true,
      });
      return controller.stop();
    }

    if (!opt.needAllPerms && !_perms.any(opt.perms)) {
      await ctx.reply({
        embeds: [
          sendEmbed(
            opt.response ??
              `You cannot use this subcommand because you need at least one of the following permissions: ${permsToString(
                opt.perms
              )}`
          ),
        ],
        ephemeral: true,
      });
      return controller.stop();
    }

    return controller.next();
  });
}

function options(opts: BaseOptions[]) {
  return CommandControlPlugin<CommandType.Slash>(async (ctx) => {
    if (ctx.isMessage()) {
      return controller.stop()
    }
    if (ctx.guild === null) {
      await ctx.reply({
        content: "This specific option cannot be used in DM's!",
        ephemeral: true,
      });
      return controller.stop();
    }

    const member = ctx.member as GuildMember;
    const channel = ctx.channel as TextChannel;

    for (const opt of opts) {
      const option = ctx.options.get(opt.name);

      if (!option) {
        await ctx.reply({
          embeds: [
            sendEmbed(
              `[PLUGIN_permCheck.options]: Could not find supplied option: \`${opt.name}\``
            ),
          ],
          ephemeral: true,
        });
        return controller.stop();
      }

      const permissions = member.permissionsIn(channel);

      if (opt.needAllPerms) {
        if (!permissions.has(opt.perms)) {
          await ctx.reply({
            embeds: [
              sendEmbed(
                opt.response ??
                  `You need all the following permissions for option \`${
                    opt.name
                  }\`:\n ${permsToString(opt.perms)}`
              ),
            ],
            ephemeral: true,
          });
          return controller.stop();
        }
      } else {
        if (!permissions.any(opt.perms)) {
          await ctx.reply({
            embeds: [
              sendEmbed(
                opt.response ??
                  `You need at least one of the following permissions for option \`${
                    opt.name
                  }\`: \n${permsToString(opt.perms)}`
              ),
            ],
            ephemeral: true,
          });
          return controller.stop();
        }
      }
    }

    return controller.next();
  });
}

interface BaseOptions {
  name: string;
  perms: PermissionResolvable[];
  needAllPerms: boolean;
  response?: string;
}

const sendEmbed = (description: string) => {
  const client = Service("@sern/client");
  return new EmbedBuilder({
    title: ":x: Permission Error! :x:",
    description,
    color: Colors.Red,
    footer: {
      text: client.user?.username!,
      icon_url: client.user?.displayAvatarURL()!,
    },
  });
};

export const permsToString = (perms: PermissionResolvable) => {
  return new PermissionsBitField(perms)
    .toArray()
    .map((perm) => `\`${perm}\``)
    .join(", ");
};

export const permCheck = Object.assign(command, {
  command,
  subGroups,
  subcommands,
  options,
});
