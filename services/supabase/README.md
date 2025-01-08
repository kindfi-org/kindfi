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

3. **Environment Variables**

Copy the sample environment file and update it with your configuration:

```sh
cp .env.sample .env
```

Update the `.env` file with your Supabase project URL and API key.

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
bun gen:local # generates what it is in local
bun gen # generates what it is in remote
```

## Useful Commands

- **Pull Remote Database Schema**

  ```sh
  bun db:pull
  ```

- **Push Local Database Schema**

  ```sh
  bun db:push
  ```

## Documentation

For more detailed instructions and advanced configurations, refer to the [Supabase Local Development Guide](https://supabase.com/docs/guides/local-development).
