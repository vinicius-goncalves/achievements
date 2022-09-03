import { invokeIndexedDB, getAchievements, cursorArchievements } from '../js/indexeddb.js'

invokeIndexedDB()
cursorArchievements().then(cursor => console.log(cursor))