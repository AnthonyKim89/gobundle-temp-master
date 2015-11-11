module.exports = {
    // This is your MYSQL Database configuration
    hostname: 'http://192.168.1.129:3001',
    port: 3001,
    db: {
        host: "192.168.1.129",
        name: "bundlefire_db",
        password: "",
        username: "root"
    },
    app: {
        name: "Gobundle",
        admin_email: "andriy.polanski@gmail.com",
        admin_name: "Gobundle Support"
    },
    facebook: {
        clientID: "714935035319726",
        clientSecret: "3d4a9c12c4f14fe06ebd76e481cf800c",
        callbackURL: "http://localhost:3000/auth/facebook/callback"
    },
    filepicker: {
        api_key: "AAIOY2BF3R3qjcrvz9lxXz"
    },
    smtp: {
        host: '192.168.1.128',
        port: 25,
        username: '',
        password: ''
    },
    mangopay: {
        username: 'bundle',
        password: 'zNdND1hdEvJ68NcgdpFzMPmdoYpLw9FX1o5YnTW1hcYeKPXm1x',
        production: false
    },
    stripe: {
        secret_key: 'sk_test_ektzJe0ZTVSFTjImAfirdC7w',
        publishable_key: 'pk_test_SJyT3bByOQl4VC7pG8Q8lvRV'
    }
}
