import type {HydrogenSession} from '~/lib/session.server';
import {type LoaderArgs, redirect} from '@shopify/remix-oxygen';
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

/**
 *  Authenticate a multipass token request
 */
export async function loader({params, context}: LoaderArgs) {
  const {session, storefront, env} = context;

  // multipass token
  const passedToken = params.token;

  try {
    if (!passedToken) {
      return await redirectHomeError({
        session,
        error: 'Multipass token not found',
      });
    }

    // create a multipassify instance
    const multipassify = new Multipassify(
      env.PRIVATE_SHOPIFY_STORE_MULTIPASS_SECRET,
    );
    // extract customer from the multipass token
    const customer = multipassify.parseToken(passedToken);

    const return_to = customer?.return_to || '/account/login';

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

      session.flash('error', messages);
      return await redirectHomeError({session, error: messages});
    }

    if (!token) {
      return await redirectHomeError({
        session,
        error: 'Access token not found',
      });
    }

    const {customerAccessToken} = token;

    if (customerAccessToken) {
      // store the customer access token in the session
      session.set('customerAccessToken', customerAccessToken);
    }

    return redirect(return_to, {
      headers: {
        'Cache-Control': 'no-cache',
        'Set-Cookie': await session.commit(),
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : JSON.stringify(error);
    return await redirectHomeError({session, error: message});
  }
}

async function redirectHomeError({
  session,
  error,
}: {
  session: HydrogenSession;
  error: string;
}) {
  session.flash('error', error);
  return redirect('/', {
    headers: {
      'Cache-Control': 'no-cache',
      'Set-Cookie': await session.commit(),
    },
  });
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
