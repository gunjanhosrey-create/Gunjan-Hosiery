import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://vzxfansocrqdhwxycgkq.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ6eGZhbnNvY3JxZGh3eHljZ2txIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEzMzY0NDUsImV4cCI6MjA5NjkxMjQ0NX0.wExe10p0iCCwTxOmjPRrIB-dWtQ4XB6Zi62GOI2RJvM'
);

async function main() {
  console.log('--- Checking connection and count ---');
  
  const { data: countData, error: countError } = await supabase
    .from('ecom_order_items')
    .select('*', { count: 'exact', head: true });
    
  if (countError) {
    console.error('Error fetching count:', countError);
  } else {
    console.log('ecom_order_items count:', countData);
  }

  console.log('--- Checking recent orders ---');
  const { data: orders, error: ordersError } = await supabase
    .from('ecom_orders')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(3);

  if (ordersError) {
    console.error('Error fetching orders:', ordersError);
  } else {
    console.log('Recent orders:', JSON.stringify(orders, null, 2));
  }

  console.log('--- Checking order items ---');
  const { data: items, error: itemsError } = await supabase
    .from('ecom_order_items')
    .select('*')
    .limit(3);

  if (itemsError) {
    console.error('Error fetching items:', itemsError);
  } else {
    console.log('Recent items:', JSON.stringify(items, null, 2));
  }
}

main().catch(console.error);
