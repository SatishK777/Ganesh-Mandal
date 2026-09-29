const gradients = [
  'bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-amber-500/20',
  'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-emerald-500/20',
  'bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-blue-500/20',
  'bg-gradient-to-br from-purple-500 to-violet-600 text-white shadow-purple-500/20',
  'bg-gradient-to-br from-rose-500 to-pink-600 text-white shadow-rose-500/20',
  'bg-gradient-to-br from-cyan-500 to-teal-600 text-white shadow-cyan-500/20',
];

export const getMemberAvatarGradient = (name: string): string => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % gradients.length;
  return gradients[index];
};
