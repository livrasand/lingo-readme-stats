export type Theme = {
  bg: string;
  titleColor: string;
  textColor: string;
  accent: string;
  border: string;
  followButton?: {
    background: string;
    text: string;
  };
};

export type Themes = Record<string, Theme>;

export const themes: Themes = {
  default: {
    bg: '#0d1117',
    titleColor: '#c9d1d9',
    textColor: '#8b949e',
    accent: '#58a6ff',
    border: '#21262d',
    followButton: {
      background: '#58a6ff',
      text: '#ffffff'
    }
  },
  light: {
    bg: '#ffffff',
    titleColor: '#0b1220',
    textColor: '#444d56',
    accent: '#1b7be3',
    border: '#e6edf3',
    followButton: {
      background: '#1b7be3',
      text: '#ffffff'
    }
  },
  duo: {
    bg: '#ffffff',
    titleColor: '#3c3c3c',
    textColor: '#afafaf',
    accent: '#3c3c3c',
    border: '#e5e5e5',
    followButton: {
      background: '#1cb0f6',
      text: '#ffffff'
    }
  }
};

export type ThemeKey = keyof Themes;
