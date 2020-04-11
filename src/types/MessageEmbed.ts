interface EmbedFooter {
  text: string;
  icon_url?: string;
}

interface EmbedImage {
  url?: string;
  height?: number;
  width?: number;
}

interface EmbedThumbnail {
  url?: string;
  height?: number;
  width?: number;
}

interface EmbedAuthor {
  name?: string;
  url?: string;
  icon_url?: string;
}

export interface EmbedField {
  name: string;
  value: string;
  inline?: boolean;
}

export interface MessageEmbed {
  title?: string;
  type?: string;
  description?: string;
  url?: string;
  timestamp?: Date;
  color?: number;
  footer?: EmbedFooter;
  image?: EmbedImage;
  thumbnail?: EmbedThumbnail;
  author?: EmbedAuthor;
  fields?: Array<EmbedField>;
  [key: string]: string|number|Date|EmbedFooter|EmbedImage|EmbedThumbnail|EmbedAuthor|Array<EmbedField>|undefined;
}
