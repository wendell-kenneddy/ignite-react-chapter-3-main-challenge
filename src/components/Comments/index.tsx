import { useEffect, useRef } from 'react';

export function Comments(): JSX.Element {
  const commentsDiv = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://utteranc.es/client.js';
    script.async = true;
    script.setAttribute('repo', process.env.NEXT_PUBLIC_UTTERANCES_REPO);
    script.setAttribute('issue-term', 'pathname');
    script.setAttribute('label', 'comment :speech_balloon:');
    script.setAttribute('theme', 'photon-dark');
    script.setAttribute('crossorigin', 'anonymous');

    commentsDiv.current.appendChild(script);
  }, []);

  return (
    <section
      id="utterances-comments"
      ref={commentsDiv}
      style={{ width: '100%' }}
    />
  );
}
