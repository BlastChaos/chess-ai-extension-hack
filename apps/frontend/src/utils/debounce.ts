export function debounce<T extends (...args: any[]) => void>(
  fn: T,
  wait = 200
) {
  let t: number | undefined;
  return (...args: Parameters<T>) => {
    clearTimeout(t);
    t = window.setTimeout(() => fn(...args), wait);
  };
}
