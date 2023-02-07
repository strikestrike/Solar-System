const bcrypt = require('bcrypt');
const db = require('../models/model');

module.exports = {
  async up(queryInterface, Sequelize) {
    await db.sequelize.getQueryInterface().bulkInsert('companies', [{
      name: 'Momentum Solar',
      description: "Momentum Solar was founded in 2009 by solar entrepreneur Cameron Christensen who currently serves as the company's President. One year later after the company's founding, Christensen recruited Arthur Souritzidis, a recent college graduate with a degree in business, to join his company in an executive position.",
      admin: '2',
      created_at: new Date(),
      updated_at: new Date()
    }, {
      name: 'Sunpower',
      description: 'SunPower Corporation is an American provider of photovoltaic solar energy generation systems and battery energy storage products, primarily for residential customers.',
      admin: '3',
      created_at: new Date(),
      updated_at: new Date()
    }, {
      name: 'Blue Raven Solar',
      description: "We believe clean energy and storage should be accessible to everybody. That's why SunPower designs all-in-one residential solutions backed by personal customer service and the industry's most comprehensive warranty. And with over 35 years of dedicated solar experience, we're the only U.S.-based solar company that's been around longer than our 25-year warranty.",
      admin: '4',
      created_at: new Date(),
      updated_at: new Date()
    }, {
      name: 'Sunrun',
      description: 'Sunrun Inc. is an American provider of photovoltaic systems and battery energy storage products, primarily for residential customers. The company was established in 2007 and is headquartered in San Francisco, California.',
      admin: '5',
      created_at: new Date(),
      updated_at: new Date()
    }, {
      name: 'Palmetto Solar',
      description: "Palmetto installs solar panel systems for customers looking to generate clean energy for their homes. The company owns the installation process from start to finish, taking your home's structure and energy consumption into consideration before designing and installing your system.",
      admin: '6',
      created_at: new Date(),
      updated_at: new Date()
    }, {
      name: 'Tesla Solar',
      description: 'The Tesla Powerwall is a rechargeable lithium-ion battery stationary home energy storage product manufactured by Tesla Energy. The Powerwall stores electricity for solar self-consumption, time of use load shifting, and backup power. The Powerwall was introduced in 2015 with limited production.',
      admin: '7',
      created_at: new Date(),
      updated_at: new Date()
    }, {
      name: 'ADT Solar',
      description: 'ADT Solar (formerly SunPro) uses LG solar panels, which have an efficiency rate of 22.3% and have an expected lifespan of 25 to 40 years. ADT Solar announced in September 2020 that it became the first solar contractor in the U.S. to install LG NeON 355 watt solar panels, a new solar panel offered by LG.',
      admin: '8',
      created_at: new Date(),
      updated_at: new Date()
    }]);

    const hashedPassword = await bcrypt.hash('123', 10);
    await db.sequelize.getQueryInterface().bulkInsert('users', [{
      first_name: 'Jack',
      last_name: 'Richard',
      email: 'admin@aa.aa',
      password: hashedPassword,
      role: constant.ROLE_GLOBAL_ADMIN,
      created_at: new Date(),
      updated_at: new Date()
    }, {
      first_name: 'John',
      last_name: 'Tony',
      email: 'momentum@aa.aa',
      password: hashedPassword,
      role: constant.ROLE_COMPANY_ADMIN,
      company_id: 1,
      created_at: new Date(),
      updated_at: new Date()
    }, {
      first_name: 'David',
      last_name: 'Smith',
      email: 'sunpower@aa.aa',
      password: hashedPassword,
      role: constant.ROLE_COMPANY_ADMIN,
      company_id: 2,
      created_at: new Date(),
      updated_at: new Date()
    }, {
      first_name: 'David',
      last_name: 'Jones',
      email: 'raven@aa.aa',
      password: hashedPassword,
      role: constant.ROLE_COMPANY_ADMIN,
      company_id: 3,
      created_at: new Date(),
      updated_at: new Date()
    }, {
      first_name: 'John',
      last_name: 'Smith',
      email: 'sunrun@aa.aa',
      password: hashedPassword,
      role: constant.ROLE_COMPANY_ADMIN,
      company_id: 4,
      created_at: new Date(),
      updated_at: new Date()
    }, {
      first_name: 'Michael',
      last_name: 'Smith',
      email: 'palmetto@aa.aa',
      password: hashedPassword,
      role: constant.ROLE_COMPANY_ADMIN,
      company_id: 5,
      created_at: new Date(),
      updated_at: new Date()
    }, {
      first_name: 'Oliver',
      last_name: 'Brown',
      email: 'tesla@aa.aa',
      password: hashedPassword,
      role: constant.ROLE_COMPANY_ADMIN,
      company_id: 6,
      created_at: new Date(),
      updated_at: new Date()
    }, {
      first_name: 'George',
      last_name: 'Evans',
      email: 'adt@aa.aa',
      password: hashedPassword,
      role: constant.ROLE_COMPANY_ADMIN,
      company_id: 7,
      created_at: new Date(),
      updated_at: new Date()
    }, {
      first_name: 'James',
      last_name: 'William',
      email: 'william@aa.aa',
      password: hashedPassword,
      role: constant.ROLE_CUSTOMER,
      company_id: 1,
      created_at: new Date(),
      updated_at: new Date()
    }, {
      first_name: 'Ryan',
      last_name: 'William',
      email: 'ryan@aa.aa',
      password: hashedPassword,
      role: constant.ROLE_CUSTOMER,
      company_id: 1,
      created_at: new Date(),
      updated_at: new Date()
    }, {
      first_name: 'Jacob',
      last_name: 'Taylor',
      email: 'jacob@aa.aa',
      password: hashedPassword,
      role: constant.ROLE_CUSTOMER,
      company_id: 1,
      created_at: new Date(),
      updated_at: new Date()
    }, {
      first_name: 'Emily',
      last_name: 'Roy',
      email: 'emily@aa.aa',
      password: hashedPassword,
      role: constant.ROLE_CUSTOMER,
      company_id: 2,
      created_at: new Date(),
      updated_at: new Date()
    }, {
      first_name: 'Donald',
      last_name: 'William',
      email: 'donald@aa.aa',
      password: hashedPassword,
      role: constant.ROLE_CUSTOMER,
      company_id: 2,
      created_at: new Date(),
      updated_at: new Date()
    }, {
      first_name: 'Isabella',
      last_name: 'Jones',
      email: 'isabella@aa.aa',
      password: hashedPassword,
      role: constant.ROLE_CUSTOMER,
      company_id: 3,
      created_at: new Date(),
      updated_at: new Date()
    }, {
      first_name: 'Thomas',
      last_name: 'Martin',
      email: 'thomas@aa.aa',
      password: hashedPassword,
      role: constant.ROLE_CUSTOMER,
      company_id: 3,
      created_at: new Date(),
      updated_at: new Date()
    }, {
      first_name: 'Harry',
      last_name: 'Davies',
      email: 'harry@aa.aa',
      password: hashedPassword,
      role: constant.ROLE_CUSTOMER,
      company_id: 4,
      created_at: new Date(),
      updated_at: new Date()
    }, {
      first_name: 'Jessica',
      last_name: 'Davis',
      email: 'jessica@aa.aa',
      password: hashedPassword,
      role: constant.ROLE_CUSTOMER,
      company_id: 4,
      created_at: new Date(),
      updated_at: new Date()
    }, {
      first_name: 'Lily',
      last_name: 'Singh',
      email: 'lily@aa.aa',
      password: hashedPassword,
      role: constant.ROLE_CUSTOMER,
      company_id: 5,
      created_at: new Date(),
      updated_at: new Date()
    }, {
      first_name: 'Megan',
      last_name: 'Murphy',
      email: 'megan@aa.aa',
      password: hashedPassword,
      role: constant.ROLE_CUSTOMER,
      company_id: 5,
      created_at: new Date(),
      updated_at: new Date()
    }, {
      first_name: 'James',
      last_name: 'William',
      email: 'customer@aa.aa',
      password: hashedPassword,
      role: constant.ROLE_CUSTOMER,
      company_id: 6,
      created_at: new Date(),
      updated_at: new Date()
    }, {
      first_name: 'Ava',
      last_name: 'Brown',
      email: 'ava@aa.aa',
      password: hashedPassword,
      role: constant.ROLE_CUSTOMER,
      company_id: 6,
      created_at: new Date(),
      updated_at: new Date()
    }, {
      first_name: 'Madison',
      last_name: 'Garcia',
      email: 'madison@aa.aa',
      password: hashedPassword,
      role: constant.ROLE_CUSTOMER,
      company_id: 7,
      created_at: new Date(),
      updated_at: new Date()
    }, {
      first_name: 'Noah',
      last_name: 'Miller',
      email: 'noah@aa.aa',
      password: hashedPassword,
      role: constant.ROLE_CUSTOMER,
      company_id: 7,
      created_at: new Date(),
      updated_at: new Date()
    }, {
      first_name: 'Robert',
      last_name: 'Wilson',
      email: 'robert@aa.aa',
      password: hashedPassword,
      role: constant.ROLE_CUSTOMER,
      company_id: 7,
      created_at: new Date(),
      updated_at: new Date()
    }, {
      first_name: 'Alexander',
      last_name: 'Abigail',
      email: 'alexander@aa.aa',
      password: hashedPassword,
      role: constant.ROLE_CUSTOMER,
      company_id: 1,
      created_at: new Date(),
      updated_at: new Date()
    }, {
      first_name: 'Daniel',
      last_name: 'Olivia',
      email: 'daniel@aa.aa',
      password: hashedPassword,
      role: constant.ROLE_CUSTOMER,
      company_id: 1,
      created_at: new Date(),
      updated_at: new Date()
    }, {
      first_name: 'Michael',
      last_name: 'Sarah',
      email: 'michael@aa.aa',
      password: hashedPassword,
      role: constant.ROLE_CUSTOMER,
      company_id: 2,
      created_at: new Date(),
      updated_at: new Date()
    }, {
      first_name: 'Charlotte',
      last_name: 'Garcia',
      email: 'charlotte@aa.aa',
      password: hashedPassword,
      role: constant.ROLE_CUSTOMER,
      company_id: 3,
      created_at: new Date(),
      updated_at: new Date()
    }, {
      first_name: 'Connor',
      last_name: 'Linda',
      email: 'connor@aa.aa',
      password: hashedPassword,
      role: constant.ROLE_CUSTOMER,
      company_id: 4,
      created_at: new Date(),
      updated_at: new Date()
    }]);

    await db.sequelize.getQueryInterface().bulkInsert('converters', [{
      name: 'Fronius',
      description: "Fronius Solar was founded in 2009 by solar entrepreneur Cameron Christensen who currently serves as the company's President. One year later after the company's founding, Christensen recruited Arthur Souritzidis, a recent college graduate with a degree in business, to join his company in an executive position.",
      timezone: 'AST',
      type: 'Solar Converter',
      serial_number: '98212372',
      vendor: 'Growatt New Energy.',
      status: 'Ok',
      expected_throughput: 200,
      company_id: 1,
      user_id: 19,
      created_at: new Date(),
      updated_at: new Date()
    }, {
      name: 'SolarEdge',
      description: 'SolarEdge Corporation is an American provider of photovoltaic solar energy generation systems and battery energy storage products, primarily for residential customers.',
      timezone: 'EST',
      type: 'Solar Converter',
      serial_number: '98212373',
      vendor: 'Ginlong Technologies.',
      status: 'Ok',
      expected_throughput: 270,
      company_id: 1,
      user_id: 18,
      created_at: new Date(),
      updated_at: new Date()
    }, {
      name: 'Huawei',
      description: "We believe clean energy and storage should be accessible to everybody. That's why SunPower designs all-in-one residential solutions backed by personal customer service and the industry's most comprehensive warranty. And with over 35 years of dedicated solar experience, we're the only U.S.-based solar company that's been around longer than our 25-year warranty.",
      timezone: 'CST',
      type: 'Solar Converter',
      serial_number: '98232372',
      vendor: 'FIMER S.p.A.',
      status: 'Ok',
      expected_throughput: 280,
      company_id: 1,
      user_id: 17,
      created_at: new Date(),
      updated_at: new Date()
    }, {
      name: 'SMA',
      description: 'Sunrun Inc. is an American provider of photovoltaic systems and battery energy storage products, primarily for residential customers. The company was established in 2007 and is headquartered in San Francisco, California.',
      timezone: 'MST',
      type: 'Solar Converter',
      serial_number: '98212382',
      vendor: 'Growatt New Energy.',
      status: 'Ok',
      expected_throughput: 300,
      company_id: 1,
      user_id: 16,
      created_at: new Date(),
      updated_at: new Date()
    }, {
      name: 'Sungrow',
      description: "Palmetto installs solar panel systems for customers looking to generate clean energy for their homes. The company owns the installation process from start to finish, taking your home's structure and energy consumption into consideration before designing and installing your system.",
      timezone: 'PST',
      type: 'Solar Converter',
      serial_number: '28212372',
      vendor: 'Ginlong Technologies.',
      status: 'Ok',
      expected_throughput: 250,
      company_id: 7,
      user_id: 15,
      created_at: new Date(),
      updated_at: new Date()
    }, {
      name: 'FIMER',
      description: 'The Tesla Powerwall is a rechargeable lithium-ion battery stationary home energy storage product manufactured by Tesla Energy. The Powerwall stores electricity for solar self-consumption, time of use load shifting, and backup power. The Powerwall was introduced in 2015 with limited production.',
      timezone: 'AKST',
      type: 'Solar Converter',
      serial_number: '58212372',
      vendor: 'TMEIC',
      status: 'Ok',
      expected_throughput: 150,
      company_id: 6,
      user_id: 14,
      created_at: new Date(),
      updated_at: new Date()
    }, {
      name: 'GoodWe',
      description: 'ADT Solar (formerly SunPro) uses LG solar panels, which have an efficiency rate of 22.3% and have an expected lifespan of 25 to 40 years. ADT Solar announced in September 2020 that it became the first solar contractor in the U.S. to install LG NeON 355 watt solar panels, a new solar panel offered by LG.',
      timezone: 'HST',
      type: 'Solar Converter',
      serial_number: '53212372',
      vendor: 'FIMER S.p.A.',
      status: 'Ok',
      expected_throughput: 350,
      company_id: 5,
      user_id: 13,
      created_at: new Date(),
      updated_at: new Date()
    }, {
      name: 'Delta',
      description: 'ADT Solar (formerly SunPro) uses LG solar panels, which have an efficiency rate of 22.3% and have an expected lifespan of 25 to 40 years. ADT Solar announced in September 2020 that it became the first solar contractor in the U.S. to install LG NeON 355 watt solar panels, a new solar panel offered by LG.',
      timezone: 'UTC-11',
      type: 'Solar Converter',
      serial_number: '16212372',
      vendor: 'Power Electronics S.L.',
      status: 'Ok',
      expected_throughput: 250,
      company_id: 4,
      user_id: 12,
      created_at: new Date(),
      updated_at: new Date()
    }, {
      name: 'GoodWe',
      description: 'ADT Solar (formerly SunPro) uses LG solar panels, which have an efficiency rate of 22.3% and have an expected lifespan of 25 to 40 years. ADT Solar announced in September 2020 that it became the first solar contractor in the U.S. to install LG NeON 355 watt solar panels, a new solar panel offered by LG.',
      timezone: 'UTC+10',
      type: 'Solar Converter',
      serial_number: '77212372',
      vendor: 'SMA Solar Technology AG.',
      status: 'Ok',
      expected_throughput: 250,
      company_id: 3,
      user_id: 11,
      created_at: new Date(),
      updated_at: new Date()
    }, {
      name: 'GoodWe',
      description: 'ADT Solar (formerly SunPro) uses LG solar panels, which have an efficiency rate of 22.3% and have an expected lifespan of 25 to 40 years. ADT Solar announced in September 2020 that it became the first solar contractor in the U.S. to install LG NeON 355 watt solar panels, a new solar panel offered by LG.',
      timezone: 'HST',
      type: 'Solar Converter',
      serial_number: '90212372',
      vendor: 'Sungrow Power Supply Co., Ltd.',
      status: 'Ok',
      expected_throughput: 300,
      company_id: 2,
      user_id: 10,
      created_at: new Date(),
      updated_at: new Date()
    }, {
      name: 'GoodWe',
      description: 'ADT Solar (formerly SunPro) uses LG solar panels, which have an efficiency rate of 22.3% and have an expected lifespan of 25 to 40 years. ADT Solar announced in September 2020 that it became the first solar contractor in the U.S. to install LG NeON 355 watt solar panels, a new solar panel offered by LG.',
      timezone: 'HST',
      type: 'Solar Converter',
      serial_number: '54212372',
      vendor: 'Huawei Technologies Co., Ltd.',
      status: 'Ok',
      expected_throughput: 200,
      company_id: 1,
      user_id: 9,
      created_at: new Date(),
      updated_at: new Date()
    }]);

    await db.sequelize.getQueryInterface().bulkInsert('events', [{
      converter_id: 1,
      message: 'SMACOM A: communication status goes to Ok',
      level: 'Info',
      created_at: new Date(),
      updated_at: new Date()
    }, {
      converter_id: 2,
      message: 'SMACOM A: communication status goes to Ok',
      level: 'Info',
      created_at: new Date(),
      updated_at: new Date()
    }, {
      converter_id: 3,
      message: 'SMACOM A: communication status goes to Ok',
      level: 'Info',
      created_at: new Date(),
      updated_at: new Date()
    }, {
      converter_id: 4,
      message: 'SMACOM A: communication status goes to Ok',
      level: 'Info',
      created_at: new Date(),
      updated_at: new Date()
    }, {
      converter_id: 5,
      message: 'SMACOM A: communication status goes to Ok',
      level: 'Info',
      created_at: new Date(),
      updated_at: new Date()
    }, {
      converter_id: 6,
      message: 'SMACOM A: communication status goes to Ok',
      level: 'Info',
      created_at: new Date(),
      updated_at: new Date()
    }, {
      converter_id: 7,
      message: 'SMACOM A: communication status goes to Ok',
      level: 'Info',
      created_at: new Date(),
      updated_at: new Date()
    }, {
      converter_id: 1,
      message: 'SMACOM A: communication status goes to Ok',
      level: 'Info',
      created_at: new Date(),
      updated_at: new Date()
    }, {
      converter_id: 2,
      message: 'SMACOM A: communication status goes to Ok',
      level: 'Info',
      created_at: new Date(),
      updated_at: new Date()
    }, {
      converter_id: 3,
      message: 'SMACOM A: communication status goes to Ok',
      level: 'Info',
      created_at: new Date(),
      updated_at: new Date()
    }, {
      converter_id: 4,
      message: 'SMACOM A: communication status goes to Ok',
      level: 'Info',
      created_at: new Date(),
      updated_at: new Date()
    }]);

    await db.sequelize.getQueryInterface().bulkInsert('tickets', [{
      converter_id: 1,
      ticket_no: 1,
      problem: 'Converter need to be replaced',
      level: 'Error',
      created_at: new Date(),
      updated_at: new Date()
    }, {
      converter_id: 1,
      ticket_no: 2,
      problem: 'Converter need to be replaced',
      level: 'Error',
      created_at: new Date(),
      updated_at: new Date()
    }, {
      converter_id: 1,
      ticket_no: 3,
      problem: 'Converter need to be replaced',
      level: 'Error',
      created_at: new Date(),
      updated_at: new Date()
    }, {
      converter_id: 2,
      ticket_no: 1,
      problem: 'Converter need to be replaced',
      level: 'Error',
      created_at: new Date(),
      updated_at: new Date()
    }, {
      converter_id: 3,
      ticket_no: 1,
      problem: 'Converter need to be replaced',
      level: 'Error',
      created_at: new Date(),
      updated_at: new Date()
    }, {
      converter_id: 4,
      ticket_no: 1,
      problem: 'Converter need to be replaced',
      level: 'Error',
      created_at: new Date(),
      updated_at: new Date()
    }, {
      converter_id: 5,
      ticket_no: 1,
      problem: 'Converter need to be replaced',
      level: 'Error',
      created_at: new Date(),
      updated_at: new Date()
    }, {
      converter_id: 6,
      ticket_no: 1,
      problem: 'Converter need to be replaced',
      level: 'Error',
      created_at: new Date(),
      updated_at: new Date()
    }, {
      converter_id: 7,
      ticket_no: 1,
      problem: 'Converter need to be replaced',
      level: 'Error',
      created_at: new Date(),
      updated_at: new Date()
    }, {
      converter_id: 2,
      ticket_no: 1,
      problem: 'Converter need to be replaced',
      level: 'Error',
      created_at: new Date(),
      updated_at: new Date()
    }, {
      converter_id: 3,
      ticket_no: 1,
      problem: 'Converter need to be replaced',
      level: 'Error',
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
