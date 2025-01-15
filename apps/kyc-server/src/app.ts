import { ApolloServer } from 'apollo-server-express'
import 'dotenv/config'
import { defineConfig } from 'drizzle-kit'
import { drizzle } from 'drizzle-orm/node-postgres'
import express from 'express'
import { resolvers } from './resolvers'
import { setRoutes } from './routes'
import { apolloTypeDef } from './types/apollo-resolvers'

const app = express()
const PORT = process.env.PORT || 3000

// Database connection
const db = drizzle({
	connection: {
		connectionString: process.env.DATABASE_URL ?? '',
		ssl: true,
	},
})

// Middleware
app.use(express.json())

// Initialize Apollo Server with type definitions and resolvers
const server = new ApolloServer({
	typeDefs: apolloTypeDef,
	resolvers,
})

// Set up routes
setRoutes(app, db)

app.listen(PORT, () => {
	console.log(`Server is running on http://localhost:${PORT}`)
})

export default defineConfig({
	out: './src/db/drizzle',
	schema: './src/db/schema.ts',
	dialect: 'postgresql',
	dbCredentials: {
		url: process.env.DATABASE_URL || '',
	},
})
