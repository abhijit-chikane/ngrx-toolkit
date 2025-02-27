import { Signal, computed } from '@angular/core';
import {
  EmptyFeatureResult,
  SignalStoreFeature,
  signalStoreFeature,
  withComputed,
  withState,
} from '@ngrx/signals';

export type CallState = 'init' | 'loading' | 'loaded' | { error: string };

export type CallStateSlice = {
  callState: CallState;
};

export type NamedCallStateSlice<Collection extends string> = {
  [K in keyof CallStateSlice as Collection extends '' ? `${Collection}${K}` : `${Collection}${Capitalize<K>}`]: CallStateSlice[K];
};

export type CallStateSignals = {
  loading: Signal<boolean>;
  loaded: Signal<boolean>;
  error: Signal<string | null>;
};

export type NamedCallStateSignals<Prop extends string> = {
  [K in keyof CallStateSignals as Prop extends '' ? `${Prop}${K}` : `${Prop}${Capitalize<K>}`]: CallStateSignals[K];
};

export type SetCallState<Prop extends string | undefined> = Prop extends string
  ? NamedCallStateSlice<Prop>
  : CallStateSlice;

export function getCallStateKeys(collection?: string) {
  return {
    callStateKey: collection ? `${collection}CallState` : 'callState',
    loadingKey: collection ? `${collection}Loading` : 'loading',
    loadedKey: collection ? `${collection}Loaded` : 'loaded',
    errorKey: collection ? `${collection}Error` : 'error',
  };
}

function getCollectionArray(collection: string | string[]){
  return Array.isArray(collection) ? collection : [collection];
}

export function withCallState<Collection extends string>(config: {
  collection: Collection | Collection[];
}): SignalStoreFeature<
  EmptyFeatureResult,
  EmptyFeatureResult & {
    state: NamedCallStateSlice<Collection>;
    props: NamedCallStateSignals<Collection>;
  }
>;
export function withCallState(): SignalStoreFeature<
  EmptyFeatureResult,
  EmptyFeatureResult & {
    state: CallStateSlice;
    props: CallStateSignals;
  }
>;
export function withCallState<Collection extends string>(config?: {
  collection: Collection | Collection[];
}): SignalStoreFeature {
  return signalStoreFeature(
    withState(() => {
      if (config) {
        const collection = getCollectionArray(config.collection);
        return collection.reduce(
            (acc, cur) => ({
              ...acc,
              ...{ [cur ? `${cur}CallState` : 'callState']: 'init' },
            }),
            {}
          )
      }
      return {
        callState: 'init',
      };
    }),
    withComputed((state: Record<string, Signal<unknown>>) => {
      if (config) {
        const collection = getCollectionArray(config.collection);
        return collection.reduce<Record<string, Signal<unknown>>>((acc, cur: string) => {
          const { callStateKey, errorKey, loadedKey, loadingKey } =
            getCallStateKeys(cur);
          const callState = state[callStateKey] as Signal<CallState>;
          return {
            ...acc,
            [loadingKey]: computed(() => callState() === 'loading'),
            [loadedKey]: computed(() => callState() === 'loaded'),
            [errorKey]: computed(() => {
              const v = callState();
              return typeof v === 'object' ? v.error : null;
            }),
          };
        }, {});
      } 
      const { callStateKey, errorKey, loadedKey, loadingKey } = getCallStateKeys();
      const callState = state[callStateKey] as Signal<CallState>;
      return {
        [loadingKey]: computed(() => callState() === 'loading'),
        [loadedKey]: computed(() => callState() === 'loaded'),
        [errorKey]: computed(() => {
          const v = callState();
          return typeof v === 'object' ? v.error : null;
        }),
      };
    })
  );
}

export function setLoading<Prop extends string | undefined = undefined>(
  prop?: Prop
): SetCallState<Prop> {
  if (prop) {
    return { [`${prop}CallState`]: 'loading' } as SetCallState<Prop>;
  }

  return { callState: 'loading' } as SetCallState<Prop>;
}

export function setLoaded<Prop extends string | undefined = undefined>(
  prop?: Prop
): SetCallState<Prop> {
  if (prop) {
    return { [`${prop}CallState`]: 'loaded' } as SetCallState<Prop>;
  } else {
    return { callState: 'loaded' } as SetCallState<Prop>;
  }
}

export function setError<Prop extends string | undefined = undefined>(
  error: unknown,
  prop?: Prop
): SetCallState<Prop> {
  let errorMessage: string;

  if (!error) {
    errorMessage = '';
  } else if (typeof error === 'object' && 'message' in error) {
    errorMessage = String(error.message);
  } else {
    errorMessage = String(error);
  }

  if (prop) {
    return {
      [`${prop}CallState`]: { error: errorMessage },
    } as SetCallState<Prop>;
  } else {
    return { callState: { error: errorMessage } } as SetCallState<Prop>;
  }
}
