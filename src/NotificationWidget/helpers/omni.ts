type ClassName = string | false | null | undefined;

export const omni = (...names: ClassName[]) =>
  names
    .filter(Boolean)
    .map((name) => `omni-${name}`)
    .join(" ");