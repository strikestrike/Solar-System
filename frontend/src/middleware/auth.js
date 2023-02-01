export default function authMiddleware(req, res, next) {
    // Your middleware logic here

    const isControllerOrDocumentRequest = req.url.startsWith('/login')
                                        || req.url.startsWith('/logout')
                                        || req.url.startsWith('/converter')
                                        || req.url.startsWith('/tickets')
                                        || req.url.startsWith('/history')
                                        || req.url.startsWith('/profile')
                                        || req.url.startsWith('/settings')
                                        || req.url.startsWith('/admin');

    if(!isControllerOrDocumentRequest){
        next();

        return;
    }

    if(req.session.token){
        if((req.path.indexOf('/admin') >= 0 && req.session.role < 1)
            || (req.path.indexOf('/gadmin') >= 0 && req.session.role != 2)){
            res.writeHead(302, { Location: '/login' });
            return res.end();
        }

        next();
    }else{
        if(req.path.indexOf('/login') >= 0
            || req.path.indexOf('/signin') >= 0){
            next();
        }else{
            res.writeHead(302, { Location: '/login' });
            return res.end();
        }
    }
}
