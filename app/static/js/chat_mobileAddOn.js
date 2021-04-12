function submitEncryption() {
    if (document.getElementById('encoding').value != '') {
        console.log(document.getElementById('encoding').value);
        document.getElementById('init-input').style.display = 'none';
    } else {
        alert("Please enter key");
    };
};
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
    for (i = 0; i < 2; i++) {
        if (hidELem[i].classList[1] == "blur") {
            hidELem[i].classList.remove('blur')
            document.getElementById('show').classList.add('toggled')
        } else {
            hidELem[i].classList.add('blur')
            document.getElementById('show').classList.remove('toggled')
        }
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
        $('#chatWindow').html($('#chatWindow').html() + '<div class="direct-chat-msg"><div class="direct-chat-info clearfix"> <span class="direct-chat-name pull-left">Alert</span> </div> <div class="direct-chat-text"> '+ data.msg+' </div></div>') ;
        $('#chatWindow').scrollTop($('#chatWindow')[0].scrollHeight);
    });
    socket.on('message', function (data) {
        $('#chatWindow').html($('#chatWindow').html() + '<div class="direct-chat-msg right"> <div class="direct-chat-info clearfix"> <span class="direct-chat-name pull-right userName">'+data.msg.slice(0, data.msg.indexOf(':'))+'</span> </div> <div class="direct-chat-text message"> '+data.msg.slice(data.msg.indexOf(':')+1, data.msg.length-1)+' </div></div>') ;
        $('#chatWindow').scrollTop($('#chatWindow')[0].scrollHeight);
    });
    $('#mess-btn').click(function() {
                        text = $('#mess-input').val();
                        $('#mess-input').val('');
                        socket.emit('text', {msg: text});
                    
                });
}
    
);

function sanitizeForm() {
    document.getElementById('chatMess').value = sanitizeHTML(document.getElementById('chatMess').value);
}
function savechat() {
    key = prompt("Podaj swój klucz, jeśli nie masz, zostaw puste")
    if (key == "") {
        key = null
    }
    haslo = prompt('Utwórz hasło czatu')
    var json = '{"key":"' + key + '","savePasswd":"' + haslo + '","messages":['
    var messUsers = $('.userName');
    var messages = $('.message');
    for(i=0; i<messages.length; i++){
        json+='{"user": "'+messUsers[i].innerText+'", "text":"'+messages[i].innerText+'"}'
        if(i != messages.length-1){
            json+=","
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
                    $('#chatWindow').html($('#chatWindow').html() + '<div class="direct-chat-msg right"> <div class="direct-chat-info clearfix"> <span class="direct-chat-name pull-right userName">'+json['messages'][i]['user']+'</span> </div> <div class="direct-chat-text message"> '+json['messages'][i]['text']+' </div></div>');
                    
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