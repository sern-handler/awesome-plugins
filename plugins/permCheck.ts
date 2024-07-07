//@ts-nocheck
/**
 * @plugin
 * This is perm check, it allows users to parse the permission you want and let the plugin do the rest. (check user for that perm).
 * Each function (other than "command") allows multiple options! [ { ... }, { ... }, { ... } ] See examples!
 *
 * @author @Benzo-Fury [<@762918086349029386>]
 * @author @Peter-MJ-Parker [<@371759410009341952>]
 * @version 2.0.0
 * @example
 * ```ts
 * import { permCheck } from "../plugins/permCheck";
 * import { commandModule } from "@sern/handler";
 * import { PermissionFlagsBits } from "discord.js";
 * export default commandModule({
 *  plugins: [
 * 		//permCheck.command("permission", "response")
 * 		//permCheck.subGroups([{ name: "test", perms: <Permissions>, needAllPerms: boolean, response?: "set me for custom response"}, { ...other_group_setup }])
 * 		//permCheck.subcommands([ { name: "testAgain", ...same options }, { ... } ])
 * 		//permCheck.options([ {}, {} ]) WIP!
 * 	],
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
  type TextChannel
} from "discord.js";
import {
  CommandControlPlugin,
  CommandType,
  controller,
  Service
} from "@sern/handler";

function command(perm: PermissionResolvable, response?: string) {
  return CommandControlPlugin<CommandType.Both>(async (ctx) => {
    if (ctx.guild === null) {
      await ctx.reply("This command cannot be used in DM's!");
      return controller.stop();
    }
    if (
      !(ctx.member! as GuildMember)
        .permissionsIn(ctx.channel as TextChannel)
        .has(perm)
    ) {
      await ctx.reply({
        embeds: [
          sendEmbed(
            response ??
              `You are missing required permissions to run this command:\n${permsToString(perm)}`
          )
        ],
        ephemeral: ctx.isMessage() ? false : true
      });
      return controller.stop();
    }
    if (
      !(ctx.member! as GuildMember)
        .permissionsIn(ctx.channel as TextChannel)
        .any(perm)
    ) {
      await ctx.reply({
        embeds: [
          sendEmbed(
            response ??
              `You need at least one of the following permissions to run this command:\n${permsToString(perm)}`
          )
        ],
        ephemeral: ctx.isMessage() ? false : true
      });
      return controller.stop();
    }
    return controller.next();
  });
}
function subGroups(opts: BaseOptions[]) {
  return CommandControlPlugin<CommandType.Slash>(async ({ interaction }) => {
    await no_guild(interaction);
    const member = interaction.member as GuildMember;
    const group = interaction.options.getSubcommandGroup();
    for (const opt of opts) {
      if (group !== opt.name) {
        await interaction.reply({
          embeds: [
            sendEmbed(
              `[PLUGIN_permCheck.subGroups]: Failed to find specified subcommandGroup \`${opt.name}\`!`
            )
          ],
          ephemeral: true
        });
        return controller.stop();
      }
      const _perms = member.permissionsIn(interaction.channel as TextChannel);
      if (opt.needAllPerms && !_perms.has(opt.perms)) {
        await interaction.reply({
          embeds: [
            sendEmbed(
              opt.response ??
                `You cannot use this group due to missing permissions: ${permsToString(opt.perms)}`
            )
          ],
          ephemeral: true
        });
        return controller.stop();
      }
      if (!opt.needAllPerms && !_perms.any(opt.perms)) {
        await interaction.reply({
          embeds: [
            sendEmbed(
              opt.response ??
                `You cannot use this group because you need at least one of the following permissions: ${permsToString(opt.perms)}`
            )
          ],
          ephemeral: true
        });
        return controller.stop();
      }
    }
    return controller.next();
  });
}

function subcommands(opts: BaseOptions[]) {
  return CommandControlPlugin<CommandType.Slash>(async ({ interaction }) => {
    await no_guild(interaction);
    const member = interaction.member as GuildMember;
    const sub = interaction.options.getSubcommand();
    for (const opt of opts) {
      if (sub !== opt.name) {
        await interaction.reply({
          embeds: [
            sendEmbed(
              `[PLUGIN_permCheck.subcommands]: Failed to find specified subcommand \`${opt.name}\`!`
            )
          ],
          ephemeral: true
        });
        return controller.stop();
      }
      const _perms = member.permissionsIn(interaction.channel as TextChannel);
      if (opt.needAllPerms && !_perms.has(opt.perms)) {
        await interaction.reply({
          embeds: [
            sendEmbed(
              opt.response ??
                `You cannot use this subcommand due to missing permissions: ${permsToString(opt.perms)}`
            )
          ],
          ephemeral: true
        });
        return controller.stop();
      }
      if (!opt.needAllPerms && !_perms.any(opt.perms)) {
        await interaction.reply({
          embeds: [
            sendEmbed(
              opt.response ??
                `You cannot use this subcommand because you need at least one of the following permissions: ${permsToString(opt.perms)}`
            )
          ],
          ephemeral: true
        });
        return controller.stop();
      }
    }
    return controller.next();
  });
}
function options(opts: BaseOptions[]) {
  return CommandControlPlugin<CommandType.Slash>(async ({ interaction }) => {
    await no_guild(interaction);
    const member = interaction.member as GuildMember;
    const channel = interaction.channel as TextChannel;

    for (const opt of opts) {
      const option = interaction.options.get(opt.name);
      console.log(option);

      if (option && option.name !== opt.name) {
        await interaction.reply({
          embeds: [
            sendEmbed(
              `[PLUGIN_permCheck.options]: Could not find supplied option: \`${opt.name}\``
            )
          ],
          ephemeral: true
        });
        return controller.stop();
      }

      const permissions = member.permissionsIn(channel);

      console.log(permsToString(permissions));
      if (opt.needAllPerms) {
        if (!permissions.has(opt.perms)) {
          await interaction.reply({
            embeds: [
              sendEmbed(
                opt.response ??
                  `You need all the following permissions for option \`${opt.name}\`:\n ${permsToString(...opt.perms)}`
              )
            ],
            ephemeral: true
          });
          return controller.stop();
        }
      } else {
        if (!permissions.any(opt.perms)) {
          await interaction.reply({
            embeds: [
              sendEmbed(
                opt.response ??
                  `You need at least one of the following permissions for option \`${opt.name}\`: \n${permsToString(...opt.perms)}`
              )
            ],
            ephemeral: true
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

const no_guild = async (interaction: any) => {
  if (interaction.guild === null) {
    await interaction.reply({
      content: "This command cannot be used in DM's!",
      ephemeral: true
    });
    return controller.stop();
  }
};

const sendEmbed = (description: string) => {
  const client = Service("@sern/client");
  return new EmbedBuilder({
    title: ":x: Permission Error! :x:",
    description,
    color: Colors.Red,
    footer: {
      text: client.user?.username!,
      icon_url: client.user?.displayAvatarURL()!
    }
  });
};

export const permsToString = (...perms: PermissionResolvable[]) => {
  return new PermissionsBitField(perms)
    .toArray()
    .map((perm) => `\`${perm}\``)
    .join(", ");
};

export const permCheck = { command, options, subcommands, subGroups };
