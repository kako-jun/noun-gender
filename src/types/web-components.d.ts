declare namespace JSX {
  interface IntrinsicElements {
    'nostalgic-counter': {
      id: string;
      type?: 'total' | 'today' | 'yesterday' | 'week' | 'month';
      theme?: 'classic' | 'modern' | 'retro';
      digits?: string;
      format?: 'image' | 'text';
    };
  }
}