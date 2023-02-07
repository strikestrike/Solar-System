import axios from "axios";

export async function post(req, res) {
    if(!req.session.token){
        res.statusCode = 403;

        res.end(JSON.stringify({
            message: `Not allowed request`
        }));
    }

    const {BACKEND_HOST} = process.env;

    await axios.post(BACKEND_HOST + '/api/companies', req.body)
        .then(response => {
            // handle success

            res.end(JSON.stringify({ success: true }));
        })
        .catch(error => {
            res.statusCode = error.response.status;

            res.end(JSON.stringify({ error: error.response.data }));
        });
}
