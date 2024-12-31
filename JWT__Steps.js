/**
 * -----------------------
 *      JWT 
 * -----------------------
 * *Install jsonwebtoken, cookie-parser
 * *set cookie-parser as middleware
 * 
 * *1. Create a Token
 * 
 * *2. jwt.sign(data, JWT_SECRET_KEY, {expiresIn: '1h'})
 * 
 * *3. set token to the cookie of response :  
 *      *.cookie('authToken', token, {
 *          *httpOnly: true,
 *          *secure: false,
 *          *sameSite: 'none'
 *       *})
 * 
 * *4. send the token to the client side :
 *      *app.use(cors({
 *          *origin: ['http://localhost:5173'],
 *          *credentials: true,
 *      *}));
 * *5. client side receive the token from the server like this : 
 *      *const user = currentUser.email;
 *      *axios.post('https://hire-sphere-server.vercel.app/jwt', user, {withCredentials: true})
 *         *.then(res=> console.log(res.data));
 * *6. Logout then clear cookie from the server side : 
 * 
 * 
 * 
 * 
 * 
 */