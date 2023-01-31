import posts from './_posts.js';
import axios from "axios";

const headers = {
	"Content-Type": "application/json",
	Accept: "application/json",
};

const contents = JSON.stringify(posts.map(post => {
	return {
		title: post.title,
		id: post.id
	};
}));

export async function get(req, res) {
	res.writeHead(200, {
		'Content-Type': 'application/json'
	});

	try {
		// const { q, user_id, company_id } = req.params;

		// const result = await fetch(`http://localhost:8080/api/converters`, {
		// 	method: "GET",
		// 	headers: {
		// 		"Content-Type": "application/json",
		// 		Accept: "application/json",
		// 	}
		// });

		axios.get('http://localhost:8080/api/converters')
			.then(response => {
				// handle success
				// console.log(response.data)
				res.end(JSON.stringify(response.data));
			})
			.catch(error => {
				// handle error
				// console.log(error)
				res.end(JSON.stringify(error));
			})

		// res.end(JSON.stringify(result));
	}catch (error){
		res.end(JSON.stringify(error));
		// res.end(JSON.stringify({ error: error.message }));
	}
}
