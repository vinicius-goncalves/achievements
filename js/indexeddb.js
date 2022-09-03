import { achievements } from '../js/achievements.js'

const db = indexedDB.open('achievements', 1)
const objName = 'objAchievements'

export const dbPromise = new Promise((resolve, reject) => {

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
            store.put({ type: 'achievements_db', achievements })
        }
    })
    db.addEventListener('error', (event) => {
        const dbReject = event.target.result
        reject(dbReject)
    })
})

const getStoreTransaction = (transactionType) => {
    const storePromise = new Promise(async (resolve) => {
        const db = await dbPromise
        const transaction = db.transaction(objName, transactionType)
        const store = transaction.objectStore(objName)
        resolve(store)
    })
    return storePromise
}

export const getAchievements = async () => {
    
    const store = await getStoreTransaction('readonly')
    const storeAll = store.getAll()
    const achievementsPromise = new Promise(resolve => {
        storeAll.addEventListener('success', (event) => {
            resolve(event.target.result[0])
        })
    })
    return achievementsPromise
}

export const cursorArchievements = async () => {
    const db = await dbPromise
    const transaction = db.transaction(objName, 'readonly')
    const store = transaction.objectStore(objName)
    const cursor = store.openCursor()
    const cursorPromise = new Promise(resolve => {
        cursor.addEventListener('success', (event) => {
            const { ['result']: cursor } = event.target
            if(!cursor) {
                return
            }
            resolve(cursor.value)
            cursor.continue()
        })
    })
    return cursorPromise
}

export const updateAllAchievements = async (newData) => {
    const db = await dbPromise
    const transaction = db.transaction(objName, 'readwrite')
    const store = transaction.objectStore(objName)
    const cursor = store.openCursor()
    cursor.addEventListener('success', (event) => {
        const { ['result']: cursor } = event.target
        if(!cursor) {
            return
        }

        const result = cursor.value
        if(result.type === 'achievements_db') {
            cursor.update(newData)
            return
        }
        cursor.continue()
    })
}

export const updateAchievement = async (newData, achievementType) => {
    const store = await getStoreTransaction('readwrite')
    const cursor = store.openCursor()
    cursor.addEventListener('success', (event) => {
        const { ['result']: cursor } = event.target
        if(!cursor) {
            return
        }

        const value = cursor.value
        if(value.type === achievementType) {
            cursor.update({ type: 'achivements_db', achievements: { ...newData } })
            return
        }

        cursor.continue()
    })
}