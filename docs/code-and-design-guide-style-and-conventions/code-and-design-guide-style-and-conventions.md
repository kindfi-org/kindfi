---
icon: code
cover: >-
  https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?crop=entropy&cs=srgb&fm=jpg&ixid=M3wxOTcwMjR8MHwxfHNlYXJjaHw1fHxjb2RlfGVufDB8fHx8MTczNjgzODk1OXww&ixlib=rb-4.0.3&q=85
coverY: 0
---

# Code Style and Conventions Guide

## :computer: Code Guidelines

Our coding philosophy revolves around writing semantic, idiomatic, functional, and declarative code. Here are some key principles to keep in mind:

1. **Utilize modern JavaScript features and TypeScript:** By leveraging the latest language features, we can write cleaner, more expressive code. TypeScript adds an extra layer of type safety, helping catch potential bugs early.
2. **Embrace React's declarative nature:** React is built around the idea of declaring your component structure and letting the framework handle the underlying DOM changes. Avoid imperative code and focus on describing what your UI should look like based on the current state.
3. **Prioritize readability with meaningful naming:** Always strive for self-explanatory code by using clear, meaningful names for variables, functions, and components. This makes your code easier to understand and maintain.
4. **Follow the Single Responsibility Principle:** Each component should have a single, well-defined responsibility. Keep your components small and focused, making them more reusable and easier to reason about.
5. **Favor composability:** Build your components and functions in a way that promotes composition. Use pure functions, keep state simple and flat, and avoid deeply nested objects. This makes your code more modular and adaptable.

By adhering to these general guidelines, you'll be well on your way to writing clean, maintainable code that aligns with our organization's standards.

### JavaScript Conventions

When writing JavaScript code, we follow these conventions:

1. **Naming variables:** Use meaningful names that describe the purpose of the variable. For booleans, prefix the name with auxiliary verbs such as `does`, `has`, `is`, or `should`. For example, `isDisabled`, `hasPermission`, `shouldRefresh`.
2. **Composition over inheritance:** Favor composing smaller, focused components together over creating deep component hierarchies with inheritance. This keeps your code more flexible and easier to modify.
3. **Filenames:** Use lowercase with dash separators for directories and file names. For example, `components/auth-wizard`. File extensions should indicate the type of file: `.config.ts`, `.test.ts`, `.context.tsx`, `.type.ts`, `.hook.ts`. For components, the extension can be omitted.
4. **Avoid default exports:** Prefer named exports over default exports. This makes it clearer what's being imported and helps avoid naming conflicts.

   ```tsx
   // Prefer this
   export const helloMessage = "hello";
   export function saySomething() {
     /* ... */
   }

   // Over this
   const helloMessage = "hello";
   function saySomething() {
     /* ... */
   }
   export default { helloMessage, saySomething };
   ```

5. **Receive an Object, Return an Object (RORO):** When defining functions, especially those interacting with external services, prefer taking an object as input and returning an object as output. This makes the function's interface more explicit and easier to use.

   ```tsx
   // types/services.type.ts
   export interface ServiceParams {
     limit?: number;
     offset?: number;
   }

   // services/account/account.type.ts
   export interface GetAccountsParams extends ServiceParams {
     account?: string;
   }

   // services/account/account.service.ts
   export async function getAccounts({
     account,
     limit = 15,
     offset = 0,
   }: GetAccountsParams) {
     // ...
   }
   ```

6. **Use regular function calls on components:** When attaching event handlers or other callbacks to components, use regular function calls instead of arrow functions. This prevents unnecessary re-renders and potential build errors due to hoisting.

   ```tsx
   export function MyComponent() {
     const myMethod = () => console.log("Hello, World!");

     return (
       <div>
         {/* Prefer this */}
         <button onClick={myMethod}>Click Me</button>

         {/* Over this */}
         <button onClick={() => console.log("Hello, World!")}>Click Me</button>
       </div>
     );
   }
   ```

These conventions help keep our JavaScript code consistent, readable, and maintainable. By following them, you'll be contributing to a cleaner, more collaborative codebase.

### TypeScript Conventions

TypeScript is a powerful tool that helps us catch potential bugs and improve the maintainability of our codebase. Here are some conventions to follow when writing TypeScript:

1. **Type definitions:** Use the appropriate type definition keyword based on the use case:
   - `interface` for objects and class definitions
   - `type` for union types, tuples, aliases, and more complex types
   - `const` for literal types or constants
   - `enum` for enumerations with a fixed set of values
