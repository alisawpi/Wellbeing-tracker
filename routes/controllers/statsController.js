import { getBehaviour } from "../../services/statsService.js";
import { format, weekOfYear } from '../../deps.js'

let dataWeekly = {
    duration_weekly: 0,
    quality_weekly: 0,
    exercise_weekly: 0,
    study_weekly: 0,
    mood_weekly: 0
}
let dataMonthly = {
    duration_monthly: 0,
    quality_monthly: 0,
    exercise_monthly: 0,
    study_monthly: 0,
    mood_monthly: 0
}

/*PARSES THE START AND END DATES FOR THE SELECTED WEEK 
AND CONVERTS THEM TO THE FORMAT USED IN THE DATABASE WHICH IS YYYY-MM-DD */

const getDateOfWeek = (w, y) => {
    var simple = new Date(y, 0, 1 + (w - 1) * 7);
    var dow = simple.getDay();
    var ISOweekStart = simple;
    if (dow <= 4) {
        ISOweekStart.setDate(simple.getDate() - simple.getDay() + 1);
    } else {
        ISOweekStart.setDate(simple.getDate() + 8 - simple.getDay());
    }
    const d = ISOweekStart.getDate()
    const m = ISOweekStart.getMonth()
    console.log(d)
    return {
        start: format(new Date(y, m, d), 'yyyy-MM-dd'),
        end: format(new Date(y, m, d + 6), 'yyyy-MM-dd')
    }
}
/*PARSES THE START AND END DATES FOR THE SELECTED MONTH 
AND CONVERTS THEM TO THE FORMAT USED IN THE DATABASE WHICH IS YYYY-MM-DD */

const getDateOfMonth = (m, y) => {
    const startDate = new Date(y, m, 1)
    const endDate = new Date(y, m + 1, 0)
    return {
        start: format(startDate, 'yyyy-MM-dd'),
        end: format(endDate, 'yyyy-MM-dd')
    }
}

/*Initially showing last weeks and last months stats */
const stats = async ({ render, session, response }) => {
    const user = await session.get('user')
    if (!user) {
        response.redirect('/auth/login')
    }
    /*FIND OUT TODAYS DATE, WEEK, MONTH AND YEAR*/
    const today = (new Date(Date.now()))
    const todayWeek = weekOfYear(today)
    const todayMonth = today.getMonth()
    console.log('Month today: ', todayMonth)
    const todayYear = today.getFullYear()

    /* GET LAST WEEKS DATES */
    const lastweekY = todayWeek === 1 ? todayYear - 1 : todayYear
    const lastweekW = todayWeek === 1 ? 52 : todayWeek - 1
    console.log('week: ', lastweekW, lastweekY)
    const lastWeekDates = getDateOfWeek(lastweekW, lastweekY)
    console.log(lastWeekDates)

    /* GET LAST MONTHS DATES*/
    const lastMonth = todayMonth === 1 ? 12 : todayMonth - 1
    const lastMonthsYear = todayMonth === 1 ? todayYear - 1 : todayYear
    const lastMonthDates = getDateOfMonth(lastMonth, lastMonthsYear)
    console.log('Month: ', lastMonth, lastMonthsYear)
    console.log(lastMonthDates)

    /*GET DATA FOR THE LAST WEEK AND LAST MONTH */
    const resWeek = await getBehaviour(user.id, lastWeekDates.start, lastWeekDates.end)
    dataWeekly = {
        duration_weekly: resWeek.sleep_duration,
        quality_weekly: resWeek.sleep_quality,
        exercise_weekly: resWeek.exercise,
        study_weekly: resWeek.study,
        mood_weekly: resWeek.mood,
    }
    const resMonth = await getBehaviour(user.id, lastMonthDates.start, lastMonthDates.end)
    dataMonthly = {
        duration_monthly: resMonth.sleep_duration,
        quality_monthly: resMonth.sleep_quality,
        exercise_monthly: resMonth.exercise,
        study_monthly: resMonth.study,
        mood_monthly: resMonth.mood
    }
    console.log(dataWeekly)
    console.log(dataMonthly)

    render('stats.ejs', { ...dataWeekly, user: user, ...dataMonthly })
}


/*FETCH SPECIFIED WEEK FROM USER INPUT */
const getStatsWeek = async ({ render, request, session }) => {
    const user = await session.get('user')
    if (!user) {
        response.redirect('/auth/login')
    }
    const body = request.body();
    const params = await body.value;
    const week = params.get('week-stats')
    const y = Number(week.substring(0, 4))
    const w = Number(week.substring(6, 9))
    const dates = getDateOfWeek(w, y)
    console.log(dates.start)
    console.log(dates.end)

    const resWeek = await getBehaviour(user.id, dates.start, dates.end)
    dataWeekly = {
        duration_weekly: resWeek.sleep_duration,
        quality_weekly: resWeek.sleep_quality,
        exercise_weekly: resWeek.exercise,
        study_weekly: resWeek.study,
        mood_weekly: resWeek.mood,
    }
    console.log(dataWeekly)
    console.log(dataMonthly)

    render('stats.ejs', { user: user,...dataWeekly, ...dataMonthly })
}

const getStatMonth = async ({ render, request, session }) => {
    const user = await session.get('user')
    if (!user) {
        response.redirect('/auth/login')
    }
    /*PARSE MONTH */
    const body = request.body();
    const params = await body.value;
    const month = params.get('month-stats')
    const m = Number(month.substring(5, 7))
    const y = Number(month.substring(0, 4))
    const monthDates = getDateOfMonth(m - 1, y)
    console.log(monthDates)

    /*GET MONTHS DATA */
    const resMonth = await getBehaviour(user.id, monthDates.start, monthDates.end)
    dataMonthly = {
        duration_monthly: resMonth.sleep_duration,
        quality_monthly: resMonth.sleep_quality,
        exercise_monthly: resMonth.exercise,
        study_monthly: resMonth.study,
        mood_monthly: resMonth.mood
    }
    render('stats.ejs', {user:user, ...dataWeekly, ...dataMonthly })
}


export { stats, getStatsWeek, getStatMonth }
