// const p = 1
const p = 0.5353; // Wahrscheinlichkeit, bei einem Klotz auf eine 1 zu fallen
const pcrossed = 0.02; // Wahrscheinlichkeit für überkreuzte Klötze
// const pcrossed = 1;

let currentNumber, // number that is currently on display
    display, // display element
    bang1, // animation elements
    bang2,
    bang3,
    bang4,
    klapper1,
    klapper2,
    klapper3,
    klapper4,
    animating = false, // animation in progress?
    rethrow = false, // if result is 4, 5 or 교차
    sounds = [], // list of all sounds
    players = [], // list of all player elements
    activePlayer, // element of active player
    warnings = {}, // dictionary to keep track of warnings
    dontIterate = true; // true, if the player was manually set to active

window.onload = function () {
    // set DOM Element values
    display = document.querySelector('#display');
    bang1 = document.querySelectorAll('.bang')[0];
    bang2 = document.querySelectorAll('.bang')[1];
    bang3 = document.querySelectorAll('.bang')[2];
    bang4 = document.querySelectorAll('.bang')[3];
    klapper1 = document.querySelectorAll('.klapper')[0];
    klapper2 = document.querySelectorAll('.klapper')[1];
    klapper3 = document.querySelectorAll('.klapper')[2];
    klapper4 = document.querySelectorAll('.klapper')[3];
    // all animation elements
    all = [bang1, bang2, bang3, bang4, klapper1, klapper2, klapper3, klapper4];

    // import the soundfiles
    for (let i = 1; i <= 18; i++) {
        sounds.push(new Audio(`../res/sounds/Yut${i}.mp3`));
    }

    // key listeners
    document.addEventListener('keydown', function (e) {
        switch (e.code) {
            case 'ArrowUp': // set player above active
                if (players.length > 0) {
                    dontIterate = true;
                    iteratePlayer(true);
                }
                break;
            case 'ArrowDown': // set player below active
                if (players.length > 0) {
                    dontIterate = true;
                    iteratePlayer();
                }
                break;
            case 'ArrowLeft': // increase number of warnings of active player
                if (players.length > 0) {
                    if (activePlayer.getAttribute('name') in warnings && warnings[activePlayer.getAttribute('name')] > 0) {
                        revertWarning(activePlayer);
                    }
                }
                break;
            case 'ArrowRight': // decrease number of warnings of active player
                if (players.length > 0) {
                    warnPlayer(activePlayer);
                }
                break;
            case 'Space': // throw
                pressThrow();
                break;
        }
    })
}

// Throw
function pressThrow() {
    if (!animating) {
        // iterate player
        if (players.length > 1 && !rethrow && !dontIterate) {
            iteratePlayer();
        } else {
            dontIterate = false;
        }
        playSound();
        currentNumber = generateNumber();
        // start animation
        animation();
        // after animation finished displayResults() gets called
    }
}
function generateNumber() {
    // decide, if 교차 (crossed) occurs
    let failNum = Math.random();
    if (failNum <= pcrossed) {
        return "교차";
    }
    // decide result of the stick throw
    let sum = 0;
    for (let i = 0; i < 4; i++) {
        let val = Math.random();
        if (val <= p) {
            sum++;
        }
    }
    if (sum == 0) { // switch value to 5, if all stick land with the flat side down
        sum = 5;
    }
    return sum;

}
function animation() {
    display.innerHTML = ''; // empty the display element
    display.className = ''; // remove highlight
    all.forEach(function (element) { // start animation of all elements
        element.className += ' animate';
    })
    animating = true; // lock any other action during the time of the animation
    setTimeout(displayResult, 1400); // wait till the animation is over
}
function playSound() {
    // select random sound and play it
    let soundNum = Math.floor(Math.random() * 18);
    sounds[soundNum].play();
}
function displayResult() {
    // set the display to the new number
    display.innerHTML = currentNumber;
    if (currentNumber >= 4) { // add highlight to display if the value is above 4
        display.className = 'colored';
        rethrow = true;
    } else if (currentNumber == '교차' && players.length > 0) { // warn player if the result is 교차
        warnPlayer(activePlayer);
        rethrow = true;
    } else { // if everything is normal
        rethrow = false;
    }
    all.forEach(function (element) { // remove animation tag
        element.className = element.className.replaceAll(' animate', '');
    })
    animating = false; // remove the lock for other actions
}

