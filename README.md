# Discord.js Prompts
[![Maintainability](https://badgen.net/codeclimate/maintainability/synzen/discord-prompts?style=flat)](https://codeclimate.com/github/synzen/discord-prompts/maintainability)
[![Test Coverage](https://badgen.net/codeclimate/coverage/synzen/discord-prompts?style=flat)](https://codeclimate.com/github/synzen/discord-prompts/test_coverage)
![Github license](https://badgen.net/github/license/synzen/discord-prompts?style=flat)

Create prompts in Discord, just like you would in console! Implemented with [prompt-anything](https://github.com/synzen/prompt-anything).

For full documentation, see [prompt-anything#usage](https://github.com/synzen/prompt-anything#usage)'s documentation and the example below (available in JS and TS). It comes with all the same features of prompt-anything, including

- Modular, reusable prompts that are also composed of reusable components
- Conditional execution in whatever order you can dream of
- Trivial unit tests and (mostly) trivial integration tests (see [prompt-anything#testing](https://github.com/synzen/prompt-anything#testing))
- Channel tracking that can be used to prevent multiple prompts running within the same channel
- Built-in support for multiple choice menus with pagination and time limits

### Table of Contents

- [Example](#example)
  - [JavaScript](#javascript)
  - [TypeScript](#typescript)
- [Using Menus](#using-menus)
  - [Pagination](#pagination)
- [Channel Tracking](#channel-tracking)

## Example

See the src/examples folder.

This will cause the bot application (with discord.js) to ask the user for their name and age. The bot will then send the collected results back. An image of the interaction is provided at the bottom.

<p align="center">
  <img src="https://i.imgur.com/DCydxh5.png">
</p>


## Using Menus
The built-in menus will automatically handle invalid options and numbering. You simply use the pre-made visual components of `MenuEmbed` with the `MenuVisual`. 

Automatic pagination controls via reactions is also built in (see the next section)!

<p align="center">
  <img src="https://i.imgur.com/Rf4ycHq.png">
</p>


```ts
import { MessageEmbed } from 'discord.js'
const embed = new MessageEmbed({
  title: 'What is your favorite fruit?'
})
const askFruitMenu = new MenuEmbed(embed)
  .addOption('Apple')
  .addOption('Orange')
  .addOption('Broccoli', 'Broccoli is so tasty, it might as well be a fruit')
const askFruitVisual = new MenuVisual(askFruitMenu)

const askFruitFn: DiscordPromptFunction<AgeMenuData> = async (message: Message, data: AgeMenuData) => {
  const { content } = message
  if (content === '1') {
    // apple
  } else if (content === '2') {
    // orange
  } else {
    // broccoli
  }
  return data
}

const askFruitPrompt = new DiscordPrompt<AgeMenuData>(askFruitVisual, askFruitFn)
const askFruitNode = new PromptNode(askFruitPrompt)
```

### Pagination

Pagination is disabled by default. To enable it, pass a callback to `MenuEmbed.prototype.enablePagination` that will handle any errors that occurs from adding reactions or editing the message.

You can also pass a `maxPerPage` or `paginationTimeout` (time until reactions are no longer accepted) in an object as the second argument (the first argument is to initialize it with a pre-made embed).

<p align="center">
  <img alt="Menu page 1" src="https://i.imgur.com/lAcp2tR.png">
  <img alt="Menu page 2" src="https://i.imgur.com/cjBsPRu.png">
</p>

```ts
import { MessageEmbed } from 'discord.js'
const embed = new MessageEmbed({
  title: 'What is your favorite fruit?'
})
const askFruitMenu = new MenuEmbed(embed, { maxPerPage: 2 })
  .addOption('Apple')
  .addOption('Orange')
  .addOption('Broccoli', 'Broccoli is so tasty, it might as well be a fruit')
  .enablePagination((error: Error) => {
    // Handle errors here
    throw error
  })
```

## Channel Tracking

Every time prompts are run with `DiscordPromptRunner`, the channel ID is stored in a `Set` that is then removed upon prompt completion.

You can access these for your convenience through the static methods:

```ts
DiscordPromptRunner.addActiveChannel(id: string): void
DiscordPromptRunner.deleteActiveChannel(id: string): void
DiscordPromptRunner.isActiveChannel(id: string): boolean
```

You can call `isActiveChannel` before calling a `DiscordPromptRunner`'s run method for example.
