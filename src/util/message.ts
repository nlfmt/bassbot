import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  MessageFlagsBitField,
  type APIEmbed,
  type MessageCreateOptions,
} from "discord.js"
import { type Track } from "shoukaku"
import { cleanTrackTitle } from "./helpers"

export const EmbedColor = {
  Error: 0xe25d50,
  Warn: 0xff8f30,
  Success: 0x43b581,
  Info: 0x7289da,
  White90: 0xe6e6e6,
} as const

/** takes a number of seconds and returns a duration string */
export function duration(s: number) {
  s = Math.round(s)
  const h = Math.floor(s / 3600)
  s -= h * 3600
  const m = Math.floor(s / 60)
  s -= m * 60
  return (h > 0 ? `${h}h ` : "") + (m > 0 ? `${m}m ` : "") + `${s}s`
}

export function code(msg: unknown) {
  return `\`\`\`${msg}\`\`\``
}

export type EmbedOpts = {
  title?: string
  color?: number
  timestamp?: boolean
  fields?: { name: string; value: string; inline?: boolean }[]
  footer?: { text: string; icon_url?: string }
  ephemeral?: boolean
}

export function createMessageEmbed(msg: string, opts?: EmbedOpts) {
  const embed: APIEmbed = {
    title: opts?.title,
    color: opts?.color,
    description: msg,
    timestamp: opts?.timestamp ? new Date().toISOString() : undefined,

    fields: opts?.fields ? opts?.fields : [],
    footer: opts?.footer,
  }
  return embed
}

export function embedMsg(msg: string, opts?: EmbedOpts) {
  return {
    embeds: [createMessageEmbed(msg, opts)],
  }
}

export function nowPlayingButtons(paused: boolean) {
  return new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder().setCustomId("prev").setLabel("Prev").setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId("pause")
      .setLabel(paused ? "Resume" : "Pause")
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId("next").setLabel("Next").setStyle(ButtonStyle.Secondary)
  )
}

export function nowPlayingEmbed(track: Track) {
  const title = cleanTrackTitle(track)
  const padding = "\u00A0".repeat(20)
  const embed = new EmbedBuilder()
    .setTitle("Now Playing")
    .setDescription(`[${title}](${track.info.uri})${padding}\nby ${track.info.author}\n`)
    .setThumbnail(track.info.artworkUrl ?? null)
    .setColor(EmbedColor.White90)

  const row = nowPlayingButtons(false)

  return {
    embeds: [embed],
    components: [row],
    flags: [MessageFlagsBitField.Flags.SuppressNotifications],
  } satisfies MessageCreateOptions
}
