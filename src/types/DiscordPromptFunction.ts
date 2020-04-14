import { PromptFunction } from "prompt-anything";
import { Message } from "../interfaces/Message";

export type DiscordPromptFunction<T> = PromptFunction<T, Message>
