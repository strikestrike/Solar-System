import axios from "axios";

export function get(req, res, next) {
	// the `slug` parameter is available because
	// this file is called [slug].json.js
	const { id } = req.params;

	res.writeHead(200, {
		'Content-Type': 'application/json'
	});

	try {
		if(!req.session.token){
			res.statusCode = 403;
			res.end(JSON.stringify({
				message: `Not allowed request`
			}));
		}

		const {BACKEND_HOST} = process.env;
		let url = BACKEND_HOST + '/api/users/' + id + '/converters?';

		axios.get(url)
			.then(response => {
				// handle success
				// console.log(response.data)
				res.end(JSON.stringify(response.data));
			})
			.catch(error => {
				res.statusCode = 404;

				res.end(JSON.stringify({
					message: `Not found`
				}));
			})
	}catch (error){
		res.statusCode = 404;

		res.end(JSON.stringify({
			message: `Not found`
		}));
	}
}
