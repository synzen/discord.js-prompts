import { MessageEmbed, EmbedField } from "./types/MessageEmbed";

interface EmbedInterface extends MessageEmbed {
  fields: EmbedField[];
}

export class Embed implements EmbedInterface {
  [key: string]: MessageEmbed[keyof MessageEmbed];
  fields: EmbedField[] = []

  constructor (initialize?: MessageEmbed) {
    this.fields = []
    if (initialize) {
      for (const key in initialize) {
        const value = initialize[key]
        if (Array.isArray(value)) {
          this[key] = [...value]
        } else if (typeof value === 'object') {
          this[key] = { ...value }
        } else {
          this[key] = value
        }
      }
    }
  }
}
