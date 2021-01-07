$.get( "/gen_new_rooms_id", function( data ) {
  for(i=0;i<5;i++){
    document.getElementById('codes').innerHTML+= "<option>"+data[i]+"</option>"
}
});

function scrollToHowDoesItWork() {
    window.scrollTo(0, document.getElementById('howDoesItWork').offsetTop);
};
document.getElementById('scrollDown').addEventListener("click", scrollToHowDoesItWork, true);
$("#button_send_data").click(function () {
    setCookie("key", $("#key").val(), 1);
    setCookie("user", $("input[name='user']:checked").val(), 2);
});
function onSubmit(token) {
        document.getElementById("main_form").submit();
      }
