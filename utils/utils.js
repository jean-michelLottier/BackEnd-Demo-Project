let Language = require('../models/language')

const COOKIE_DURATION = 3600

module.exports = {
    initExpireCookie: () => {
        let expire = new Date();
        expire.setSeconds(expire.getSeconds() + COOKIE_DURATION);
        return expire;
    },

    checkLanguage: (lang) => {
        let language
        switch(lang) {
            case 'fr':
                language = Language.FRENCH
                break
            case 'en':
                language = Language.ENGLISH
                break
            default:
                language = Language.FRENCH
        }

        return language
    }
}