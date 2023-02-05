import axios from "axios";

const headers = {
    "Content-Type": "application/json",
    Accept: "application/json",
};

export async function post(req, res) {
    try {
        const { email, password } = req.body;

        const {BACKEND_HOST} = process.env;

        await axios.post(BACKEND_HOST + '/api/signin', {email, password})
            .then(response => {
                // handle success
                let user = response.data.user;

                req.session.token = user;
                req.session.role = user.role;

                res.end(JSON.stringify({ token: user, role: user.role }));
            })
            .catch(error => {
                throw new Error(error.response.data.error);
            });
    } catch (error) {
        res.end(JSON.stringify({ error: error.message }));
    }
}
