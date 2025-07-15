/**
 * Create Default Categories Script
 * Adds essential categories for both restaurants and retail stores
 */

import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function createDefaultCategories() {
  console.log('Creating default categories...');
  
  const categories = [
    // Restaurant categories
    { name: 'Appetizers', slug: 'appetizers', description: 'Starters and small dishes' },
    { name: 'Main Courses', slug: 'main-courses', description: 'Primary dishes and entrees' },
    { name: 'Beverages', slug: 'beverages', description: 'Drinks and refreshments' },
    { name: 'Desserts', slug: 'desserts', description: 'Sweet dishes and treats' },
    { name: 'Rice & Biryani', slug: 'rice-biryani', description: 'Rice dishes and biryani varieties' },
    { name: 'Snacks', slug: 'snacks', description: 'Light snacks and finger foods' },
    
    // Retail categories
    { name: 'Groceries', slug: 'groceries', description: 'Food and household essentials' },
    { name: 'Electronics', slug: 'electronics', description: 'Electronic devices and accessories' },
    { name: 'Clothing', slug: 'clothing', description: 'Apparel and fashion items' },
    { name: 'Home & Kitchen', slug: 'home-kitchen', description: 'Household and kitchen items' },
    { name: 'Health & Beauty', slug: 'health-beauty', description: 'Personal care and beauty products' },
    { name: 'Sports & Outdoors', slug: 'sports-outdoors', description: 'Sports equipment and outdoor gear' }
  ];

  try {
    for (const category of categories) {
      // Check if category already exists
      const existingCategory = await pool.query(
        'SELECT id FROM categories WHERE slug = $1',
        [category.slug]
      );

      if (existingCategory.rows.length === 0) {
        await pool.query(
          `INSERT INTO categories (name, slug, description, "isActive", "createdAt", "updatedAt") 
           VALUES ($1, $2, $3, true, NOW(), NOW())`,
          [category.name, category.slug, category.description]
        );
        console.log(`✅ Created category: ${category.name}`);
      } else {
        console.log(`⏭️  Category already exists: ${category.name}`);
      }
    }

    console.log('✅ Default categories setup completed');
  } catch (error) {
    console.error('❌ Error creating categories:', error);
  } finally {
    await pool.end();
  }
}

createDefaultCategories();