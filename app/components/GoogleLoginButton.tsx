import {useMatches} from '@remix-run/react';
import {useRef, useEffect} from 'react';
import {multipass} from '~/lib/multipass/multipass';

interface GoogleJwTResponseType {
  credential: string;
}

declare global {
  var google: {
    accounts: {
      id: {
        initialize: (options: any) => void;
        renderButton: (element: HTMLDivElement | null, options: any) => void;
      };
    };
  };
}

/*
  Google Sign in component.
  @see: https://developers.google.com/identity/gsi/web/guides/display-button
*/
export function GoogleLoginButton() {
  const [root] = useMatches();
  const env = root?.data?.env;
  const init = useRef(false);
  const buttonRef = useRef<HTMLDivElement>(null);

  async function handleJwtResponse(response: GoogleJwTResponseType) {
    // authenticate google customer info via multipass
    await multipass({
      token: response.credential,
      provider: 'google',
      redirect: true, // will redirect to
    });
  }

  useEffect(() => {
    if (typeof window?.google !== 'undefined' || init.current) return;

    init.current = true;

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      google.accounts.id.initialize({
        client_id: env.PUBLIC_GOOGLE_CLIENT_ID,
        callback: handleJwtResponse,
      });

      // @see: https://developers.google.com/identity/gsi/web/reference/js-reference#GsiButtonConfiguration
      google.accounts.id.renderButton(
        buttonRef.current,
        {
          theme: 'outline',
          text: 'Login in with Google',
          size: 'large',
          type: 'standard',
          autoPrompt: false,
        }, // customization attributes
      );
    };

    console.log(document.body);

    document.body.appendChild(script);
  }, []);

  return (
    <div style={{width: '220px', height: '44px', overflow: 'hidde'}}>
      <div ref={buttonRef}>Loading...</div>
    </div>
  );
}
