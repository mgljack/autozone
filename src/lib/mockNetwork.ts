function deepClone<T>(value: T): T {
  // Prototype-only: structuredClone isn't available everywhere yet, and JSON cloning is fine for mock data.
  return JSON.parse(JSON.stringify(value)) as T;
}

export async function mockNetwork<T>(value: T, ms = 500): Promise<T> {
  return await new Promise((resolve) => {
    setTimeout(() => resolve(deepClone(value)), ms);
  });
}


