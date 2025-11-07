# Routing Implementation

This document explains the routing implementation in the Kindfi KYC Server application, which combines server-side rendering (SSR) with client-side routing.

## Overview

The application uses a hybrid routing approach:

1. **Server-Side Routes**: Initial requests are handled by the server, which renders the full HTML
2. **Client-Side Routes**: After the initial load, navigation is handled by React Router on the client

This approach provides the best of both worlds: fast initial loads with SEO benefits, and smooth navigation without full page reloads.

## Server-Side Routing

### Implementation

Server-side routing is implemented in `src/index.tsx` and `src/routes/react.tsx`.

#### Route Definition

Routes are defined in `src/routes/react.tsx`:

```typescript
export const reactRoutes = {
  '/': {
    async GET(req: Request) {
      // Handle GET request for the home page
      return withConfiguredCORS(async () => {
        const stream = await renderToReadableStream(
          <Home message="Welcome to Kindfi KYC Server!" />,
        );

        return new Response(stream, {
          headers: { 'Content-Type': 'text/html' },
        });
      })(req);
    },
    OPTIONS: withConfiguredCORS(() => new Response(null)),
  },

  '/react': {
    async GET(req: Request) {
      // Handle GET request for the React demo page
      // ...
    },
    OPTIONS: withConfiguredCORS(() => new Response(null)),
  },
};
```

#### Route Handling

The server handles routes in `src/index.tsx`:

```typescript
// Check if the route exists in our routes object
const pathname = url.pathname;
const route = routes[pathname as keyof typeof routes];

if (route) {
  const method = req.method;
  if (method in route) {
    // @ts-expect-error method is dynamically accessed
    return route[method](req);
  }

  // Method not allowed
  return new Response("Method not allowed", { status: 405 });
}
```

### Server-Side Rendering

For React routes, the server uses `renderToReadableStream` to render the component to an HTML stream:

```typescript
const stream = await renderToReadableStream(
  <Home message="Welcome to Kindfi KYC Server!" />,
);

return new Response(stream, {
  headers: { 'Content-Type': 'text/html' },
});
```

## Client-Side Routing

### Implementation

Client-side routing is implemented using React Router in `src/client.tsx` and `src/components/App.tsx`.

#### Router Configuration

The router is configured in `src/client.tsx`:

```typescript
const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        element: <div className="card">
          <p>Welcome to Kindfi KYC Server!</p>
          <p>Server-side rendered with React and Bun</p>
        </div>,
      },
      {
        path: 'react',
        element: <div className="card">
          <p>This page is server-side rendered with React and Bun!</p>
          <p>Client-side navigation powered by React Router</p>
        </div>,
      },
    ],
  },
]);
```

#### Navigation Component

The `App` component in `src/components/App.tsx` provides the navigation UI:

```typescript
export function App() {
  const location = useLocation();

  return (
    <>
      <nav>
        <ul>
          <li>
            <Link
              to="/"
              className={location.pathname === '/' ? 'active' : ''}
            >
              Dashboard
            </Link>
          </li>
          <li>
            <Link
              to="/users"
              className={location.pathname === '/users' ? 'active' : ''}
            >
              Users
            </Link>
          </li>
          <li>
            <Link
              to="/websocket"
              className={location.pathname === '/websocket' ? 'active' : ''}
            >
              WS Health
            </Link>
          </li>
          <li>
            <Link
              to="/about"
              className={location.pathname === '/about' ? 'active' : ''}
            >
              About
            </Link>
          </li>
        </ul>
      </nav>
      <Outlet />
    </>
  );
}
```

### Hydration

The client-side JavaScript hydrates the server-rendered HTML:

```typescript
document.addEventListener('DOMContentLoaded', () => {
  const root = document.getElementById('root');
  if (root) {
    hydrateRoot(root, <RouterProvider router={router} />);
  }
});
```

## How It Works Together

1. **Initial Request**:
   - User requests a page (e.g., `/` or `/react`)
   - Server renders the full HTML using the `Home` component
   - HTML includes links to the client-side JavaScript

2. **Hydration**:
   - Browser loads the client-side JavaScript
   - React hydrates the server-rendered HTML
   - React Router takes over navigation

3. **Client-Side Navigation**:
   - User clicks a link
   - React Router prevents the default navigation
   - React Router updates the URL using the History API
   - React Router renders the appropriate component
   - No full page reload occurs

## Benefits

- **Fast Initial Load**: Server-side rendering provides a fast initial page load
- **SEO-Friendly**: Search engines can crawl and index the content
- **Smooth Navigation**: Client-side routing provides a smooth, app-like experience
- **Progressive Enhancement**: The site works even if JavaScript is disabled

## Considerations

- **Initial HTML Size**: Server-rendered HTML may be larger than a minimal client-side app
- **Hydration Mismatch**: Ensure server and client render the same content to avoid hydration errors
- **SEO for Client Routes**: Only server-rendered content is visible to search engines on initial load

## Advanced Techniques

For more advanced routing needs, consider:

- **Data Loading**: Use React Router's data loading capabilities
- **Code Splitting**: Split your bundle by route for faster loading
- **Prefetching**: Prefetch routes when links come into view
- **Transitions**: Add animations between route changes
