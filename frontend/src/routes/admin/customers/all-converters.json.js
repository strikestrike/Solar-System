import axios from "axios";

export function get(req, res, next) {
    if(!req.session.token){
        res.statusCode = 403;
        res.end(JSON.stringify({
            message: `Not allowed request`
        }));
    }

    let companyId = req.session.token.company_id;

    if(!companyId) companyId = 0;

    const {BACKEND_HOST} = process.env;
    let url = BACKEND_HOST + '/api/companies/' + companyId + '/converters?filter_flag=1';

    console.log(url);

    axios.get(url)
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
