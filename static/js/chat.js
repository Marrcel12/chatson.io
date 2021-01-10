function toggleBlur(){
    hidELem=document.getElementsByClassName('hidden');
    for (i=0; i<2; i++){
        if (hidELem[i].classList[1] == "blur"){
        hidELem[i].classList.remove('blur')
        document.getElementById('show').classList.add('toggled')
    } else{
        hidELem[i].classList.add('blur')
        document.getElementById('show').classList.remove('toggled')
    }
    }
    
}
function expandCollapse(){
    if(document.getElementsByTagName('nav')[0].offsetHeight == 60){
        document.getElementsByTagName('nav')[0].style.height = "340px";
        document.getElementById('expandOrCollapse').innerHTML = 'collapse'
        console.log('kappa')
    }else{
        document.getElementsByTagName('nav')[0].style.height = "60px";
        document.getElementById('expandOrCollapse').innerHTML = 'expand'
    }
    
}
function bottomDiv(){
    var objDiv = document.getElementById("chatWindow");
    objDiv.scrollTop = objDiv.scrollHeight; 
}
window.setInterval(bottomDiv,5000)

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
  console.log("aaa");
  setCookie("key_encryption", $("#roomKey").val(), 2);
  $("#roomKey").val(getCookie("key_encryption"));
});
// send and refresh chat
function send_and_refresh() {
  var jqxhr = $.getJSON("/chat_check", function () {})
    .done(function (data) {
      $("#chatWindow").html("");
      $.each(data, function () {
        if (this.user == 1) {
          class_to = 'class="user1"';
        } else {
          class_to = 'class="user2"';
        }
        if (this.mess == null) {
          console.log("null");
        } else {
          $("#chatWindow").append(
            "<p " +
              class_to +
              " > <span>" +
              decryption(this.mess, $("#roomKey").val()).toString(
                CryptoJS.enc.Utf8
              ) +
              "</span> </p>"
          );
        }
      });
    })
    .fail(function () {
      console.log("error");
    });

  setTimeout(send_and_refresh, 1000);
}
//   main form sending
$(document).ready(function () {
  $("form").submit(function () {
    var $input_mess = $(this).find("input[name=chat_mess]");
    var $input_encryption = $("#roomKey").val();
    if (!$input_mess.val() || !$input_encryption) {
      alert("wypełnij oba pola");
    } else {
      // alert(encryption($input_mess.val(), $input_encryption).toString(),$input_encryption,$input_mess.val())
      $input_mess.val(
        encryption($input_mess.val(), $input_encryption).toString()
      );
    }
  });
  send_and_refresh();
});
