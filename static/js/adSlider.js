function changeAd(){
    var adIndex= document.getElementById('adCounter').value
    ads = document.getElementsByClassName('ad')
    for (i=0;i<ads.length;i++){
        ads[i].style.display = 'none';
    }
    if(adIndex == ads.length-1){
        document.getElementById('adCounter').value = 0;
        ads[0].style.display = 'block';
    }else{
        document.getElementById('adCounter').value = parseInt(adIndex)+1
        ads[document.getElementById('adCounter').value].style.display = 'block';
    }
}

setInterval(changeAd, 5000)