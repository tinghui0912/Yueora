import * as React from 'react';

declare global {
  namespace JSX {
    interface IntrinsicAttributes {
      [key: string]: any;
    }
  }
}

declare module 'react' {
  namespace JSX {
    interface IntrinsicAttributes {
      [key: string]: any;
    }
  }

  function forwardRef<T, P = any>(
    render: (props: P, ref: React.Ref<T>) => React.ReactElement | null
  ): React.ForwardRefExoticComponent<React.PropsWithoutRef<P> & React.RefAttributes<T>>;
}
