import 'react';

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'nostalgic-counter': {
        id?: string;
        type?: 'total' | 'today' | 'yesterday' | 'week' | 'month';
        theme?: 'classic' | 'modern' | 'retro';
        digits?: string;
        format?: 'image' | 'text';
      };
      'nostalgic-like': {
        id?: string;
        theme?: 'classic' | 'modern' | 'retro';
        icon?: 'heart' | 'star' | 'thumb';
        format?: 'interactive' | 'image' | 'text';
      };
    }
  }
}