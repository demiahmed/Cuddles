declare module '*.svg' {
  import type { FunctionComponent } from 'react';
  const content: FunctionComponent<{ className?: string }>;
  export default content;
}