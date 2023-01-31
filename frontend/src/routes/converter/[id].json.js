import axios from "axios";

export async function get(req, res) {
	// the `slug` parameter is available because
	// this file is called [slug].json.js
	const { id } = req.params;

	res.writeHead(200, {
		'Content-Type': 'application/json'
	});

	try {
		const params = req.query;

		if(!req.session.token){
			location.href = '/login';
		}

		let url = 'http://localhost:8080/api/converters/' + id;

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