2. **Avoid `any`:** The `any` type should be used sparingly, as it essentially opts out of type checking. If you find yourself using `any`, consider if there's a more specific type that could be used instead. A PR with `any` will likely be pushed back for revision.
3. **Leverage type inference:** TypeScript is often able to infer types based on the context. When the type is clear from the context, you can omit the explicit type annotation to keep your code cleaner and more readable.

   ```tsx
   // Instead of this
   const name: string = "John";

   // You can do this
   const name = "John";
   ```

4. **Use type annotations for function parameters and return values:** Even though TypeScript can often infer types, it's a good practice to explicitly annotate function parameters and return values. This makes the function's interface clear and helps catch type-related issues.

   ```tsx
   function greet(name: string): string {
     return `Hello, ${name}!`;
   }
   ```

5. **Prefer type assertion with `as`:** When you need to assert a type, use the `as` keyword instead of angle-bracket syntax. This is more readable and consistent with JSX syntax.

   ```tsx
   // Prefer this
   const name = someValue as string;

   // Over this
   const name = <string>someValue;
   ```

6. **Use type guards:** Type guards are a powerful way to narrow down the type of a variable within a conditional block. This is particularly useful when working with union types.

   ```tsx
   function processValue(value: string | number) {
     if (typeof value === "string") {
       // In this block, `value` is of type `string`
       console.log(value.toUpperCase());
     } else {
       // In this block, `value` is of type `number`
       console.log(value.toFixed(2));
     }
   }
   ```

By following these TypeScript conventions, you'll be taking full advantage of the language's type system and contributing to a more robust, maintainable codebase.

### ReactJS Conventions

React is at the core of our front-end development. Here are some conventions to keep in mind when writing React components:

1. **Declare components with the function keyword:** Use the `function` keyword to declare your React components. This aligns with the use of React hooks and emphasizes the functional nature of components.

   ```tsx
   export function MyComponent({ param1, param2 }: MyComponentProps) {
     // ...
   }
   ```

2. **Order your component file:** Organize your React component files in the following order:

   1. Imports
   2. Component declaration
   3. Styled components (if any)
   4. TypeScript types and interfaces

   This makes your component files more readable and easier to navigate.

   ```tsx
   // Imports
   import React from "react";
   import { Button, Input } from "~/components/base/button";

   // Constants declaration
   const MAX_LENGTH = 20;

   // Component declaration
   export function MyComponent({ param1, param2 }: MyComponentProps) {
     const submitAction = async () => {
       "use server";
       return await Promise.resolve(console.log("You clicked!!"));
     };

     return (
       <form
         className="w-full max-w-[600px] bg-muted text-muted-foreground m-2 px-4 py-6 rounded-lg"
         action={submitAction}
       >
         <Input name="username" id="username" maxLength={MAX_LENGTH} />
         <Button type="submit">Submit</Button>
       </form>
     );
   }

   // TypeScript types and interfaces
   interface MyComponentProps {
     param1: string;
     param2: number;
   }
   ```

3. **Use PascalCase for component names:** Name your components using PascalCase. This makes it clear that the identifier refers to a React component.

   ```tsx
   // Prefer this
   function MyComponent() {
     /* ... */
   }

   // Over this
   function myComponent() {
     /* ... */
   }
   ```

4. **Keep components small and focused:** Each component should have a single, clear responsibility. If a component starts growing too large, consider breaking it down into smaller, reusable components.
5. **Use functional components and hooks:** With the introduction of hooks, functional components have become the preferred way to write React components. Hooks provide a more concise and flexible way to manage state and side effects in your components.

   ```tsx
   "use client";

   import { useState } from "react";

   function Counter() {
     const [count, setCount] = useState(0);

     return (
       <div>
         <p>Count: {count}</p>
         <button onClick={() => setCount(count + 1)}>Increment</button>
       </div>
     );
   }
   ```

6. **Use TypeScript for props typing:** Always define the types for your component's props using a TypeScript interface. This makes the component's interface clear and helps catch type-related issues.

   ```tsx
   interface GreetingProps {
     name: string;
   }

   function Greeting({ name }: GreetingProps) {
     return <h1>Hello, {name}!</h1>;
   }
   ```

By adhering to these React conventions, you'll be writing components that are more readable, maintainable, and consistent with the rest of our codebase.

