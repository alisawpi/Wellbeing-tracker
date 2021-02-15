import { Router } from "../deps.js";
import { home, reporting, sendMorning, sendEvening } from "./controllers/trackerController.js";
import { getStatMonth, getStatsWeek, stats } from './controllers/statsController.js'
import { showRegistrationForm, postRegistrationForm, showLoginForm, postLoginForm, logOut } from './controllers/loginController.js'
import {daySummary, weekSummary} from './apis/statApi.js'

const router = new Router();

/**LANDING PAGE */
router.get('/', home);

/**REPORTING  */
router.get('/behavior/reporting', reporting)
router.post('/behavior/reporting/morning', sendMorning)
router.post('/behavior/reporting/evening', sendEvening)

/**SUMMARY */
router.get('/behavior/summary', stats)
router.post('/behavior/summary/week', getStatsWeek)
router.post('/behavior/summary/month', getStatMonth)

/*USERS REGISTRATION, LOGIN, LOGOUT*/
router.get('/auth/register', showRegistrationForm);
router.post('/auth/register', postRegistrationForm);
router.get('/auth/login', showLoginForm);
router.post('/auth/login', postLoginForm);
router.get('/auth/logout', logOut)

/*API ACCESSIBLE TO ALL*/
router.get('/api/summary', weekSummary)
router.get('/api/summary/:year/:month/:day', daySummary)

export { router };