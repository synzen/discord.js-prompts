import {
  MessageVisual,
  DiscordPromptFunction,
  DiscordPrompt,
  VisualGenerator,
  Rejection,
} from "../../../../src/index"
import { Message } from "discord.js"
import { PersonDetails } from './types'

// Prompt to ask age
export const askAgeVisual: VisualGenerator<PersonDetails> = async (data: PersonDetails) => {
  return new MessageVisual(`How old are you, ${data.name}?`)
}

export const askAgeFn: DiscordPromptFunction<PersonDetails> = async (m: Message, data: PersonDetails) => {
  const age = Number(m.content)
  if (isNaN(age)) {
    throw new Rejection(`That's not a valid number. Try again.`)
    /**
     * You can also throw a DiscordRejection. The MessageEmbed
     * is directly from discord.js
     * 
     * throw new DiscordRejection('Text', new Discord.MessageEmbed({
     *  description: 'Silly you!'
     * }))
     */
  }
  return {
    ...data,
    age
  }
}

export const askAgePrompt = new DiscordPrompt(askAgeVisual, askAgeFn)
