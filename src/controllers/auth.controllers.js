const { pool } = require("../db");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { SECRET_KEY } = require("../config");

//
const registerAccount = async (req, res) => {
  const { name, email, password, passwordConfirm, age } = req.body;

  try {
    const result = await pool.query(
      "SELECT email FROM accounts WHERE email = $1",
      [email],
    );

    if (result.rows.length > 0) {
      return res.send("This email is already in use");
    } else if (age < 18) {
      return res.send("You must be at least 18 years old");
    } else if (password !== passwordConfirm) {
      if (password?.length < 6) {
        return res.send("Password should be at least 6 characters long");
      }
      return res.send("Password and confirm password do not match");
    }

    const hashedPassword = bcrypt.hashSync(password, 10);

    await pool.query(
      "INSERT INTO accounts (name, email, password, age, role_user) VALUES ($1, $2, $3, $4, $5)",
      [name, email, hashedPassword, age, "user"],
    );

    return res.send("Account registered successfully");
  } catch (err) {
    console.error(err);
    return res.status(500).send("Error registering user");
  }
};

//
const loginAccount = async (req, res) => {
  const { email, password: psw } = req.body;

  try {
    const result = await pool.query("SELECT * FROM accounts WHERE email = $1", [
      email,
    ]);

    if (result.rows.length === 0) {
      return res.status(404).send("Email not found");
    }

    const user = result.rows[0];
    const isPasswordValid = bcrypt.compareSync(psw, user.password);
    if (!isPasswordValid) {
      return res.status(401).send("Invalid password");
    }

    const { password, role_user, ...account } = user;

    // Generate token
    const token = jwt.sign(account, SECRET_KEY, {
      expiresIn: "1h",
    });

    const generateRandomNumber = () => {
      return Math.floor(1000 + Math.random() * 9000);
    };

    res.cookie("auth_token_" + generateRandomNumber(), token, {
      httpOnly: process.env.NODE_ENV === "production",
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Strict",
      expires: new Date(Date.now() + 3600 * 1000),
    });

    return res.json(account);
  } catch (err) {
    console.error(err);
    return res.status(500).send("Error during login");
  }
};

//
const refreshToken = async (req, res) => {
  // 1. Use your custom logic to find the cookie name
  const endToken = req.headers["end_token"];
  if (!endToken) return res.status(400).send("end_token header missing");

  const cookieName = `auth_token_${endToken}`;
  const token = req.cookies[cookieName];

  if (!token)
    return res.status(401).json({ message: "Token not found in cookies" });

  try {
    // 2. Verify the old token
    const decoded = jwt.verify(token, SECRET_KEY);

    // Remove 'iat' and 'exp' from decoded so jwt.sign creates new ones
    const { iat, exp, ...userData } = decoded;

    // 3. Create new token
    const newToken = jwt.sign(userData, SECRET_KEY, { expiresIn: "1h" });

    // 4. Overwrite the old cookie with the new token
    res.cookie(cookieName, newToken, {
      httpOnly: process.env.NODE_ENV === "production",
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Strict",
      expires: new Date(Date.now() + 3600 * 1000),
    });

    return res.json({ message: "Token refreshed", user: userData });
  } catch (error) {
    return res.status(403).json({ message: "Invalid or expired token" });
  }
};

module.exports = { registerAccount, loginAccount, refreshToken };
