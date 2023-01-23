
import root from './root.svelte';
import { set_building, set_paths, set_private_env, set_public_env, set_version } from '../../node_modules/@sveltejs/kit/src/runtime/shared.js';

set_paths({"base":"","assets":""});
set_version("1674473603932");

export const options = {
	csp: {"mode":"auto","directives":{"upgrade-insecure-requests":false,"block-all-mixed-content":false},"reportOnly":{"upgrade-insecure-requests":false,"block-all-mixed-content":false}},
	csrf_check_origin: true,
	embedded: false,
	env_public_prefix: 'PUBLIC_',
	hooks: null, // added lazily, via `get_hooks`
	root,
	service_worker: false,
	templates: {
		app: ({ head, body, assets, nonce, env }) => "<!DOCTYPE html>\r\n<html lang=\"en\">\r\n\t<head>\r\n\t\t<meta charset=\"utf-8\" />\r\n\t\t<link rel=\"icon\" href=\"/favicon.ico\" />\r\n\t\t<meta name=\"viewport\" content=\"width=device-width, initial-scale=1\" />\r\n\t\t<link rel=\"manifest\" href=\"/manifest.json\" />\r\n\r\n\t\t<!-- Import Ionicon icons & Google Fonts our Bootstrap theme relies on -->\r\n\t\t<link\r\n\t\t\thref=\"//code.ionicframework.com/ionicons/2.0.1/css/ionicons.min.css\"\r\n\t\t\trel=\"stylesheet\"\r\n\t\t\ttype=\"text/css\"\r\n\t\t/>\r\n\t\t<link\r\n\t\t\thref=\"//fonts.googleapis.com/css?family=Titillium+Web:700|Source+Serif+Pro:400,700|Merriweather+Sans:400,700|Source+Sans+Pro:400,300,600,700,300italic,400italic,600italic,700italic\"\r\n\t\t\trel=\"stylesheet\"\r\n\t\t\ttype=\"text/css\"\r\n\t\t/>\r\n\t\t<!-- Import the custom Bootstrap 4 theme from our hosted CDN -->\r\n\t\t<link rel=\"stylesheet\" href=\"/main.css\" />\r\n\r\n\t\t<!--Fontawesome-->\r\n\t\t<link rel=\"stylesheet\" href=\"/fontawesome-free-5.11.2-web/css/all.min.css\" />\r\n\r\n\t\t" + head + "\r\n\t</head>\r\n\t<body data-sveltekit-prefetch>\r\n\t\t<div>" + body + "</div>\r\n\t</body>\r\n</html>\r\n",
		error: ({ status, message }) => "<!DOCTYPE html>\n<html lang=\"en\">\n\t<head>\n\t\t<meta charset=\"utf-8\" />\n\t\t<title>" + message + "</title>\n\n\t\t<style>\n\t\t\tbody {\n\t\t\t\tfont-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,\n\t\t\t\t\tUbuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;\n\t\t\t\tdisplay: flex;\n\t\t\t\talign-items: center;\n\t\t\t\tjustify-content: center;\n\t\t\t\theight: 100vh;\n\t\t\t}\n\n\t\t\t.error {\n\t\t\t\tdisplay: flex;\n\t\t\t\talign-items: center;\n\t\t\t\tmax-width: 32rem;\n\t\t\t\tmargin: 0 1rem;\n\t\t\t}\n\n\t\t\t.status {\n\t\t\t\tfont-weight: 200;\n\t\t\t\tfont-size: 3rem;\n\t\t\t\tline-height: 1;\n\t\t\t\tposition: relative;\n\t\t\t\ttop: -0.05rem;\n\t\t\t}\n\n\t\t\t.message {\n\t\t\t\tborder-left: 1px solid #ccc;\n\t\t\t\tpadding: 0 0 0 1rem;\n\t\t\t\tmargin: 0 0 0 1rem;\n\t\t\t\tmin-height: 2.5rem;\n\t\t\t\tdisplay: flex;\n\t\t\t\talign-items: center;\n\t\t\t}\n\n\t\t\t.message h1 {\n\t\t\t\tfont-weight: 400;\n\t\t\t\tfont-size: 1em;\n\t\t\t\tmargin: 0;\n\t\t\t}\n\t\t</style>\n\t</head>\n\t<body>\n\t\t<div class=\"error\">\n\t\t\t<span class=\"status\">" + status + "</span>\n\t\t\t<div class=\"message\">\n\t\t\t\t<h1>" + message + "</h1>\n\t\t\t</div>\n\t\t</div>\n\t</body>\n</html>\n"
	}
};

export function get_hooks() {
	return import("../../src/hooks.server.js");
}

export { set_building, set_paths, set_private_env, set_public_env };
