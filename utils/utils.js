const COOKIE_DURATION = 3600

module.exports = {
    initExpireCookie: () => {
        let expire = new Date();
        expire.setSeconds(expire.getSeconds() + COOKIE_DURATION);
        return expire;
    }
}