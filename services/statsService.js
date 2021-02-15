import { executeQuery } from "../database/database.js";
import { format } from '../deps.js'

/**DATE IS IN FORMAT YYYY-MM-DD IN THE DATABASE */
/*THIS FUNCTION FETCHES USER SPECIFIC DATA BETWEEN GIVEN DATES */
const getBehaviour = async (userid, startDay, endDay) => {
  const stats = {
    sleep_quality: 0,
    sleep_duration: 0,
    exercise: 0,
    study: 0,
    mood: 0
  }
  /*FETCH AVERAGES*/
  const sleep_quality = await executeQuery("SELECT CAST(AVG(sleep_quality) AS DECIMAL(10,2)) FROM behaviour WHERE user_id=$1 AND date>=$2 AND date<=$3", userid, startDay, endDay);
  const sleep_duration = await executeQuery("SELECT CAST(AVG(sleep_duration) AS DECIMAL(10,2)) FROM behaviour WHERE user_id=$1 AND date>=$2 AND date<=$3", userid, startDay, endDay);
  const exercise = await executeQuery("SELECT CAST(AVG(exercise) AS DECIMAL(10,2)) FROM behaviour WHERE user_id=$1 AND date>=$2 AND date<=$3", userid, startDay, endDay);
  const study = await executeQuery("SELECT CAST(AVG(study) AS DECIMAL(10,2)) FROM behaviour WHERE user_id=$1 AND date>=$2 AND date<=$3", userid, startDay, endDay);
  const mood = await executeQuery("SELECT CAST((AVG(mood) + AVG(mood_evening))/2 AS DECIMAL(10,2))FROM behaviour WHERE user_id=$1 AND date>=$2 AND date<=$3", userid, startDay, endDay);
  if (sleep_quality.rowCount > 0) {
    stats.sleep_quality = sleep_quality.rowsOfObjects()[0].avg
  }
  if (sleep_duration.rowCount > 0) {
    stats.sleep_duration = sleep_duration.rowsOfObjects()[0].avg
  }
  if (exercise.rowCount > 0) {
    stats.exercise = exercise.rowsOfObjects()[0].avg
  }
  if (study.rowCount > 0) {
    stats.study = study.rowsOfObjects()[0].avg
  }
  if (mood.rowCount > 0) {
    stats.mood = mood.rowsOfObjects()[0].numeric
  }
  return stats
}

/*THIS FUNCTION FETCHES THE OVERALL MOOD OF ALL USERS FOR TODAY AND YESTERDAY */
const usersMood = async () => {
  /*GET DATE FOR TODAY AND YESTERDAY */
  const todayDate = new Date(Date.now())
  const today = format(todayDate, 'yyyy-MM-dd')
  const yesterday = format(new Date(todayDate.getFullYear(), todayDate.getMonth(), todayDate.getDate()-1), 'yyyy-MM-dd')

  /*FETCH MOOD */
  const stats = {
    today: 0, 
    yesterday: 0
  }
  const moodYesterday = await executeQuery("SELECT CAST((AVG(mood) + AVG(mood_evening))/2 AS DECIMAL(10,2)) FROM behaviour WHERE date=$1", yesterday)
  const moodToday = await executeQuery("SELECT CAST((AVG(mood) + AVG(mood_evening))/2 AS DECIMAL(10,2)) FROM behaviour WHERE date=$1", today)
  if (moodYesterday.rowCount > 0 ){
    stats.yesterday = moodYesterday.rowsOfObjects()[0].numeric
  }
  if (moodToday.rowCount > 0 ){
    stats.today = moodToday.rowsOfObjects()[0].numeric
  }
  console.log(stats)
  return stats
}

/*THIS FUNCTION IS USED BY THE API TO FETCH AVERAGES OF ALL USERS FOR A SPECIFIED DATE */
const dayForAll =  async (date) => {
  const stats = {
    sleep_quality: 0,
    sleep_duration: 0,
    exercise: 0,
    study: 0,
    mood: 0
  }
  const sleep_quality = await executeQuery("SELECT CAST(AVG(sleep_quality) AS DECIMAL(10,2)) FROM behaviour WHERE date=$1", date);
  const sleep_duration = await executeQuery("SELECT CAST(AVG(sleep_duration) AS DECIMAL(10,2)) FROM behaviour WHERE date=$1", date);
  const exercise = await executeQuery("SELECT CAST(AVG(exercise) AS DECIMAL(10,2)) FROM behaviour WHERE date=$1", date);
  const study = await executeQuery("SELECT CAST(AVG(study) AS DECIMAL(10,2)) FROM behaviour WHERE date=$1", date);
  const mood = await executeQuery("SELECT CAST((AVG(mood) + AVG(mood_evening))/2 AS DECIMAL(10,2)) FROM behaviour WHERE date=$1", date);
  if (sleep_quality.rowCount > 0) {
    stats.sleep_quality = sleep_quality.rowsOfObjects()[0].avg
  }
  if (sleep_duration.rowCount > 0) {
    stats.sleep_duration = sleep_duration.rowsOfObjects()[0].avg
  }
  if (exercise.rowCount > 0) {
    stats.exercise = exercise.rowsOfObjects()[0].avg
  }
  if (study.rowCount > 0) {
    stats.study = study.rowsOfObjects()[0].avg
  }
  if (mood.rowCount > 0) {
    stats.mood = mood.rowsOfObjects()[0].numeric
  }
  return stats
}

/* THIS FUNCTION IS USED TO FETCH AVERAGES FOR ALL USERS FROM THE PAST 7 DAYS */
const weekForAll = async (startDay, endDay) => {
  const stats = {
    sleep_quality: 0,
    sleep_duration: 0,
    exercise: 0,
    study: 0,
    mood: 0
  }
  const sleep_quality = await executeQuery("SELECT CAST(AVG(sleep_quality) AS DECIMAL(10,2)) FROM behaviour WHERE date>=$1 AND date<=$2", startDay, endDay);
  const sleep_duration = await executeQuery("SELECT CAST(AVG(sleep_duration) AS DECIMAL(10,2)) FROM behaviour WHERE date>=$1 AND date<=$2", startDay, endDay);
  const exercise = await executeQuery("SELECT CAST(AVG(exercise) AS DECIMAL(10,2)) FROM behaviour WHERE date>=$1 AND date<=$2", startDay, endDay);
  const study = await executeQuery("SELECT CAST(AVG(study) AS DECIMAL(10,2)) FROM behaviour WHERE date>=$1 AND date<=$2", startDay, endDay);
  const mood = await executeQuery("SELECT CAST((AVG(mood) + AVG(mood_evening))/2 AS DECIMAL(10,2)) FROM behaviour WHERE date>=$1 AND date<=$2", startDay, endDay);
  console.log(mood)
  if (sleep_quality.rowCount > 0) {
    stats.sleep_quality = sleep_quality.rowsOfObjects()[0].avg
  }
  if (sleep_duration.rowCount > 0) {
    stats.sleep_duration = sleep_duration.rowsOfObjects()[0].avg
  }
  if (exercise.rowCount > 0) {
    stats.exercise = exercise.rowsOfObjects()[0].avg
  }
  if (study.rowCount > 0) {
    stats.study = study.rowsOfObjects()[0].avg
  }
  if (mood.rowCount > 0) {
    stats.mood = mood.rowsOfObjects()[0].numeric
  }
  return stats
  
}
export { getBehaviour, usersMood, dayForAll, weekForAll}