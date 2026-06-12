import { useEffect } from 'react';

type Seo = {
  title: string;
  description: string;
  keywords?: string[];
};

function setMeta(name: string, content: string) {
  let tag = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;
  if (!tag) {
    tag = document.createElement('meta');
    tag.name = name;
    document.head.appendChild(tag);
  }
  tag.content = content;
}

export function useSeo({ title, description, keywords = [] }: Seo) {
  useEffect(() => {
    document.title = title;
    setMeta('description', description);
    setMeta('keywords', keywords.join(', '));
  }, [title, description, keywords.join('|')]);
}
