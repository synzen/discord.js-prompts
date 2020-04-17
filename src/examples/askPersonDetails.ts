import { Client, Message, TextChannel } from 'discord.js'
import { DiscordPrompt, VisualGenerator, Rejection, PromptNode, DiscordPromptRunner, MessageVisual, DiscordPromptFunction } from '../index';

const client = new Client()

type PersonDetails = {
  name?: string;
  age?: number;
}

// Prompt to ask name
const askNameVisual = new MessageVisual(`What's your name?`)
const askNameFn: DiscordPromptFunction<PersonDetails> = async (m: Message, data: PersonDetails) => {
  return {
    ...data,
    name: m.content
  }
}
const askNamePrompt = new DiscordPrompt(askNameVisual, askNameFn)

// Prompt to ask age
const askAgeVisual: VisualGenerator<PersonDetails> = async (data: PersonDetails) => {
  return new MessageVisual(`How old are you, ${data.name}?`)
}
const askAgeFn: DiscordPromptFunction<PersonDetails> = async (m: Message, data: PersonDetails) => {
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

// Prompt that just sends visual, and doesn't wait for input
const summaryVisual: VisualGenerator<PersonDetails> = async (data: PersonDetails) => {
  return new MessageVisual(`Your name is ${data.name}. You are ${data.age} years old.`)
}
const summaryPrompt = new DiscordPrompt<PersonDetails>(summaryVisual)

// Set up nodes
const askName = new PromptNode(askNamePrompt)
const askAge = new PromptNode(askAgePrompt)
const summary = new PromptNode(summaryPrompt)

askName.addChild(askAge)
askAge.addChild(summary)

// Now pass the root node, askName, to a PromptRunner, as done below
client.on('message', async (message) => {
  if (message.content === 'askdetails') {
    const runner = new DiscordPromptRunner<PersonDetails>(message.author, {})
    runner.run(askName, message.channel as TextChannel)
      .then((data: PersonDetails) => {
        // Access data from all prompts
        console.log(data)
        // data.age
        // data.name
      })
      .catch(console.error)
  }
});

client.login('token here');
