import {GoogleLoginButton} from '~/components/GoogleLoginButton';
import {type LoaderArgs, json, redirect} from '@shopify/remix-oxygen';

export async function loader({context, params}: LoaderArgs) {
  const customerAccessToken = await context.session.get('customerAccessToken');

  if (customerAccessToken) {
    return redirect(params.lang ? `${params.lang}/account` : '/account');
  }

  // TODO: Query for this?
  return json({shopName: 'Hydrogen'});
}

export default function GoogleLogin() {
  return (
    <div className="flex justify-center my-24 px-4">
      <div className="max-w-md w-full">
        <h1 className="text-4xl">Sign in.</h1>
        <br />
        <GoogleLoginButton />
      </div>
    </div>
  );
}
