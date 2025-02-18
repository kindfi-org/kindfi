# Supabase Service - KindFi

This document provides instructions for developers to set up and run the Supabase service locally within the KindFi monorepo.

## Prerequisites

Ensure you have the following installed on your machine:

- [Node.js](https://nodejs.org/)
- [Bun](https://bun.sh/)
- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)
- [Supabase CLI](https://supabase.com/docs/guides/local-development)

## Setup

1. **Clone the Repository (if you haven't already)**

```sh
git clone https://github.com/kindfi-org/kindfi.git
cd monorepo/services/supabase
```

2. **Install Dependencies**

```sh
bun install
```

3. **Get Ready For Migrations**

To create migrations, please follow this [guide](https://supabase.com/docs/guides/local-development/overview#database-migrations), it provides steps to generate migrations, ensure that they work before pushing.

## Running Supabase Locally

1. **Start Supabase Services**

Use the following command to start the Supabase services:

```sh
bun start # supabase start
```

This will start the Supabase local development environment, including the database, authentication, and storage services.

2. **Generate Types and Schemas**

Generate the necessary types and schemas for the Supabase service:

```sh
bun gen:remote # generates what it is in the linked (remote) database
bun gen # generates what it is in local database
```

3. **Environment Variables**

Copy the sample environment file and update it with your configuration:

```sh
cp .env.sample .env
```

Update the `.env` file with the KindFi Supabase project id. This is for remote type generation and to identify the local development host.

## Useful Commands

- **Apply (new) migrations to the local database**

  ```sh
  bun migrate # When adding new migrations file, this makes sure to apply them.
  ```

- **Apply migrations by resetting local database completely**

  ```sh
  bun reset # When adding new migrations file, this makes sure to apply them by resetting from the migrations.
  ```

## Documentation

For more detailed instructions and advanced configurations, refer to the [Supabase Local Development Guide](https://supabase.com/docs/guides/local-development).
