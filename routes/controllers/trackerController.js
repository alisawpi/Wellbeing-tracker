import { todayReported, addMorning, addEvening } from "../../services/trackerService.js";
import { required, validate, numberBetween, isNumber, minNumber } from '../../deps.js'
import { usersMood } from '../../services/statsService.js'

const morningValidation = {
  sleep_quality: [required, isNumber, numberBetween(1, 5)],
  sleep_duration: [required, isNumber, minNumber(0)],
  mood: [required, isNumber, numberBetween(1, 5)],
  date: [required],
  user_id: [required]
};

const eveningValidation = {
  exercise: [required, isNumber, minNumber(0)],
  study: [required, isNumber, minNumber(0)],
  food_quality: [required, isNumber, numberBetween(1, 5)],
  food_req: [required, isNumber, numberBetween(1, 5)],
  mood_evening: [required, isNumber, numberBetween(1, 5)],
  date_evening: [required],
  user_id: [required]
};

var today = new Date();
var dd = today.getDate();
var mm = today.getMonth() + 1; //January is 0!
var yyyy = today.getFullYear();
if (dd < 10) {
  dd = '0' + dd
}
if (mm < 10) {
  mm = '0' + mm
}

today = yyyy + '-' + mm + '-' + dd;

let fieldData = {
  sleep_quality: '',
  sleep_duration: '',
  mood: '',
  date: today,
  exercise: '',
  study: '',
  food_quality: '',
  food_req: '',
  mood_evening: '',
  date_evening: today
}

/**
 * moods is of form: 
 * {
 * yesterday: number, 
 * today: number
 * }
 */
const home = async ({session, render }) => {
  const moods = await usersMood()
  const user = await session.get('user')
  render('index.ejs', { ...moods, user:user });
};

/**Alreadyreported is of form 
 * {
 * morning: boolean, 
 * evening: boolean
 * }
 */
const reporting = async ({ render, session, response }) => {
  const user = await session.get('user')
  if (!user) {
    response.redirect('/auth/login')
  }
  const alreadyReported = await todayReported(user.id)
  render('forms.ejs', { ...alreadyReported, user:user, errors: [], ...fieldData })
}

/*The parameter for addMorning is of form 
{ sleep_quality: number, 
  sleep_duration: number, 
  mood: number, 
  date: date, 
  user_id: id
}
  */
const sendMorning = async ({ render, request, response, session }) => {
  const body = request.body();
  const params = await body.value;
  const sleepQuality = params.get('sleep-quality')
  const sleepDuration = params.get('sleep-duration')
  const mood = params.get('mood-morning')
  const date = params.get('morning-date')
  const user = await session.get('user')
  if (!user) {
    response.redirect('/auth/login')
  }
  const newData = {
    sleep_quality: Number(sleepQuality),
    sleep_duration: sleepDuration === "" ? undefined : Number(sleepDuration),
    mood: Number(mood),
    date: date,
    user_id: user.id
  }
  const [passes, errors] = await validate(newData, morningValidation)
  if (!passes) {
    const alreadyReported = await todayReported(user.id)
    fieldData = {
      ...fieldData,
      ...newData
    }
    render('forms.ejs', { ...alreadyReported, errors: errors, ...fieldData })
  } else {
    await addMorning(newData)
    fieldData = {
      sleep_quality: '',
      sleep_duration: '',
      mood: '',
      date: today,
      exercise: '',
      study: '',
      food_quality: '',
      food_req: '',
      mood_evening: '',
      date_evening: today
    }
    response.redirect('/')
  }
}
/*The parameter newDataMorning is of form 
{ 
  exercise: number, 
  study: number, 
  food_quality: number, 
  food_req: number, 
  mood: number
  date: date, 
  user_id: id
}
  */
const sendEvening = async ({ render, request, response, session }) => {
  const body = request.body();
  const params = await body.value;
  const exercise = params.get('exercise')
  const study = params.get('study')
  const food_req = params.get('food-reqularity')
  const food_quality = params.get('food-quality')
  const mood = params.get('mood-evening')
  const date = params.get('evening-date')
  console.log('evening date: ', date)
  const user = await session.get('user')
  if (!user) {
    response.body = 'Must be logged in to submit data!'
    return
  }
  const newData = {
    exercise: exercise === "" ? undefined : Number(exercise),
    study: study === "" ? undefined : Number(study),
    food_quality: Number(food_quality),
    food_req: Number(food_req),
    mood_evening: Number(mood),
    date_evening: date,
    user_id: user.id
  }
  const [passes, errors] = await validate(newData, eveningValidation)
  if (!passes) {
    const alreadyReported = await todayReported(user.id)
    fieldData = {
      ...fieldData,
      ...newData
    }
    render('forms.ejs', { user: user, ...alreadyReported, errors: errors, ...fieldData })
  } else {
    await addEvening(newData)
    fieldData = {
      sleep_quality: '',
      sleep_duration: '',
      mood: '',
      date: today,
      exercise: '',
      study: '',
      food_quality: '',
      food_req: '',
      mood_evening: '',
      date_evening: today
    }
    response.redirect('/')
  }
}

export { home, reporting, sendMorning, sendEvening };