### NextJS Conventions

NextJS latest versions are the backbone of our web applications, providing a powerful framework for building React applications. Here are some conventions and best practices to follow when working with NextJS 14/15:

1. **Organize your components:** Maintain a well-structured components folder, following the guidelines outlined in our [Ultimate Guide to Organizing Your Next.js Components Folder](https://www.dhiwise.com/post/ultimate-guide-to-organizing-your-nextjs-components-folder). This includes separating components into subfolders based on their purpose (e.g., layout, UI, forms) and keeping the folder structure flat to improve maintainability.
2. **Leverage Server Components:** Whenever possible, use Server Components to fetch and process data on the server. This can improve security, performance, and developer experience. Refer to the [Data Fetching: Data Fetching Patterns and Best Practices](https://nextjs.org/docs/app/building-your-application/data-fetching/patterns) guide for more information.
3. **Utilize the `use client` directive:** Use the `use client` directive judiciously to mark components as Client Components when you need to use client-side-only features. This can help you strike a balance between server-side and client-side rendering, optimizing your application's performance.
4. **Implement Nested Layouts:** Take advantage of the Nested Layouts feature in the App Router to create a consistent and reusable structure for your application. This can improve the overall user experience and make it easier to manage your application's layout. [Resource: Nested Layouts in Next.js 14](https://www.youtube.com/watch?v=z2-Z5dNb_jg)
5. **Leverage Streaming and Suspense:** Utilize the Streaming and Suspense features in NextJS 14 to provide a more responsive and interactive user experience. This can be particularly beneficial when dealing with large data sets or complex UI components. [Resource: Streaming and Suspense in Next.js 14](https://www.youtube.com/watch?v=Oa9G4iBcgzs)
6. **Follow the File Conventions:** Adhere to the file conventions outlined in the [Next.js Documentation](https://nextjs.org/docs/app/api-reference/file-conventions) to ensure your application's structure is consistent and easy to navigate. This includes using the appropriate files for layouts, pages, error handling, and more.
7. **Optimize Data Fetching:** Implement the recommended data fetching patterns, such as fetching data on the server, fetching data where it's needed, and using the preload pattern to prevent waterfalls. Refer to the [Data Fetching: Data Fetching Patterns and Best Practices](https://nextjs.org/docs/app/building-your-application/data-fetching/patterns) guide for more details.
8. **Leverage Metadata Files:** Utilize the Metadata File Conventions to manage your application's icons, Open Graph and Twitter images, and SEO-related files. This can help improve the overall presentation and discoverability of your application. Resource: [Metadata File Conventions in Next.js](https://nextjs.org/docs/app/api-reference)
9. **Maintain a Consistent Coding Style:** Enforce a consistent coding style across your development team by using tools like ESLint and Prettier. This can improve code readability, maintainability, and collaboration.
10. **Stay Up-to-Date with NextJS Releases:** Regularly review the NextJS documentation and release notes to stay informed about the latest features, improvements, and best practices. This will help you make the most of the NextJS ecosystem and ensure your application remains optimized and secure.

By following these NextJS 14 conventions and best practices, you'll be building applications that are performant, maintainable, and aligned with the latest industry standards.

#### Dive Deeper: OK, Server Components are cool but, what happens for slow or unstable internet connections?

While server components in NextJS 14/15 offer many benefits, they face challenges with slow or unstable internet connections. Let's examine these scenarios and discuss strategies to address potential issues.

**Initial Load Time**

Since server components are rendered on the server and the HTML is sent to the client, the initial load time can be slower on slow or unstable connections. The client has to wait for the server to generate and send the HTML before it can display the page.

Imagine you're trying to load a webpage on a slow connection. With server components, the server has to do more work upfront to prepare the page for you. It's like ordering a meal at a restaurant - if the kitchen is busy or understaffed, you might have to wait longer for your food to arrive, even if it'll be a delicious meal.

**Interactivity Delay**

Server components are not interactive until the client-side JavaScript is loaded and hydrated. This means that on slow connections, users may experience a delay before they can interact with parts of the page that are server components.

Think of it like a toy that needs batteries. The server components are like the toy's body - they provide the structure and look of the page. But to make the toy actually work and be interactive, you need to put in the batteries - that's the client-side JavaScript. On a slow connection, it takes longer to get those batteries in place, so you can't play with the toy right away.

**Streaming and Suspense**

NextJS 14 introduces Streaming and Suspense features to help mitigate the initial load time issues with server components. These features allow the server to send the HTML to the client in chunks, and the client can display the page as it's being loaded. However, these features still rely on a stable connection to work effectively.

Imagine you're streaming a movie. With a good connection, the movie loads quickly and you can start watching almost immediately. If your connection is slow or unstable, the movie might pause to buffer frequently, disrupting your viewing experience. Streaming and Suspense in NextJS work similarly - they try to give you content as quickly as possible, but they can still be impacted by poor network conditions.

**Offline Functionality**

Server components, by their nature, require a connection to the server to render. This means that server components will not work at all when the user is offline, unlike client components which can potentially still function.

Think of server components like a remote control car. The car (the component) needs to be constantly communicating with the remote (the server) to function. If the battery dies or the remote goes out of range, the car stops working. Similarly, if the user's internet connection drops, server components will stop working because they can't communicate with the server.

To address these challenges, we can employ several strategies:

1. **Optimize Server Component Usage:** We should carefully consider which parts of the application truly benefit from server-side rendering and use server components judiciously. Overusing server components can negatively impact performance on slow connections.
2. **Implement Fallbacks and Offline Support:** We can provide fallback content or alternative experiences for users with slow or unstable connections. This could include using client components for critical interactive features or implementing offline support using service workers.
3. **Leverage Caching and Preloading:** We can use techniques like caching and preloading to improve the initial load time of server components, especially for content that is unlikely to change frequently.
4. **Monitor and Test Performance:** We should continuously monitor the performance of the application, especially on slow or unstable connections, and make adjustments to the use of server components as needed.

By being mindful of the potential drawbacks of server components on slow or unstable connections and implementing appropriate mitigation strategies, we can still leverage the benefits of server components while providing a good user experience for all users.

#### Honorable Mention: Comparison between NextJS 13 and NextJS 14

NextJS 14 brought significant changes and improvements compared to NextJS 13. Let's explore some of the key differences between these two versions and understand how NextJS 14 builds upon and enhances the capabilities introduced in NextJS 13.

#### App Router

One of the most significant changes in NextJS 14 is the introduction of the App Router. The App Router provides a more intuitive and powerful routing system compared to the Pages Router used in NextJS 13.

Imagine you're planning a trip. With the Pages Router in NextJS 13, you had to plan each part of your trip separately - booking flights, hotels, and activities individually. It worked, but it could be a bit cumbersome and didn't always give you a clear overall picture of your trip.

The App Router in NextJS 14 is like having a travel agent. They help you plan your entire trip in a more cohesive way, considering how each part connects to the others. They might suggest a flight that arrives at a convenient time for checking into your hotel, or an activity that's close to where you're staying. This is similar to how the App Router helps manage the different parts of your application in a more interconnected and efficient way.

Some of the key features of the App Router include:

- **Nested Layouts:** This feature allows you to create a hierarchy of layouts that can be shared across multiple pages. It's like having a consistent design theme throughout your trip - the same color scheme in your hotel room, a similar style of restaurants, etc. This consistency makes your trip (or in this case, your application) feel more cohesive and easier to navigate.
- **Server Components:** The App Router encourages the use of Server Components, which allow you to render parts of your page on the server. This is like having a concierge at your hotel who can take care of certain tasks for you, like making restaurant reservations or arranging transportation. Server Components can handle data fetching and other server-side tasks, making your application more efficient and secure.
- **Streaming and Suspense:** These features allow your application to load content incrementally, rather than waiting for the entire page to load before displaying anything. It's like being able to start your vacation while you're still planning parts of it - you can enjoy the beach while you're still deciding on which activities to do later in the trip.

#### Server Components

NextJS 14 heavily emphasizes the use of Server Components. Server Components allow you to render parts of your page on the server, which can improve performance, security, and developer experience.

Let's use a restaurant analogy. Imagine you're ordering a meal at a restaurant. Some parts of the meal, like the salad or appetizer, can be prepared quickly and served to you right away. Other parts, like a well-done steak, take longer to prepare.

In this analogy, the parts of the meal that can be served quickly are like Client Components - they can be rendered immediately on the client side. The parts that take longer, like the steak, are like Server Components - they're prepared on the server and then sent to the client.

This approach has several benefits:

- **Improved Performance:** By rendering certain parts of the page on the server, you can reduce the amount of work the client has to do, which can lead to faster load times.
- **Better Security:** Server Components can handle sensitive tasks like data fetching and authentication on the server, reducing the risk of exposing sensitive information to the client.
- **Enhanced Developer Experience:** Server Components can make your code more modular and easier to reason about, as you can clearly separate server-side and client-side logic.

#### `use client` Directive

In NextJS 14, you can use the `use client` directive to specify that a particular component should be rendered on the client side, even within the App Router.

Let's go back to our restaurant analogy. Imagine you have a specific dietary requirement, like a gluten allergy. When you order your meal, you need to communicate this to the server so they can prepare your meal accordingly.

The `use client` directive is like a special note on your order that tells the kitchen, "This part of the meal needs to be handled differently." It lets NextJS know that even though a component is part of the App Router (which generally encourages Server Components), this particular component needs to be rendered on the client side.

This is useful when you have a component that relies on client-side state or interactivity, like a form or a button that triggers a client-side event.

By using the `use client` directive judiciously, you can strike a balance between the benefits of Server Components and the flexibility of Client Components, optimizing your application's performance and user experience.

In conclusion, NextJS 14 builds upon the foundation laid by NextJS 13 and introduces significant enhancements, particularly in the areas of routing, server-side rendering, and developer experience. By understanding and leveraging features like the App Router, Server Components, and the `use client` directive, you can create powerful, efficient, and maintainable applications that deliver a great user experience.

### Styling

At our organization, we use Tailwind CSS for styling our React components. Tailwind CSS is a utility-first CSS framework that allows us to rapidly build custom user interfaces.

Imagine you're painting a picture. In traditional approaches to CSS (which we can compare to painting), you might have a separate palette for each color - one for blues, one for greens, one for reds, and so on. Whenever you want to use a color, you have to go to the appropriate palette, find the exact shade you want, and then apply it to your canvas.

Tailwind CSS is like having a single, giant palette that contains every color you could possibly need, all organized in a logical way. Instead of having to go to separate palettes for each color, you have all the colors right at your fingertips. This makes it much faster and easier to get the exact color you want, when you want it.

In CSS terms, this means that instead of writing custom CSS classes for each element (like going to separate color palettes), you use predefined utility classes (like having all colors on one palette) to style your elements directly in your HTML.

Here are some of the key benefits of using Tailwind CSS:

1. **Faster Development:** With Tailwind, you spend less time writing custom CSS and more time focusing on your application's functionality and design. It's like being able to paint your picture faster because you don't have to keep switching between different color palettes.
2. **Consistent Design:** Tailwind provides a predefined set of design tokens (like colors, spacing, and typography) that ensure consistency across your application. It's like having a guide that ensures you use colors that complement each other, or that your brush strokes are consistent throughout your painting.
3. **Responsive Design:** Tailwind makes it easy to build responsive designs by providing utility classes for different screen sizes. It's like having a tool that automatically adjusts your painting for different canvas sizes.
4. **Maintainable Code:** With Tailwind, your styles are defined directly in your HTML, making it easier to understand how your components are styled. If you want to change a style, you can do it directly in your HTML, rather than hunting through a separate CSS file. It's like being able to make changes to your painting directly on the canvas, rather than having to refer back to a separate sketch.
5. **Small CSS Footprint:** Tailwind generates only the CSS you actually use, resulting in a smaller CSS footprint. It's like having a palette that only contains the colors you actually used in your painting, rather than a palette with colors you never touched.

Here's an example of how you might style a button using Tailwind:

```html
<button
  class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
>
  Click Me!
</button>
```

In this example, we're using Tailwind utility classes to style the button:

- `bg-blue-500` sets the background color to a specific shade of blue.
- `hover:bg-blue-700` changes the background color when the button is hovered over.
- `text-white` makes the button text white.
- `font-bold` makes the text bold.
- `py-2` adds padding to the top and bottom of the button.
- `px-4` adds padding to the left and right of the button.
- `rounded` makes the button corners rounded.

This approach allows us to quickly and easily style our components without writing any custom CSS.

In summary, Tailwind CSS is a powerful tool that allows us to rapidly build consistent, responsive, and maintainable user interfaces. By using Tailwind, we can focus more on our application's functionality and design, and less on writing custom CSS. It's like having a giant, well-organized palette that makes painting your picture faster, easier, and more consistent.
