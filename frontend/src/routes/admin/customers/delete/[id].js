import axios from "axios";

export async function get(req, res, next) {
	// the `slug` parameter is available because
	// this file is called [slug].json.js
	const { id } = req.params;

	res.writeHead(200, {
		'Content-Type': 'application/json'
	});

	if(!req.session.token){
		location.href = '/login';
	}

	const {BACKEND_HOST} = process.env;
	let url = BACKEND_HOST + '/api/users/' + id;

	await axios.delete(url)
		.then(response => {
			// handle success
			res.end(JSON.stringify({ success: true }));
		})
		.catch(error => {
			res.statusCode = error.response.status;

			res.end(JSON.stringify({ error: error.response.data }));
		});
}
