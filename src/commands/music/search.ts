import { createCommand } from "@/util/command";
import { createMessageEmbed } from "@/util/message";
import { ActionRowBuilder, ApplicationCommandOptionType, ComponentType, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } from "discord.js";
import { LoadType } from "shoukaku";

function abbreviateString(str: string, maxLen: number) {
  return str.length > maxLen ? str.slice(0, maxLen - 3) + "..." : str
}

export default createCommand({
  description: "Search for a song.",
  options: [
    {
      name: "query",
      description: "The song you want to search for.",
      type: ApplicationCommandOptionType.String,
      required: true,
    },
  ],

  run: async ({ i, options, reply, bot }) => {
    console.log("search")
    const node = bot.lava.getIdealNode()
    if (!node) {
      return reply.error("No available nodes.");
    }
    
    const result = await Promise.all([
      node.rest.resolve(`spsearch:${options.query}`),
      node.rest.resolve(`ytmsearch:${options.query}`),
    ])
    
    const songs = result
      .map((r) => (r && r.loadType === LoadType.SEARCH ? r.data : []))
      .flat()
      .splice(0, 25)

    if (songs.length === 0) return reply.error("No results found.")
      
    const select = new StringSelectMenuBuilder()
      .setCustomId("song-select")
      .setPlaceholder("Select a song...")
      .addOptions(
        songs.map((track, i) =>
          new StringSelectMenuOptionBuilder()
            .setLabel(abbreviateString(track.info.title, 100))
            .setValue(i.toString())
            .setDescription(track.info.author)
        ),
      )
      
    const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(select)
    
    const response = await i.reply({
      embeds: [createMessageEmbed(`${songs.length} results found, select one:`)],
      components: [row],
      withResponse: true,
      flags: "Ephemeral",
    })
    
    try {
      const confirmation = await response.resource?.message?.awaitMessageComponent<ComponentType.StringSelect>({
        time: 120_000,
      })
      
      if (confirmation?.customId === "song-select") {
        const selection = confirmation.values[0]!
        const track = songs[parseInt(selection)]!

        const player = bot.getPlayer(i.guildId) ?? (await bot.joinVC(i))
        await player.addTrack(track, false)

        await i.editReply({
          embeds: [
            createMessageEmbed(
              `Queued **${track.info.title}** by **${track.info.author}**`,
            ),
          ],
          components: [],
        })
      }
    } catch(_e) {
      await i.editReply({ embeds: [createMessageEmbed("You took too long to select a song.")], components: [] })
    }
  },
})