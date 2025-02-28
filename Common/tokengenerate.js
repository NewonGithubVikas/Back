function tokengenerate(data) {
    jwt.sign({ data }, secretKey, { expiresIn: "300s" }, (err, token) => {
        return res.json({
          responseCode: 200,
          responseMessage: "Successfully login",
          token: token,
          _id: oneuser.id,
        });
      });
}
