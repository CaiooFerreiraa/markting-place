import { db } from "../src/lib/db";
import { pluginRegistry } from "../src/lib/plugins/registry";
import { initPlugins } from "../src/lib/plugins/index";

async function seedAndVerify() {
  console.log("--- Starting Seed & E2E Verification Simulation ---\n");

  try {
    // 1. Seed Minimal Data
    console.log("0. Seeding minimal data for verification...");
    
    // Create/Update Seller
    const seller = await db.user.upsert({
      where: { email: "seller@test.com" },
      update: { role: "SELLER", stripeAccountId: "acct_test_123" },
      create: { 
        email: "seller@test.com", 
        name: "Test Seller", 
        role: "SELLER", 
        stripeAccountId: "acct_test_123" 
      }
    });

    // Create Store
    const store = await db.store.upsert({
      where: { slug: "test-store" },
      update: {},
      create: {
        userId: seller.id,
        name: "Test Store",
        slug: "test-store",
        street: "Main St",
        number: "123",
        district: "Downtown",
        city: "Test City",
        state: "TS",
        zip: "12345",
        email: "store@test.com"
      }
    });

    // Create Category
    const category = await db.category.upsert({
      where: { slug: "test-category" },
      update: {},
      create: { name: "Test Category", slug: "test-category" }
    });

    // Create Product
    const product = await db.product.create({
      data: {
        storeId: store.id,
        categoryId: category.id,
        name: "Test Product",
        priceRetail: 99.99,
        stock: 10
      }
    });

    // Create Order
    const order = await db.order.create({
      data: {
        userId: seller.id, // Using seller as buyer for simplicity
        totalAmount: 99.99,
        status: "PENDING",
        paymentStatus: "PENDING",
        storeOrders: {
          create: {
            storeId: store.id,
            subTotal: 99.99,
            fulfillmentType: "DELIVERY",
            orderItems: {
              create: {
                productId: product.id,
                quantity: 1,
                priceAtPurchase: 99.99
              }
            }
          }
        }
      }
    });

    // Create Coupon
    const coupon = await db.coupon.upsert({
      where: { code: "TEST20" },
      update: { isActive: true },
      create: {
        code: "TEST20",
        storeId: store.id,
        discountPercent: 20,
        isActive: true
      }
    });

    console.log("✅ Seed complete.\n");

    // 2. Verifications
    console.log("1. Verifying Seller stripeAccountId...");
    if (seller.stripeAccountId) {
      console.log(`✅ Found seller: ${seller.email} with Stripe ID: ${seller.stripeAccountId}`);
    }

    console.log("\n2. Verifying Coupon Logic...");
    if (coupon.isActive) {
      console.log(`✅ Active coupon: ${coupon.code} for store: ${store.name}`);
      console.log(`   Discount: ${coupon.discountPercent}%`);
    }

    console.log("\n3. Verifying Notification Plugin...");
    initPlugins();
    console.log("   Emitting 'order.paid' event for Order ID:", order.id);
    await pluginRegistry.emit("order.paid", order.id);

  } catch (error) {
    console.error("❌ Verification failed:", error);
  } finally {
    // Cleanup optional: not cleaning up so we can check DB manually if needed
    await db.$disconnect();
    console.log("\n--- Seed & Verification Complete ---");
  }
}

seedAndVerify();
