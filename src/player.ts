import type { ChatInputCommandInteraction, GuildTextBasedChannel } from "discord.js"
import { Constants, Player, type Track } from "shoukaku"
import { createMessageEmbed, EmbedColor, nowPlayingButtons, nowPlayingMessage } from "./util/message"
import type { BassBot } from "./bot"
import logger from "./util/logger"

export const LoopMode = {
  None: "None",
  Song: "Song",
  Queue: "Queue",
  Autoplay: "Autoplay",
} as const
export type LoopMode = keyof typeof LoopMode

export class PlayerWithQueue extends Player {
  public history: Track[] = []
  private _current?: Track
  public queue: Track[] = []

  public textChannel: GuildTextBasedChannel | null = null
  public bot!: BassBot
  
  private playerMsgId: string | null = null
  private _disconnect: ReturnType<typeof setTimeout> | null = null
  private loopMode: LoopMode = LoopMode.None

  init(bot: BassBot, i: ChatInputCommandInteraction<"cached">) {
    this.bot = bot
    this.textChannel = i.channel

    this.on("end", async ({ reason }) => {
      if (this.playerMsgId && this.textChannel) {
        this.textChannel.messages.delete(this.playerMsgId).catch(() => {
          logger.warn(`Failed to delete player message with id: ${this.playerMsgId}`)
        })
      }

      if (reason != "finished" && reason != "loadFailed") return

      if (this.loopMode == LoopMode.Song)
        return this.play(this.current)
      
      // Swap history and queue
      if (this.loopMode == LoopMode.Queue && this.queue.length == 0) {
        if (this._current) {
          this.history.push(this._current)
          this._current = undefined
        }
        if (this.history.length > 0) {
          this.queue.push(this.history.shift()!)
        }
        return this.next()
      }
      else if (this.loopMode == LoopMode.Autoplay) {
        // TODO: Implement autoplay
        await this.next()
      }
      await this.next()
    })

    this.on("start", async (data) => {
      if (!this.textChannel) return
      const msg = await this.textChannel.send(nowPlayingMessage(data.track))
      this.playerMsgId = msg.id

      logger.info(`[${i.guild} > ${i.member.voice.channel?.name} @ ${this.node.name}] ${data.track.info.title} - ${data.track.info.author}`)
    })

    this.on("exception", async ({ exception }) => {
      if (!this.textChannel) return

      await this.textChannel.send({
        embeds: [
          createMessageEmbed(`An error occurred while playing the track: ${exception.message}`, {
            color: EmbedColor.Error,
          }),
        ],
      })
    })

    this.on("closed", async () => {
      if (this.node.state !== Constants.State.CONNECTED) return
      await this.disconnect()
    })

    this.bot.on("voiceStateUpdate", (prev, next) => {
      const currentVC = this.bot.guilds.cache.get(this.guildId)?.members.me?.voice.channel
      if (!currentVC) return

      if (prev.channelId !== currentVC.id && next.channelId !== currentVC.id) return
      const members = currentVC.members.filter((m) => !m.user.bot)

      if (members.size == 0) this.scheduleDisconnect()
      else this.cancelDisconnect()
    })
  }

  public get current() {
    return this._current
  }

  public async play(track: Track | undefined) {
    this._current = track
    if (!track) {
      await this.stopTrack()
      this.scheduleDisconnect()
      return
    }

    this.cancelDisconnect()
    await this.playTrack({
      track: { encoded: track.encoded },
      paused: false,
      volume: 50,
    }, false)
  }

  public async next(pos: number | null = null) {
    if (this.current) this.history.push(this.current)
    if (pos && pos > 1) {
      const skipped = this.queue.splice(0, pos - 1)
      this.history.push(...skipped)
    }
    await this.play(this.queue.shift())
  }

  public async prev() {
    if (this.current) this.queue.unshift(this.current)
    await this.play(this.history.pop())
  }

  public async addTracks(tracks: Track[], next = false) {
    if (next) this.queue.unshift(...tracks)
    else this.queue.push(...tracks)
    if (!this.current) await this.next()
  }
  public addTrack(track: Track, next = false) {
    return this.addTracks([track], next)
  }

  public shuffle() {
    for (let i = 0; i < this.queue.length; i++) {
      const ri = Math.floor(Math.random() * this.queue.length)

      const tmp = this.queue[ri]!
      this.queue[ri] = this.queue[i]!
      this.queue[i] = tmp
    }
  }

  public clear() {
    this.queue = []
  }

  public moveTrack(from: number, to: number) {
    if (!this.isValidQueuePos(from, true)) return null
    if (!this.isValidQueuePos(to, true)) return null

    const track = this.queue.splice(from, 1)[0]!
    this.queue.splice(to, 0, track)
    return track
  }

  public remove(from: number, to: number) {
    if (from > to || !this.isValidQueuePos(from, false) || !this.isValidQueuePos(to, false)) return null

    const deleted = this.queue.splice(from, to)
    return deleted.length
  }

  public async setPaused(paused: boolean) {
    if (this.paused != paused && this.textChannel && this.playerMsgId) {
      const msg = this.textChannel.messages.cache.get(this.playerMsgId)
      if (msg) await msg.edit({ components: [nowPlayingButtons(paused)] })
    }
    return super.setPaused(paused)
  }

  public setLoopMode(mode: LoopMode) {
    this.loopMode = mode
  }

  public getQueueDuration() {
    return this.queue.reduce((acc, track) => acc + track.info.length, 0)
  }

  private isValidQueuePos(pos: number, allowEndPos: boolean) {
    return allowEndPos ? pos >= 0 && pos <= this.queue.length : pos >= 0 && pos < this.queue.length
  }

  public async disconnect() {
    await this.destroy()
    await this.bot.leaveVC(this.guildId)
  }

  public scheduleDisconnect(seconds = 60) {
    this.cancelDisconnect()
    
    this._disconnect = setTimeout(async () => {
      await this.disconnect()
    }, seconds * 1000)
  }
  
  public cancelDisconnect() {
    if (this._disconnect) clearTimeout(this._disconnect)
  }
}
