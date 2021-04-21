function submitEncryption() {
    if (document.getElementById('encoding').value != '') {
        document.getElementById('init-input').style.display = 'none';
        sendRoomKey()
    } else {
        alert("Please enter key");
    };
};
var sanitizeHTML = function (str) {
    var temp = document.createElement('div');
    temp.textContent = str;
    return temp.innerHTML;
};

function showChatOptions() {
    if (document.getElementById('save').classList[0] != 'toggled') {
        document.getElementById('save').classList.add('toggled')
        document.getElementById('chatOptions').classList.add('shown')
    } else {
        document.getElementById('save').classList.remove('toggled')
        document.getElementById('chatOptions').classList.remove('shown')
        document.getElementById('saveChat').classList.remove('shown')
        document.getElementById('loadChat').classList.remove('shown')
        document.getElementById('delChat').classList.remove('shown')
    }
}

function showsavechat() {
    document.getElementById('chatOptions').classList.remove('shown')
    document.getElementById('saveChat').classList.add('shown')
}

function showloadchat() {
    document.getElementById('chatOptions').classList.remove('shown')
    document.getElementById('loadChat').classList.add('shown')
}

function showdelchat() {
    document.getElementById('chatOptions').classList.remove('shown')
    document.getElementById('delChat').classList.add('shown')
}

function closeWindows(toClose) {
    if (toClose == "save") {
        document.getElementById('saveChat').classList.remove('shown')
    } else if (toClose == "load") {
        document.getElementById('loadChat').classList.remove('shown')
    } else if (toClose == "del") {
        document.getElementById('delChat').classList.remove('shown')
    }
    document.getElementById('chatOptions').classList.add('shown')
}

function clickOnLogo() {
    window.location.replace("https://chatson.me");
}

function encryption(mess, key) {
    return CryptoJS.AES.encrypt(mess, key);
}

function decryption(mess_ecrypted, key) {
    return CryptoJS.AES.decrypt(mess_ecrypted, key).toString(CryptoJS.enc.Utf8);
}
// load key from cookies
$("#encoding").val(getCookie("key_encryption"));
// new key for encryption
function sendRoomKey() {
    document.getElementById('encoding').value = sanitizeHTML(document.getElementById('encoding').value);
    setCookie("key_encryption", $("#encoding").val(), 2);
    $("#encoding").val(getCookie("key_encryption"));
};
// send and refresh chat
var socket;
$(document).ready(function () {
    socket = io.connect('http://' + document.domain + ':' + location.port + '/chat');
    socket.on('connect', function () {
        socket.emit('joined', {});
    });
    socket.on('status', function (data) {
        $('#chatWindow').html($('#chatWindow').html() + '<div class="direct-chat-msg"><div class="direct-chat-info clearfix"> <span class="direct-chat-name pull-left">Alert</span> </div> <div class="direct-chat-text"> ' + data.msg + ' </div></div>');
        $('#chatWindow').scrollTop($('#chatWindow')[0].scrollHeight);
    });
    socket.on('message', function (data) {
        $('#chatWindow').html($('#chatWindow').html() + '<div class="direct-chat-msg right"> <div class="direct-chat-info clearfix"> <span class="direct-chat-name pull-right userName">' + data.msg.slice(0, data.msg.indexOf(':')) + '</span> </div> <div class="direct-chat-text message"> ' + data.msg.slice(data.msg.indexOf(':') + 1, data.msg.length) + ' </div></div>');
        $('#chatWindow').scrollTop($('#chatWindow')[0].scrollHeight);
        decryptMess();
    });
    $('#mess-btn').click(function () {
        sanitizeForm();
        text = $('#mess-input').val();
        $('#mess-input').val('');
        socket.emit('text', {
            msg: text
        });
    });
});

function sanitizeForm() {
    encrypted = encryption(sanitizeHTML(document.getElementById('mess-input').value), getCookie('key_encryption'))
    document.getElementById('mess-input').value = encrypted;
}

