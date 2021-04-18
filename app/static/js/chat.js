var sanitizeHTML = function (str) {
    var temp = document.createElement('div');
    temp.textContent = str;
    return temp.innerHTML;
};

function clickOnLogo() {
    window.location.replace("https://chatson.me");
}

function toggleBlur() {
    hidELem = document.getElementsByClassName('hidden');
    for (i = 0; i < 3; i++) {
        if (hidELem[i].classList[1] == "blur") {
            hidELem[i].classList.remove('blur')
            document.getElementById('show').classList.add('toggled')
        } else {
            hidELem[i].classList.add('blur')
            document.getElementById('show').classList.remove('toggled')
        }
    }
}
function showChatOptions() {
        if (document.getElementById('save').classList[0] != 'toggled') {
            document.getElementById('save').classList.add('toggled')
            document.getElementById('chatOptions').classList.add('shown')

        } else {
            document.getElementById('save').classList.remove('toggled')
            document.getElementById('chatOptions').classList.remove('shown')
        
    }
}

function checkIfEncryptionKey() {
    if (document.getElementById('roomKey').value == "") {
        alert('Please enter room key before sending message')
    }
}

function expandCollapse() {
    if (document.getElementsByTagName('nav')[0].offsetHeight == 60) {
        document.getElementsByTagName('nav')[0].style.height = "340px";
        document.getElementById('expandOrCollapse').innerHTML = 'collapse'
    } else {
        document.getElementsByTagName('nav')[0].style.height = "60px";
        document.getElementById('expandOrCollapse').innerHTML = 'expand'
    }
}

function bottomDiv() {
    var objDiv = document.getElementById("chatWindow");
    objDiv.scrollTop = objDiv.scrollHeight;
}
window.setInterval(bottomDiv, 5000)

function encryption(mess, key) {
    return CryptoJS.AES.encrypt(mess, key);
}

function decryption(mess_ecrypted, key) {
    return CryptoJS.AES.decrypt(mess_ecrypted, key);
}
// load key from cookies
$("#roomKey").val(getCookie("key_encryption"));
// new key for encryption
$("#send_key").click(function () {
    document.getElementById('roomKey').value = sanitizeHTML(document.getElementById('roomKey').value);
    setCookie("key_encryption", $("#roomKey").val(), 2);
    $("#roomKey").val(getCookie("key_encryption"));
});
// send and refresh chat
var socket;
$(document).ready(function () {
    socket = io.connect('http://' + document.domain + ':' + location.port + '/chat');
    socket.on('connect', function () {
        socket.emit('joined', {});
    });
    socket.on('status', function (data) {
        $('#chatWindow').html($('#chatWindow').html() + "<p " +
            "class='user2'" +
            " > <span>" +
            data.msg +
            "</span> </p>");
        $('#chatWindow').scrollTop($('#chatWindow')[0].scrollHeight);
    });
    socket.on('message', function (data) {
        $('#chatWindow').html($('#chatWindow').html() + "<p " +
            "class='user1'" +
            " > <span>" +
            data.msg +
            "</span> </p>");
        decryptMess()
        $('#chatWindow').scrollTop($('#chatWindow')[0].scrollHeight);
    });
    $('#sendmess').click(function () {
        text = $('#chatMess').val();
        $('#chatMess').val('');
        socket.emit('text', {
            msg: text
        });
    });
});
function decryptMess(){
    
    mess = $('.user1')[$('.user1').length-1];
    toDecrypt = mess.children[0].innerText.slice(mess.children[0].innerText.indexOf(':') + 1, mess.children[0].innerText.length)
    console.log(decryption(toDecrypt,'kkk').toString() )
    console.log(toDecrypt.toString())
    console.log(getCookie("key_encryption"))
}

function sanitizeForm() {
    console.log(getCookie("key_encryption"))
    encrypted = encryption(sanitizeHTML(document.getElementById('chatMess').value),'kkk')
    console.log(encrypted.toString())
    document.getElementById('chatMess').value = encrypted;
}

function savechat() {
    key = prompt("Podaj swój klucz, jeśli nie masz, zostaw puste")
    if (key == "") {
        key = null
    }
    haslo = prompt('Utwórz hasło czatu')
    var json = '{"key":"' + key + '","savePasswd":"' + haslo + '","messages":['
    var messages = document.getElementsByClassName('user1')
    for (i = 0; i < messages.length; i++) {
        var currentMess = messages[i].innerText;
        json += '{"user": "' + currentMess.slice(0, currentMess.indexOf(':')) + '", "text":"' + currentMess.slice(currentMess.indexOf(':') + 1, currentMess.length - 1) + '"}'
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
}

function loadchat() {
    key = prompt("Podaj swój klucz")
    if (key == "") {
        key = null
    }
    haslo = prompt('Podaj hasło')
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
                    var msg = json['messages'][i]['user'] + ':' + json['messages'][i]['text'];
                    $('#chatWindow').html($('#chatWindow').html() + "<p " +
                        "class='user1'" +
                        " > <span>" +
                        msg +
                        "</span> </p>");
                }
            } else {
                alert("Wystąpił błąd, spróbuj ponownie")
            }
        }
    };
    var data = JSON.stringify(jsonToSend)
    xhr.send(data);
}

function delchat() {
    key = prompt("Podaj swój klucz")
    if (key == "") {
        key = null
    }
    haslo = prompt('Podaj hasło')
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
}