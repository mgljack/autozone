export function formatMnt(value: number): string {
  return `${Intl.NumberFormat("mn-MN").format(value)} ₮`;
}

export function formatKm(value: number): string {
  return `${Intl.NumberFormat("mn-MN").format(value)} км`;
}


