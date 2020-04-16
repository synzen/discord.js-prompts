import { PromptFunction } from "prompt-anything";
import { Message } from 'discord.js'

export type DiscordPromptFunction<DataType> = PromptFunction<DataType, Message>
