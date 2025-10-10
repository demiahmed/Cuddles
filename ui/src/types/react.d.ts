declare module 'react' {
  export const useState: <T>(initialState: T | (() => T)) => [T, (newState: T | ((prevState: T) => T)) => void];
  export const useEffect: (effect: () => void | (() => void), deps?: ReadonlyArray<any>) => void;
  export const useCallback: <T extends (...args: any[]) => any>(callback: T, deps: ReadonlyArray<any>) => T;
  export const useRef: <T>(initialValue: T | null) => { current: T };
  export interface FC<P = {}> {
    (props: P): JSX.Element | null;
  }
  export interface ReactElement {
    type: any;
    props: any;
    key: string | null;
  }
}