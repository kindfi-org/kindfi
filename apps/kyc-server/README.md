# My Express App

This is an Express application that use TypeScript, PostgreSQL, and Drizzle ORM. It consumes mainly the AI monorepo service to do the KYC verification.

## Project Structure

```
kindfi
├── apps
│   ├── kyc-server
│   │   ├── public
│   │   │   └── styles.css       # Styles for the KYC dashboard
│   │   ├── src
│   │   │   ├── controllers      # Contains controllers for handling requests
│   │   │   │   └── kyc.ts       # KYC controller
│   │   │   ├── models           # Contains data models
│   │   │   │   └── kyc-application.ts # KYC application model
│   │   │   ├── resolvers        # GraphQL resolvers
│   │   │   │   └── index.ts     # Resolver definitions
│   │   │   ├── server.ts        # Server setup
│   │   │   └── app.ts           # Entry point of the application
│   │   ├── package.json         # NPM dependencies and scripts
│   │   ├── tsconfig.json        # TypeScript configuration
│   │   └── README.md            # Project documentation
├── services
│   └── supabase
│       └── .branches
│           └── _current_branch  # Current branch information
├── package.json                 # Monorepo configuration
└── README.md                    # Monorepo documentation
```

## Installation

1. Clone the repository:

   ```
   git clone <repository-url>
   cd kindfi/apps/kyc-server
   ```

2. Install dependencies:

   ```
   bun install
   ```

## Configuration

Make sure to configure your PostgreSQL database connection in `src/app.ts` using Drizzle ORM. Additionally, set up your environment variables by creating a `.env` file based on the `.env.sample` provided.

### Why Drizzle ORM?

Drizzle ORM is a lightweight and easy-to-use ORM for Node.js. It simplifies database interactions with a straightforward API and supports multiple databases. In the KindFi monorepo, Drizzle ORM helps manage shared database access across services, reducing complexity and making the application easier to maintain and extend. Using Drizzle ORM for admin actions avoids overloading Supabase with requests, ensuring efficient database operations.

## Running the Application

To start the application, run:

```
bun start
```

## License

This project is licensed under the MIT License.
