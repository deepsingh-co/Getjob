

const isAuth = (req, res, next) => {
    try {
        let {token} = req.cookies

        if (!token) {
            return res.status(401).json({message: "Unauthorized"})
        }   


    }catch (error) {

    }
}
