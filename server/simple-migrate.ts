import { db } from "./db";
import { sql } from "drizzle-orm";

export async function runSimpleMigrations() {
  try {
    console.log("Running simple database migrations...");

    // Only add critical missing columns that are needed for delivery partner system
    const migrations = [
      // Ensure delivery_partner_id column exists in deliveries table
      {
        name: "Add delivery_partner_id to deliveries",
        query: sql`ALTER TABLE deliveries ADD COLUMN IF NOT EXISTS delivery_partner_id INTEGER REFERENCES delivery_partners(id)`
      },
      
      // Ensure notifications table has data column for JSON storage
      {
        name: "Add data column to notifications",
        query: sql`ALTER TABLE notifications ADD COLUMN IF NOT EXISTS data TEXT`
      },

      // Add firebase_uid column to users table
      {
        name: "Add firebase_uid to users table",
        query: sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS firebase_uid TEXT UNIQUE`
      },
      
      // Ensure admin_users table exists with minimal schema
      {
        name: "Create admin_users table",
        query: sql`
          CREATE TABLE IF NOT EXISTS admin_users (
            id SERIAL PRIMARY KEY,
            email TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL,
            full_name TEXT NOT NULL,
            role TEXT NOT NULL DEFAULT 'admin',
            created_at TIMESTAMP DEFAULT NOW() NOT NULL,
            is_active BOOLEAN DEFAULT true
          )
        `
      },

      // Create password reset tokens table
      {
        name: "Create password_reset_tokens table",
        query: sql`
          CREATE TABLE IF NOT EXISTS password_reset_tokens (
            id SERIAL PRIMARY KEY,
            user_id INTEGER NOT NULL REFERENCES users(id),
            token TEXT NOT NULL UNIQUE,
            expires_at TIMESTAMP NOT NULL,
            created_at TIMESTAMP DEFAULT NOW() NOT NULL,
            used BOOLEAN DEFAULT false
          )
        `
      },

      // Ensure delivery tracking tables exist
      {
        name: "Create delivery_location_tracking table",
        query: sql`
          CREATE TABLE IF NOT EXISTS delivery_location_tracking (
            id SERIAL PRIMARY KEY,
            delivery_id INTEGER NOT NULL,
            delivery_partner_id INTEGER NOT NULL,
            current_latitude DECIMAL(10, 8) NOT NULL,
            current_longitude DECIMAL(11, 8) NOT NULL,
            heading DECIMAL(5, 2),
            speed DECIMAL(8, 2),
            accuracy DECIMAL(8, 2),
            timestamp TIMESTAMP DEFAULT NOW() NOT NULL,
            is_active BOOLEAN DEFAULT true
          )
        `
      },

      // Create default categories for restaurants and retail stores
      {
        name: "Insert default categories",
        query: sql`
          INSERT INTO categories (name, slug, description, icon, created_at, updated_at)
          VALUES 
            ('Appetizers', 'appetizers', 'Starters and small dishes', '🥗', NOW(), NOW()),
            ('Main Courses', 'main-courses', 'Primary dishes and entrees', '🍛', NOW(), NOW()),
            ('Beverages', 'beverages', 'Drinks and refreshments', '🥤', NOW(), NOW()),
            ('Desserts', 'desserts', 'Sweet dishes and treats', '🍰', NOW(), NOW()),
            ('Rice & Biryani', 'rice-biryani', 'Rice dishes and biryani varieties', '🍚', NOW(), NOW()),
            ('Snacks', 'snacks', 'Light snacks and finger foods', '🍿', NOW(), NOW()),
            ('Groceries', 'groceries', 'Food and household essentials', '🛒', NOW(), NOW()),
            ('Electronics', 'electronics', 'Electronic devices and accessories', '📱', NOW(), NOW()),
            ('Clothing', 'clothing', 'Apparel and fashion items', '👕', NOW(), NOW()),
            ('Home & Kitchen', 'home-kitchen', 'Household and kitchen items', '🏠', NOW(), NOW()),
            ('Health & Beauty', 'health-beauty', 'Personal care and beauty products', '💄', NOW(), NOW()),
            ('Sports & Outdoors', 'sports-outdoors', 'Sports equipment and outdoor gear', '⚽', NOW(), NOW())
          ON CONFLICT (slug) DO NOTHING
        `
      }
    ];

    for (const migration of migrations) {
      try {
        await db.execute(migration.query);
        console.log(`✅ ${migration.name}`);
      } catch (error: any) {
        // Only log actual errors, not "already exists" type errors
        if (!error.message.includes('already exists') && !error.message.includes('duplicate key')) {
          console.warn(`⚠️ ${migration.name}: ${error.message}`);
        }
      }
    }

    console.log('✅ Simple migrations completed successfully');
    return true;
  } catch (error) {
    console.error('❌ Simple migration error:', error);
    return false;
  }
}