import axios from "axios";

export async function post(req, res) {
    try {
        const { email, password } = req.body;

        const {BACKEND_HOST} = process.env;

        await axios.request({
                url: BACKEND_HOST + '/api/profile',
                method: 'PUT',
                headers: {
                    'x-access-token': req.session.token_id,
                    'Content-Type': 'application/json'
                },
                data: req.body
            })
            .then(response => {
                // handle success
                console.log(response);
                res.end(JSON.stringify({ success: true }));
            })
            .catch(error => {
                throw new Error(error.response.data.error);
            });
    } catch (error) {
        res.end(JSON.stringify({ error: error.message }));
    }
}
