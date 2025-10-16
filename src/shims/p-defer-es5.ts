// Shim minimal para "p-defer-es5" que algunos bundles ES5 requieren.
// Implementación simple de p-defer para evitar errores de resolución en Vite.
export type Deferred<T = any> = {
  promise: Promise<T>;
  resolve: (value: T | PromiseLike<T>) => void;
  reject: (reason?: any) => void;
};

export default function pDefer<T = any>(): Deferred<T> {
  let resolve!: (value: T | PromiseLike<T>) => void;
  let reject!: (reason?: any) => void;

  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });

  return { promise, resolve, reject };
}
