import { lazy as _lazy } from 'react';

type Factory<T> = () => Promise<{ default: T }>;

async function retry<T extends React.ComponentType<any>>(
  factory: Factory<T>,
  retries = 5,
  interval = 1000
) {
  try {
    const result = await factory();
    return result;
  } catch (error) {
    if (retries === 0) throw error;
    setTimeout(() => retry(factory, retries - 1, interval), interval);
  }
}

const lazy: typeof _lazy = factory => _lazy(() => retry(factory));

export default lazy;
