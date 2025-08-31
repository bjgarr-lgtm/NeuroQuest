
export const colors = {
  bg: '#0d0a17',
  panel: '#131024',
  card: '#1b1731',
  edge: '#2d2450',
  ink: '#F5F7FF',
  muted: '#9AA3B2',
  vio: '#B887FF',
  teal: '#46E1E3',
  green: '#6FE38E',
  pink: '#FF8BD0',
  gold: '#F9D85D',
  red: '#ff6b6b',
  yellow: '#ffd166',
  orange: '#FF9C54',
};

export const spacing = (n)=> n*8;
export const radius = 14;

export const neon = {
  card: { backgroundColor: colors.card, borderWidth: 2, borderColor: colors.edge, borderRadius: radius, padding: spacing(1.25) },
  panel: { backgroundColor: colors.panel, borderWidth: 2, borderColor: colors.edge, borderRadius: 16, padding: spacing(2) },
  chip: { borderWidth: 2, borderColor: colors.edge, borderRadius: 10, paddingVertical: 6, paddingHorizontal: 10, color: colors.ink, fontSize: 12 },
  btn: { backgroundColor: '#121024', borderWidth: 2, borderColor: colors.edge, borderRadius: 12, paddingVertical: 12, paddingHorizontal: 14 },
  btnPrimary: { backgroundColor: '#ffffff', borderWidth: 0, borderRadius: 12, paddingVertical: 12, paddingHorizontal: 14 },
  title: { color: colors.ink, fontSize: 22 },
  label: { color: colors.muted, fontSize: 12 },
};
