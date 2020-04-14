# Discord Prompts
[![Maintainability](https://img.shields.io/codeclimate/maintainability/synzen/discord-prompts?style=flat-square)](https://codeclimate.com/github/synzen/discord-prompts/maintainability)
[![Test Coverage](https://img.shields.io/codeclimate/coverage/synzen/discord-prompts?style=flat-square)](https://codeclimate.com/github/synzen/discord-prompts/test_coverage)
![Github license](https://img.shields.io/github/license/synzen/discord-prompts?color=%231081c1&style=flat-square)

Create prompts in Discord, just like you would in console!

This works out-of-the-box with [discord.js](https://discord.js.org/#/), and is an implementation of [prompt-anything](https://github.com/synzen/prompt-anything). For use with other libraries, the relevant interfaces in src/interfaces must be implemented, starting from `User` and `TextChannel`.

For full documentation, see [prompt-anything#usage](https://github.com/synzen/prompt-anything#usage)'s documentation and the example below (available in JS and TS). It comes with all the same features of prompt-anything, including

- Modular, reusable prompts that are also composed of reusable components
- Conditional execution in whatever order you can dream of
- Trivial unit tests and (mostly) trivial integration tests (see [prompt-anything#testing](https://github.com/synzen/prompt-anything#testing))
- Channel tracking that can be used to prevent multiple prompts running within the same channel

### Table of Contents

- [Example](#example)
  - [JavaScript](#javascript)
  - [TypeScript](#typescript)
- [Channel Tracking](#channel-tracking)

## Example

This will cause the bot application (with discord.js) to ask the user for their name and age. The bot will then send the collected results back. An image of the interaction is provided at the bottom.

<p align="center">
  <img src="https://i.imgur.com/DCydxh5.png">
</p>


### JavaScript
```js
const Client = require('discord.js').Client
const { DiscordPrompt, Rejection, PromptNode, DiscordPromptRunner } = require('discord-prompts')

const client = new Client()

// Set up reusable prompt to ask name
const askNameVisual = {
  text: `What's your name`
}
const askNameFn = async (m, data) => {
  return {
    ...data,
    name: m.content
  }
}
const askNamePrompt = new DiscordPrompt(askNameVisual, askNameFn)

// Set up reusable prompt to ask age
const askAgeVisual = (data) => {
  return {
    text: `How old are you, ${data.name}?`
  }
}
const askAgeFn = async (m, data) => {
  const age = Number(m.content)
  if (isNaN(age)) {
    throw new Rejection(`That's not a valid number. Try again.`)
  }
  return {
    ...data,
    age
  }
}
const askAgePrompt = new DiscordPrompt(askAgeVisual, askAgeFn)

// Set up reusable prompt that just sends visual, and doesn't wait for input
const summaryVisual = (data) => ({
  text: `Your name is ${data.name}. You are ${data.age} years old.`
})
const summaryPrompt = new DiscordPrompt(summaryVisual)

// Set and configure nodes that dictates the order of execution
const askName = new PromptNode(askNamePrompt)
const askAge = new PromptNode(askAgePrompt)
const summary = new PromptNode(summaryPrompt)

askName.addChild(askAge)
askAge.addChild(summary)

// Now pass the root node, askName, to a PromptRunner, as done below
client.on('message', async (message) => {
  if (message.content === 'askme') {
    const runner = new DiscordPromptRunner(message.author, {})
    runner.run(askName, message.channel)
      .then((data) => {
        // Access data returned by the last prompt
        // data.age
        // data.name
      })
  }
})
```

### TypeScript
```ts
import { Client } from 'discord.js'
import { DiscordPrompt, PromptFunction, VisualGenerator, Rejection, PromptNode, DiscordPromptRunner, TextChannel } from 'discord-prompts';

const client = new Client()

type PersonDetails = {
  name?: string;
  age?: number;
}

// Set up reusable prompt to ask name
const askNameVisual = {
  text: `What's your name`
}
const askNameFn: PromptFunction<PersonDetails> = async (m, data) => {
  return {
    ...data,
    name: m.content
  }
}
const askNamePrompt = new DiscordPrompt<PersonDetails>(askNameVisual, askNameFn)

// Set up reusable prompt to ask age
const askAgeVisual: VisualGenerator<PersonDetails> = (data) => {
  return {
    text: `How old are you, ${data.name}?`
  }
}
const askAgeFn: PromptFunction<PersonDetails> = async (m, data) => {
  const age = Number(m.content)
  if (isNaN(age)) {
    throw new Rejection(`That's not a valid number. Try again.`)
  }
  return {
    ...data,
    age
  }
}
const askAgePrompt = new DiscordPrompt<PersonDetails>(askAgeVisual, askAgeFn)

// Set up reusable prompt that just sends visual, and doesn't wait for input
const summaryVisual: VisualGenerator<PersonDetails> = (data) => ({
  text: `Your name is ${data.name}. You are ${data.age} years old.`
})
const summaryPrompt = new DiscordPrompt<PersonDetails>(summaryVisual)

// Set and configure nodes that dictates the order of execution
const askName = new PromptNode(askNamePrompt)
const askAge = new PromptNode(askAgePrompt)
const summary = new PromptNode(summaryPrompt)

askName.addChild(askAge)
askAge.addChild(summary)

// Now pass the root node, askName, to a PromptRunner, as done below
client.on('message', async (message) => {
  if (message.content === 'askme') {
    const runner = new DiscordPromptRunner<PersonDetails>(message.author, {})
    runner.run(askName, message.channel as TextChannel)
      .then((data) => {
        // Access data returned by the last prompt
        // data.age
        // data.name
      })
  }
});
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
