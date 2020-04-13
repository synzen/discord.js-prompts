# Discord Prompts
[![Maintainability](https://api.codeclimate.com/v1/badges/c4c08e63d9d7078a3b5b/maintainability)](https://codeclimate.com/github/synzen/discord.js-prompts/maintainability)
[![Test Coverage](https://api.codeclimate.com/v1/badges/c4c08e63d9d7078a3b5b/test_coverage)](https://codeclimate.com/github/synzen/discord.js-prompts/test_coverage)

Create prompts in Discord, just like you would in console!

This works out-of-the-box with [discord.js](https://discord.js.org/#/). For use with other libraries, the relevant interfaces in src/interfaces must be implemented, starting from `User` and `TextChannel` since these two interfaces are the entry point for using this module.

For full documentation, see [prompt-anything](https://github.com/synzen/prompt-anything)'s documentation and the example below.

## Example

This will cause the bot application (with discord.js) to ask the user for their name and age. The bot will then send the collected results back. An image of the interaction is provided at the bottom.

```ts
import { Client } from 'discord.js'
import { DiscordPrompt, PromptFunction, VisualGenerator, Rejection, PromptNode, DiscordPromptRunner, TextChannel } from 'discord.js-prompts';

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
  if (message.content === 'askmeal') {
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
<p align="center">
  <img src="https://i.imgur.com/6nw8d8n.png">
</p>
