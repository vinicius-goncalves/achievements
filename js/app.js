import { updateAllAchievements, dbPromise, getAchievements, cursorArchievements, updateAchievement } from '../js/indexeddb.js'

const USER = {
    setupUser: function() {
        
        const defaultUserSettings = {
            clicks: 2,
            selections: 0,
            id: Math.floor(Math.random() * (9999 - 999 + 1) + 999) 
        }

        if(localStorage.getItem('userSettings') === null) {
            localStorage.setItem('userSettings', JSON.stringify(defaultUserSettings))
        }
    },
    
    getUser: function () {
        if(localStorage.getItem('userSettings')) {
            return JSON.parse(localStorage.getItem('userSettings'))
        }
    },

    start: function() {
        this.setupUser()
    }
}

window.addEventListener('DOMContentLoaded', USER.start())

const userSettings = () => {

    const user = USER.getUser()

    const userSettingsProto = {
        getClicks: function() {
            return user.clicks
        },
        setClicks: function(amount) {
            user.clicks = amount
            localStorage.setItem('userSettings', JSON.stringify(user))
        },
        getSelections: function() {
            return user.selections
        },
        setSelections: function(amount) {
            user.selections = amount
            localStorage.setItem('userSettings', JSON.stringify(user))
        },
    }

    Object.setPrototypeOf(user, userSettingsProto)
    
    return user
}

const user = userSettings()

document.addEventListener('selectionchange', (event) => {
    
    const targetSelected = event.target
    const selection = targetSelected.getSelection()
    const itemsSelectedLength = selection.toString().length
    if(itemsSelectedLength <= 0) {
        return
    }

    user.setSelections(user.getSelections() + itemsSelectedLength)
})

document.addEventListener('click', () => {
    user.setClicks(user.getClicks() + 1)
})

setInterval(async () => {
    
    const dataInfo = (dataInfo) => document.querySelector(`[data-info="${dataInfo}"]`)
    const user = userSettings()
    
    for(let i in user) {
        
        const infoDOM = dataInfo(i)
        if(infoDOM === null) {
            continue
        } 

        const verifyTypeof = typeof user[i] === 'number' && i !== 'id'

        infoDOM.textContent = verifyTypeof
            ? new Intl.NumberFormat(navigator.language).format(user[i]) 
            : user[i]
    }

    const result = await getAchievements()
    const { achievements } = result

    const achievementsValues = Object.values(achievements)
    const userKeys = Object.keys(user)
    
    for(let i = 0; i < achievementsValues.length; i++) {
        for(let j = 0; j < userKeys.length; j++) {
            if(userKeys[j] === 'id') { continue }
            const greaterThan = user[userKeys[j]] >= achievementsValues[i].amount
            const isSameType = userKeys[j] === achievementsValues[i].type
            if(greaterThan && isSameType) {
                achievementsValues[i].done = true
                updateAchievement({ })
            }
        }
    }

}, 1000)