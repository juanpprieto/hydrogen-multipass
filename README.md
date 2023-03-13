# Hydrogen Demo Store + Multipass Google Sign in and checkout persistence

At the time of writing [multipass](https://shopify.dev/docs/api/multipass) is available for Shopify Plus customers only.

## 1. Checkout login persistence

Demonstrates how to persist the user session between Hydrogen and the checkout.

### Implementation

1. Add env variables
2. Add the [MulitpassCheckoutButton](https://github.com/juanpprieto/hydrogen-multipass/blob/main/app/components/MultipassCheckoutButton.tsx) to `/app/components/MultipassCheckoutButton.tsx`
3. Add the [multipass.tsx](https://github.com/juanpprieto/hydrogen-multipass/blob/main/app/lib/multipass/multipass.ts) helper to `/lib/multipass/multipass.tsx`
4. Add the [Multipassify class](https://github.com/juanpprieto/hydrogen-multipass/blob/main/app/lib/multipass/multipassify.server.ts) to `/lib/multipass/multipassify.server.tsx`
5. Add the [multipass token generation route](https://github.com/juanpprieto/hydrogen-multipass/blob/main/app/routes/(%24lang)/account/__public/login.multipass.tsx) to `app/routes/($lang)/account/__public/login.multipass.tsx`
6. [Implement](https://github.com/juanpprieto/hydrogen-multipass/blob/0ceaf0207d2a9464d82b458275a8a254452b77dc/app/components/Cart.tsx#L180) the `<MulitpassCheckoutButton />` in the `<Cart />` component at `app/components/Cart.tsx`
 
### Flow

1. Login via `/account/login`
2. Add any product to the cart
3. Click checkout. The [MultipassCheckoutButton](https://github.com/juanpprieto/hydrogen-multipass/blob/main/app/components/MultipassCheckoutButton.tsx) runs the  multipass [helper](https://github.com/juanpprieto/hydrogen-multipass/blob/main/app/lib/multipass/multipass.ts)
4. The `multipass` helper makes a POST request to the multipass route `/account/login/multipass` to generate a token for the current `customer` and the `target url` in this case `cart.checkoutUrl`
5. With the token, the `multipass` helper then redirects to the `${PRIVATE_SHOPIFY_CHECKOUT_DOMAIN}/account/login/multipass/token` for token authentication. If successful, the user is authenticated and redirected to the `checkoutUrl` otherwise the user is still redirected but it is not authenticated.

## 2. External user authentication via Google sign in 

The `/account/login-google` route demonstrates loginng with a 3rd-Party auth provider (Google Sign in) and Shopify multipass.

### Implementation

1. Add env variables
2. Add the [GoogleSingInButton](https://github.com/juanpprieto/hydrogen-multipass/blob/main/app/components/GoogleLoginButton.tsx) to `app/components/GoogleLoginButton.tsx`
3. Add the [multipass.tsx](https://github.com/juanpprieto/hydrogen-multipass/blob/main/app/lib/multipass/multipass.ts) helper to `/lib/multipass/multipass.tsx`
4. Add the [Multipassify class](https://github.com/juanpprieto/hydrogen-multipass/blob/main/app/lib/multipass/multipassify.server.ts) to `/lib/multipass/multipassify.server.tsx`
5. Add the [multipass token generation route](https://github.com/juanpprieto/hydrogen-multipass/blob/main/app/routes/(%24lang)/account/__public/login.multipass.tsx) to `app/routes/($lang)/account/__public/login.multipass.tsx`
6. Add the [multipass token validation route](https://github.com/juanpprieto/hydrogen-multipass/blob/main/app/routes/(%24lang)/account/__public/login.multipass.%24token.tsx) to `app/routes/(%24lang)/account/__public/login.multipass.%24token.tsx`
7. [Implement](https://github.com/juanpprieto/hydrogen-multipass/blob/main/app/routes/(%24lang)/account/__public/login-google.tsx) the `<GoogleSignIn />` in the  google sign in login route (or `/app/routes/account/login`) `app/components/Cart.tsx`

### Multipass Google login flow:

1. Login via `/account/login-google/`
2. The [<GoogleSignInButton />](https://github.com/juanpprieto/hydrogen-multipass/blob/main/app/components/GoogleLoginButton.tsx) triggers the google auth flow
3. Using the return google user data we trigger the [multipass](https://github.com/juanpprieto/hydrogen-multipass/blob/0ceaf0207d2a9464d82b458275a8a254452b77dc/app/components/GoogleLoginButton.tsx#L52) helper to automatically create (if the customer does not exist in Shopify) or login (if it exists) via multipass
4. The `multipass` helper makes a POST request to the route `/account/login/multipass` to generate a token for the current `customer` and the `target url` in this case `/account`
6. The helper redirects to the local multipass validator `/account/login/multipass/token` which persists the user session upon successful validation and redirects to the target url `/account`.

### Required env vars

```env
PRIVATE_SHOPIFY_STORE_MULTIPASS_SECRET=64 chars (Shopify Plus only)
PUBLIC_STORE_DOMAIN=your-store.myshopify.com
PRIVATE_SHOPIFY_CHECKOUT_DOMAIN=checkout.your-store.com (e.g if configured, otherwise repeat your-store.myshopify.com)
PUBLIC_GOOGLE_CLIENT_ID=xyz123.apps.googleusercontent.com
```







Hydrogen is Shopify’s stack for headless commerce. Hydrogen is designed to dovetail with [Remix](https://remix.run/), Shopify’s full stack web framework. This template contains a **full-featured setup** of components, queries and tooling to get started with Hydrogen.

[Check out Hydrogen docs](https://shopify.dev/custom-storefronts/hydrogen)
[Get familiar with Remix](https://remix.run/docs/en/v1)

## What's included

- Remix
- Hydrogen
- Oxygen
- Shopify CLI
- ESLint
- Prettier
- GraphQL generator
- TypeScript and JavaScript flavors
- Tailwind CSS (via PostCSS)
- Full-featured setup of components and routes

## Getting started

**Requirements:**

- Node.js version 16.14.0 or higher

```bash
npm create @shopify/hydrogen@latest --template demo-store
```

Remember to update `.env` with your shop's domain and Storefront API token!

## Building for production

```bash
npm run build
```

## Local development

```bash
npm run dev
```
