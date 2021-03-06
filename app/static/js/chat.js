function openSweetDialog(content){
    document.getElementById('sweetDialogText').innerHTML = content;
    document.getElementById('sweetDialog').style.display = 'block';
}
function closeSweetDialog(){
     document.getElementById('sweetDialogText').innerHTML = "";
    document.getElementById('sweetDialog').style.display = 'none';
}

var sanitizeHTML = function (str) {
    var temp = document.createElement('div');
    temp.textContent = str;
    return temp.innerHTML;
};

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

function checkIfEncryptionKey() {
    if (document.getElementById('roomKey').value == "") {
        openSweetDialog('Please enter room key before sending message')
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
    return CryptoJS.AES.decrypt(mess_ecrypted, key).toString(CryptoJS.enc.Utf8);
}
// load key from cookies
$("#roomKey").val(getCookie("key_encryption"));
// new key for encryption
$("#send_key").click(function () {
    openSweetDialog('Key saved!')
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
            "class='user1'" +
            " > <span>" +
            data.msg +
            "</span> </p>");
        $('#chatWindow').scrollTop($('#chatWindow')[0].scrollHeight);
    });
    socket.on('message', function (data) {
        if(data.msg.slice(0, data.msg.indexOf(':')) == document.getElementById('user').innerHTML){
            $('#chatWindow').html($('#chatWindow').html() + "<p " +
            "class='chatMessage user2'" +
            " > <span>" +
            data.msg +
            "</span> </p>");
        }else{
              $('#chatWindow').html($('#chatWindow').html() + "<p " +
            "class='chatMessage user1'" +
            " > <span>" +
            data.msg +
            "</span> </p>");
              }
        
        decryptMess()
        $('#chatWindow').scrollTop($('#chatWindow')[0].scrollHeight);
    });
    $('#sendmess').click(function () {
        
        text =$('#chatMess').val();
        $('#chatMess').val('');
        console.log(text);
        socket.emit('text', {
            msg: text
        });
        
    });
});

function decryptMess() {
    
    mess = $('.chatMessage')[$('.chatMessage').length - 1];
    toDecrypt = mess.children[0].innerText.slice(mess.children[0].innerText.indexOf(':') + 1, mess.children[0].innerText.length)
    mess.children[0].innerText = mess.children[0].innerText.slice(0, mess.children[0].innerText.indexOf(':')+1)+decryption(toDecrypt, getCookie("key_encryption")).toString()
}

function sanitizeForm() {
    encrypted = encryption(sanitizeHTML(document.getElementById('chatMess').value), getCookie("key_encryption"))
    document.getElementById('chatMess').value = encrypted;
   
}

function savechat() {
    key = sanitizeHTML(document.getElementById('saveKey').value)
    if (key == "") {
        key = null
    }
    haslo = sanitizeHTML(document.getElementById('savePass').value)
    if (haslo != "") {
        var json = '{"key":"' + key + '","savePasswd":"' + haslo + '","messages":['
        var messages = document.getElementsByClassName('chatMessage')
        for (i = 0; i < messages.length; i++) {
            var currentMess = messages[i].innerText;
            json += '{"user": "' + currentMess.slice(0, currentMess.indexOf(':')) + '", "text":"' + encryption(currentMess.slice(currentMess.indexOf(':') + 1, currentMess.length), getCookie('key_encryption')) + '"}'
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
                if (json['success']) {
                    openSweetDialog("Save successful, Your key: " + json['key'])
                } else {
                    openSweetDialog("An error occured, try again")
                }
            }
        };
        var data = JSON.stringify(jsonToSend)
        xhr.send(data);
        showChatOptions()
        document.getElementById('saveKey').value="";
        document.getElementById('savePass').value = "";
    } else {
        openSweetDialog("Password cannot be empty")
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
                if (json['success']) {
                    for (var i = 0; i < json['messages'].length; i++) {
                        var msg = json['messages'][i]['user'] + ':' + decryption(json['messages'][i]['text'], getCookie('key_encryption'));
                        if(json['messages'][i]['user'] == document.getElementById('user').innerHTML){
                            $('#chatWindow').html($('#chatWindow').html() + "<p " +
                            "class='chatMessage user2'" +
                            " > <span>" +
                            msg +
                            "</span> </p>");
                        }else{
                            $('#chatWindow').html($('#chatWindow').html() + "<p " +
                            "class='chatMessage user1'" +
                            " > <span>" +
                            msg +
                            "</span> </p>");
                        }
                        
                    }
                    openSweetDialog("Load successful")
                } else {
                    openSweetDialog("An error occured, try again")
                }
            }
        };
        var data = JSON.stringify(jsonToSend)
        xhr.send(data);
        showChatOptions()
        document.getElementById('loadKey').value="";
        document.getElementById('loadPass').value = "";
    } else {
        openSweetDialog("Pasword and/or key cannot be empty")
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
                if (json['success']) {
                    openSweetDialog("Save successfully deleted")
                } else {
                    openSweetDialog("An error occured, try again")
                }
            }
        };
        var data = JSON.stringify(jsonToSend)
        xhr.send(data);
        showChatOptions()
        document.getElementById('delKey').value="";
        document.getElementById('delPass').value = "";
    } else {
        openSweetDialog("Pasword and/or key cannot be empty")
    }
}
