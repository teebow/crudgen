declare global {
  interface String {
    ignoreWhitespace(): string;
  }
}

String.prototype.ignoreWhitespace = function () {
  return this.replace(/\s+/g, "");
};

export {};