// Players
function addPlayer() {
    // get the names of all players
    let playerNames = [];
    players.forEach(function (element) {
        playerNames.push(element.getAttribute('name'));
    })
    let listElem = document.querySelector('.players'); // list of all elements in the list

    // get new name and test, if name works
    let playerName = prompt("Neuer Spieler").trim();
    while (true) { // ensures that names don't double
        if (playerNames.includes(playerName)) {
            playerName = prompt("Sorry, der Name ist schon vergeben!\nNeuer Spieler");
        } else {
            break;
        }
    }
    if (['', null].includes(playerName)) { // if canceled or nothing entered
        return;
    }

    // create new player element
    let playerEntry = document.createElement('li');
    playerEntry.className = 'player';
    playerEntry.setAttribute('name', playerName);
    playerEntry.innerHTML = playerName + ' ';
    playerEntry.setAttribute('onclick', 'playerClicked(this)');
    if (players.length > 1) {
        // get reference node for insertion
        let index = Array.prototype.indexOf.call(players, activePlayer);
        let referenceNode;
        if (index != playerNames.length-1) {
            referenceNode = players[index + 1];
        }
        // referenceNode == undefined => add it in last place
        listElem.insertBefore(playerEntry, referenceNode);
    } else {
        listElem.appendChild(playerEntry);
    }
    setActivePlayer(playerEntry);

    players = document.querySelectorAll('.players .player'); // update players list
}
function removePlayer() {
    let removePlayer = activePlayer;
    if (players.length > 1) {
        iteratePlayer(true);
    }

    if (players.length > 0) {
        let index = Array.prototype.indexOf.call(players, removePlayer);
        players[index].remove();
        delete warnings[removePlayer.getAttribute('name')]; // remove warnings for player
        players = document.querySelectorAll('.players .player'); // update players list
    }
}
function playerClicked(element) {
    // set the clicked player as the active one
    dontIterate = true;
    setActivePlayer(element);
}
function setActivePlayer(player) {
    // deactivate active player
    if (players.length > 0) {
        lastActive = document.querySelector('.player.active');
        lastActive.className = lastActive.className.replaceAll(' active', '');
    }
    // activate new active player
    player.className += ' active';
    activePlayer = player;
}
function iteratePlayer(reverse = false) {
    let index = Array.prototype.indexOf.call(players, activePlayer);
    if (reverse) {
        // iterate backwards
        if (index <= 0) {
            index = players.length;
        }
        setActivePlayer(players[index - 1]);
        return;
    }
    // iterate
    // if the active Player is the last one, jump to the top
    setActivePlayer(players[(index + 1) % players.length]);
}
function warnPlayer(player) {
    playerName = player.getAttribute('name');
    // create new property in warnings
    if (!(playerName in warnings)) {
        warnings[playerName] = 0;
    }
    // stop adding more than 3 warnings
    if (warnings[playerName] >= 3) {
        return;
    }
    warnings[playerName] += 1;
    player.innerHTML += '❌';

    // check if player has 3 warnings
    let abort = false;
    if (warnings[playerName] >= 3) {
        let i = 0;
        let blink = function () {
            animating = true; // lock other actions
            if (i < 3) { // blink 3 times
                if (player.style.backgroundColor == '') {
                    // set player background to red(ish)
                    player.style.backgroundColor = 'rgb(222, 6, 117)';
                    i++;
                } else {
                    // reset player background color
                    player.style.backgroundColor = '';
                }
                // if warnings get removed manually
                if (warnings[playerName] < 3) {
                    abort = true;
                }
                // recursion vvv
                setTimeout(blink, 300);
            } else {
                if (!abort) {
                    removePlayer();
                    animating = false; // remove action lock
                } else {
                    // if aborted, reset background color
                    player.style.backgroundColor = '';
                }
            }
        }
        blink();
    }
}
function revertWarning(player) {
    // remove 1 warning from player
    warnings[player.getAttribute('name')] -= 1;
    player.innerHTML = player.innerHTML.replace('❌', ' ');
}