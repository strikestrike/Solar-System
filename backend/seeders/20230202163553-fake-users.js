const bcrypt = require('bcrypt');
const db = require('../models/model');

module.exports = {
  async up(queryInterface, Sequelize) {
    await db.sequelize.getQueryInterface().bulkInsert('companies', [{
      name: 'Installer Company1',
      description: 'We install Solar Converters.',
      admin: '2',
      created_at: new Date(),
      updated_at: new Date()
    }]);

    const hashedPassword = await bcrypt.hash('123', 10);
    await db.sequelize.getQueryInterface().bulkInsert('users', [{
      first_name: 'global',
      last_name: 'admin',
      email: 'admin@aa.aa',
      password: hashedPassword,
      role: constant.ROLE_GLOBAL_ADMIN,
      created_at: new Date(),
      updated_at: new Date()
    }, {
      first_name: 'company',
      last_name: 'admin',
      email: 'company@aa.aa',
      password: hashedPassword,
      role: constant.ROLE_COMPANY_ADMIN,
      created_at: new Date(),
      updated_at: new Date()
    }, {
      first_name: 'customer1',
      last_name: 'normal',
      email: 'customer@aa.aa',
      password: hashedPassword,
      role: constant.ROLE_CUSTOMER,
      created_at: new Date(),
      updated_at: new Date()
    }]);
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
  }
};
