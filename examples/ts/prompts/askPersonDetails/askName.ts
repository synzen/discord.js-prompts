import {
  MessageVisual,
  DiscordPromptFunction,
  DiscordPrompt
} from "../../../../src/index"
import { Message } from "discord.js"
import { PersonDetails } from './types'

export const askNameVisual = new MessageVisual(`What's your name?`)

export const askNameFn: DiscordPromptFunction<PersonDetails> = async (m: Message, data: PersonDetails) => {
  return {
    ...data,
    name: m.content
  }
}

export const askNamePrompt = new DiscordPrompt(askNameVisual, askNameFn)
