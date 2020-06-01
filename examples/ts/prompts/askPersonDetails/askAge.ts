import { MessageVisual, DiscordPromptFunction, DiscordPrompt, VisualGenerator, Rejection } from "../../../../src/index"
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
  }
  return {
    ...data,
    age
  }
}

export const askAgePrompt = new DiscordPrompt(askAgeVisual, askAgeFn)
