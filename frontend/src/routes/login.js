const headers = {
    "Content-Type": "application/json",
    Accept: "application/json",
};

export async function post(req, res) {
    try {
        const { email, password } = req.body;

        const result = await fetch(`http://localhost:8080/api/signin`, {
            method: "POST",
            headers,
            body: JSON.stringify({ email, password }),
        });

        const parsed = await result.json();

        if (typeof parsed.error !== "undefined") {
            throw new Error(parsed.error);
        }

        let user = parsed.user;

        req.session.token = user;
        req.session.role = user.role;

        res.end(JSON.stringify({ token: user, role: user.role }));
    } catch (error) {
        res.end(JSON.stringify({ error: error.message }));
    }
}
