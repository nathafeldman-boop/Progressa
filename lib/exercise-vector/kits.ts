export interface VectorKit {
  jersey: string;
  jerseyTrim: string;
  shorts: string;
  shortsTrim: string;
  skin: string;
  skinShade: string;
  hair: string;
  boot: string;
  sole: string;
  outline: string;
}

export const OUTFIELD_KIT: VectorKit = {
  jersey: "#2c7be5",
  jerseyTrim: "#164f9e",
  shorts: "#171b24",
  shortsTrim: "#2c7be5",
  skin: "#e7b389",
  skinShade: "#cf9a6e",
  hair: "#3a2a1d",
  boot: "#171b24",
  sole: "#f2efe8",
  outline: "#11151d",
};

export const GOALKEEPER_KIT: VectorKit = {
  ...OUTFIELD_KIT,
  jersey: "#e8b23c",
  jerseyTrim: "#a3721b",
  shorts: "#22303f",
  shortsTrim: "#e8b23c",
};
