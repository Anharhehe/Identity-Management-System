const { User } = require('../models');

const ADMIN_EMAIL = 'admin@admin.com';
const ADMIN_PASSWORD = 'Anhar123';

async function setupAdmin() {
  try {
    // Check if admin already exists
    const adminExists = await User.findOne({ email: ADMIN_EMAIL });

    if (adminExists) {
      // Update existing admin account to ensure admin status
      if (!adminExists.isAdmin) {
        await User.findByIdAndUpdate(adminExists._id, { isAdmin: true });
        console.log(`✅ Admin account ${ADMIN_EMAIL} activated (existing user promoted)`);
      } else {
        console.log(`✅ Admin account ${ADMIN_EMAIL} already exists and is active`);
      }
    } else {
      // Create new admin user
      const adminUser = new User({
        firstName: 'Admin',
        lastName: 'User',
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        isAdmin: true
      });

      await adminUser.save();
      console.log(`✅ Admin account created successfully: ${ADMIN_EMAIL}`);
      console.log(`   Password: ${ADMIN_PASSWORD}`);
    }
  } catch (error) {
    console.error('❌ Error setting up admin account:', error.message);
    if (error.message.includes('duplicate key')) {
      console.log('   (Admin account already exists in database)');
    }
  }
}

module.exports = setupAdmin;
