var InstaAPI = {

    tempdata: null,
    callbackFunction: null,

    getAccessToken: function () {
        var access_token = Cookies.get('instagram_access_token');

        if (typeof access_token === 'undefined') {
            var hash = location.hash.replace('#access_token=', '');
            if (hash == '') {
                location.href = 'https://api.instagram.com/oauth/authorize/?client_id=' + window.INSTAGRAM_CLIENTID
                                    + '&redirect_uri=' + location.protocol + '//' + location.hostname + '&response_type=token'
                                    + '&scope=public_content';
            } else {
                Cookies.set('instagram_access_token', hash, { expires: 1 });
                access_token = hash;
            }
        }

        return access_token;
    },

    getUserId: function (username, callbackFunc) {
        this.makeRequest('https://api.instagram.com/v1/users/search?q=' + username + '&access_token=' + window.INSTAGRAM_ACCESSTOKEN, function (data) {
            if (data.length > 0) {
                callbackFunc(data[0].id);
            }
        });
    },

    makeRequest: function(url, callbackFunc) {
        var script = document.createElement('script');
        script.id = 'instaapi-fetcher';
        script.src = url + '&callback=InstaAPI.parse';
        var header = document.getElementsByTagName('head');
        header[0].appendChild(script);

        this.callbackFunction = callbackFunc;

        return false;
    },

    parse: function (data) {
        if (typeof data.data !== 'undefined') {
            this.tempdata = data.data;
            if (this.callbackFunction) {
                this.callbackFunction(this.tempdata);
            }
        }
    },

    getFeed: function (userId, callbackFunc) {
        var feed = new Instafeed({
            get: 'user',
            userId: userId,
            clientId: window.INSTAGRAM_CLIENTID,
            accessToken: window.INSTAGRAM_ACCESSTOKEN,
            limit: 20,
            mock: true,
            success: callbackFunc
        });

        feed.run();
    }

};