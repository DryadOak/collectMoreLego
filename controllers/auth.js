import passport from 'passport';
import validator from 'validator';
import User from '../models/User.js';

export const getLogin = (req, res) => {
  if (req.user) {
    return res.redirect('/userCollection');
  }
  res.render('login', {
    title: 'Login',
  });
};

export const postLogin = (req, res, next) => {
  console.log(req.body);
  const validationErrors = [];
  if (!validator.isEmail(req.body.email)) {
    validationErrors.push({ msg: 'Please enter a valid email address.' });
  }
  if (validator.isEmpty(req.body.password)) {
    validationErrors.push({ msg: 'Password cannot be blank.' });
  }

  if (validationErrors.length) {
    req.flash('errors', validationErrors);
    console.log(validationErrors)
    return res.status(400).json({ errors: validationErrors });
  }
  req.body.email = validator.normalizeEmail(req.body.email, { gmail_remove_dots: false });

  passport.authenticate('local', (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      req.flash('errors', info);
      return res.status(400).json({ errors: info });
    }
    req.logIn(user, (err) => {
      if (err) {
        return next(err);
      }
      req.flash('success', { msg: 'Success! You are logged in.' });
      return res.status(200).json({ success: 'Success! You are logged in.', redirectUrl: '/userCollection' });
    });
  })(req, res, next);
};

export const logout = (req, res, next) => {
  req.logout((err) => {
    if (err) {
      console.error('Error during logout:', err);
      return next(err);
    }

    req.session.destroy((err) => {
      if (err) {
        console.error('Error destroying session:', err);
        return next(err);
      }

      res.redirect('/');
    });
  });
};

// export const getSignup = (req, res) => {
//   if (req.user) {
//     return res.redirect('/userCollection');
//   }
//   res.render('signup', {
//     title: 'Create Account',
//   });
// };

export const postSignup = async (req, res, next) => {
  const validationErrors = [];

  if (!validator.isEmail(req.body.email)) {
    validationErrors.push({ msg: 'Please enter a valid email address.' });
  }
  if (!validator.isLength(req.body.password, { min: 8 })) {
    validationErrors.push({ msg: 'Password must be at least 8 characters long' });
  }
  if (req.body.password !== req.body.confirmPassword) {
    validationErrors.push({ msg: 'Passwords do not match' });
  }

  if (validationErrors.length) {
    req.flash('errors', validationErrors);
    return res.status(400).json({ errors: validationErrors });
  }

  req.body.email = validator.normalizeEmail(req.body.email, { gmail_remove_dots: false });

  try {
    const existingUser = await User.findOne({
      $or: [
        { email: req.body.email },
        { userName: req.body.userName },
      ],
    });

    if (existingUser) {
      req.flash('errors', { msg: 'Account with that email address or username already exists.' });
      return res.status(400).json({ errors: [{ msg: 'Account with that email address or username already exists.' }] });
    }

    const user = new User({
      userName: req.body.userName,
      email: req.body.email,
      password: req.body.password,
    });

    await user.save();

    req.logIn(user, (err) => {
      if (err) {
        return next(err);
      }
      return res.status(200).json({ success: 'Success! You are logged in.', redirectUrl: '/userCollection' });
    });

  } catch (err) {
    return next(err);
  }
};
