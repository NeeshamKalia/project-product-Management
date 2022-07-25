const jwt = require('jsonwebtoken');
const checkAuth = function (req, res, next) {
    try {
      let token = req.header('Authorization', 'Bearer Token');
      //if (!token) token = req.headers["bearer token"];
      if (!token)
        return res
          .status(401)
          .send({ status: false, message: "not authorized" });
          bearerToken = token.split(' ')[1]
          jwt.verify(bearerToken,"functionup-radon", (err, user) => { if (err) return res.status(401).send({msg: "Unauthorized access"})}); 
          //req.user = user;
          let decodedToken = jwt.verify(bearerToken, "functionup-radon");
          if (decodedToken.length ==0){
            return res.status(404).send({ status: false, msg: "token is not valid" })};
           if (Date.now() > bearerToken.exp * 1000) {
            return res
              .status(401)
              .send({ status: false, message: "access expired" }); //checking if the token is expired
          } 
          
          //req.userId = decodedToken.id;
          //console.log(decodedToken.userId)
          next();
        }
       
     catch (error) {
      return res.status(500).send({ status: false, Error: error.message });
    }
  }; 
  const authrz = function (req, res, next) {
    try {
    

      bearerToken = (req.header('Authorization', 'Bearer Token')).split(' ')[1]
      let decodedToken = jwt.verify(bearerToken, "functionup-radon");
      
      let userId = req.params.userId;
     
      if (userId.toString() != decodedToken.userId) {return res.status(401).send({status: false, message: "unauthorized"});}
      next();
    }
   
 catch (error) {
  return res.status(500).send({ status: false, Error: error.message });
}
}; 


  module.exports = { checkAuth, authrz };