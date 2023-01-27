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

        let role = parsed.role;

        role = 'admin';

        req.session.token = parsed.user;
        req.session.role = role;

        res.end(JSON.stringify({ token: parsed.user, role: role }));
    } catch (error) {
        res.end(JSON.stringify({ error: error.message }));
    }
}
