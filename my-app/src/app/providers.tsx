"use client";

import * as React from "react";
import {
  FluentProvider,
  webLightTheme,
  SSRProvider,
  RendererProvider,
  createDOMRenderer,
  renderToStyleElements,
} from "@fluentui/react-components";
import { useServerInsertedHTML } from "next/navigation";
import { TrpcProvider } from "@/utils/trpcProvider";
import { SessionProvider } from "next-auth/react";

export function Providers({ children }: { children: React.ReactNode }) {
  const [renderer] = React.useState(() => createDOMRenderer());
  const didRenderRef = React.useRef(false);

  useServerInsertedHTML(() => {
    if (didRenderRef.current) {
      return;
    }
    didRenderRef.current = true;
    return <>{renderToStyleElements(renderer)}</>;
  });

  return (
    <RendererProvider renderer={renderer}>
      <SSRProvider>
        <FluentProvider theme={webLightTheme}>
          <TrpcProvider>
            <SessionProvider>
            {children}
            </SessionProvider>
          </TrpcProvider>
        </FluentProvider>
      </SSRProvider>
    </RendererProvider>
  );
}

/*
'use client';

// Import necessary dependencies from 'react'
import { useEffect, useState } from 'react'
// Import necessary dependencies from '@fluentui/react-components'
import {
  createDOMRenderer,
  RendererProvider,
  FluentProvider,
  webLightTheme,
  SSRProvider,
} from '@fluentui/react-components';

// Create a DOM renderer for Fluent UI.
const renderer = createDOMRenderer();
*/

/**
 * Providers component.
 *
 * This component wraps other components with a set of providers
 * for Fluent UI, SSR, and a custom renderer.
 *
 * @param {Object} props - The properties for the Providers component.
 * @param {React.ReactNode} props.children - The child components to be wrapped by the Providers.
 * @returns {React.Element} The Providers component with child components.
 */
/*
export function Providers({ children }) {
    // Declare a state variable named 'hasMounted' and a function named 'setHasMounted' to update it.
    const [ hasMounted, setHasMounted ] = useState(false);

    // Use the 'useEffect' hook to set 'hasMounted' to true once the component has mounted.
    useEffect(() => {
      setHasMounted(true);
    }, []);

    // If the component hasn't mounted yet, return nothing.
    if ( !hasMounted ) {
      return null;
    }

    // If the component has mounted, return a set of providers.
    return (
      <RendererProvider renderer={ renderer || createDOMRenderer() }>
        <SSRProvider>
          <FluentProvider theme={ webLightTheme }>
            { children }
          </FluentProvider>
        </SSRProvider>
      </RendererProvider>
    );
}*/
