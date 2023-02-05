const axios = require("axios");
const CronJob = require("node-cron");
const db = require('./models/model');
const Converter = db.Converter;
const Event = db.Event;
const Ticket = db.Ticket;

exports.initScheduledJobs = () => {
    const scheduledJobFunction = CronJob.schedule('0 0 */1 * * *', async () => {
        console.log("I'm executed on a schedule!");

        var converters = await Converter.findAll();
        for (var converter of converters) {
            var url = `https://sandbox.smaapis.de/monitoring/v1/devices/${converter.id}/logs`;
            console.log(url);
            axios({
                url: url,
                method: "get",
            })
                .then(response => {
                    const event = {
                        converter_id: converter.id,
                        level: response.data.level,
                        message: response.data.message,
                    };

                    // Save Event in the database
                    Event.create(event)
                        .then(data => {
                            console.log('Event created!');
                        })
                        .catch(err => {
                            console.log(err.message || "Some error occurred while creating the Event.");
                        });

                    if (event.level == 'Error' || event.level == 'Disturbance') {
                        const ticket = { problem: event.message, level: event.level, converter_id: converter.id };

                        // Save Ticket in the database
                        Ticket.create(ticket)
                            .then(data => {
                                console.log('Ticket created!');
                            })
                            .catch(err => {
                                console.log(err.message || "Some error occurred while creating the Ticket.");
                            });
                    }

                })
                .catch((err) => {
                    console.log(err);
                });

        }

    });

    scheduledJobFunction.start();
}