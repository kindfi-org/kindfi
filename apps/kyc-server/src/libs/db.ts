import { drizzle } from "drizzle-orm/postgres-js";
import { createClient } from "@supabase/supabase-js";
import postgres from "postgres";
import { kycStatus } from "../schema/kyc";

// Fail fast when required environment variables are missing
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
	throw new Error("SUPABASE_URL and SUPABASE_ANON_KEY must be defined");
}

// Initialize Supabase client
const supabase = createClient(
	process.env.SUPABASE_URL,
	process.env.SUPABASE_ANON_KEY,
	{
		auth: {
			persistSession: false
		}
	}
);

// Get the database connection string from Supabase
const getDatabaseUrl = async () => {
	try {
		const { data, error } = await supabase.rpc("get_database_url");
		if (error) throw error;
		if (!data) throw new Error("Database URL not found");
		return data;
	} catch (error) {
		console.error("Error getting database URL:", error);
		throw error;
	}
};

// Initialize database connection
const initDatabase = async () => {
	try {
		const databaseUrl = await getDatabaseUrl();
		const client = postgres(databaseUrl, {
			max: 10, // Maximum number of connections
			idle_timeout: 20, // Idle connection timeout in seconds
			connect_timeout: 10, // Connection timeout in seconds
		});
		
		return drizzle(client, {
			schema: {
				kycStatus,
			},
		});
	} catch (error) {
		console.error("Error initializing database:", error);
		throw error;
	}
};

// Export the database instance
export const db = await initDatabase();
export type Database = typeof db;
