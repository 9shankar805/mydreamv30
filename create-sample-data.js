#!/usr/bin/env node

/**
 * Create Sample Data Script
 * Adds sample stores, products, and users to test the application
 */

import { Pool } from 'pg';

const DATABASE_URL = process.env.DATABASE_URL;

async function createSampleData() {
  console.log('🔍 Creating sample data...');
  
  const pool = new Pool({ 
    connectionString: DATABASE_URL,
    ssl: false,
    connectionTimeoutMillis: 10000,
  });

  try {
    const client = await pool.connect();
    console.log('✅ Connected to database');
    
    // Create sample users
    console.log('👥 Creating sample users...');
    await client.query(`
      INSERT INTO users (username, email, password, full_name, phone, address, role, status) 
      VALUES 
        ('customer1', 'customer@test.com', 'password123', 'John Doe', '+977-9801234567', 'Siraha Main Road', 'customer', 'active'),
        ('shopkeeper1', 'shop@test.com', 'password123', 'Ram Sharma', '+977-9801234568', 'Siraha Bazaar Street', 'shopkeeper', 'approved'),
        ('delivery1', 'delivery@test.com', 'password123', 'Gokul Yadav', '+977-9801234569', 'Siraha Center', 'delivery_partner', 'approved')
      ON CONFLICT (email) DO NOTHING
    `);
    
    // Get user IDs
    const usersResult = await client.query('SELECT id, email FROM users');
    const shopkeeperId = usersResult.rows.find(u => u.email === 'shop@test.com')?.id;
    const deliveryId = usersResult.rows.find(u => u.email === 'delivery@test.com')?.id;
    
    // Create sample stores
    console.log('🏪 Creating sample stores...');
    await client.query(`
      INSERT INTO stores (name, description, owner_id, category_id, address, phone, email, latitude, longitude, is_active, store_type)
      VALUES 
        ('Family Restaurant', 'Authentic Nepali cuisine and fast food', $1, 1, 'Siraha Main Road, Nepal', '+977-9801234568', 'family@restaurant.com', 26.6519, 86.2044, true, 'restaurant'),
        ('Siraha Electronics', 'Latest electronics and gadgets', $1, 2, 'Electronics Market, Siraha', '+977-9801234570', 'electronics@siraha.com', 26.6520, 86.2045, true, 'retail')
      ON CONFLICT (name) DO NOTHING
    `, [shopkeeperId]);
    
    // Get store IDs
    const storesResult = await client.query('SELECT id, name FROM stores');
    const restaurantId = storesResult.rows.find(s => s.name === 'Family Restaurant')?.id;
    const electronicsId = storesResult.rows.find(s => s.name === 'Siraha Electronics')?.id;
    
    // Create sample products
    console.log('🛍️ Creating sample products...');
    if (restaurantId) {
      await client.query(`
        INSERT INTO products (name, description, price, category_id, store_id, stock_quantity, images, is_active, product_type)
        VALUES 
          ('Chicken Momo', 'Delicious steamed chicken dumplings (10 pieces)', 150.00, 1, $1, 50, ARRAY['https://images.unsplash.com/photo-1496116218417-1a781b1c416c'], true, 'food'),
          ('Dal Bhat Set', 'Traditional Nepali meal with rice, lentils, and vegetables', 200.00, 1, $1, 30, ARRAY['https://images.unsplash.com/photo-1585937421612-70a008356fbe'], true, 'food'),
          ('Chow Mein', 'Stir-fried noodles with vegetables and chicken', 180.00, 1, $1, 40, ARRAY['https://images.unsplash.com/photo-1612929633738-8fe44f7ec841'], true, 'food')
        ON CONFLICT (name, store_id) DO NOTHING
      `, [restaurantId]);
    }
    
    if (electronicsId) {
      await client.query(`
        INSERT INTO products (name, description, price, category_id, store_id, stock_quantity, images, is_active, product_type)
        VALUES 
          ('Samsung Galaxy A54', 'Latest smartphone with great camera', 45000.00, 2, $1, 10, ARRAY['https://images.unsplash.com/photo-1511707171634-5f897ff02aa9'], true, 'retail'),
          ('Apple iPhone 14', 'Premium smartphone with advanced features', 120000.00, 2, $1, 5, ARRAY['https://images.unsplash.com/photo-1592750475338-74b7b21085ab'], true, 'retail'),
          ('Wireless Earbuds', 'High-quality wireless earphones', 3500.00, 2, $1, 25, ARRAY['https://images.unsplash.com/photo-1590658268037-6bf12165a8df'], true, 'retail')
        ON CONFLICT (name, store_id) DO NOTHING
      `, [electronicsId]);
    }
    
    // Create delivery partner entry
    if (deliveryId) {
      console.log('🚛 Creating delivery partner...');
      await client.query(`
        INSERT INTO delivery_partners (user_id, vehicle_type, vehicle_number, license_number, status, is_available)
        VALUES ($1, 'motorcycle', 'NAA-1234', 'DL123456', 'approved', true)
        ON CONFLICT (user_id) DO NOTHING
      `, [deliveryId]);
    }
    
    // Check final counts
    const finalCounts = await client.query(`
      SELECT 
        (SELECT COUNT(*) FROM users) as users_count,
        (SELECT COUNT(*) FROM stores) as stores_count,
        (SELECT COUNT(*) FROM products) as products_count,
        (SELECT COUNT(*) FROM delivery_partners) as delivery_partners_count,
        (SELECT COUNT(*) FROM categories) as categories_count
    `);
    
    const counts = finalCounts.rows[0];
    console.log('\n📊 Final Data Summary:');
    console.log(`   Users: ${counts.users_count}`);
    console.log(`   Stores: ${counts.stores_count}`);
    console.log(`   Products: ${counts.products_count}`);
    console.log(`   Delivery Partners: ${counts.delivery_partners_count}`);
    console.log(`   Categories: ${counts.categories_count}`);
    
    client.release();
    await pool.end();
    
    console.log('\n🎉 Sample data created successfully!');
    console.log('🌐 Your application should now show stores and products');
    
  } catch (error) {
    console.error('❌ Error creating sample data:');
    console.error('   Error:', error.message);
    await pool.end();
  }
}

createSampleData().catch(console.error);