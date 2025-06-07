declare module 'react' {
  export function useState(initial?: any): any;
  export function useEffect(effect: any, deps?: any): void;
  export function useCallback(callback: any, deps?: any): any;
  export namespace React {
    export type FC<P = any> = (props: P) => any;
  }
  const React: any;
  export default React;
}

declare module 'react-dom/client' {
  export function createRoot(container: any): { render: (c: any) => void };
}

declare namespace JSX {
  interface IntrinsicElements {
    [elemName: string]: any;
  }
}

declare module 'react/jsx-runtime' {
  export const jsx: any;
  export const jsxs: any;
  export const Fragment: any;
}

declare var process: {
  env: Record<string, string | undefined>;
};
