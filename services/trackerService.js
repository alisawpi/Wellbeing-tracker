import {executeQuery} from '../database/database.js'
import { format } from '../deps.js'

/* THIS FUNCTION IS USED TO CHECK WHETHER THE USER HAS REPORTED TODAYS MORNING AND/OR EVENING YET */
const todayReported = async (user_id) => {
  const reported = {
    morning: false,
    evening: false
  }
  const today = format(new Date(Date.now()), 'yyyy-MM-dd')
  const res = await executeQuery("SELECT * FROM behaviour WHERE date=$1 AND user_id=$2", today, user_id)
  if (res.rowCount > 0) {
    const report = res.rowsOfObjects()[0]
    if (report.mood) {
      reported.morning = true
    }
    if (report.mood_evening) {
      reported.evening = true
    }
  }
  return reported
}

/*NEWDATA { 
  sleep_quality: number, 
  sleep_duration: number, 
  mood: number, 
  date: date, 
  user_id: id
}
THIS FUNCTION IS USED TO EITHER CREATE A NEW MORNING REPORT OR REPLACE THE EXISTING DATA WITH NEW
*/
const addMorning = async ({ sleep_quality, sleep_duration, mood, date, user_id }) => {
  const entryAlreadyExists = await executeQuery('SELECT * FROM behaviour WHERE user_id=$1 AND date=$2', user_id, date)
  if (entryAlreadyExists.rowCount > 0) {
    await executeQuery("UPDATE behaviour SET sleep_quality=$1, sleep_duration=$2, mood=$3 WHERE date=$4 AND user_id=$5;",
      sleep_quality, sleep_duration, mood, date, user_id);
  } else {
    await executeQuery("INSERT INTO behaviour  (sleep_quality, sleep_duration, mood, date, user_id) VALUES ($1, $2, $3,$4, $5);",
      sleep_quality, sleep_duration, mood, date, user_id)
  }

}
/*NEWDATA: { 
  exercise: number, 
  study: number, 
  food_quality: number, 
  food_req: number, 
  mood_evening: number
  date_evening: date, 
  user_id: id
}
THIS FUNCTION IS USED TO EITHER CREATE A NEW EVENING REPORT OR REPLACE THE EXISTING DATA
  */
const addEvening = async ({ exercise, study, food_quality, food_req, mood_evening, date_evening, user_id }) => {
  const entryAlreadyExists = await executeQuery('SELECT * FROM behaviour WHERE user_id=$1 AND date=$2', user_id, date_evening)
  if (entryAlreadyExists.rowCount > 0) {
    await executeQuery("UPDATE behaviour SET food_req=$1, food_quality=$2, study=$3, exercise=$4, mood_evening=$5 WHERE date=$6 AND user_id=$7;",
      food_req, food_quality, study, exercise, mood_evening, date_evening, user_id)
  } else {
    await executeQuery("INSERT INTO behaviour  (food_req,food_quality,study,exercise,mood_evening,date,user_id) VALUES ($1, $2, $3,$4, $5, $6,$7);",
      food_req, food_quality, study, exercise, mood_evening, date_evening, user_id)
  }
}

export { todayReported, addMorning, addEvening };