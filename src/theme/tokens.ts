export const colors = {
  cotton: '#FBFBF9',
  cream: '#FDF8F1',
  barBg: '#F7F6FA',
  sand: '#F4EFE7',
  sandLine: '#DCD5CA',
  blue50: '#EFF5FC',
  blue100: '#DFEBF9',
  sky: '#74A7E3',
  blue600: '#4F8BCD',
  blue700: '#2F6DB5',
  navy: '#24508F',
  blue900: '#17335A',
  ink: '#242A36',
  muted: '#5C6472',
  line: '#E6E7E5',
  white: '#FFFFFF',
  alabaster: '#FEF9F3',
  chiffon: '#FBFAFE',
  blue200: '#C3D9F3',
  blue300: '#9CC1EC',
  blue400: '#85B5E8',
  blue500: '#73A9E9',
  heroText: '#FBF1E1',
  marigold: '#F0B74A',
  // Stars need 3:1 against cream; the bright marigold only reached 1.7:1.
  star: '#B7791F',
  // Text and icons on the light blue. White on sky was 2.5:1; navy is 5:1.
  onSky: '#17335A',
  // The chalkboard panels used for the continue, player and quiz cards.
  chalk: '#273531',
  chalkText: '#FEF9F2',
  danger: '#B53A3A',
  success: '#2E8B67',
} as const;

// Fonts from the Figma design system: Bricolage Grotesque for headings, Figtree for everything else.
// PostScript names, as the font files register them.
export const fonts = {
  display: 'BricolageGrotesque-Bold',
  heading: 'BricolageGrotesque-SemiBold',
  body: 'Figtree-Regular',
  medium: 'Figtree-Medium',
  semibold: 'Figtree-SemiBold',
  bold: 'Figtree-Bold',
  family: 'Figtree-Regular',
} as const;

// Spacing and touch targets from the design system.
export const spacing = {screen: 16, card: 12, gap: 12, section: 24, target: 44, button: 52, row: 64, topBar: 56} as const;

// Type scale from the design system (size / line height). Headings drop ~20% so two-line titles fit a 358px column.
export const type = {
  display: 34, displayLine: 40,
  heading1: 28, heading1Line: 34,
  heading2: 22, heading2Line: 28,
  heading3: 18, heading3Line: 24,
  heading4: 16, heading4Line: 22,
  body: 16, bodyLine: 24,
  small: 14, smallLine: 20,
  caption: 12, captionLine: 16,
  button: 16, buttonLine: 20,
  // Legacy names the screens use; they now follow the scale above.
  title: 28, subheading: 18, label: 14, tab: 12, heading: 22,
} as const;

export const radius = {card: 16, field: 12, pill: 999, button: 12} as const;

// Motion shared with the launch intro, so every screen moves the same way.
export const motion = {
  outExpo: [0.16, 1, 0.3, 1] as const, // entrances
  inOut: [0.65, 0, 0.2, 1] as const, // exits and large moves
  fast: 220,
  base: 420,
  slow: 700,
};
