declare module 'react' {
  export = React;
  export as namespace React;
  namespace React {
    type Key = string | number | bigint;
    type ReactNode = any;
    type ReactElement = any;
    type PropsWithChildren<P = {}> = P & { children?: ReactNode };
    type FC<P = {}> = (props: P & { key?: Key }) => any;
    interface Context<T> {
      Provider: any;
      Consumer: any;
      _currentValue: T;
    }
    function useState<T>(initialState: T | (() => T)): [T, (newState: T | ((prevState: T) => T)) => void];
    function useEffect(effect: () => void | (() => void), deps?: any[]): void;
    function useMemo<T>(factory: () => T, deps: any[]): T;
    function useCallback<T extends (...args: any[]) => any>(callback: T, deps: any[]): T;
    function useRef<T>(initialValue?: T): { current: T };
    function createContext<T>(defaultValue: T): Context<T>;
    function useContext<T>(context: Context<T>): T;
  }
}

declare module 'react/jsx-runtime' {
  export const jsx: any;
  export const jsxs: any;
  export const Fragment: any;
  export namespace JSX {
    interface Element extends React.ReactNode {}
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}

declare module 'react/jsx-dev-runtime' {
  export const jsxDEV: any;
  export const Fragment: any;
  export namespace JSX {
    interface Element extends React.ReactNode {}
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}

declare module 'react-native' {
  export type StyleProp<T = any> = any;
  export type ViewStyle = any;
  export type TextStyle = any;
  export type ImageStyle = any;
  export type TextInputProps = any;
  export function useWindowDimensions(): {
    width: number;
    height: number;
    scale: number;
    fontScale: number;
  };
  export const View: any;
  export const Text: any;
  export const Image: any;
  export const StyleSheet: {
    create: <T extends Record<string, any>>(styles: T) => T;
  };
  export const TouchableOpacity: any;
  export const ScrollView: any;
  export const SafeAreaView: any;
  export const TextInput: any;
  export const StatusBar: any;
  export const Dimensions: any;
  export const Platform: any;
  export const ActivityIndicator: any;
  export const KeyboardAvoidingView: any;
}

declare module 'expo-secure-store' {
  export function getItemAsync(key: string): Promise<string | null>;
  export function setItemAsync(key: string, value: string): Promise<void>;
  export function deleteItemAsync(key: string): Promise<void>;
}

declare module 'react-native-url-polyfill/auto' {}
