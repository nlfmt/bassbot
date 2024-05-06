# Bass Bot
Bass is a feature-rich discord music bot. \
With features like the button-controlled player message, easy interop with spotify links, \
built-in lyrics search and many more features, it offer the best listening experience.

## Technologies
### Typescript
The bot is written entirely in typescript, with extensive use of the type system to ensure safety. \
Through custom command creation code, option types are enforced to be typesafe.

### Lavalink
The bot uses the Lavalink audio player to play music. \
This allows for a more feature-rich music player, with support for things like spotify links, \
and reliable playback.

### Discord.js
The bot uses discord.js to interact with the discord API.

### Bun
The bot uses bun, which simplifies running the code by skipping the need for a build step.


## How to run
1. Clone the repository
2. Run `bun install`
3. Copy the `.env.example` file to `.env` and fill in the tokens
4. Copy the `nodes.example.json` file to `nodes.json` and fill you lavalink node information
5. Run `bun register` to register the commands to your application
6. Run `bun start`
7. Invite the bot to your server, join a voice channel and run the `play` command
8. Use the `help` command to see all available commands

## License
This project is licensed under the MIT license. \
See the [LICENSE](LICENSE) file for more information.

## Contributing
Contributions are welcome! \
Please open an issue or a pull request if you have any suggestions or improvements.
