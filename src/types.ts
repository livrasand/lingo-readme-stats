export type DuolingoCourse = {
  learningLanguage?: string;
  fromLanguage?: string;
  crowns?: number;
  xp?: number;
  title?: string;
  id?: string;
};

export type DuolingoProfile = {
  id?: number | string;
  username?: string;
  name?: string;
  totalXp?: number;
  learningLanguage?: string;
  language?: string;
  picture?: string;
  streak?: number;
  courses?: DuolingoCourse[];
  // keep generic for other fields
  [k: string]: any;
};
