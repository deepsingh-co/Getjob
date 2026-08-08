import jwt from "jsonwebtoken"

const isAuth = (req, res, next) => {
    try {
        let {token} = req.cookies

        if (!token) {
            return res.status(400).json({message: "Unauthorized user does not have a token"})
        }   

        const verifyToken = jwt.verify(token , process.env.JWT_SECRET)

        if(!verifyToken) {
            return res.status(400).json({message: "Unauthorized user token is not valid"})
        }
        req.userId = verifyToken.userId

        next()


    }catch (error) {
                return res.status(500).json({ message: `isAuth  server error ${error}` });


    }
}

export default isAuth
