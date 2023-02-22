// const p = 1
const p = 0.5253; // Wahrscheinlichkeit, bei einem Klotz auf eine 1 zu fallen
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
    rethrow = false,
    sounds = [],
    players = [],
    activePlayer,
    warnings = {};

let tracks = [];

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
    all = [bang1, bang2, bang3, bang4, klapper1, klapper2, klapper3, klapper4];

    // players = document.querySelectorAll('.players .player');
    // activePlayer = players[0]

    // import the soundfiles
    for (let i = 1; i <= 18; i++) {
        sounds.push(new Audio(`../res/sounds/Yut${i}.mp3`))
        // sounds[sounds.length-1].volume = 1;
    }

    // key listeners
    document.addEventListener('keydown', function (e) {
        switch (e.code) {
            case 'ArrowUp':
                if (players.length > 0) {
                    iteratePlayer(true);
                }
                break;
            case 'ArrowDown':
                if (players.length > 0) {
                    iteratePlayer();
                }
                break;
            case 'ArrowLeft':
                if (players.length > 0) {
                    if (activePlayer.getAttribute('name') in warnings && warnings[activePlayer.getAttribute('name')] > 0) {
                        revertWarning(activePlayer)
                    }
                }
                break;
            case 'ArrowRight':
                if (players.length > 0) {
                    warnPlayer(activePlayer)
                }
                break;
            case 'Space':
                pressThrow();
                break;
        }
    })
}
// Throw
function pressThrow() {
    if (!animating) {
        if (players.length > 1 && !rethrow) {
            iteratePlayer();
        }
        playSound()
        currentNumber = generateNumber();
        animation();
    }
}
function generateNumber() {
    let failNum = Math.random();
    if (failNum <= pcrossed) {
        return "교차"
    }
    let sum = 0;
    let stickValues = []
    for (let i = 0; i < 4; i++) {
        let val = Math.random()
        stickValues.push(val <= p)
    }
    stickValues.forEach(function (e) {
        if (e) {
            sum++
        }
    })
    if (sum == 0) {
        sum = 5
    }
    return sum

}
function animation() {
    display.innerHTML = ''
    display.className = ''
    all.forEach(function (element) {
        element.className += ' animate';
    })
    animating = true
    setTimeout(displayResult, 1400)
}
function playSound() {
    let soundNum = Math.floor(Math.random() * 18)
    sounds[soundNum].play()
}
function displayResult() {
    // set the new number
    if (animating) {
        display.innerHTML = currentNumber
        if (currentNumber >= 4) {
            display.className = 'colored'
            rethrow = true
        } else if (currentNumber == '교차' && players.length > 0) {
            warnPlayer(activePlayer)
            rethrow = true
        } else {
            rethrow = false
        }
        all.forEach(function (element) {
            element.className = element.className.replaceAll(' animate', '')
        })

    }
    animating = false
}

// Players
function addPlayer() {
    // list of names and players
    let playerNames = []
    players.forEach(function (element) {
        playerNames.push(element.getAttribute('name'))
    })
    let list = document.querySelector('.players')

    // get new name and test, if name works
    let playerName = prompt("Neuer Spieler")
    while (true) { // ensures that names don't double
        console.log(playerNames, playerName)
        if (playerNames.includes(playerName)) {
            playerName = prompt("Sorry, der Name ist schon vergeben!\nNeuer Spieler")
        } else {
            break
        }
    }
    if (['', null].includes(playerName)) { // if canceled or nothing entered
        return
    }

    // create new player element
    let playerEntry = document.createElement('li')
    playerEntry.className = 'player'
    playerEntry.setAttribute('name', playerName)
    playerEntry.appendChild(document.createTextNode(playerName + ' '))
    playerEntry.addEventListener('click', playerClicked)
    let elementCount = list.querySelectorAll('li').length
    if (elementCount == 0) {
        playerEntry.className += ' active'
        activePlayer = playerEntry
    }
    list.appendChild(playerEntry, document.querySelector('.players button'));

    // update players list
    players = document.querySelectorAll('.players .player');

    // console.log(players)
}
function removePlayer() {
    let removePlayer = activePlayer
    if (players.length > 1) {
        iteratePlayer(true)
    }

    if (players.length > 0) {
        let index = Array.prototype.indexOf.call(players, removePlayer)
        players[index].remove()
        delete warnings[removePlayer.getAttribute('name')]
        players = document.querySelectorAll('.players .player');
    }
}
function playerClicked() {
    setActivePlayer(this)
}
function setActivePlayer(player) {
    // deactivate active player
    lastActive = document.querySelector('.player.active')
    lastActive.className = lastActive.className.replaceAll(' active', '')
    player.className += ' active'
    activePlayer = player
}
function iteratePlayer(reverse = false) {
    let index = Array.prototype.indexOf.call(players, activePlayer)
    if (reverse) {
        if (index <= 0) {
            index = players.length
        }
        setActivePlayer(players[index - 1])
        return
    }
    setActivePlayer(players[(index + 1) % players.length])
}
function warnPlayer(player) {
    playerName = player.getAttribute('name')
    // console.log(playerName)
    if (!(playerName in warnings)) {
        warnings[playerName] = 0
    }
    if (warnings[playerName] >= 3) {
        return
    }
    warnings[playerName] += 1
    player.innerHTML += '❌'

    // check if player has 3 warnings
    let abort = false
    if (warnings[playerName] >= 3) {
        let i = 0
        let blink = function () {
            animating = true
            if (i < 3) {
                if (player.style.backgroundColor == '') {
                    player.style.backgroundColor = 'rgb(222, 6, 117)';
                    i++;
                } else {
                    player.style.backgroundColor = ''
                }
                if (warnings[playerName] < 3) {
                    abort = true
                }
                setTimeout(blink, 300);
                // console.log('number:', i)
            } else {
                if (!abort) {
                    removePlayer()
                    animating = false
                } else {
                    player.style.backgroundColor = ''
                }
            }
        }
        blink()
    }
}
function revertWarning(player) {
    console.log(player)
    warnings[player.getAttribute('name')] -= 1
    player.innerHTML = player.innerHTML.replace('❌', ' ')
}