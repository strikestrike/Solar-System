const headers = {
    "Content-Type": "application/json",
    Accept: "application/json",
};

export async function post(req, res) {
    try {
        const { first_name, last_name } = req.body;

        const {BACKEND_HOST} = process.env;

        const result = await fetch(BACKEND_HOST + `/api/signup`, {
            method: "POST",
            headers,
            body: JSON.stringify(req.body),
        });

        const parsed = await result.json();

        if (typeof parsed.error !== "undefined") {
            throw new Error(parsed.error);
        }

        let user = parsed.user;

        res.end(JSON.stringify({ token: user, role: user.role }));
    } catch (error) {
        res.end(JSON.stringify({ error: error.message }));
    }
}
