import { checkExistingUsers, registerNewUser } from '../../services/loginService.js'
import { bcrypt, validate, required, isEmail, minLength } from '../../deps.js'

const registrationRules = {
    email: [required, isEmail],
    password: [required, minLength(4)],
};

const showRegistrationForm = ({ render }) => {
    render('register.ejs', { errors: [], email: '' });
}
/*AFTER CREATING THE USER, THE USER WILL BE AUTOMATICALLY LOGGED IN */
const postRegistrationForm = async ({ request, response, render, session }) => {
    const body = request.body();
    const params = await body.value;

    const email = params.get('email');
    const password = params.get('password');
    const verification = params.get('verification');
    const [passes, errors] = await validate({ email: email, password: password }, registrationRules)
    const existingUsers = await checkExistingUsers(email)
    if (password !== verification) {
        errors.password = {
            ...errors.password,
            matches: 'The entered passwords did not match'
        }
    }
    if (existingUsers.rowCount > 0) {
        errors.email = {
            ...errors.email,
            matches: 'The email is already reserved!'
        }
    }
    if (!passes || Object.keys(errors).length > 0) {
        render('register.ejs', { errors: errors, email: email });
    } else {
        const hash = await bcrypt.hash(password);
        await registerNewUser(email, hash)
        const res = await checkExistingUsers(email)
        if (res.rowCount === 0) {
            response.redirect('/auth/login');
        } else {
            const userObj = res.rowsOfObjects()[0];
            await session.set('authenticated', true);
            await session.set('user', {
                id: userObj.id,
                email: userObj.email
            });
            response.redirect('/');
        }
    }
};

const postLoginForm = async ({ request, response, session, render }) => {
    const body = request.body();
    const params = await body.value;

    const email = params.get('email');
    const password = params.get('password');
    // check if the email exists in the database
    const res = await checkExistingUsers(email)
    if (res.rowCount === 0) {
        render('login.ejs', { error: 'Invalid email or password' });
    } else {
        // take the first row from the results
        const userObj = res.rowsOfObjects()[0];
        const hash = userObj.password;
        const passwordCorrect = await bcrypt.compare(password, hash);
        if (!passwordCorrect) {
            console.log('password wrong')
            render('login.ejs', { error: 'Invalid email or password' });
        } else {
            await session.set('authenticated', true);
            await session.set('user', {
                id: userObj.id,
                email: userObj.email
            });
            response.redirect('/');
        }
    }
}

const showLoginForm = ({ render }) => {
    render('login.ejs', { error: null });
}
const logOut = async ({ response, session }) => {
    await session.set('authenticated', false)
    await session.set('user', null)
    response.redirect('/')
}

export { showRegistrationForm, postRegistrationForm, postLoginForm, showLoginForm, logOut }