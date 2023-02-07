import axios from "axios";

export async function post(req, res) {
    const { id } = req.params;

    const {BACKEND_HOST} = process.env;

    await axios.put(BACKEND_HOST + '/api/users/' + id, req.body)
        .then(response => {
            // handle success
            console.log(1);
            res.end(JSON.stringify({ success: true }));
        })
        .catch(error => {
            console.log(error);
            res.statusCode = error.response.status;

            res.end(JSON.stringify({ error: error.response.data }));
        });
}
