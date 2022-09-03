import { achievements } from '../js/achievements.js'

const db = indexedDB.open('achievements', 1)
const objName = 'objAchievements'

export const invokeIndexedDB = () => {
    const dbPromise = new Promise((resolve, reject) => {
    
        db.addEventListener('success', (event) => {
            const dbResult = event.target.result
            resolve(dbResult)
        })
    
        db.addEventListener('upgradeneeded', (event) => {
            const db = event.target.result
            const objectStoreName = db.objectStoreNames.contains(objName)
            if(!objectStoreName) {
                const result = db.createObjectStore(objName, { autoIncrement: true })
                const transaction = result.transaction
                const store = transaction.objectStore(objName)
                store.put(achievements)
            }
        })
        db.addEventListener('error', (event) => {
            const dbReject = event.target.result
            reject(dbReject)
        })
    })
    return dbPromise
}

export const getAchievements = async () => {
    const db = await invokeIndexedDB()
    const transaction = db.transaction(objName, 'readonly')
    const store = transaction.objectStore(objName)
    const storeAll = store.getAll()
    const achievementsPromise = new Promise(resolve => {
        storeAll.addEventListener('success', (event) => {
            resolve(event.target.result[0])
        })
    })
    return achievementsPromise
}

export const cursorArchievements = async () => {
    const db = await invokeIndexedDB()
    const transaction = db.transaction(objName, 'readonly')
    const store = transaction.objectStore(objName)
    const cursor = store.openCursor()
    const cursorPromise = new Promise(resolve => {
        cursor.addEventListener('success', (event) => {
            const { ['result']: cursor } = event.target
            if(!cursor) {
                return
            }
            console.log(cursor.value)
            cursor.continue()
        })
    })
    return cursorPromise
}