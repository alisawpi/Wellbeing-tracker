import {weekForAll, dayForAll} from '../../services/statsService.js'; 
import { format } from '../../deps.js'

const weekSummary = async ({response}) => {
    const todayDate = new Date(Date.now())
    const sevenDaysAgo = new Date(todayDate.getFullYear(), todayDate.getMonth(), todayDate.getDate()-7)
    const end = format(todayDate, 'yyyy-MM-dd')
    const start = format(sevenDaysAgo, 'yyyy-MM-dd')
    response.body = await weekForAll(start, end)
};
const daySummary = async ({params, response}) => {
    const year = params.year
    const month = params.month
    const day = params.day
    const date = format(new Date(year, month-1, day), 'yyyy-MM-dd')
    response.body = await dayForAll(date)
}


export { weekSummary, daySummary };