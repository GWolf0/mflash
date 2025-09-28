export function shuffleArray<T=any>(arr: T[]): T[] {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1)); // pick index 0..i
        [arr[i], arr[j]] = [arr[j], arr[i]]; // swap
    }
    return arr;
}