var sanitizeHTML = function (str) {
	var temp = document.createElement('div');
	temp.textContent = str;
	return temp.innerHTML;
};
document.getElementById('wid').value = window.innerWidth;

function gencode() {
    $.get("/gen_room", function (data) {
        document.getElementById('roomCode').value = data["roomId"]
    });
};

function scrollToHowDoesItWork() {
    window.scrollTo(0, document.getElementById('howDoesItWork').offsetTop);
};
document.getElementById('scrollDown').addEventListener("click", scrollToHowDoesItWork, true);
$("#button_send_data").click(function () {
    setCookie("key", $("#key").val(), 1);
    setCookie("user", $("input[name='user']:checked").val(), 2);
});

function sanitizeForm() {
    document.getElementById('roomCode').value = sanitizeHTML(document.getElementById('roomCode').value);
    document.getElementById('uname').value = sanitizeHTML(document.getElementById('uname').value);
}

