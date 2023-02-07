import axios from "axios";

export async function post(req, res) {
    try {
        const { email, password } = req.body;

        const {BACKEND_HOST} = process.env;

        await axios.put(BACKEND_HOST + '/api/profile', req.body)
            .then(response => {
                // handle success
                res.end(JSON.stringify({ success: true }));
            })
            .catch(error => {
                throw new Error(error.response.data.error);
            });
    } catch (error) {
        res.end(JSON.stringify({ error: error.message }));
    }
}
