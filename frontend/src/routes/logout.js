export async function get(req, res) {
    req.session.token = null;
    req.session.role = null;
    req.session.user = null;

    res.writeHead(307, { Location: '/login' })
    res.end()
}
