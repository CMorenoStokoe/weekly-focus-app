/* 

Main
-----
Generate user interface, access data model and give user controls

*/

var username = '';

var icon = 'fas fa-cookie-bite';
function chooseIcon(value){icon = value; console.log(icon);}

var focusName = '';

var todaysFocusCompleted = false;

var today = new Date(); // Get today's date
var dd = String(today.getDate()).padStart(2, '0');
var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
var yyyy = today.getFullYear();
today = mm + '/' + dd + '/' + yyyy;

var weekCommencing = new Date(); // Get today's date
    var day = weekCommencing.getDay(),
        diff = weekCommencing.getDate() - day + (day == 0 ? -6:1); // adjust when day is sunday
        weekCommencing = new Date(weekCommencing.setDate(diff));

const daysOfTheWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

window.onload = init;

function init(){
    
    

}

function login(enteredUsername){
    if(enteredUsername){
        $('#login').hide();
        username = enteredUsername;
        console.log('Logged in:', username);

        // Check if focus chosen for this week
        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                console.log(this.responseText);
                if(this.responseText=='0 results'){ // If focus not chosen then show chose focus screen
                    $('#choose-focus').show().animate({opacity: 1}, 500);
                }
                else{ // If focus already chosen then show current progress
                    focusName = this.responseText;
                    showFocuses();
                }
            }
        };
        xhttp.open("GET", `https://www.morenostok.io/getFocus.php?usr=${username}&date=${today}`, true);
        xhttp.send();
        

    }else{
        return alert('Please enter username');
    }
}

function createFocus(enteredFocusName){
    if(enteredFocusName){

        // Create focuses for whole week
        for(i=0;i<7;i++){
            let date = new Date
            date.setDate(weekCommencing.getDate() + i);
            var dd = String(date.getDate()).padStart(2, '0');
            var mm = String(date.getMonth() + 1).padStart(2, '0'); //January is 0!
            var yyyy = date.getFullYear();
            date = mm + '/' + dd + '/' + yyyy;
            constructFocus(date, i);
        }
    
        // Construct focus by each individual day
        function constructFocus(date, i){
            console.log(username, date, today, icon, i)
            
            var xhttp = new XMLHttpRequest();
                xhttp.onreadystatechange = function() {
                    if (this.readyState == 4 && this.status == 200) {
                        if(i == 6){
                            focusName = enteredFocusName;
                            $('#choose-focus').hide();
                            showFocuses();
                        }
                    }
                };
                xhttp.open("GET", `https://www.morenostok.io/newFocus.php?usr=${username}&focus=${enteredFocusName}&date=${date}&icon=${icon}`, true);
                xhttp.send();
        }

    } else {
        alert('Please name your focus for this week');
    }
}

function showFocuses(){

    // Name focuses with days
    for(const day of daysOfTheWeek){
        document.getElementById(`ico-${day}`).className = icon;
        document.getElementById(`lbl-${day}`).innerHTML = focusName;
    }

    // Highlight already completed focuses this week
    for(i=0;i<7;i++){
        let dateR = new Date();
        dateR.setDate(weekCommencing.getDate() + i);
        var dd = String(dateR.getDate()).padStart(2, '0');
        var mm = String(dateR.getMonth() + 1).padStart(2, '0'); //January is 0!
        var yyyy = dateR.getFullYear();
        let date = mm + '/' + dd + '/' + yyyy;
        highlightFocus(date, dateR, i);
    }
    let completedFocuses=[];
    function highlightFocus(date, dateR, i){
        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                console.log(this.responseText);
                
                // Mark previously completed focusses
                if(this.responseText=='TRUE'){ 
                    
                    // If focus completed previously show FX
                    completedFx(`#focus-${daysOfTheWeek[dateR.getDay()-1]}`);

                    // If todays focus completed record this and disallow completing it again today
                    if(date == today){
                        todaysFocusCompleted = true;
                    }
                   
                }

                // If all have been searched then mark current focus as completed or to complete
                if(i >= 6){
                    
                    // Highlight current day
                    if(todaysFocusCompleted){
                        console.log('focus already completed for today');
                    }else{
                        let todaysDay = new Date().getDay();
                        todaysFocus = daysOfTheWeek[todaysDay-1];
                        if(todaysFocus){
                            $(`#focus-${todaysFocus}`).removeClass('glass');
                            $(`#focus-${todaysFocus}`).addClass('clickable');
                            $(`#focus-${todaysFocus}`).one('click', function(){
                                completeFocus(todaysFocus);
                                todaysFocusCompleted = true;
                            });
                        };
                        todaysFocusCompleted = true;
                    }
                }
            }
        };
        xhttp.open("GET", `https://www.morenostok.io/getCompleted.php?usr=${username}&date=${date}`, true);
        xhttp.send();
    }
    for(const completedFocus of completedFocuses){
        completedFx(completedFocus.getDay()); // Complete focuses by day
    }
    
    // Show focus tree
    $('#tree').show().animate({opacity: 1}, 500);

}

function completeFocus(todaysFocus){

    // Set focus as completed in DB
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            console.log(this.responseText);
            completedFx(`#focus-${todaysFocus}`);
        }
    };
    xhttp.open("GET", `https://www.morenostok.io/completeFocus.php?usr=${username}&date=${today}`, true);
    xhttp.send();

}

function completedFx(id){

    // Format focus as completed
    $(id).removeClass('animatedBG');
    $(id).removeClass('clickable');
    $(id).removeClass('glass');
    $(id).addClass('completed');

    // Sound from https://freesound.org/people/FunWithSound/sounds/456965/
    var sfx = new Audio('audio/completed.mp3');
        sfx.play();
}