export const SITE = {
  name: "AVS Formation",
  tagline: "FORME-TOI. RÉUSSIS.",
  brandLetter: "A",
};

export const PAYMENT = {
  moncash: {
    label: "MonCash",
    color: "#E5484D",
    name: process.env.NEXT_PUBLIC_MONCASH_NAME ?? "Dawsen Nelson",
    phone: process.env.NEXT_PUBLIC_MONCASH_PHONE ?? "+509 00 00 0000",
  },
  natcash: {
    label: "NatCash",
    color: "#1B7F4C",
    name: process.env.NEXT_PUBLIC_NATCASH_NAME ?? "Dawsen Nelson",
    phone: process.env.NEXT_PUBLIC_NATCASH_PHONE ?? "+509 00 00 0000",
  },
} as const;
