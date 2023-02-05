import axios from "axios";

const headers = {
    "Content-Type": "application/json",
    Accept: "application/json",
};

export async function post(req, res) {
    try {
        const { first_name, last_name } = req.body;

        const {BACKEND_HOST} = process.env;

        await axios.post(BACKEND_HOST + '/api/signup', req.body)
            .then(response => {
                // handle success
                let user = response.data.user;

                req.session.token = user;

                res.end(JSON.stringify({ token: user}));
            })
            .catch(error => {
                throw new Error(error.response.data.error);
            });
    } catch (error) {
        res.end(JSON.stringify({ error: error.message }));
    }
}
