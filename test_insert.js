import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://vzxfansocrqdhwxycgkq.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ6eGZhbnNvY3JxZGh3eHljZ2txIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEzMzY0NDUsImV4cCI6MjA5NjkxMjQ0NX0.wExe10p0iCCwTxOmjPRrIB-dWtQ4XB6Zi62GOI2RJvM'
);

async function main() {
  console.log('--- Testing insertion of order and item ---');
  
  // 1. Create order
  const { data: order, error: orderError } = await supabase
    .from('ecom_orders')
    .insert({
      status: 'pending',
      payment_method: 'COD',
      shipping: 0,
      total: 100,
      shipping_address: {
        name: 'Test Customer',
        email: 'test@example.com',
        address: '123 Test St',
        city: 'Test City',
        state: 'TS',
        zip: '123456',
        country: 'India'
      }
    })
    .select('id')
    .single();

  if (orderError) {
    console.error('Order creation failed:', orderError);
    return;
  }
  
  console.log('Order created successfully, ID:', order.id);

  // 2. Try inserting item
  const itemData = {
    order_id: order.id,
    product_id: 'test-product-id', // or maybe it needs a valid UUID?
    product_name: 'Test Product',
    product_image: 'https://example.com/image.jpg',
    price: 100,
    quantity: 1,
    variant: 'Red / L'
  };

  console.log('Attempting to insert item:', itemData);

  const { data: insertedItem, error: itemError } = await supabase
    .from('ecom_order_items')
    .insert([itemData])
    .select();

  if (itemError) {
    console.error('Item insertion failed:', itemError);
  } else {
    console.log('Item inserted successfully:', insertedItem);
  }
}

main().catch(console.error);
