const auth_middleware = require("../middleware/auth");
const multer = require("multer");

const imageFilter = (req, file, cb) => {
    if (file.mimetype.startsWith("image")) {
        cb(null, true);
    } else {
        cb("Please upload only images.", false);
    }
};

var storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, __basedir + "/uploads/");
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-bezkoder-${file.originalname}`);
    },
});

var photoFile = multer({ storage: storage, fileFilter: imageFilter });

module.exports = app => {
    var router = require("express").Router();
    const auth = require('../controllers/auth.controller');
    const company = require('../controllers/company.controller');
    const converter = require('../controllers/converter.controller');
    const customer = require('../controllers/customer.controller');
    const event = require('../controllers/event.controller');
    const throughput = require('../controllers/throughput.controller');
    const ticket = require('../controllers/ticket.controller');

    // Authentication Routing
    router.post('/signin', auth.singin);
    router.post('/signup', photoFile.single('avatar'), auth.singup);
    router.post('/updateProfile', auth_middleware, auth.updateProfile);

    // Company routes
    router.post("/companies", company.createCompany);
    router.get("/companies", /*auth_middleware,*/ company.getCompanies);
    router.get("/companies/:id", company.getCompanyById);
    router.put("/companies/:id", company.updateCompany);
    router.delete("/companies/:id", company.deleteCompany);

    // Converter routes
    router.post("/converters", photoFile.single('photo'), converter.createConverter);
    router.get("/converters", converter.getConverters);
    router.get("/converters/:id", converter.getConverterById);
    router.put("/converters/:id", converter.updateConverter);
    router.delete("/converters/:id", converter.deleteConverter);

    // Customer routes
    router.post("/customers", customer.createCustomer);
    router.get("/customers", customer.getCustomers);
    router.get("/customers/:id", customer.getCustomerById);
    router.put("/customers/:id", customer.updateCustomer);
    router.delete("/customers/:id", customer.deleteCustomer);

    // Event routes
    router.post("/events", event.createEvent);
    router.get("/events", event.getEvents);
    router.get("/events/:id", event.getEventById);
    router.put("/events/:id", event.updateEvent);
    router.delete("/events/:id", event.deleteEvent);

    // Throughput routes
    router.post("/throughputs", throughput.createThroughput);
    router.get("/throughputs", throughput.getThroughputs);
    router.get("/throughputs/:id", throughput.getThroughputById);
    router.put("/throughputs/:id", throughput.updateThroughput);
    router.delete("/throughputs/:id", throughput.deleteThroughput);

    // Ticket routes
    router.post("/tickets", ticket.createTicket);
    router.get("/tickets", ticket.getTickets);
    router.get("/tickets/:id", ticket.getTicketById);
    router.put("/tickets/:id", ticket.updateTicket);
    router.delete("/tickets/:id", ticket.deleteTicket);

    app.use('/api/', router);
};