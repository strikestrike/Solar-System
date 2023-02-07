import axios from "axios";

export async function post(req, res) {
    const {BACKEND_HOST} = process.env;

    await axios.post(BACKEND_HOST + '/api/users', req.body)
        .then(response => {
            // handle success

            res.end(JSON.stringify({ success: true }));
        })
        .catch(error => {
            res.statusCode = error.response.status;

            res.end(JSON.stringify({ error: error.response.data }));
        });
}
