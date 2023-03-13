import {redirect, type LoaderArgs} from '@shopify/remix-oxygen';
import {Multipassify} from '~/lib/multipass/multipassify.server';

type QueryError = {
  message: string;
  code: string;
  field: string;
};

type MultipassTokenResponse = {
  result: {
    token: {
      customerAccessToken: string;
    };
    customerUserErrors: QueryError[];
  };
};

/*
  Redirect document GET requests to the login page (housekeeping)
*/
export async function loader({request, params, context}: LoaderArgs) {
  const {session, storefront, env} = context;
  const url = new URL(request.url);
  const searchParams = new URLSearchParams(url.search);
  const state = searchParams.get('state');
  console.log('state', state);

  try {
    const passedToken = params.token;
    console.log('passedToken', passedToken);

    // create a multipassify instance
    const multipassify = new Multipassify(
      env.PRIVATE_SHOPIFY_STORE_MULTIPASS_SECRET,
    );

    // extract customer from the multipass token
    const customer = multipassify.parseToken(passedToken);

    console.log('customer', customer);

    // retrieve the customer token based on the multipass token
    const {result} = await storefront.mutate<MultipassTokenResponse>(
      CUSTOMER_ACCESS_TOKEN_FROM_TOKEN_MUTATION,
      {
        variables: {
          multipassToken: passedToken,
        },
      },
    );

    const {token, customerUserErrors} = result;

    if (customerUserErrors.length) {
      const messages = customerUserErrors
        .map((error: QueryError) => error.message)
        .join(', ');

      console.log('customerUserErrors', messages);
      // purposely not passing session_token back to fail auth0
      return redirect(`https://jbaz.auth0.com/login`);
    }

    if (!token?.customerAccessToken) {
      // purposely not passing session_token back to fail auth0
      console.log('missing customerAccessToken', token);
      return redirect(`https://jbaz.auth0.com/login`);
    }

    const {customerAccessToken} = token;

    // store the customer access token in the session
    session.set('customerAccessToken', customerAccessToken);

    console.log('setting customerAccessToken', customerAccessToken);

    return redirect(`https://jbaz.auth0.com/continue?state=${state}`, {
      headers: {
        'Cache-Control': 'no-cache',
        'Set-Cookie': await session.commit(),
      },
    });
  } catch (error) {
    let message = 'unknown error';
    if (error instanceof Error) {
      message = error.message;
      // eslint-disable-next-line no-console
      console.log('Multipass error:', error.message);
    } else {
      message = JSON.stringify(error);
    }

    console.log('error', message);
    return redirect(`https://jbaz.auth0.com/login`);
  }
}

const CUSTOMER_ACCESS_TOKEN_FROM_TOKEN_MUTATION = `#graphql
  mutation customerAccessTokenCreateWithMultipass($multipassToken: String!) {
    result: customerAccessTokenCreateWithMultipass(
      multipassToken: $multipassToken
    ) {
      token: customerAccessToken {
        customerAccessToken: accessToken
        expiresAt
      }
      customerUserErrors {
        code
        field
        message
      }
    }
  }
`;
