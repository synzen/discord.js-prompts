/* eslint-disable @typescript-eslint/no-var-requires */
const {
  MessageVisual,
  DiscordPrompt,
  Rejection
} = require('discord.js-prompts')

// Prompt to ask age
export const askAgeVisual = async (data) => {
  return new MessageVisual(`How old are you, ${data.name}?`)
}

export const askAgeFn = async (m, data) => {
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
