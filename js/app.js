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
        }else {
            this.setupUser()
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
        getValueByProperty: function(property) {
            return user[property]
        }
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

    for(let i = 0; i < achievementsValues.length; i++) {
        const achievementType = achievementsValues[i].type
        const achievementAmount = achievementsValues[i].amount
        const userValue = user.getValueByProperty(achievementType)
        if(userValue >= achievementAmount) {
            achievementsValues[i].done = true
            updateAllAchievements(achievementsValues)
        }
    }

}, 1000)

setInterval(async () => {
    
    const dataStatistic = (statistic) => document.querySelector(`[data-statistic="${statistic}"]`)
    const allDataStatistic = document.querySelectorAll('[data-statistic]')

    const result = await getAchievements()
    const { achievements } = result
    const achievementsValues = Object.values(achievements)

    const statisticPromise = new Promise(resolve => {

        const achievementsAmount = achievementsValues.reduce((acc, item) => {
            const done = item.done ? 'completed' : 'undone'
            Object.defineProperty(acc, done, {
                value: acc[done] + 1 || 1,
                enumerable: true,
                writable: true
            })
            return acc
        }, {})
    
        achievementsAmount.amount = achievementsValues.length
        resolve(achievementsAmount)
        
    })

    allDataStatistic.forEach(statistic => {
        statistic.textContent = 0
    })

    const objectResolved = await statisticPromise    
    Object.keys(objectResolved).forEach(statistic => {
        const infoDOM = dataStatistic(statistic)
        infoDOM.textContent = objectResolved[statistic]
    })

    const ul = document.querySelector('[data-js="achievements"]')

    const lis = achievementsValues.map(value => {

        const { id, name, done } = value

        const li = document.createElement('li')
        li.textContent = `${name}`
        li.dataset.liId = id

        if(done) {
            const del = document.createElement('del')
            del.append(li)
        }

        return li
        
    })

    lis.forEach(li => {
        if(!document.querySelector(`[data-li-id="${li.dataset.liId}"]`)) {
            ul.append(li)
        }
    })

}, 2 * 1000)