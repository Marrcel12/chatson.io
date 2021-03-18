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
function savechat(){
    var messUsers = $('.userName');
    var messages = $('.message');
    var json = '['
    for(i=0; i<messages.length; i++){
        json+='{"user": "'+messUsers[i].innerText+'", "text":"'+messages[i].innerText+'"}'
        if(i != messages.length-1){
            json+=","
        }
    }
    json+="]"
    console.log(JSON.parse(json))
}