import axios from "axios";

export function get(req, res) {
    if(!req.session.token){
        res.statusCode = 403;
        res.end(JSON.stringify({
            message: `Not allowed request`
        }));
    }

    const {BACKEND_HOST} = process.env;

    axios.request({
            url: BACKEND_HOST + '/api/profile',
            method: 'GET',
            headers: {
                'x-access-token': req.session.token_id,
            }
        })
        .then(response => {
            // handle success
            // console.log(response.data)
            res.end(JSON.stringify(response.data));
        })
        .catch(error => {
            res.statusCode = 404;

            res.end(JSON.stringify(error));
        })
}