function decryptMess() {
    mess = $('.message')[$('.message').length - 1];
    toDecrypt = mess.innerText
    console.log(toDecrypt)
    mess.innerText = decryption(toDecrypt, getCookie("key_encryption")).toString()
}

function savechat() {
    key = sanitizeHTML(document.getElementById('saveKey').value)
    if (key == "") {
        key = null
    }
    haslo = sanitizeHTML(document.getElementById('savePass').value)
    if (haslo != "") {
        var json = '{"key":"' + key + '","savePasswd":"' + haslo + '","messages":['
        var messUsers = $('.userName');
        var messages = $('.message');
        for (i = 0; i < messages.length; i++) {
            json += '{"user": "' + messUsers[i].innerText + '", "text":"' + encryption(messages[i].innerText, getCookie("key_encryption")) + '"}'
            if (i != messages.length - 1) {
                json += ","
            }
        }
        json += "]}"
        jsonToSend = JSON.parse(json);
        var xhr = new XMLHttpRequest();
        var url = "/save_chat";
        var respToReturn;
        xhr.open("POST", url, true);
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4 && xhr.status === 200) {
                var json = JSON.parse(xhr.responseText);
                console.log(json['success']);
                if (json['success']) {
                    alert("Zapis się powiódł, twoje dane to Klucz: " + json['key'] + " Hasło: " + haslo)
                } else {
                    alert("Wystąpił błąd, spróbuj ponownie")
                }
            }
        };
        var data = JSON.stringify(jsonToSend)
        xhr.send(data);
    } else {
        alert("Password cannot be empty")
    }
}

function loadchat() {
    key = sanitizeHTML(document.getElementById('loadKey').value)
    if (key == "") {
        key = null
    }
    haslo = sanitizeHTML(document.getElementById('loadPass').value)
    if (key != null && haslo != "") {
        var json = '{"key":"' + key + '","savePasswd":"' + haslo + '"}'
        jsonToSend = JSON.parse(json);
        var xhr = new XMLHttpRequest();
        var url = "/load_chat";
        var respToReturn;
        xhr.open("POST", url, true);
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4 && xhr.status === 200) {
                var json = JSON.parse(xhr.responseText);
                console.log(json);
                if (json['success']) {
                    for (var i = 0; i < json['messages'].length; i++) {
                        $('#chatWindow').html($('#chatWindow').html() + '<div class="direct-chat-msg right"> <div class="direct-chat-info clearfix"> <span class="direct-chat-name pull-right userName">' + json['messages'][i]['user'] + '</span> </div> <div class="direct-chat-text message"> ' + decryption(json['messages'][i]['text'], getCookie("key_encryption")) + ' </div></div>');
                    }
                } else {
                    alert("Wystąpił błąd, spróbuj ponownie")
                }
            }
        };
        var data = JSON.stringify(jsonToSend)
        xhr.send(data);
    } else {
        alert("Pasword and/or key cannot be empty")
    }
}

function delchat() {
    key = sanitizeHTML(document.getElementById('delKey').value)
    if (key == "") {
        key = null
    }
    haslo = sanitizeHTML(document.getElementById('delPass').value)
    if (key != null && haslo != "") {
        var json = '{"key":"' + key + '","savePasswd":"' + haslo + '"}'
        jsonToSend = JSON.parse(json);
        var xhr = new XMLHttpRequest();
        var url = "/del_chat";
        var respToReturn;
        xhr.open("POST", url, true);
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4 && xhr.status === 200) {
                var json = JSON.parse(xhr.responseText);
                console.log(json);
                if (json['success']) {
                    alert("Rozmowa została usunięta, jest bezpiecznie")
                } else {
                    alert("Wystąpił błąd, spróbuj ponownie")
                }
            }
        };
        var data = JSON.stringify(jsonToSend)
        xhr.send(data);
    } else {
        alert("Pasword and/or key cannot be empty")
    }
}
