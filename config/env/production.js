module.exports = {
    // This is your MYSQL Database configuration
    hostname: 'http://app.gobundle.it',
    port: 80,
    db: {
        host: "us-cdbr-iron-east-02.cleardb.net",
        name: "heroku_ee8336a9d75aa6c",
        password: "8e7e449f",
        username: "ba5db42ba208cd"
    },
    app: {
        name: "Gobundle",
        admin_email: "andriy.polanski@gmail.com",
        admin_name: "Gobundle Support"
    },
    facebook: {
        clientID: "939798702707031",
        clientSecret: "35c86582a0c8c9384cf37d8ba3adca21",
        callbackURL: "http://localhost:3000/auth/facebook/callback"
    },
    filepicker: {
        api_key: "AAIOY2BF3R3qjcrvz9lxXz"
    },
    smtp: {
        host: 'smtp.mandrillapp.com',
        port: 587,
        username: 'us@webfire.co.uk',
        password: '_rs3l5r-ZEloWeQcPNNOhA'
    },
    mangopay: {
        username: 'bundle',
        password: 'zNdND1hdEvJ68NcgdpFzMPmdoYpLw9FX1o5YnTW1hcYeKPXm1x',
        production: false
    },
    stripe: {
        secret_key: 'sk_live_SDfPtI6D9xrPffd5isYwGgck',
        publishable_key: 'pk_live_0lKj5bNaSygbFR4XwBBg1nkU'
    }
}