import axios from "axios";

export async function get(req, res) {
	res.writeHead(200, {
		'Content-Type': 'application/json'
	});

	try {
		const params = req.query;

		if(!req.session.token){
			location.href = '/login';
		}

		let url = 'http://localhost:8080/api/companies/' + req.session.token.company_id + '/users?';

		if(params.q){
			url += 'q=' + params.q;
		}

		axios.get(url)
			.then(response => {
				// handle success
				// console.log(response.data)
				res.end(JSON.stringify(response.data));
			})
			.catch(error => {
				// handle error
				res.end(JSON.stringify(error));
			})
	}catch (error){
		res.end(JSON.stringify(error));
	}
}
