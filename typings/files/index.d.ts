// use wildard module-declarations so typescript don't complain when you import files other than .ts or .js with file-loader

declare module '*.png' {
  const content: string;
  export = content;
}
declare module '*.fnt' {
  const content: string;
  export = content;
}
declare module '*.json' {
  const content: string;
  export = content;
}
declare module '*.ogg' {
  const content: string;
  export = content;
}
declare module '*.mp3' {
  const content: string;
  export = content;
}
