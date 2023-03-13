import {useLoaderData} from '@remix-run/react';
import {type LoaderArgs, json, redirect} from '@shopify/remix-oxygen';

export async function loader({context, params}: LoaderArgs) {
  const {env} = context;
  const customerAccessToken = await context.session.get('customerAccessToken');

  if (customerAccessToken) {
    return redirect(params.lang ? `${params.lang}/account` : '/account');
  }

  return json({
    env: {
      PUBLIC_AUTH0_CLIENT_ID: env.PUBLIC_AUTH0_CLIENT_ID,
      PUBLIC_AUTH0_DOMAIN: env.PUBLIC_AUTH0_DOMAIN,
      PUBLIC_HYDROGEN_DOMAIN: env.PUBLIC_HYDROGEN_DOMAIN,
    },
  });
}

export default function GoogleLogin() {
  const {env} = useLoaderData();
  const loginUrl = `https://${env.PUBLIC_AUTH0_DOMAIN}/authorize?response_type=code&client_id=${env.PUBLIC_AUTH0_CLIENT_ID}&return_to=http%3A%2F%2F${env.PUBLIC_HYDROGEN_DOMAIN}&scope=SCOPE&state=STATE`;
  return (
    <div className="flex justify-center my-24 px-4">
      <div className="max-w-md w-full">
        <h1 className="text-4xl">Sign in.</h1>
        <br />
        <a href={loginUrl}>Login with oAuth</a>
      </div>
    </div>
  );
}
