/* eslint-disable @typescript-eslint/no-var-requires */
const {
  MessageVisual,
  DiscordPrompt
} = require('discord.js-prompts')

export const askNameVisual = new MessageVisual(`What's your name?`)

export const askNameFn = async (m, data) => {
  return {
    ...data,
    name: m.content
  }
}

export const askNamePrompt = new DiscordPrompt(askNameVisual, askNameFn)
